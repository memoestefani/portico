use axum::{
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    response::{Html, IntoResponse},
    Json,
};
use chrono::Utc;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use portico_core::calendar::resolve_next_meeting;
use portico_core::db::data_plane::{
    enroll_in_service_ministry, get_current_season_for_campus, insert_service_ministry,
    list_campuses, list_exceptions_for_edition, list_ministry_enrollments,
    list_recognized_editions_for_season, list_service_ministries,
};
use portico_core::domain::{LicenseStatus, MinistryEnrollment, NamingScheme, ServiceMinistry, VenueType};
use crate::state::AppState;

#[derive(Deserialize)]
pub struct CatalogQuery {
    pub campus_slug: Option<String>,
    pub affinity_id: Option<String>,
    pub zone_id: Option<String>,
    pub kids_welcome: Option<bool>,
    pub kids_friendly: Option<bool>,
    pub macro_zone: Option<String>,
    pub transit_friendly: Option<bool>,
}

#[derive(Serialize)]
pub struct PublicEditionCard {
    pub id: String,
    pub nombre_publico: String,
    pub proposito: String,
    pub affinity_name: String,
    pub zone_label: String,
    pub dia_habitual: u8,
    pub hora_habitual: String,
    pub venue_category: String, // "Casa particular", "Lugar público (Café/Restaurante)", "En línea"
    pub location_summary: String, // Filtered according to polymorphic privacy rules!
    pub map_url: Option<String>,
    pub leader_name: Option<String>,
    pub host_name: Option<String>,
    pub apprentice_name: Option<String>,
    pub kids_welcome: bool,
    pub kids_space_type: String,
    pub is_full: bool,
    pub aviso_breve: Option<String>,
    pub next_meeting_summary: Option<String>,
    pub transit_friendly: bool,
    pub carpool_available: bool,
    pub macro_zone: Option<String>,
}

fn url_encode_text(s: &str) -> String {
    let mut out = String::new();
    for b in s.bytes() {
        match b {
            b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => out.push(b as char),
            b' ' => out.push_str("%20"),
            _ => out.push_str(&format!("%{:02X}", b)),
        }
    }
    out
}

#[derive(Serialize)]
pub struct PublicConfigResponse {
    pub church_name: String,
    pub slug: String,
    pub naming_scheme: NamingScheme,
    pub campuses: Vec<CampusSummary>,
    pub affinities: Vec<ItemSummary>,
    pub zones: Vec<ItemSummary>,
    pub active_season: Option<SeasonSummary>,
}

#[derive(Serialize)]
pub struct CampusSummary {
    pub id: String,
    pub slug: String,
    pub nombre_publico: String,
    pub ciudad: String,
}

#[derive(Serialize)]
pub struct ItemSummary {
    pub id: String,
    pub label: String,
}

#[derive(Serialize)]
pub struct SeasonSummary {
    pub id: String,
    pub nombre_publico: String,
    pub fecha_inicio: String,
    pub fecha_fin: String,
}

#[derive(Deserialize)]
pub struct JoinRequestPayload {
    pub edition_id: String,
    pub name: String,
    pub whatsapp: String,
}

fn resolve_tenant(headers: &HeaderMap, state: &AppState) -> Option<portico_core::domain::Tenant> {
    // 1. Check X-Tenant-Slug header (used in dev and testing)
    if let Some(slug) = headers.get("X-Tenant-Slug").and_then(|v| v.to_str().ok()) {
        if let Ok(Some(t)) = state.get_tenant(slug) {
            if t.license_status == LicenseStatus::Active {
                return Some(t);
            }
        }
    }

    // 2. Check Host header (e.g. "amorygracia.localhost", "amorygracia.portico.lat", "grupos.amorygracia.mx")
    if let Some(host) = headers.get("host").and_then(|v| v.to_str().ok()) {
        let clean_host = host.split(':').next().unwrap_or(host);
        
        // Check full domain match
        if let Ok(Some(t)) = state.get_tenant(clean_host) {
            if t.license_status == LicenseStatus::Active {
                return Some(t);
            }
        }

        // Check subdomain prefix (e.g. "amorygracia" from "amorygracia.portico.lat")
        let parts: Vec<&str> = clean_host.split('.').collect();
        if !parts.is_empty() {
            if let Ok(Some(t)) = state.get_tenant(parts[0]) {
                if t.license_status == LicenseStatus::Active {
                    return Some(t);
                }
            }
        }
    }

    // Fallback default tenant for local demo/dev if only 1 active tenant exists or "amorygracia"
    if let Ok(Some(t)) = state.get_tenant("amorygracia") {
        if t.license_status == LicenseStatus::Active {
            return Some(t);
        }
    }

    None
}

pub async fn get_config_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada o inactiva"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let campuses = list_campuses(&tenant_conn).unwrap_or_default();
    let campus_summaries: Vec<CampusSummary> = campuses
        .into_iter()
        .map(|c| CampusSummary {
            id: c.id,
            slug: c.slug,
            nombre_publico: c.nombre_publico,
            ciudad: c.ciudad,
        })
        .collect();

    let mut affinities = Vec::new();
    if let Ok(mut stmt) = tenant_conn.prepare("SELECT id, nombre_publico FROM affinity WHERE status = 'active' ORDER BY sort_order ASC") {
        if let Ok(mut rows) = stmt.query([]) {
            while let Ok(Some(row)) = rows.next() {
                affinities.push(ItemSummary {
                    id: row.get(0).unwrap_or_default(),
                    label: row.get(1).unwrap_or_default(),
                });
            }
        }
    }

    let mut zones = Vec::new();
    if let Ok(mut stmt) = tenant_conn.prepare("SELECT id, label FROM zone WHERE status = 'active' ORDER BY sort_order ASC") {
        if let Ok(mut rows) = stmt.query([]) {
            while let Ok(Some(row)) = rows.next() {
                zones.push(ItemSummary {
                    id: row.get(0).unwrap_or_default(),
                    label: row.get(1).unwrap_or_default(),
                });
            }
        }
    }

    // Active season for first campus
    let active_season = if let Some(first_campus) = campus_summaries.first() {
        get_current_season_for_campus(&tenant_conn, &first_campus.id)
            .ok()
            .flatten()
            .map(|s| SeasonSummary {
                id: s.id,
                nombre_publico: s.nombre_publico,
                fecha_inicio: s.fecha_inicio.to_string(),
                fecha_fin: s.fecha_fin.to_string(),
            })
    } else {
        None
    };

    let response = PublicConfigResponse {
        church_name: tenant.church_name,
        slug: tenant.slug,
        naming_scheme: tenant.naming_scheme,
        campuses: campus_summaries,
        affinities,
        zones,
        active_season,
    };

    (StatusCode::OK, Json(serde_json::to_value(response).unwrap()))
}

pub async fn get_catalog_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Query(query): Query<CatalogQuery>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada o inactiva"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    // Determine campus
    let campuses = list_campuses(&tenant_conn).unwrap_or_default();
    let selected_campus = if let Some(slug) = query.campus_slug {
        campuses.into_iter().find(|c| c.slug == slug)
    } else {
        campuses.into_iter().next()
    };

    let campus = match selected_campus {
        Some(c) => c,
        None => return (StatusCode::OK, Json(serde_json::json!([]))),
    };

    // Active season
    let season = match get_current_season_for_campus(&tenant_conn, &campus.id) {
        Ok(Some(s)) => s,
        _ => return (StatusCode::OK, Json(serde_json::json!([]))),
    };

    let editions_with_templates = list_recognized_editions_for_season(&tenant_conn, &season.id).unwrap_or_default();

    let mut cards = Vec::new();
    let today = Utc::now().date_naive();

    for (ed, tmpl) in editions_with_templates {
        // Filter by affinity
        if let Some(ref aff_filter) = query.affinity_id {
            if &ed.affinity_id != aff_filter {
                continue;
            }
        }

        // Filter by zone
        if let Some(ref zone_filter) = query.zone_id {
            if tmpl.zone_id.as_deref() != Some(zone_filter) {
                continue;
            }
        }

        // Filter by kids friendly (Decisión 10-C)
        let filter_kids = query.kids_welcome.or(query.kids_friendly);
        if filter_kids == Some(true) && !tmpl.kids_welcome {
            continue;
        }

        // Filter by macro_zone (Decisión 6 / GOLD-267)
        if let Some(ref mz_filter) = query.macro_zone {
            if ed.macro_zone.as_deref() != Some(mz_filter.as_str()) {
                continue;
            }
        }

        // Filter by transit friendly
        if query.transit_friendly == Some(true) && !ed.transit_friendly && !ed.carpool_available {
            continue;
        }

        // Fetch apprentice name if present
        let apprentice_name: Option<String> = tmpl.apprentice_id.as_ref().and_then(|aid| {
            tenant_conn
                .query_row("SELECT nombre_visible FROM member WHERE id = ?1", params![aid], |r| r.get(0))
                .ok()
        });

        // Fetch affinity name
        let affinity_name: String = tenant_conn
            .query_row(
                "SELECT nombre_publico FROM affinity WHERE id = ?1",
                params![ed.affinity_id],
                |r| r.get(0),
            )
            .unwrap_or_else(|_| "Comunidad".to_string());

        // Fetch zone label
        let zone_label: String = tmpl.zone_id.as_ref().and_then(|zid| {
            tenant_conn
                .query_row("SELECT label FROM zone WHERE id = ?1", params![zid], |r| r.get(0))
                .ok()
        }).unwrap_or_else(|| "Zona General".to_string());

        // Leader name (only if public_responsible_visibility is true)
        let leader_name = if ed.public_responsible_visibility {
            tenant_conn
                .query_row(
                    "SELECT nombre_visible FROM member WHERE id = ?1",
                    params![ed.responsible_member_id],
                    |r| r.get(0),
                )
                .ok()
        } else {
            None
        };

        // Polymorphic Venue Privacy & Formatting Rules:
        let (venue_category, location_summary, map_url) = match tmpl.venue_type {
            VenueType::PrivateHome => {
                // R11: Private home address and exact coordinates are sealed in member silo!
                // Unauthenticated visitors see only the neighborhood/zone and general cross streets.
                let loc = match (&tmpl.private_reference, &tmpl.public_location_name) {
                    (Some(notes), Some(zone)) => format!("{}, Durango ({})", zone, notes),
                    (None, Some(zone)) => format!("{}, Durango", zone),
                    _ => format!("{}, Durango (Domicilio particular)", zone_label),
                };
                ("Casa particular".to_string(), loc, None)
            }
            VenueType::PublicVenue => {
                // Public venues: fully open and visible with Google Maps link
                let loc = tmpl.public_location_name.clone().unwrap_or_else(|| "Lugar Público".to_string());
                let full_loc = match &tmpl.private_address {
                    Some(addr) => format!("{} - {}", loc, addr),
                    None => loc,
                };
                ("Lugar público".to_string(), full_loc, tmpl.public_location_url.clone())
            }
            VenueType::OnlineSession => {
                // Online: link is sealed for members
                ("En línea".to_string(), "Reunión virtual en tiempo real (enlace al inscribirse)".to_string(), None)
            }
            VenueType::Other => ("Punto de encuentro".to_string(), zone_label.clone(), None),
        };

        // Resolve next meeting with exceptions (e.g. Taquería exception)
        let exceptions = list_exceptions_for_edition(&tenant_conn, &ed.id).unwrap_or_default();
        let next_meeting = resolve_next_meeting(&ed, &tmpl, &exceptions, today, &season);
        let next_meeting_summary = next_meeting.map(|m| {
            if let Some(loc_override) = m.public_location_name {
                format!("Próx. sesión: {} {} (Lugar especial: {})", m.date, m.time, loc_override)
            } else {
                format!("Próx. sesión: {} {}", m.date, m.time)
            }
        });

        cards.push(PublicEditionCard {
            id: ed.id,
            nombre_publico: ed.nombre_publico,
            proposito: ed.proposito,
            affinity_name,
            zone_label,
            dia_habitual: ed.dia_habitual,
            hora_habitual: ed.hora_habitual,
            venue_category,
            location_summary,
            map_url,
            leader_name,
            host_name: tmpl.host_reference.clone(),
            apprentice_name,
            kids_welcome: tmpl.kids_welcome,
            kids_space_type: tmpl.kids_space_type.clone(),
            is_full: ed.is_full,
            aviso_breve: ed.aviso_breve,
            next_meeting_summary,
            transit_friendly: ed.transit_friendly,
            carpool_available: ed.carpool_available,
            macro_zone: ed.macro_zone,
        });
    }

    (StatusCode::OK, Json(serde_json::to_value(cards).unwrap()))
}

pub async fn submit_join_request_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<JoinRequestPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada o inactiva"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let req_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    // Ruteo Preventivo Anti-Colisión (Decisión 7-C / GOLD-246)
    // Verificar si el teléfono del solicitante tiene restricción registrada
    let has_conflict: bool = tenant_conn
        .query_row(
            "SELECT COUNT(*) FROM restricted_pairing WHERE phone_a = ?1 OR phone_b = ?1",
            params![payload.whatsapp],
            |r| r.get::<_, i64>(0),
        )
        .map(|c| c > 0)
        .unwrap_or(false);

    let (effective_edition_id, suggested_alternative_id) = if has_conflict {
        // Encontrar otra edición disponible en el mismo campus para reubicar amablemente
        let alt_id: Option<String> = tenant_conn
            .query_row(
                "SELECT id FROM edition WHERE id != ?1 AND estado = 'reconocida' LIMIT 1",
                params![payload.edition_id],
                |r| r.get(0),
            )
            .ok();
        match alt_id {
            Some(alt) => (alt.clone(), Some(alt)),
            None => (payload.edition_id.clone(), None),
        }
    } else {
        (payload.edition_id.clone(), None)
    };

    let result = tenant_conn.execute(
        r#"
        INSERT INTO join_request (id, edition_id, name, whatsapp, status, created_at)
        VALUES (?1, ?2, ?3, ?4, 'solicitada', ?5)
        "#,
        params![req_id, effective_edition_id, payload.name, payload.whatsapp, now],
    );

    // Protocolo de Acera en WhatsApp (Decisión 8-C / GOLD-247)
    let host_name: String = tenant_conn
        .query_row(
            r#"
            SELECT COALESCE(t.host_reference, m.nombre_visible, 'Anfitrión')
            FROM edition e
            LEFT JOIN meeting_template t ON e.id = t.edition_id
            LEFT JOIN member m ON e.responsible_member_id = m.id
            WHERE e.id = ?1
            "#,
            params![effective_edition_id],
            |r| r.get(0),
        )
        .unwrap_or_else(|_| "Anfitrión".to_string());

    let host_phone: Option<String> = tenant_conn
        .query_row(
            "SELECT host_phone FROM meeting_template WHERE edition_id = ?1",
            params![effective_edition_id],
            |r| r.get(0),
        )
        .ok()
        .flatten();

    let raw_phone = host_phone
        .unwrap_or_else(|| "+526181000001".to_string())
        .replace(['+', ' ', '-'], "");

    let sidewalk_msg = format!(
        "Hola {}, vi tu grupo en Pórtico OS. Cuando vaya llegando a la cuadra te aviso por aquí para salir a recibirme a la banqueta y entrar juntos.",
        host_name
    );
    let sidewalk_whatsapp_url = format!("https://wa.me/{}?text={}", raw_phone, url_encode_text(&sidewalk_msg));

    match result {
        Ok(_) => {
            let message = if suggested_alternative_id.is_some() {
                "Por balance de cupos y proximidad en tu zona, hemos enrutado tu solicitud al grupo óptimo para ti esta temporada. El anfitrión te espera con gusto."
            } else {
                "Solicitud registrada con éxito. El anfitrión y facilitador del grupo te contactarán a la brevedad."
            };

            (
                StatusCode::CREATED,
                Json(serde_json::json!({
                    "message": message,
                    "request_id": req_id,
                    "sidewalk_whatsapp_url": sidewalk_whatsapp_url,
                    "suggested_alternative_edition_id": suggested_alternative_id
                })),
            )
        }
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string()})),
        ),
    }
}

// ---------------- Catálogo de Ministerios de Servicio (GOLD-265) ----------------

pub async fn list_ministries_handler(
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

    match list_service_ministries(&tenant_conn) {
        Ok(ministries) => (StatusCode::OK, Json(serde_json::to_value(ministries).unwrap())),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct CreateMinistryPayload {
    pub name: String,
    pub description: String,
    pub category: String,
    pub leader_name: String,
}

pub async fn create_ministry_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<CreateMinistryPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let ministry = ServiceMinistry {
        id: Uuid::new_v4().to_string(),
        name: payload.name,
        description: payload.description,
        category: payload.category,
        leader_name: payload.leader_name,
        active: true,
    };

    match insert_service_ministry(&tenant_conn, &ministry) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::to_value(ministry).unwrap())),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct EnrollMinistryPayload {
    pub member_name: String,
    pub member_phone: String,
    pub notes: Option<String>,
}

pub async fn enroll_ministry_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(ministry_id): Path<String>,
    Json(payload): Json<EnrollMinistryPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let enrollment = MinistryEnrollment {
        id: Uuid::new_v4().to_string(),
        ministry_id,
        member_name: payload.member_name,
        member_phone: payload.member_phone,
        notes: payload.notes,
        created_at: Utc::now().to_rfc3339(),
    };

    match enroll_in_service_ministry(&tenant_conn, &enrollment) {
        Ok(_) => (
            StatusCode::CREATED,
            Json(serde_json::json!({
                "message": "Inscripción en ministerio de servicio registrada con gratitud.",
                "enrollment": enrollment
            })),
        ),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn list_enrollments_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(ministry_id): Path<String>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match list_ministry_enrollments(&tenant_conn, &ministry_id) {
        Ok(list) => (StatusCode::OK, Json(serde_json::to_value(list).unwrap())),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

// ---------------- Servidor de Tarjetas Sociales y Open Graph (GOLD-272) ----------------

pub async fn group_social_preview_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Html("<h1>Organización no encontrada</h1>".to_string())),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Html("<h1>Error interno</h1>".to_string())),
    };

    let (group_name, proposito, dia_habitual, hora, macro_zone_opt): (String, String, u8, String, Option<String>) = match tenant_conn.query_row(
        "SELECT nombre_publico, proposito, dia_habitual, hora_habitual, macro_zone FROM edition WHERE id = ?1",
        params![group_id],
        |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?)),
    ) {
        Ok(v) => v,
        _ => return (StatusCode::NOT_FOUND, Html("<h1>Comunidad no encontrada</h1>".to_string())),
    };

    let macro_zone = macro_zone_opt.as_deref().unwrap_or("Zona Metropolitana");

    let days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    let dia_str = days.get(dia_habitual as usize).unwrap_or(&"Día acordado");

    let title = format!("{} • Pórtico", group_name);
    let description = format!("{} | Nos reunimos los {} a las {} ({})", proposito, dia_str, hora, macro_zone);

    let html = format!(r#"<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <!-- Open Graph Metadata para WhatsApp, Facebook, iMessage, Instagram -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:site_name" content="Pórtico OS • Amor y Gracia">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <style>
        body {{
            margin: 0;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            box-sizing: border-box;
        }}
        .card {{
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            max-width: 520px;
            width: 100%;
            padding: 32px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            text-align: center;
        }}
        .badge {{
            display: inline-block;
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            padding: 6px 14px;
            border-radius: 999px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 16px;
        }}
        h1 {{
            margin: 0 0 12px 0;
            font-size: 1.75rem;
            color: #ffffff;
            font-weight: 700;
        }}
        p {{
            color: #94a3b8;
            line-height: 1.6;
            margin: 0 0 24px 0;
        }}
        .meta-box {{
            background: #0f172a;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            text-align: left;
        }}
        .meta-label {{
            font-size: 0.75rem;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
        }}
        .meta-val {{
            font-size: 0.95rem;
            color: #e2e8f0;
            font-weight: 600;
            margin-top: 4px;
        }}
        .btn {{
            display: block;
            width: 100%;
            background: #2563eb;
            color: #ffffff;
            padding: 14px 20px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            box-sizing: border-box;
            transition: background 0.2s;
        }}
        .btn:hover {{
            background: #1d4ed8;
        }}
        .atrium-note {{
            margin-top: 18px;
            font-size: 0.85rem;
            color: #64748b;
        }}
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">🏛️ {macro_zone}</div>
        <h1>{group_name}</h1>
        <p>{proposito}</p>
        <div class="meta-box">
            <div>
                <div class="meta-label">Día y Hora</div>
                <div class="meta-val">{dia_str} {hora}</div>
            </div>
            <div>
                <div class="meta-label">Macro-Zona</div>
                <div class="meta-val">{macro_zone}</div>
            </div>
        </div>
        <a href="/#/grupo/{group_id}" class="btn">✨ Ver Grupo y Conectar</a>
        <div class="atrium-note">
            ¿Prefieres conocernos en persona antes? Te esperamos en el <strong>Punto de Conexión Dominical en el Atrio</strong>.
        </div>
    </div>
</body>
</html>"#,
        title = title,
        description = description,
        macro_zone = macro_zone,
        group_name = group_name,
        proposito = proposito,
        dia_str = dia_str,
        hora = hora,
        group_id = group_id
    );

    (StatusCode::OK, Html(html))
}

// ---------------- Multi-Campus Durango y Módulos Cívicos (GOLD-274, GOLD-277, GOLD-278) ----------------

pub async fn list_campuses_handler(
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

    match list_campuses(&tenant_conn) {
        Ok(campuses) => (StatusCode::OK, Json(serde_json::json!(campuses))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn get_campus_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match portico_core::db::data_plane::get_campus_by_id(&tenant_conn, &id) {
        Ok(Some(campus)) => (StatusCode::OK, Json(serde_json::json!(campus))),
        Ok(None) => (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Campus no encontrado"}))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct CurriculumQuery {
    pub week: Option<u32>,
}

pub async fn get_active_curriculum_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Query(query): Query<CurriculumQuery>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match portico_core::db::data_plane::get_active_curated_curriculum(&tenant_conn, query.week) {
        Ok(Some(curriculum)) => (StatusCode::OK, Json(serde_json::json!(curriculum))),
        Ok(None) => (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Currículo litúrgico no disponible"}))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct SubmitNeighborhoodComplaintPayload {
    pub group_id: Option<String>,
    pub colonia_name: String,
    pub reporter_contact: Option<String>,
    pub category: String,
    pub comments: String,
}

pub async fn submit_neighborhood_complaint_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<SubmitNeighborhoodComplaintPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let now = Utc::now();
    let sla_deadline = (now + chrono::Duration::hours(24)).to_rfc3339();
    let complaint = portico_core::domain::NeighborhoodComplaint {
        id: Uuid::new_v4().to_string(),
        group_id: payload.group_id,
        colonia_name: payload.colonia_name,
        reporter_contact: payload.reporter_contact,
        category: payload.category,
        comments: payload.comments,
        status: "pending".to_string(),
        sla_deadline,
        resolution_notes: None,
        created_at: now.to_rfc3339(),
    };

    match portico_core::db::data_plane::insert_neighborhood_complaint(&tenant_conn, &complaint) {
        Ok(_) => (
            StatusCode::CREATED,
            Json(serde_json::json!({
                "message": "🤝 Reporte vecinal recibido por el Diaconado Cívico. Se dará respuesta en menos de 24 horas con respeto y cortesía cristiana.",
                "complaint": complaint
            })),
        ),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}
