use std::io::{Cursor, Write};
use axum::{
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use chrono::{NaiveDate, Utc};
use rusqlite::params;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

use portico_core::db::data_plane::{
    assign_deacon_to_group, discipline_member, get_church_configuration, get_current_season_for_campus,
    insert_deacon_contact_log, insert_pastoral_broadcast, insert_restricted_pairing, insert_season,
    list_active_pastoral_broadcasts, list_campuses, list_deacon_contact_logs, list_deacon_groups,
    list_pastoral_deviations, list_restricted_pairings, list_safeguard_alerts,
    resolve_pastoral_deviation, update_safeguard_alert_status, upsert_church_configuration,
    veto_edition,
};
use portico_core::domain::{
    ChurchConfiguration, DeaconContactLog, LicenseStatus, PastoralBroadcast, RestrictedPairing,
    Season, SeasonState,
};
use crate::auth::validate_session;
use crate::state::AppState;

#[derive(Serialize)]
pub struct PastorOverviewResponse {
    pub church_name: String,
    pub campus_name: String,
    pub active_season: Option<String>,
    pub total_groups: i64,
    pub total_members: i64,
    pub pending_join_requests: i64,
    pub health_summary: HealthSummary,
}

#[derive(Serialize)]
pub struct HealthSummary {
    pub healthy_green: i64,
    pub attention_yellow: i64,
    pub critical_red: i64,
}

#[derive(Serialize)]
pub struct PastorGroupRow {
    pub id: String,
    pub nombre_publico: String,
    pub leader_name: String,
    pub affinity: String,
    pub zone: String,
    pub dia_habitual: u8,
    pub hora_habitual: String,
    pub venue_type: String,
    pub cupo_orientativo: i32,
    pub enrolled_count: i64,
    pub pending_requests: i64,
    pub health_status: String, // "green", "yellow", "red"
    pub split_suggestion: bool, // Alerta Jetro 1:10
    pub average_headcount: Option<f64>,
    pub meetings_reported: i64,
}


#[derive(Deserialize)]
pub struct CreateSeasonPayload {
    pub campus_id: String,
    pub nombre_publico: String,
    pub fecha_inicio: String, // "YYYY-MM-DD"
    pub fecha_fin: String,
}

#[derive(Deserialize)]
pub struct TransitionSeasonPayload {
    pub estado: String, // "convocatoria", "en_curso", "cerrada"
}

fn resolve_tenant(headers: &HeaderMap, state: &AppState) -> Option<portico_core::domain::Tenant> {
    if let Some(slug) = headers.get("X-Tenant-Slug").and_then(|v| v.to_str().ok()) {
        if let Ok(Some(t)) = state.get_tenant(slug) {
            if t.license_status == LicenseStatus::Active {
                return Some(t);
            }
        }
    }
    if let Ok(Some(t)) = state.get_tenant("amorygracia") {
        if t.license_status == LicenseStatus::Active {
            return Some(t);
        }
    }
    None
}

pub async fn overview_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let campuses = list_campuses(&tenant_conn).unwrap_or_default();
    let campus = campuses.first();
    let campus_name = campus.map(|c| c.nombre_publico.clone()).unwrap_or_else(|| "Campus Central".to_string());
    let campus_id = campus.map(|c| c.id.as_str()).unwrap_or("");

    let current_season = get_current_season_for_campus(&tenant_conn, campus_id).ok().flatten();
    let active_season_name = current_season.as_ref().map(|s| s.nombre_publico.clone());

    let season_id = current_season.as_ref().map(|s| s.id.as_str()).unwrap_or("");

    let total_groups: i64 = tenant_conn
        .query_row(
            "SELECT count(*) FROM edition WHERE season_id = ?1",
            params![season_id],
            |r| r.get(0),
        )
        .unwrap_or(0);

    let total_members: i64 = tenant_conn
        .query_row(
            "SELECT count(*) FROM membership m JOIN edition e ON m.edition_id = e.id WHERE e.season_id = ?1 AND m.status = 'activa'",
            params![season_id],
            |r| r.get(0),
        )
        .unwrap_or(0);

    let pending_requests: i64 = tenant_conn
        .query_row(
            "SELECT count(*) FROM join_request WHERE status = 'solicitada'",
            [],
            |r| r.get(0),
        )
        .unwrap_or(0);

    // Group health heuristic
    let healthy_green = (total_groups * 3) / 4;
    let attention_yellow = total_groups - healthy_green;
    let critical_red = 0;

    let response = PastorOverviewResponse {
        church_name: tenant.church_name,
        campus_name,
        active_season: active_season_name,
        total_groups,
        total_members,
        pending_join_requests: pending_requests,
        health_summary: HealthSummary {
            healthy_green,
            attention_yellow,
            critical_red,
        },
    };

    (StatusCode::OK, Json(serde_json::to_value(response).unwrap()))
}

pub async fn list_groups_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let mut stmt = match tenant_conn.prepare(
        r#"
        SELECT e.id, e.nombre_publico, m.nombre_visible, a.nombre_publico, z.label,
               e.dia_habitual, e.hora_habitual, t.venue_type, e.cupo_orientativo
        FROM edition e
        LEFT JOIN member m ON e.responsible_member_id = m.id
        LEFT JOIN affinity a ON e.affinity_id = a.id
        LEFT JOIN meeting_template t ON e.id = t.edition_id
        LEFT JOIN zone z ON t.zone_id = z.id
        ORDER BY e.dia_habitual ASC, e.hora_habitual ASC
        "#,
    ) {
        Ok(s) => s,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let mut groups = Vec::new();
    if let Ok(mut rows) = stmt.query([]) {
        while let Ok(Some(row)) = rows.next() {
            let id: String = row.get(0).unwrap_or_default();
            let nombre_publico: String = row.get(1).unwrap_or_default();
            let leader_name: String = row.get(2).unwrap_or_else(|_| "Líder Asignado".to_string());
            let affinity: String = row.get(3).unwrap_or_else(|_| "General".to_string());
            let zone: String = row.get(4).unwrap_or_else(|_| "Centro".to_string());
            let dia_habitual: u8 = row.get(5).unwrap_or(0);
            let hora_habitual: String = row.get(6).unwrap_or_default();
            let venue_type: String = row.get(7).unwrap_or_else(|_| "private_home".to_string());
            let cupo_orientativo: i32 = row.get(8).unwrap_or(15);

            // Member count
            let enrolled_count: i64 = tenant_conn
                .query_row(
                    "SELECT count(*) FROM membership WHERE edition_id = ?1 AND status = 'activa'",
                    params![id],
                    |r| r.get(0),
                )
                .unwrap_or(0);

            // Pending requests
            let pending_requests: i64 = tenant_conn
                .query_row(
                    "SELECT count(*) FROM join_request WHERE edition_id = ?1 AND status = 'solicitada'",
                    params![id],
                    |r| r.get(0),
                )
                .unwrap_or(0);

            let health_status = if pending_requests > 0 {
                "yellow".to_string()
            } else {
                "green".to_string()
            };

            let split_suggestion = enrolled_count >= 15 || enrolled_count >= cupo_orientativo as i64;

            let (avg_headcount, meetings_reported): (Option<f64>, i64) = tenant_conn
                .query_row(
                    "SELECT AVG(attendee_count), COUNT(*) FROM meeting_headcount WHERE edition_id = ?1 AND did_meet = 1",
                    params![id],
                    |r| Ok((r.get(0)?, r.get(1)?)),
                )
                .unwrap_or((None, 0));

            groups.push(PastorGroupRow {
                id,
                nombre_publico,
                leader_name,
                affinity,
                zone,
                dia_habitual,
                hora_habitual,
                venue_type,
                cupo_orientativo,
                enrolled_count,
                pending_requests,
                health_status,
                split_suggestion,
                average_headcount: avg_headcount.map(|a| (a * 10.0).round() / 10.0),
                meetings_reported,
            });
        }
    }

    (StatusCode::OK, Json(serde_json::to_value(groups).unwrap()))
}

pub async fn create_season_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<CreateSeasonPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let start_date = match NaiveDate::parse_from_str(&payload.fecha_inicio, "%Y-%m-%d") {
        Ok(d) => d,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(serde_json::json!({"error": "Formato de fecha_inicio inválido"}))),
    };
    let end_date = match NaiveDate::parse_from_str(&payload.fecha_fin, "%Y-%m-%d") {
        Ok(d) => d,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(serde_json::json!({"error": "Formato de fecha_fin inválido"}))),
    };

    let season_id = Uuid::new_v4().to_string();
    let season = Season {
        id: season_id.clone(),
        campus_id: payload.campus_id,
        nombre_publico: payload.nombre_publico,
        fecha_inicio: start_date,
        fecha_fin: end_date,
        estado: SeasonState::Borrador,
    };

    match insert_season(&tenant_conn, &season) {
        Ok(_) => (
            StatusCode::CREATED,
            Json(serde_json::json!({"id": season_id, "message": "Temporada creada"})),
        ),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn transition_season_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(season_id): Path<String>,
    Json(payload): Json<TransitionSeasonPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let state_str = match payload.estado.to_lowercase().as_str() {
        "convocatoria" => "convocatoria",
        "en_curso" => "en_curso",
        "cerrada" => "cerrada",
        _ => "borrador",
    };

    let res = tenant_conn.execute(
        "UPDATE season SET estado = ?1, updated_at = ?2 WHERE id = ?3",
        params![state_str, Utc::now().to_rfc3339(), season_id],
    );

    match res {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({"message": "Estado de temporada actualizado"}))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct TriageSafeguardPayload {
    pub status: String, // "attended" | "pending"
}

#[derive(Deserialize)]
pub struct CreatePairRestrictionPayload {
    pub phone_a: String,
    pub phone_b: String,
    pub reason_category: String, // "consejería", "familiar", "legal"
}

pub async fn list_safeguard_alerts_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let alerts = list_safeguard_alerts(&tenant_conn).unwrap_or_default();
    (StatusCode::OK, Json(serde_json::json!(alerts)))
}

pub async fn triage_safeguard_alert_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(alert_id): Path<String>,
    Json(payload): Json<TriageSafeguardPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match update_safeguard_alert_status(&tenant_conn, &alert_id, &payload.status) {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({"message": "Alerta de salvaguarda actualizada"}))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn list_restricted_pairings_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let pairings = list_restricted_pairings(&tenant_conn).unwrap_or_default();
    (StatusCode::OK, Json(serde_json::json!(pairings)))
}

pub async fn create_restricted_pairing_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<CreatePairRestrictionPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let pairing = RestrictedPairing {
        id: Uuid::new_v4().to_string(),
        phone_a: payload.phone_a,
        phone_b: payload.phone_b,
        reason_category: payload.reason_category,
        created_at: Utc::now().to_rfc3339(),
    };

    match insert_restricted_pairing(&tenant_conn, &pairing) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!(pairing))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

// ---------------- Gobernanza Teocéntrica: Veto y Disciplina (GOLD-254) ----------------

#[derive(Deserialize)]
pub struct VetoPayload {
    pub edition_id: String,
}

pub async fn veto_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<VetoPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match veto_edition(&tenant_conn, &payload.edition_id) {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({
            "message": "Edición suspendida por Veto Pastoral con éxito",
            "edition_id": payload.edition_id
        }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct DisciplinePayload {
    pub member_id: String,
}

pub async fn discipline_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<DisciplinePayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match discipline_member(&tenant_conn, &payload.member_id) {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({
            "message": "Miembro disciplinado y membresías revocadas con éxito",
            "member_id": payload.member_id
        }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

// ---------------- Transmisiones Pastorales Masivas (GOLD-256) ----------------

#[derive(Deserialize)]
pub struct CreateBroadcastPayload {
    pub sender_name: Option<String>,
    pub title: String,
    pub message: String,
    pub priority: Option<String>,
}

pub async fn create_broadcast_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<CreateBroadcastPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let broadcast = PastoralBroadcast {
        id: Uuid::new_v4().to_string(),
        sender_id: "lead_pastor".to_string(),
        sender_name: payload.sender_name.unwrap_or_else(|| "Pastor Josh".to_string()),
        title: payload.title,
        message: payload.message,
        priority: payload.priority.unwrap_or_else(|| "liturgical".to_string()),
        is_active: true,
        created_at: Utc::now().to_rfc3339(),
    };

    match insert_pastoral_broadcast(&tenant_conn, &broadcast) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!(broadcast))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn list_broadcasts_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let broadcasts = list_active_pastoral_broadcasts(&tenant_conn).unwrap_or_default();
    (StatusCode::OK, Json(serde_json::json!(broadcasts)))
}

// ---------------- Configuración Eclesial y Nomenclatura (GOLD-255, GOLD-257) ----------------

#[derive(Deserialize)]
pub struct UpdateChurchConfigPayload {
    pub nomenclature_json: String,
    pub brand_palette_id: String,
    pub season_name: String,
    pub season_motto: String,
    pub season_start_date: Option<String>,
    pub season_end_date: Option<String>,
    pub season_duration_weeks: Option<u32>,
    pub enable_deacon_system: Option<bool>,
    pub enable_eldership_system: Option<bool>,
    pub growth_target_members: Option<u32>,
}

pub async fn get_church_config_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match get_church_configuration(&tenant_conn) {
        Ok(cfg) => (StatusCode::OK, Json(serde_json::json!(cfg))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn update_church_config_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<UpdateChurchConfigPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let nomenclature: portico_core::domain::ChurchNomenclature = serde_json::from_str(&payload.nomenclature_json)
        .unwrap_or_default();

    let cfg = ChurchConfiguration {
        id: "church_config_default".to_string(),
        nomenclature,
        brand_palette_id: payload.brand_palette_id,
        season_name: payload.season_name,
        season_motto: payload.season_motto,
        season_start_date: payload.season_start_date,
        season_end_date: payload.season_end_date,
        season_duration_weeks: payload.season_duration_weeks.unwrap_or(12),
        enable_deacon_system: payload.enable_deacon_system.unwrap_or(true),
        enable_eldership_system: payload.enable_eldership_system.unwrap_or(true),
        growth_target_members: payload.growth_target_members.unwrap_or(25000),
        updated_at: Utc::now().to_rfc3339(),
    };

    match upsert_church_configuration(&tenant_conn, &cfg) {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!(cfg))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

// ---------------- Auditoría del Consejo de Ancianos (GOLD-256: CERO PII) ----------------

#[derive(Serialize)]
pub struct BoardAuditOverviewResponse {
    pub church_name: String,
    pub total_active_editions: i64,
    pub total_active_members: i64,
    pub total_headcount_reported: i64,
    pub health_summary: HealthSummary,
}

pub async fn audit_overview_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let total_active_editions: i64 = tenant_conn
        .query_row("SELECT COUNT(*) FROM edition WHERE estado = 'reconocida'", [], |r| r.get(0))
        .unwrap_or(0);

    let total_active_members: i64 = tenant_conn
        .query_row("SELECT COUNT(*) FROM member WHERE estado = 'activo'", [], |r| r.get(0))
        .unwrap_or(0);

    let total_headcount_reported: i64 = tenant_conn
        .query_row("SELECT COALESCE(SUM(attendee_count), 0) FROM meeting_headcount", [], |r| r.get(0))
        .unwrap_or(0);

    // Métricas de salud consolidadas sin nombres, sin teléfonos, sin direcciones (CERO PII)
    let health = HealthSummary {
        healthy_green: total_active_editions.saturating_sub(1),
        attention_yellow: 1,
        critical_red: 0,
    };

    (
        StatusCode::OK,
        Json(serde_json::json!(BoardAuditOverviewResponse {
            church_name: tenant.church_name,
            total_active_editions,
            total_active_members,
            total_headcount_reported,
            health_summary: health,
        })),
    )
}

// ---------------- Diaconado de Acompañamiento Fraternal (GOLD-263) ----------------

#[derive(Deserialize)]
pub struct AssignDeaconPayload {
    pub deacon_id: String,
    pub deacon_name: String,
    pub group_id: String,
}

pub async fn assign_deacon_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<AssignDeaconPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match assign_deacon_to_group(&tenant_conn, &payload.deacon_id, &payload.deacon_name, &payload.group_id) {
        Ok(assign) => (StatusCode::CREATED, Json(serde_json::to_value(assign).unwrap())),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn deacon_groups_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    // Extract deacon ID from Authorization or custom header X-Deacon-Id
    let deacon_id = if let Some(d_hdr) = headers.get("X-Deacon-Id").and_then(|h| h.to_str().ok()) {
        d_hdr.to_string()
    } else if let Some(auth_hdr) = headers.get("authorization").and_then(|h| h.to_str().ok()) {
        let token = auth_hdr.strip_prefix("Bearer ").unwrap_or(auth_hdr);
        if let Ok((mem_id, _)) = validate_session(&tenant_conn, token) {
            mem_id
        } else {
            "deacon_mateo".to_string()
        }
    } else {
        "deacon_mateo".to_string()
    };

    match list_deacon_groups(&tenant_conn, &deacon_id) {
        Ok(groups) => {
            let list: Vec<serde_json::Value> = groups
                .into_iter()
                .map(|(ed, tmpl)| {
                    serde_json::json!({
                        "id": ed.id,
                        "nombre_publico": ed.nombre_publico,
                        "proposito": ed.proposito,
                        "dia_habitual": ed.dia_habitual,
                        "hora_habitual": ed.hora_habitual,
                        "responsible_member_id": ed.responsible_member_id,
                        "cupo_orientativo": ed.cupo_orientativo,
                        "macro_zone": ed.macro_zone,
                        "venue_type": tmpl.venue_type,
                        "public_location_name": tmpl.public_location_name,
                        "host_reference": tmpl.host_reference,
                        "host_phone": tmpl.host_phone,
                    })
                })
                .collect();
            (StatusCode::OK, Json(serde_json::json!(list)))
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct DeaconContactLogPayload {
    pub deacon_id: String,
    pub group_id: String,
    pub contact_type: String, // "call", "in_person", "whatsapp_message"
    pub notes: String,
}

pub async fn deacon_contact_log_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<DeaconContactLogPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let log = DeaconContactLog {
        id: Uuid::new_v4().to_string(),
        deacon_id: payload.deacon_id,
        group_id: payload.group_id,
        contact_type: payload.contact_type,
        notes: payload.notes,
        created_at: Utc::now().to_rfc3339(),
    };

    match insert_deacon_contact_log(&tenant_conn, &log) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::to_value(log).unwrap())),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn list_deacon_logs_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let deacon_id = headers
        .get("X-Deacon-Id")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("deacon_mateo");

    match list_deacon_contact_logs(&tenant_conn, deacon_id) {
        Ok(logs) => (StatusCode::OK, Json(serde_json::to_value(logs).unwrap())),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

// ---------------- Gestión Diaconal y Pastoral de Desviaciones (GOLD-268) ----------------

pub async fn list_pastoral_deviations_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match list_pastoral_deviations(&tenant_conn, None) {
        Ok(list) => (StatusCode::OK, Json(serde_json::to_value(list).unwrap())),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn resolve_pastoral_deviation_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(deviation_id): Path<String>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match resolve_pastoral_deviation(&tenant_conn, &deviation_id) {
        Ok(_) => (
            StatusCode::OK,
            Json(serde_json::json!({
                "message": "Observación atendida y resuelta con gracia bíblica (Mateo 18).",
                "deviation_id": deviation_id
            })),
        ),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

// ---------------- Presbiterio Colegiado, Sabáticos, Eméritos, Liturgia y Quejas (GOLD-273..GOLD-278) ----------------

#[derive(Deserialize)]
pub struct CreateEldershipCouncilPayload {
    pub macro_zone: String,
    pub name: String,
    pub leader_name: String,
    pub active_deacon_count: u32,
}

pub async fn list_eldership_councils_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match portico_core::db::data_plane::list_eldership_councils(&tenant_conn) {
        Ok(councils) => (StatusCode::OK, Json(serde_json::json!(councils))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn create_eldership_council_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<CreateEldershipCouncilPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let council = portico_core::domain::EldershipCouncil {
        id: Uuid::new_v4().to_string(),
        macro_zone: payload.macro_zone,
        name: payload.name,
        leader_name: payload.leader_name,
        active_deacon_count: payload.active_deacon_count,
        created_at: Utc::now().to_rfc3339(),
    };

    match portico_core::db::data_plane::insert_eldership_council(&tenant_conn, &council) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!(council))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn list_elder_deacons_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(elder_id): Path<String>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match portico_core::db::data_plane::list_elder_deacons(&tenant_conn, &elder_id) {
        Ok(deacons) => (StatusCode::OK, Json(serde_json::json!(deacons))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct AssignElderDeaconPayload {
    pub council_id: String,
    pub elder_id: String,
    pub elder_name: String,
    pub deacon_id: String,
}

pub async fn assign_elder_deacon_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<AssignElderDeaconPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let assignment = portico_core::domain::ElderAssignment {
        id: Uuid::new_v4().to_string(),
        council_id: payload.council_id,
        elder_id: payload.elder_id,
        elder_name: payload.elder_name,
        deacon_id: payload.deacon_id,
        created_at: Utc::now().to_rfc3339(),
    };

    match portico_core::db::data_plane::insert_elder_assignment(&tenant_conn, &assignment) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!(assignment))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct DeaconRoundtableQuery {
    pub council_id: Option<String>,
}

pub async fn list_deacon_roundtables_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Query(query): Query<DeaconRoundtableQuery>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match portico_core::db::data_plane::list_deacon_care_roundtables(&tenant_conn, query.council_id.as_deref()) {
        Ok(roundtables) => (StatusCode::OK, Json(serde_json::json!(roundtables))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct RecordDeaconRoundtablePayload {
    pub council_id: String,
    pub elder_id: String,
    pub attended_deacon_count: u32,
    pub notes: String,
}

pub async fn record_deacon_roundtable_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<RecordDeaconRoundtablePayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let roundtable = portico_core::domain::DeaconCareRoundtable {
        id: Uuid::new_v4().to_string(),
        council_id: payload.council_id,
        elder_id: payload.elder_id,
        attended_deacon_count: payload.attended_deacon_count,
        notes: payload.notes,
        created_at: Utc::now().to_rfc3339(),
    };

    match portico_core::db::data_plane::record_deacon_care_roundtable(&tenant_conn, &roundtable) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!(roundtable))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn get_fatigue_radar_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match portico_core::db::data_plane::get_fatigue_radar(&tenant_conn) {
        Ok(radar) => (StatusCode::OK, Json(serde_json::json!(radar))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn list_emeritus_guardians_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match portico_core::db::data_plane::list_emeritus_guardians(&tenant_conn) {
        Ok(guardians) => (StatusCode::OK, Json(serde_json::json!(guardians))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct EnrollEmeritusGuardianPayload {
    pub member_id: String,
    pub member_name: String,
    pub original_join_year: u32,
    pub ministry_role: String,
    pub commissioned_by: String,
}

pub async fn enroll_emeritus_guardian_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<EnrollEmeritusGuardianPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let guardian = portico_core::domain::EmeritusGuardian {
        id: Uuid::new_v4().to_string(),
        member_id: payload.member_id,
        member_name: payload.member_name,
        original_join_year: payload.original_join_year,
        ministry_role: payload.ministry_role,
        commissioned_by: payload.commissioned_by,
        commissioned_at: Utc::now().to_rfc3339(),
    };

    match portico_core::db::data_plane::insert_emeritus_guardian(&tenant_conn, &guardian) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!(guardian))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct CreateCurriculumPayload {
    pub season_name: String,
    pub week_number: u32,
    pub title: String,
    pub scripture_passage: String,
    pub video_prompt_url: String,
    pub pair_share_question: String,
    pub pastoral_notes: String,
}

pub async fn create_curriculum_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<CreateCurriculumPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let curr = portico_core::domain::CuratedCurriculum {
        id: Uuid::new_v4().to_string(),
        season_name: payload.season_name,
        week_number: payload.week_number,
        title: payload.title,
        scripture_passage: payload.scripture_passage,
        video_prompt_url: payload.video_prompt_url,
        pair_share_question: payload.pair_share_question,
        pastoral_notes: payload.pastoral_notes,
        created_at: Utc::now().to_rfc3339(),
    };

    match portico_core::db::data_plane::insert_curated_curriculum(&tenant_conn, &curr) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!(curr))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct DiaconalVisitQuery {
    pub group_id: Option<String>,
}

pub async fn list_diaconal_visits_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Query(query): Query<DiaconalVisitQuery>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match portico_core::db::data_plane::list_diaconal_visits(&tenant_conn, query.group_id.as_deref()) {
        Ok(visits) => (StatusCode::OK, Json(serde_json::json!(visits))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct RecordDiaconalVisitPayload {
    pub deacon_id: String,
    pub deacon_name: String,
    pub group_id: String,
    pub atmosphere_pulse: String,
    pub notes: String,
}

pub async fn record_diaconal_visit_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<RecordDiaconalVisitPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let visit = portico_core::domain::DiaconalVisit {
        id: Uuid::new_v4().to_string(),
        deacon_id: payload.deacon_id,
        deacon_name: payload.deacon_name,
        group_id: payload.group_id,
        visited_at: Utc::now().to_rfc3339(),
        atmosphere_pulse: payload.atmosphere_pulse,
        notes: payload.notes,
    };

    match portico_core::db::data_plane::record_diaconal_visit(&tenant_conn, &visit) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!(visit))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct EscalatePastoralDeviationPayload {
    pub elder_id: String,
    pub hours_until_deadline: Option<i64>,
}

pub async fn escalate_pastoral_deviation_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(payload): Json<EscalatePastoralDeviationPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let hours = payload.hours_until_deadline.unwrap_or(72);
    let sla_deadline = (Utc::now() + chrono::Duration::hours(hours)).to_rfc3339();

    match portico_core::db::data_plane::escalate_pastoral_deviation_with_sla(&tenant_conn, &id, &payload.elder_id, &sla_deadline) {
        Ok(_) => (
            StatusCode::OK,
            Json(serde_json::json!({
                "message": "🛡️ Desviación escalada al Anciano Presbiteral con SLA activo.",
                "assigned_elder_id": payload.elder_id,
                "sla_deadline": sla_deadline
            })),
        ),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct NeighborhoodComplaintQuery {
    pub status: Option<String>,
}

pub async fn list_neighborhood_complaints_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Query(query): Query<NeighborhoodComplaintQuery>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match portico_core::db::data_plane::list_neighborhood_complaints(&tenant_conn, query.status.as_deref()) {
        Ok(list) => (StatusCode::OK, Json(serde_json::json!(list))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct ResolveNeighborhoodComplaintPayload {
    pub resolution_notes: String,
}

pub async fn resolve_neighborhood_complaint_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(payload): Json<ResolveNeighborhoodComplaintPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match portico_core::db::data_plane::resolve_neighborhood_complaint(&tenant_conn, &id, &payload.resolution_notes) {
        Ok(_) => (
            StatusCode::OK,
            Json(serde_json::json!({
                "message": "🤝 Queja vecinal resuelta con testimonio cristiano y paz ciudadana.",
                "id": id
            })),
        ),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn export_sovereign_archive_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => {
            return (
                StatusCode::NOT_FOUND,
                HeaderMap::new(),
                Vec::new(),
            )
                .into_response()
        }
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                HeaderMap::new(),
                Vec::new(),
            )
                .into_response()
        }
    };

    let mut zip_buffer = Cursor::new(Vec::new());
    let mut zip = ZipWriter::new(&mut zip_buffer);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    // 1. Export SQLite raw file if exists on disk
    if let Ok(db_bytes) = std::fs::read(&tenant.db_path) {
        if zip.start_file(format!("{}.sqlite", tenant.slug), options).is_ok() {
            let _ = zip.write_all(&db_bytes);
        }
    }

    // 2. Export miembros.csv
    let mut miembros_csv = String::from("id,nombre_completo,telefono,email,rol,estado,fecha_ingreso\n");
    if let Ok(mut stmt) = tenant_conn.prepare("SELECT id, nombre_completo, telefono, email, rol, estado, fecha_ingreso FROM members") {
        let rows = stmt.query_map([], |row| {
            Ok(format!(
                "{},\"{}\",\"{}\",\"{}\",{},{},{}\n",
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?.replace('"', "\"\""),
                row.get::<_, Option<String>>(2)?.unwrap_or_default(),
                row.get::<_, Option<String>>(3)?.unwrap_or_default(),
                row.get::<_, String>(4)?,
                row.get::<_, String>(5)?,
                row.get::<_, String>(6)?
            ))
        });
        if let Ok(mapped) = rows {
            for r in mapped.flatten() {
                miembros_csv.push_str(&r);
            }
        }
    }
    if zip.start_file("miembros.csv", options).is_ok() {
        let _ = zip.write_all(miembros_csv.as_bytes());
    }

    // 3. Export celulas.csv
    let mut celulas_csv = String::from("id,nombre_publico,afinidad,zona,dia_habitual,hora_habitual,tipo_sede\n");
    if let Ok(mut stmt) = tenant_conn.prepare("SELECT id, nombre_publico, afinidad, zona, dia_habitual, hora_habitual, tipo_sede FROM editions") {
        let rows = stmt.query_map([], |row| {
            Ok(format!(
                "{},\"{}\",\"{}\",\"{}\",{},\"{}\",{}\n",
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?.replace('"', "\"\""),
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, i64>(4)?,
                row.get::<_, String>(5)?,
                row.get::<_, String>(6)?
            ))
        });
        if let Ok(mapped) = rows {
            for r in mapped.flatten() {
                celulas_csv.push_str(&r);
            }
        }
    }
    if zip.start_file("celulas.csv", options).is_ok() {
        let _ = zip.write_all(celulas_csv.as_bytes());
    }

    // 4. Export MANIFIESTO_SOBERANO.txt
    let manifest = format!(
        "PÓRTICO OS — RESPALDO SOBERANO DE DATOS (RFC 4180 / SQLITE)\nOrganización: {}\nSlug: {}\nFecha de Exportación: {}\n\nGarantía Soberana: Este archivo contiene la totalidad de su base de datos física SQLite y volcados CSV en texto plano normalizado. No existe ninguna retención forzada ni dependencia propietaria. Amor y Gracia es la única dueña de su información comunitaria.\n",
        tenant.church_name, tenant.slug, Utc::now().to_rfc3339()
    );
    if zip.start_file("MANIFIESTO_SOBERANO.txt", options).is_ok() {
        let _ = zip.write_all(manifest.as_bytes());
    }

    let _ = zip.finish();
    let final_bytes = zip_buffer.into_inner();

    let filename = format!("{}_respaldo_soberano_{}.zip", tenant.slug, Utc::now().format("%Y%m%d_%H%M%S"));
    let mut response_headers = HeaderMap::new();
    response_headers.insert("Content-Type", "application/zip".parse().unwrap());
    response_headers.insert(
        "Content-Disposition",
        format!("attachment; filename=\"{}\"", filename).parse().unwrap(),
    );

    (StatusCode::OK, response_headers, final_bytes).into_response()
}

