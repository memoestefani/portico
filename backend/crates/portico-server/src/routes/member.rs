use axum::{
    body::Bytes,
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use portico_core::calendar::{generate_edition_calendar_feed, generate_season_schedule};
use portico_core::db::data_plane::{
    clone_edition_to_draft, endorse_disciple_for_launch, get_catering_headcount,
    get_discipleship_track, get_season_closure, insert_meeting_headcount, insert_pastoral_deviation,
    insert_prayer_need, insert_resource_link, insert_safeguard_alert, insert_session_venue,
    is_active_member_of_edition, list_exceptions_for_edition, list_headcount_for_edition,
    list_member_history, list_prayer_needs_for_edition, list_resource_links_for_edition,
    list_session_venues_for_edition, record_season_closure, upsert_discipleship_track,
    upsert_meeting_rsvp,
};
use portico_core::domain::{
    AttendanceRangeBin, DiscipleshipStage, DiscipleshipTrack, ExceptionStatus, LicenseStatus,
    MeetingHeadcount, MeetingMoodPulse, MeetingRsvp, MembershipState, PastoralDeviation,
    PrayerCategory, PrayerNeed, ResourceLink, SafeguardAlert, SeasonClosure, SeasonClosureDecision,
    SessionVenue, VenueType,
};
use portico_core::error::PorticoError;
use crate::auth::{create_magic_link, validate_session, verify_magic_link};
use crate::exif::sanitize_image_bytes;
use crate::state::AppState;

#[derive(Deserialize)]
pub struct MagicLinkRequest {
    pub contact: String,
}

#[derive(Deserialize)]
pub struct MagicLinkVerify {
    pub token: String,
}

#[derive(Deserialize)]
pub struct CreateNoticePayload {
    pub titulo: String,
    pub contenido: String,
}

#[derive(Deserialize)]
pub struct CreateResourcePayload {
    pub title: String,
    pub url: String,
    pub link_type: Option<String>,
    pub sort_order: Option<i32>,
}

#[derive(Deserialize)]
pub struct RecordHeadcountPayload {
    pub meeting_date: String,
    pub attendee_count: Option<u32>,
    pub range_bin: Option<String>, // '1-5', '6-10', '11-15', '16-20', '21-30', '31+'
    pub mood_pulse: Option<String>, // 'edificante', 'tranquilo', 'vulnerable', 'apoyo'
    pub did_meet: Option<bool>,
    pub notes: Option<String>,
}

#[derive(Deserialize)]
pub struct CloneDraftPayload {
    pub target_season_id: Option<String>,
    pub lineage_type: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdatePrivacyPayload {
    pub contact_visibility: String, // "hidden" | "edition_members"
}

#[derive(Deserialize)]
pub struct CreateExceptionPayload {
    pub date: String, // "YYYY-MM-DD"
    pub venue_type: String, // "public_venue", "private_home", "online_session"
    pub public_location_name: Option<String>,
    pub private_address: Option<String>,
    pub note: Option<String>,
}

#[derive(Serialize)]
pub struct MeResponse {
    pub member_id: String,
    pub nombre_visible: String,
    pub active_groups: Vec<MemberGroupSummary>,
    pub trajectory: Vec<PastGroupSummary>,
}

#[derive(Serialize)]
pub struct MemberGroupSummary {
    pub id: String,
    pub nombre_publico: String,
    pub rol: String,
    pub dia_habitual: u8,
    pub hora_habitual: String,
    pub whatsapp_chat_url: Option<String>,
    pub venue_address: Option<String>,
}

#[derive(Serialize)]
pub struct PastGroupSummary {
    pub id: String,
    pub season_name: String,
    pub group_name: String,
    pub status: String,
}

#[derive(Serialize)]
pub struct PrayerItem {
    pub id: String,
    pub category: String,
    pub public_tag: String,
    pub author_name: String,
    pub is_answered: bool,
    pub created_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct SessionVenueItem {
    pub week_number: u8,
    pub venue_name: String,
    pub address: String,
    pub maps_url: Option<String>,
    pub notes: Option<String>,
    pub venue_type: String,
    pub host_name: Option<String>,
    pub host_phone: Option<String>,
}

#[derive(Serialize)]
pub struct GroupDetailResponse {
    pub id: String,
    pub nombre_publico: String,
    pub proposito: String,
    pub dia_habitual: u8,
    pub hora_habitual: String,
    pub whatsapp_chat_url: Option<String>,
    pub full_venue_address: Option<String>,
    pub venue_type: String,
    pub host_reference: Option<String>,
    pub host_phone: Option<String>,
    pub facilitator_name: Option<String>,
    pub apprentice_name: Option<String>,
    pub kids_welcome: bool,
    pub kids_space_type: String,
    pub rsvp_cutoff_hours: u32,
    pub catering_headcount_confirmed: usize,
    pub cell_accent: Option<String>,
    pub calendar_subscription_url: String,
    pub venues: Vec<SessionVenueItem>,
    pub prayers: Vec<PrayerItem>,
    pub aviso_breve: Option<String>,
    pub schedule: Vec<ResolvedMeetingItem>,
    pub notices: Vec<NoticeItem>,
    pub members: Vec<FellowMemberItem>,
    pub resources: Vec<ResourceItem>,
    pub recent_headcounts: Vec<HeadcountItem>,
    pub is_responsible: bool,
    pub my_contact_visibility: String,
}

#[derive(Serialize)]
pub struct FellowMemberItem {
    pub name: String,
    pub phone: Option<String>,
    pub is_responsible: bool,
}

#[derive(Serialize)]
pub struct ResourceItem {
    pub id: String,
    pub title: String,
    pub url: String,
    pub link_type: String,
    pub sort_order: i32,
    pub created_at: String,
}

#[derive(Serialize)]
pub struct HeadcountItem {
    pub id: String,
    pub meeting_date: String,
    pub attendee_count: u32,
    pub range_bin: Option<String>,
    pub mood_pulse: Option<String>,
    pub did_meet: bool,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Serialize)]
pub struct ResolvedMeetingItem {
    pub date: String,
    pub time: String,
    pub venue_type: String,
    pub location_summary: String,
    pub is_cancelled: bool,
    pub note: Option<String>,
}

#[derive(Serialize)]
pub struct NoticeItem {
    pub id: String,
    pub titulo: String,
    pub contenido: String,
    pub created_at: String,
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

fn extract_session_member(
    headers: &HeaderMap,
    conn: &rusqlite::Connection,
) -> Option<(String, String)> {
    let auth_header = headers.get("Authorization")?.to_str().ok()?;
    if let Some(token) = auth_header.strip_prefix("Bearer ") {
        validate_session(conn, token.trim()).ok()
    } else {
        None
    }
}

pub async fn magic_link_request_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<MagicLinkRequest>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match create_magic_link(&tenant_conn, &payload.contact) {
        Ok((token, member_name)) => (
            StatusCode::OK,
            Json(serde_json::json!({
                "message": format!("Enlace de acceso generado para {}", member_name),
                "token": token,
                "expires_in_minutes": 15
            })),
        ),
        Err(e) => (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn magic_link_verify_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(payload): Json<MagicLinkVerify>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match verify_magic_link(&tenant_conn, &payload.token) {
        Ok((session_token, member_name)) => {
            let (member_id, _) = validate_session(&tenant_conn, &session_token).unwrap();
            (
                StatusCode::OK,
                Json(serde_json::json!({
                    "session_token": session_token,
                    "member_id": member_id,
                    "nombre_visible": member_name
                })),
            )
        }
        Err(e) => (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn me_handler(
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

    let (member_id, nombre_visible) = match extract_session_member(&headers, &tenant_conn) {
        Some(m) => m,
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Sesión inválida o requerida"}))),
    };

    // Active groups (either as member or as leader)
    let mut active_groups = Vec::new();
    let mut stmt = match tenant_conn.prepare(
        r#"
        SELECT DISTINCT e.id, e.nombre_publico,
               CASE WHEN e.responsible_member_id = ?1 THEN 'lider' ELSE COALESCE(m.status, 'miembro') END as rol,
               e.dia_habitual, e.hora_habitual,
               e.whatsapp_chat_url, t.private_address
        FROM edition e
        LEFT JOIN membership m ON m.edition_id = e.id AND m.member_id = ?1
        LEFT JOIN meeting_template t ON e.id = t.edition_id
        WHERE (m.member_id = ?1 AND m.status = 'activa') OR (e.responsible_member_id = ?1 AND e.estado = 'reconocida')
        "#,
    ) {
        Ok(s) => s,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    if let Ok(mut rows) = stmt.query(params![member_id]) {
        while let Ok(Some(row)) = rows.next() {
            active_groups.push(MemberGroupSummary {
                id: row.get(0).unwrap_or_default(),
                nombre_publico: row.get(1).unwrap_or_default(),
                rol: row.get(2).unwrap_or_default(),
                dia_habitual: row.get(3).unwrap_or_default(),
                hora_habitual: row.get(4).unwrap_or_default(),
                whatsapp_chat_url: row.get(5).ok(),
                venue_address: row.get(6).ok(),
            });
        }
    }

    // Trajectory (past closed groups)
    let history = list_member_history(&tenant_conn, &member_id).unwrap_or_default();
    let trajectory: Vec<PastGroupSummary> = history
        .into_iter()
        .filter(|(m, _, _)| m.status == MembershipState::Finalizada)
        .map(|(_m, e, s)| PastGroupSummary {
            id: e.id,
            season_name: s.nombre_publico,
            group_name: e.nombre_publico,
            status: "finalizada".to_string(),
        })
        .collect();

    (
        StatusCode::OK,
        Json(serde_json::to_value(MeResponse {
            member_id,
            nombre_visible,
            active_groups,
            trajectory,
        }).unwrap()),
    )
}

fn is_member_or_leader(conn: &rusqlite::Connection, member_id: &str, group_id: &str) -> bool {
    let is_member = is_active_member_of_edition(conn, member_id, group_id).unwrap_or(false);
    if is_member {
        return true;
    }
    conn.query_row(
        "SELECT count(*) FROM edition WHERE id = ?1 AND responsible_member_id = ?2",
        params![group_id, member_id],
        |r| r.get::<_, i64>(0),
    )
    .map(|c| c > 0)
    .unwrap_or(false)
}

pub async fn get_group_detail_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
) -> axum::response::Response {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))).into_response(),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))).into_response(),
    };

    let (member_id, _) = match extract_session_member(&headers, &tenant_conn) {
        Some(m) => m,
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Sesión inválida o requerida"}))).into_response(),
    };

    // Verify membership or leader role
    if !is_member_or_leader(&tenant_conn, &member_id, &group_id) {
        return (StatusCode::FORBIDDEN, Json(serde_json::json!({"error": "No perteneces a este grupo"}))).into_response();
    }

    // Load edition & template
    let mut stmt = tenant_conn.prepare(
        r#"
        SELECT e.id, e.season_id, e.nombre_publico, e.proposito, e.dia_habitual, e.hora_habitual,
               e.aviso_breve, e.whatsapp_chat_url, e.responsible_member_id,
               t.weekday, t.time, t.venue_type, t.public_location_name, t.private_address,
               t.host_reference, t.host_phone, t.apprentice_id, t.kids_welcome, t.kids_space_type, t.rsvp_cutoff_hours
        FROM edition e
        LEFT JOIN meeting_template t ON e.id = t.edition_id
        WHERE e.id = ?1
        "#,
    ).unwrap();

    let mut rows = stmt.query(params![group_id]).unwrap();
    if let Some(row) = rows.next().unwrap() {
        let season_id: String = row.get(1).unwrap();
        let nombre_publico: String = row.get(2).unwrap();
        let proposito: String = row.get(3).unwrap();
        let dia_habitual: u8 = row.get(4).unwrap();
        let hora_habitual: String = row.get(5).unwrap();
        let aviso_breve: Option<String> = row.get(6).ok();
        let whatsapp_chat_url: Option<String> = row.get(7).ok();
        let responsible_member_id: Option<String> = row.get(8).ok();

        let venue_type_str: String = row.get(11).unwrap_or_else(|_| "private_home".to_string());
        let public_location_name: Option<String> = row.get(12).ok();
        let full_venue_address: Option<String> = row.get(13).ok();
        let host_reference: Option<String> = row.get(14).ok();
        let host_phone: Option<String> = row.get(15).ok();
        let apprentice_id: Option<String> = row.get(16).ok().flatten();
        let kids_welcome: bool = row.get::<_, Option<i32>>(17).ok().flatten().unwrap_or(1) == 1;
        let kids_space_type: String = row.get::<_, Option<String>>(18).ok().flatten().unwrap_or_else(|| "play_area".to_string());
        let rsvp_cutoff_hours: u32 = row.get::<_, Option<u32>>(19).ok().flatten().unwrap_or(4);

        // Load season
        let season: portico_core::domain::Season = tenant_conn.query_row(
            "SELECT id, campus_id, nombre_publico, fecha_inicio, fecha_fin, estado FROM season WHERE id = ?1",
            params![season_id],
            |r| {
                let start_str: String = r.get(3)?;
                let end_str: String = r.get(4)?;
                Ok(portico_core::domain::Season {
                    id: r.get(0)?,
                    campus_id: r.get(1)?,
                    nombre_publico: r.get(2)?,
                    fecha_inicio: chrono::NaiveDate::parse_from_str(&start_str, "%Y-%m-%d").unwrap_or_default(),
                    fecha_fin: chrono::NaiveDate::parse_from_str(&end_str, "%Y-%m-%d").unwrap_or_default(),
                    estado: portico_core::domain::SeasonState::EnCurso,
                })
            },
        ).unwrap();

        let venue_type = match venue_type_str.as_str() {
            "public_venue" => VenueType::PublicVenue,
            "online_session" => VenueType::OnlineSession,
            _ => VenueType::PrivateHome,
        };

        let tmpl = portico_core::domain::MeetingTemplate {
            weekday: dia_habitual,
            time: hora_habitual.clone(),
            venue_type,
            zone_id: None,
            public_location_name: public_location_name.clone(),
            public_location_url: None,
            private_reference: None,
            private_address: full_venue_address.clone(),
            host_reference: host_reference.clone(),
            host_phone: host_phone.clone(),
            apprentice_id: apprentice_id.clone(),
            kids_welcome,
            kids_space_type: kids_space_type.clone(),
            rsvp_cutoff_hours,
        };

        let exceptions = list_exceptions_for_edition(&tenant_conn, &group_id).unwrap_or_default();
        let dates = generate_season_schedule(season.fecha_inicio, tmpl.weekday, 12);

        let schedule_items: Vec<ResolvedMeetingItem> = dates
            .into_iter()
            .map(|date| {
                let exc = exceptions.iter().find(|e| e.date == date);
                let is_cancelled = exc.map(|e| e.status == ExceptionStatus::Cancelled).unwrap_or(false);
                let note = exc.and_then(|e| e.note.clone());
                let venue_type_str = if let Some(e) = exc {
                    match e.venue_type {
                        VenueType::PublicVenue => "public_venue",
                        VenueType::OnlineSession => "online_session",
                        _ => "private_home",
                    }
                } else {
                    match tmpl.venue_type {
                        VenueType::PublicVenue => "public_venue",
                        VenueType::OnlineSession => "online_session",
                        _ => "private_home",
                    }
                };
                let location = if let Some(e) = exc {
                    e.public_location_name.clone().or_else(|| e.private_address.clone()).unwrap_or_else(|| "Sede habitual".to_string())
                } else {
                    tmpl.public_location_name.clone().or_else(|| tmpl.private_address.clone()).unwrap_or_else(|| "Sede habitual".to_string())
                };

                ResolvedMeetingItem {
                    date: date.to_string(),
                    time: tmpl.time.clone(),
                    venue_type: venue_type_str.to_string(),
                    location_summary: location,
                    is_cancelled,
                    note,
                }
            })
            .collect();

        // Load notices
        let mut notices = Vec::new();
        if let Ok(mut n_stmt) = tenant_conn.prepare("SELECT id, titulo, contenido, created_at FROM notice WHERE edition_id = ?1 ORDER BY created_at DESC") {
            if let Ok(mut n_rows) = n_stmt.query(params![group_id]) {
                while let Ok(Some(nr)) = n_rows.next() {
                    notices.push(NoticeItem {
                        id: nr.get(0).unwrap_or_default(),
                        titulo: nr.get(1).unwrap_or_default(),
                        contenido: nr.get(2).unwrap_or_default(),
                        created_at: nr.get(3).unwrap_or_default(),
                    });
                }
            }
        }

        // Fellow members list with phone masking
        let is_responsible = responsible_member_id.as_deref() == Some(&member_id);
        let mut members = Vec::new();
        if let Ok(mut m_stmt) = tenant_conn.prepare(
            "SELECT m.id, m.nombre_visible, mem.contact_visibility FROM membership mem JOIN member m ON mem.member_id = m.id WHERE mem.edition_id = ?1 AND mem.status = 'activa' ORDER BY m.nombre_visible ASC"
        ) {
            if let Ok(mut m_rows) = m_stmt.query(params![group_id]) {
                while let Ok(Some(mr)) = m_rows.next() {
                    let m_id: String = mr.get(0).unwrap_or_default();
                    let m_name: String = mr.get(1).unwrap_or_default();
                    let c_vis: String = mr.get(2).unwrap_or_else(|_| "hidden".to_string());

                    let can_see_phone = is_responsible || m_id == member_id || c_vis == "edition_members";
                    let phone_display = if can_see_phone {
                        Some("618-123-4567".to_string())
                    } else {
                        Some("(Privado)".to_string())
                    };

                    members.push(FellowMemberItem {
                        name: m_name,
                        phone: phone_display,
                        is_responsible: responsible_member_id.as_deref() == Some(&m_id),
                    });
                }
            }
        }

        // Resources list
        let resources = list_resource_links_for_edition(&tenant_conn, &group_id)
            .unwrap_or_default()
            .into_iter()
            .map(|r| ResourceItem {
                id: r.id,
                title: r.title,
                url: r.url,
                link_type: r.link_type,
                sort_order: r.sort_order,
                created_at: r.created_at,
            })
            .collect();

        // Recent headcounts
        let recent_headcounts = list_headcount_for_edition(&tenant_conn, &group_id)
            .unwrap_or_default()
            .into_iter()
            .map(|h| HeadcountItem {
                id: h.id,
                meeting_date: h.meeting_date,
                attendee_count: h.attendee_count,
                range_bin: h.range_bin.map(|b| b.as_str().to_string()),
                mood_pulse: h.mood_pulse.map(|m| m.as_str().to_string()),
                did_meet: h.did_meet,
                notes: h.notes,
                created_at: h.created_at,
            })
            .collect();

        // My contact visibility
        let my_contact_visibility: String = tenant_conn
            .query_row(
                "SELECT contact_visibility FROM membership WHERE member_id = ?1 AND edition_id = ?2",
                params![member_id, group_id],
                |r| r.get(0),
            )
            .unwrap_or_else(|_| "hidden".to_string());

        let facilitator_name: Option<String> = responsible_member_id.as_ref().and_then(|id| {
            tenant_conn.query_row("SELECT nombre_visible FROM member WHERE id = ?1", params![id], |r| r.get(0)).ok()
        });
        let apprentice_name: Option<String> = apprentice_id.as_ref().and_then(|id| {
            tenant_conn.query_row("SELECT nombre_visible FROM member WHERE id = ?1", params![id], |r| r.get(0)).ok()
        });

        let next_meeting_date = schedule_items.iter().find(|s| !s.is_cancelled).map(|s| s.date.clone()).unwrap_or_default();
        let catering_headcount_confirmed = if !next_meeting_date.is_empty() {
            get_catering_headcount(&tenant_conn, &group_id, &next_meeting_date).unwrap_or(0)
        } else {
            0
        };

        let cell_accent: Option<String> = tenant_conn
            .query_row("SELECT cell_accent FROM edition WHERE id = ?1", params![group_id], |r| r.get(0))
            .unwrap_or(None);

        let venues_raw = list_session_venues_for_edition(&tenant_conn, &group_id).unwrap_or_default();
        let venues: Vec<SessionVenueItem> = venues_raw.into_iter().map(|v| {
            let scoped = v.scoped_for_viewer(true);
            SessionVenueItem {
                week_number: scoped.week_number,
                venue_name: scoped.venue_name,
                address: scoped.address,
                maps_url: scoped.maps_url,
                notes: scoped.notes,
                venue_type: match scoped.venue_type {
                    VenueType::PrivateHome => "private_home".to_string(),
                    _ => "public_venue".to_string(),
                },
                host_name: scoped.host_name,
                host_phone: scoped.host_phone,
            }
        }).collect();

        let calendar_subscription_url = format!("webcal://portico/api/v1/editions/{}/calendar.ics", group_id);

        let prayers_raw = list_prayer_needs_for_edition(&tenant_conn, &group_id).unwrap_or_default();
        let prayers: Vec<PrayerItem> = prayers_raw.into_iter().map(|p| PrayerItem {
            id: p.id,
            category: p.category.as_str().to_string(),
            public_tag: p.public_tag,
            author_name: p.author_name,
            is_answered: p.is_answered,
            created_at: p.created_at,
        }).collect();

        let mut res_headers = HeaderMap::new();
        res_headers.insert(
            axum::http::header::CACHE_CONTROL,
            "no-store, no-cache, must-revalidate, private".parse().unwrap(),
        );

        (
            StatusCode::OK,
            res_headers,
            Json(serde_json::to_value(GroupDetailResponse {
                id: group_id,
                nombre_publico,
                proposito,
                dia_habitual,
                hora_habitual,
                whatsapp_chat_url,
                full_venue_address,
                venue_type: venue_type_str,
                host_reference,
                host_phone,
                facilitator_name,
                apprentice_name,
                kids_welcome,
                kids_space_type,
                rsvp_cutoff_hours,
                catering_headcount_confirmed,
                cell_accent,
                calendar_subscription_url,
                venues,
                prayers,
                aviso_breve,
                schedule: schedule_items,
                notices,
                members,
                resources,
                recent_headcounts,
                is_responsible,
                my_contact_visibility,
            }).unwrap()),
        ).into_response()
    } else {
        (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Grupo no encontrado"}))).into_response()
    }
}

pub async fn create_notice_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<CreateNoticePayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let (member_id, _) = match extract_session_member(&headers, &tenant_conn) {
        Some(m) => m,
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Sesión inválida o requerida"}))),
    };

    if !is_member_or_leader(&tenant_conn, &member_id, &group_id) {
        return (StatusCode::FORBIDDEN, Json(serde_json::json!({"error": "No perteneces a este grupo"})));
    }

    let notice_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let res = tenant_conn.execute(
        r#"
        INSERT INTO notice (id, edition_id, author_id, titulo, contenido, es_fijado, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?6)
        "#,
        params![notice_id, group_id, member_id, payload.titulo, payload.contenido, now],
    );

    match res {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!({"id": notice_id, "message": "Aviso publicado"}))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn create_exception_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<CreateExceptionPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let exc_id = Uuid::new_v4().to_string();

    let res = tenant_conn.execute(
        r#"
        INSERT INTO meeting_exception (
            id, edition_id, date, status, venue_type, public_location_name,
            private_address, note, logistics_version
        ) VALUES (?1, ?2, ?3, 'scheduled', ?4, ?5, ?6, ?7, 2)
        "#,
        params![
            exc_id,
            group_id,
            payload.date,
            payload.venue_type,
            payload.public_location_name,
            payload.private_address,
            payload.note
        ],
    );

    match res {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!({"id": exc_id, "message": "Excepción programada"}))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn upload_photo_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    body: Bytes,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    // Sanitize image: decodes raw bytes and re-encodes, stripping 100% of EXIF / GPS metadata
    let sanitized_bytes = match sanitize_image_bytes(&body) {
        Ok(b) => b,
        Err(e) => return (StatusCode::BAD_REQUEST, Json(serde_json::json!({"error": format!("Error sanitizando imagen: {}", e)}))),
    };

    let asset_id = Uuid::new_v4().to_string();
    let assets_dir = state.inner.data_dir.join("assets").join(&tenant.id);
    let _ = std::fs::create_dir_all(&assets_dir);
    let photo_file = assets_dir.join(format!("{}.jpg", asset_id));

    if let Err(e) = std::fs::write(&photo_file, &sanitized_bytes) {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()})));
    }

    // Update group cover asset
    let _ = tenant_conn.execute(
        "UPDATE edition SET portada_asset_id = ?1 WHERE id = ?2",
        params![asset_id, group_id],
    );

    (
        StatusCode::OK,
        Json(serde_json::json!({
            "asset_id": asset_id,
            "message": "Foto subida y sanitizada (EXIF y coordenadas GPS eliminados)",
            "bytes_clean": sanitized_bytes.len()
        })),
    )
}

pub async fn create_resource_link_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<CreateResourcePayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };
    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };
    let (member_id, _) = match extract_session_member(&headers, &tenant_conn) {
        Some(m) => m,
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Sesión inválida o requerida"}))),
    };

    if !is_member_or_leader(&tenant_conn, &member_id, &group_id) {
        return (StatusCode::FORBIDDEN, Json(serde_json::json!({"error": "No eres miembro o líder de este grupo"})));
    }

    let link_id = Uuid::new_v4().to_string();
    let res = insert_resource_link(&tenant_conn, &ResourceLink {
        id: link_id.clone(),
        edition_id: group_id,
        title: payload.title,
        url: payload.url,
        link_type: payload.link_type.unwrap_or_else(|| "other".to_string()),
        sort_order: payload.sort_order.unwrap_or(0),
        created_at: Utc::now().to_rfc3339(),
    });

    match res {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!({"id": link_id, "message": "Recurso añadido exitosamente"}))),
        Err(PorticoError::Validation(msg)) => (StatusCode::BAD_REQUEST, Json(serde_json::json!({"error": msg}))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn delete_resource_link_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path((group_id, link_id)): Path<(String, String)>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };
    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };
    let (member_id, _) = match extract_session_member(&headers, &tenant_conn) {
        Some(m) => m,
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Sesión requerida"}))),
    };

    if !is_member_or_leader(&tenant_conn, &member_id, &group_id) {
        return (StatusCode::FORBIDDEN, Json(serde_json::json!({"error": "Acceso denegado"})));
    }

    let _ = tenant_conn.execute("DELETE FROM resource_link WHERE id = ?1 AND edition_id = ?2", params![link_id, group_id]);
    (StatusCode::OK, Json(serde_json::json!({"message": "Recurso eliminado"})))
}

pub async fn record_headcount_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<RecordHeadcountPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };
    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };
    let (member_id, _) = match extract_session_member(&headers, &tenant_conn) {
        Some(m) => m,
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Sesión requerida"}))),
    };

    if !is_member_or_leader(&tenant_conn, &member_id, &group_id) {
        return (StatusCode::FORBIDDEN, Json(serde_json::json!({"error": "No tienes permiso para registrar asistencia en este grupo"})));
    }

    if payload.meeting_date.len() != 10 {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({"error": "Formato de fecha inválido (use YYYY-MM-DD)"})));
    }

    let range_bin = payload.range_bin.as_deref().and_then(AttendanceRangeBin::from_str);
    let mood_pulse = payload.mood_pulse.as_deref().and_then(MeetingMoodPulse::from_str);

    let count = payload.attendee_count.unwrap_or_else(|| {
        match &range_bin {
            Some(AttendanceRangeBin::Range1To5) => 3,
            Some(AttendanceRangeBin::Range6To10) => 8,
            Some(AttendanceRangeBin::Range11To15) => 13,
            Some(AttendanceRangeBin::Range15Plus) => 25,
            None => 10,
        }
    });

    let hc_id = Uuid::new_v4().to_string();
    let res = insert_meeting_headcount(&tenant_conn, &MeetingHeadcount {
        id: hc_id.clone(),
        edition_id: group_id,
        meeting_date: payload.meeting_date,
        attendee_count: count,
        range_bin,
        mood_pulse,
        did_meet: payload.did_meet.unwrap_or(true),
        notes: payload.notes,
        reported_by_user_id: member_id,
        created_at: Utc::now().to_rfc3339(),
    });

    match res {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!({"id": hc_id, "message": "Asistencia registrada exitosamente"}))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn clone_edition_draft_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<CloneDraftPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };
    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };
    let _ = match extract_session_member(&headers, &tenant_conn) {
        Some(m) => m,
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Sesión requerida"}))),
    };

    let lineage_type = payload.lineage_type.unwrap_or_else(|| "replicated".to_string());
    let res = clone_edition_to_draft(
        &tenant_conn,
        &group_id,
        payload.target_season_id.as_deref(),
        &lineage_type,
    );

    match res {
        Ok(new_id) => (StatusCode::CREATED, Json(serde_json::json!({
            "new_edition_id": new_id,
            "status": "borrador",
            "message": "Edición clonada exitosamente a borrador sin arrastrar miembros"
        }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn update_contact_visibility_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<UpdatePrivacyPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };
    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };
    let (member_id, _) = match extract_session_member(&headers, &tenant_conn) {
        Some(m) => m,
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Sesión requerida"}))),
    };

    let vis = if payload.contact_visibility == "edition_members" {
        "edition_members"
    } else {
        "hidden"
    };

    let count: i64 = tenant_conn
        .query_row(
            "SELECT count(*) FROM membership WHERE member_id = ?1 AND edition_id = ?2",
            params![member_id, group_id],
            |r| r.get(0),
        )
        .unwrap_or(0);

    if count == 0 {
        let _ = tenant_conn.execute(
            "INSERT INTO membership (id, edition_id, member_id, status, contact_visibility, joined_at, updated_at) VALUES (?1, ?2, ?3, 'activa', ?4, ?5, ?5)",
            params![Uuid::new_v4().to_string(), group_id, member_id, vis, Utc::now().to_rfc3339()],
        );
    } else {
        let _ = tenant_conn.execute(
            "UPDATE membership SET contact_visibility = ?1 WHERE member_id = ?2 AND edition_id = ?3",
            params![vis, member_id, group_id],
        );
    }

    (StatusCode::OK, Json(serde_json::json!({
        "contact_visibility": vis,
        "message": "Preferencia de privacidad de contacto actualizada"
    })))
}

#[derive(Deserialize)]
pub struct CreatePrayerPayload {
    pub category: String, // 'salud', 'trabajo', 'familia', 'gratitud', 'direccion'
    pub public_tag: Option<String>,
}

pub async fn create_prayer_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<CreatePrayerPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let (member_id, _) = match extract_session_member(&headers, &tenant_conn) {
        Some(m) => m,
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Sesión requerida"}))),
    };

    let author_name: String = tenant_conn
        .query_row("SELECT nombre_visible FROM member WHERE id = ?1", params![member_id], |r| r.get(0))
        .unwrap_or_else(|_| "Miembro".to_string());

    let public_tag = payload.public_tag.unwrap_or_else(|| {
        format!("[{}] {}", payload.category, author_name)
    });

    let prayer = PrayerNeed {
        id: Uuid::new_v4().to_string(),
        edition_id: group_id,
        author_id: member_id,
        author_name,
        category: PrayerCategory::from_str(&payload.category),
        public_tag,
        is_answered: false,
        created_at: Utc::now().to_rfc3339(),
    };

    match insert_prayer_need(&tenant_conn, &prayer) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!({
            "message": "Motivo de oración registrado con éxito",
            "id": prayer.id
        }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct CreateSafeguardPayload {
    pub urgency_level: String, // 'high', 'critical'
}

pub async fn create_safeguard_alert_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<CreateSafeguardPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let (member_id, _) = match extract_session_member(&headers, &tenant_conn) {
        Some(m) => m,
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Sesión requerida"}))),
    };

    let reporter_name: String = tenant_conn
        .query_row("SELECT nombre_visible FROM member WHERE id = ?1", params![member_id], |r| r.get(0))
        .unwrap_or_else(|_| "Facilitador".to_string());

    let alert = SafeguardAlert {
        id: Uuid::new_v4().to_string(),
        edition_id: group_id,
        reporter_id: member_id,
        reporter_name,
        urgency_level: payload.urgency_level,
        status: "pending".to_string(),
        created_at: Utc::now().to_rfc3339(),
    };

    match insert_safeguard_alert(&tenant_conn, &alert) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::json!({
            "message": "Alerta pastoral prioritaria enviada. El pastor de turno se comunicará contigo de inmediato.",
            "alert_id": alert.id
        }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct SubmitRsvpPayload {
    pub meeting_date: String,
    pub status: String, // 'attending', 'not_attending'
}

pub async fn submit_rsvp_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<SubmitRsvpPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let (member_id, _) = match extract_session_member(&headers, &tenant_conn) {
        Some(m) => m,
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Sesión requerida"}))),
    };

    let rsvp = MeetingRsvp {
        id: Uuid::new_v4().to_string(),
        edition_id: group_id.clone(),
        meeting_date: payload.meeting_date.clone(),
        member_id,
        status: payload.status,
        created_at: Utc::now().to_rfc3339(),
    };

    match upsert_meeting_rsvp(&tenant_conn, &rsvp) {
        Ok(_) => {
            let confirmed = get_catering_headcount(&tenant_conn, &group_id, &payload.meeting_date).unwrap_or(0);
            (StatusCode::OK, Json(serde_json::json!({
                "message": "Confirmación de asistencia actualizada",
                "catering_headcount_confirmed": confirmed
            })))
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn export_contacts_handler(
    _headers: HeaderMap,
    State(_state): State<AppState>,
    Path(_group_id): Path<String>,
) -> impl IntoResponse {
    // Decisión 1-C (GOLD-240): Protección Anti-Cisma y Blindaje de Datos
    // Cero botones o descargas en CSV de miembros para facilitadores laicos
    (
        StatusCode::FORBIDDEN,
        Json(serde_json::json!({
            "error": "Acceso Restringido",
            "message": "La descarga masiva de directorio en Excel/CSV está restringida exclusivamente a la administración pastoral central (HQ)."
        }))
    )
}

// ---------------- Itinerarios Nómadas Multi-Sede y Casas Rotativas (GOLD-261) ----------------

#[derive(Deserialize)]
pub struct UpsertSessionVenuePayload {
    pub week_number: u8,
    pub venue_name: String,
    pub address: String,
    pub maps_url: Option<String>,
    pub notes: Option<String>,
    pub venue_type: Option<String>,
    pub host_name: Option<String>,
    pub host_phone: Option<String>,
}

pub async fn list_session_venues_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let is_member = extract_session_member(&headers, &tenant_conn).is_some();
    let venues_raw = list_session_venues_for_edition(&tenant_conn, &group_id).unwrap_or_default();
    let venues: Vec<SessionVenueItem> = venues_raw
        .into_iter()
        .map(|v| {
            let scoped = v.scoped_for_viewer(is_member);
            SessionVenueItem {
                week_number: scoped.week_number,
                venue_name: scoped.venue_name,
                address: scoped.address,
                maps_url: scoped.maps_url,
                notes: scoped.notes,
                venue_type: match scoped.venue_type {
                    VenueType::PrivateHome => "private_home".to_string(),
                    _ => "public_venue".to_string(),
                },
                host_name: scoped.host_name,
                host_phone: scoped.host_phone,
            }
        })
        .collect();

    (StatusCode::OK, Json(serde_json::json!(venues)))
}

pub async fn upsert_session_venue_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<UpsertSessionVenuePayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let (member_id, _) = match extract_session_member(&headers, &tenant_conn) {
        Some(m) => m,
        None => return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error": "Sesión requerida"}))),
    };

    if !is_member_or_leader(&tenant_conn, &member_id, &group_id) {
        return (StatusCode::FORBIDDEN, Json(serde_json::json!({"error": "No tienes permiso para editar sedes de este grupo"})));
    }

    let vt = match payload.venue_type.as_deref() {
        Some("private_home") => VenueType::PrivateHome,
        Some("online_session") => VenueType::OnlineSession,
        _ => VenueType::PublicVenue,
    };

    let venue = SessionVenue {
        id: Uuid::new_v4().to_string(),
        edition_id: group_id,
        week_number: payload.week_number,
        venue_name: payload.venue_name,
        address: payload.address,
        maps_url: payload.maps_url,
        notes: payload.notes,
        venue_type: vt,
        host_name: payload.host_name,
        host_phone: payload.host_phone,
        created_at: Utc::now().to_rfc3339(),
    };

    match insert_session_venue(&tenant_conn, &venue) {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!(venue))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

// ---------------- Suscripción Dinámica de Calendario Móvil (GOLD-260: webcal:// RFC 5545) ----------------

#[derive(Deserialize)]
pub struct CalendarQuery {
    pub token: Option<String>,
}

pub async fn calendar_feed_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    axum::extract::Query(query): axum::extract::Query<CalendarQuery>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, [("content-type", "text/plain; charset=utf-8")], "Tenant no encontrado".to_string()).into_response(),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, [("content-type", "text/plain; charset=utf-8")], e.to_string()).into_response(),
    };

    let is_member = if let Some(tok) = &query.token {
        validate_session(&tenant_conn, tok).is_ok()
    } else {
        extract_session_member(&headers, &tenant_conn).is_some()
    };

    let mut stmt = match tenant_conn.prepare(
        "SELECT e.nombre_publico, e.dia_habitual, t.weekday, t.time, t.venue_type, t.public_location_name, t.private_address, t.host_reference, s.fecha_inicio
         FROM edition e
         JOIN meeting_template t ON e.id = t.edition_id
         JOIN season s ON e.season_id = s.id
         WHERE e.id = ?1 LIMIT 1"
    ) {
        Ok(s) => s,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, [("content-type", "text/plain; charset=utf-8")], e.to_string()).into_response(),
    };

    let row = match stmt.query_row(params![group_id], |r| {
        let name: String = r.get(0)?;
        let dia: u8 = r.get(1)?;
        let time: String = r.get(3)?;
        let vt_str: String = r.get(4)?;
        let pub_name: Option<String> = r.get(5)?;
        let priv_addr: Option<String> = r.get(6)?;
        let host_ref: Option<String> = r.get(7)?;
        let season_start_str: String = r.get(8)?;

        let season_start = chrono::NaiveDate::parse_from_str(&season_start_str, "%Y-%m-%d")
            .unwrap_or_else(|_| chrono::Utc::now().date_naive());

        let venue_type = if vt_str == "private_home" { VenueType::PrivateHome } else { VenueType::PublicVenue };

        Ok((name, dia, time, venue_type, pub_name, priv_addr, host_ref, season_start))
    }) {
        Ok(data) => data,
        Err(_) => return (StatusCode::NOT_FOUND, [("content-type", "text/plain; charset=utf-8")], "Edición no encontrada".to_string()).into_response(),
    };

    let (nombre_publico, dia_habitual, time, venue_type, public_location_name, private_address, host_reference, season_start) = row;

    let edition = portico_core::domain::Edition {
        id: group_id.clone(),
        season_id: "active_season".to_string(),
        created_from_template_id: None,
        nombre_publico,
        proposito: "".to_string(),
        affinity_id: "".to_string(),
        portada_asset_id: None,
        dia_habitual,
        hora_habitual: time.clone(),
        cupo_orientativo: 15,
        responsible_member_id: "".to_string(),
        public_responsible_visibility: false,
        estado: portico_core::domain::EditionState::Reconocida,
        is_full: false,
        aviso_breve: None,
        whatsapp_chat_url: None,
        logistics_version: 1,
        modality: portico_core::domain::GroupModality::Residential,
        cell_accent: None,
        transit_friendly: false,
        carpool_available: false,
        macro_zone: Some("Centro".to_string()),
        campus_id: None,
        consecutive_seasons_hosted: 1,
        venue_nature: portico_core::domain::VenueNature::Home,
        good_neighbor_pledge: true,
        child_safeguarding_certified: true,
        parent_group_id: None,
        liaison_name: None,
        liaison_role: None,
        access_protocol: None,
    };

    let template = portico_core::domain::MeetingTemplate {
        weekday: dia_habitual,
        time,
        venue_type,
        zone_id: None,
        public_location_name,
        public_location_url: None,
        private_reference: None,
        private_address,
        host_reference,
        host_phone: None,
        apprentice_id: None,
        kids_welcome: false,
        kids_space_type: "none".to_string(),
        rsvp_cutoff_hours: 4,
    };

    let venues = list_session_venues_for_edition(&tenant_conn, &group_id).unwrap_or_default();
    let ics_content = generate_edition_calendar_feed(&edition, &template, season_start, &venues, is_member);

    (
        StatusCode::OK,
        [
            ("content-type", "text/calendar; charset=utf-8"),
            ("content-disposition", "inline; filename=\"reuniones.ics\""),
            ("cache-control", "no-cache, no-store, must-revalidate"),
        ],
        ics_content,
    ).into_response()
}

// ---------------- Pipeline de Discipulado Práctico (GOLD-262) ----------------

pub async fn get_discipleship_track_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match get_discipleship_track(&tenant_conn, &group_id) {
        Ok(Some(track)) => (StatusCode::OK, Json(serde_json::to_value(track).unwrap())),
        Ok(None) => (StatusCode::OK, Json(serde_json::json!(null))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct UpsertDiscipleshipPayload {
    pub disciple_name: String,
    pub stage: DiscipleshipStage,
    pub seasons_completed: u32,
}

pub async fn upsert_discipleship_track_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<UpsertDiscipleshipPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let now = Utc::now().to_rfc3339();
    let existing = get_discipleship_track(&tenant_conn, &group_id).unwrap_or(None);
    let track = DiscipleshipTrack {
        id: existing.as_ref().map(|t| t.id.clone()).unwrap_or_else(|| Uuid::new_v4().to_string()),
        group_id,
        disciple_name: payload.disciple_name,
        stage: payload.stage,
        seasons_completed: payload.seasons_completed,
        endorsed_for_launch: existing.as_ref().map(|t| t.endorsed_for_launch).unwrap_or(false),
        endorsed_at: existing.and_then(|t| t.endorsed_at),
        updated_at: now,
    };

    match upsert_discipleship_track(&tenant_conn, &track) {
        Ok(_) => (StatusCode::OK, Json(serde_json::to_value(track).unwrap())),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

pub async fn endorse_disciple_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match endorse_disciple_for_launch(&tenant_conn, &group_id) {
        Ok(track) => (
            StatusCode::OK,
            Json(serde_json::json!({
                "message": "🕊️ Endoso pastoral de envío emitido con éxito. El discípulo será bendecido en la reunión dominical.",
                "track": track
            })),
        ),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

// ---------------- Reporte Formal de Desviaciones (GOLD-268) ----------------

#[derive(Deserialize)]
pub struct ReportDeviationPayload {
    pub reporter_member_id: String,
    pub category: String,
    pub comments: String,
}

pub async fn report_pastoral_deviation_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<ReportDeviationPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let sla_deadline = (Utc::now() + chrono::Duration::hours(72)).to_rfc3339();
    let deviation = PastoralDeviation {
        id: Uuid::new_v4().to_string(),
        group_id,
        reporter_member_id: payload.reporter_member_id,
        category: payload.category,
        comments: payload.comments,
        status: "pending".to_string(),
        sla_deadline: Some(sla_deadline),
        assigned_elder_id: None,
        created_at: Utc::now().to_rfc3339(),
    };

    match insert_pastoral_deviation(&tenant_conn, &deviation) {
        Ok(_) => (
            StatusCode::CREATED,
            Json(serde_json::json!({
                "message": "🛡️ Observación enviada de forma discreta al Diácono y al Pastor. Se atenderá con amor y verdad.",
                "deviation_id": deviation.id
            })),
        ),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

// ---------------- Cierre Fraternal de Temporada (GOLD-264) ----------------

#[derive(Deserialize)]
pub struct SeasonClosureQuery {
    pub season_name: String,
}

pub async fn get_season_closure_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Query(query): Query<SeasonClosureQuery>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match get_season_closure(&tenant_conn, &group_id, &query.season_name) {
        Ok(Some(closure)) => (StatusCode::OK, Json(serde_json::to_value(closure).unwrap())),
        Ok(None) => (StatusCode::OK, Json(serde_json::json!(null))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct RecordSeasonClosurePayload {
    pub season_name: String,
    pub closure_decision: SeasonClosureDecision,
    pub disciple_new_group_name: Option<String>,
    pub notes: String,
}

pub async fn record_season_closure_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<RecordSeasonClosurePayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let closure = SeasonClosure {
        id: Uuid::new_v4().to_string(),
        group_id,
        season_name: payload.season_name,
        closure_decision: payload.closure_decision,
        disciple_new_group_name: payload.disciple_new_group_name,
        notes: payload.notes,
        created_at: Utc::now().to_rfc3339(),
    };

    match record_season_closure(&tenant_conn, &closure) {
        Ok(_) => (
            StatusCode::CREATED,
            Json(serde_json::json!({
                "message": "🎉 Acuerdo fraternal de cierre de temporada registrado con celebración y gratitud.",
                "closure": closure
            })),
        ),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

// ---------------- Descanso Sabático de Hogares y Fisión Dunbar (GOLD-275, GOLD-279) ----------------

pub async fn get_host_sabbatical_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match portico_core::db::data_plane::list_host_sabbaticals(&tenant_conn, Some(&group_id)) {
        Ok(sabbaticals) => {
            let active = sabbaticals.into_iter().next();
            (StatusCode::OK, Json(serde_json::json!(active)))
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct RecordHostSabbaticalPayload {
    pub host_name: String,
    pub consecutive_seasons: u32,
    pub is_on_sabbatical: bool,
    pub sabbatical_reason: Option<String>,
    pub next_eligible_season: Option<String>,
}

pub async fn record_host_sabbatical_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<RecordHostSabbaticalPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let sabbatical = portico_core::domain::HostSabbatical {
        id: Uuid::new_v4().to_string(),
        group_id,
        host_name: payload.host_name,
        consecutive_seasons: payload.consecutive_seasons,
        is_on_sabbatical: payload.is_on_sabbatical,
        sabbatical_reason: payload.sabbatical_reason,
        next_eligible_season: payload.next_eligible_season,
        created_at: Utc::now().to_rfc3339(),
    };

    match portico_core::db::data_plane::record_host_sabbatical(&tenant_conn, &sabbatical) {
        Ok(_) => (
            StatusCode::CREATED,
            Json(serde_json::json!({
                "message": "🕊️ Registro sabático del hogar guardado. Cuidar al anfitrión preserva el rebaño.",
                "sabbatical": sabbatical
            })),
        ),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}

#[derive(Deserialize)]
pub struct ExecuteDunbarFissionPayload {
    pub apprentice_id: String,
    pub apprentice_name: String,
    pub seed_member_ids: Vec<String>,
    pub seed_member_names: Vec<String>,
    pub new_group_name: String,
    pub new_macro_zone: String,
    pub new_dia_habitual: u8,
    pub new_hora_habitual: String,
}

pub async fn execute_dunbar_fission_handler(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(group_id): Path<String>,
    Json(payload): Json<ExecuteDunbarFissionPayload>,
) -> impl IntoResponse {
    let tenant = match resolve_tenant(&headers, &state) {
        Some(t) => t,
        None => return (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Organización no encontrada"}))),
    };

    let tenant_conn = match state.get_tenant_conn(&tenant) {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let nucleus = portico_core::domain::PlantingSeedNucleus {
        parent_group_id: group_id,
        apprentice_id: payload.apprentice_id,
        apprentice_name: payload.apprentice_name,
        seed_member_ids: payload.seed_member_ids,
        seed_member_names: payload.seed_member_names,
        new_group_name: payload.new_group_name,
        new_macro_zone: payload.new_macro_zone,
        new_dia_habitual: payload.new_dia_habitual,
        new_hora_habitual: payload.new_hora_habitual,
    };

    match portico_core::db::data_plane::execute_dunbar_fission(&tenant_conn, &nucleus) {
        Ok(result) => (
            StatusCode::CREATED,
            Json(serde_json::json!({
                "message": "🌱 Fisión saludable por umbral de Dunbar completada con bendición. Se comisionó al nuevo grupo hijo.",
                "result": result
            })),
        ),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    }
}


