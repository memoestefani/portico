pub mod catalog;
pub mod member;
pub mod pastor;
pub mod platform;

use std::path::Path;
use axum::{
    routing::{get, post},
    Router,
};
use tower_http::services::{ServeDir, ServeFile};
use crate::state::AppState;

pub fn create_router(state: AppState) -> Router {
    let api_router = Router::new()
        // Health check
        .route("/health", get(|| async { axum::Json(serde_json::json!({"status": "ok", "service": "portico-server"})) }))
        // Control Plane: Operator HQ
        .route("/api/platform/auth/login", post(platform::login_handler))
        .route("/api/platform/tenants", get(platform::list_tenants_handler).post(platform::create_tenant_handler))
        .route("/api/platform/tenants/{slug}/suspend", post(platform::suspend_tenant_handler))
        .route("/api/platform/tenants/{slug}/activate", post(platform::activate_tenant_handler))
        // Data Plane: Public Catalog & Config
        .route("/api/config", get(catalog::get_config_handler))
        .route("/api/catalog", get(catalog::get_catalog_handler))
        .route("/api/campuses", get(catalog::list_campuses_handler))
        .route("/api/campuses/{id}", get(catalog::get_campus_handler))
        .route("/api/curriculum/active", get(catalog::get_active_curriculum_handler))
        .route("/api/neighborhood/complaints", post(catalog::submit_neighborhood_complaint_handler))
        .route("/api/join-requests", post(catalog::submit_join_request_handler))
        .route("/api/ministries", get(catalog::list_ministries_handler).post(catalog::create_ministry_handler))
        .route("/api/ministries/{id}/enroll", post(catalog::enroll_ministry_handler))
        .route("/api/ministries/{id}/enrollments", get(catalog::list_enrollments_handler))
        .route("/api/groups/{id}/social-preview", get(catalog::group_social_preview_handler))
        // Data Plane: Member / Leader Silo
        .route("/api/auth/magic-link/request", post(member::magic_link_request_handler))
        .route("/api/auth/magic-link/verify", post(member::magic_link_verify_handler))
        .route("/api/me", get(member::me_handler))
        .route("/api/groups/{id}", get(member::get_group_detail_handler))
        .route("/api/groups/{id}/notices", post(member::create_notice_handler))
        .route("/api/groups/{id}/resources", post(member::create_resource_link_handler))
        .route("/api/groups/{id}/resources/{link_id}", axum::routing::delete(member::delete_resource_link_handler))
        .route("/api/groups/{id}/headcount", post(member::record_headcount_handler))
        .route("/api/groups/{id}/clone-draft", post(member::clone_edition_draft_handler))
        .route("/api/groups/{id}/privacy", post(member::update_contact_visibility_handler))
        .route("/api/groups/{id}/exceptions", post(member::create_exception_handler))
        .route("/api/groups/{id}/photos", post(member::upload_photo_handler))
        .route("/api/groups/{id}/prayers", post(member::create_prayer_handler))
        .route("/api/groups/{id}/safeguard-alert", post(member::create_safeguard_alert_handler))
        .route("/api/groups/{id}/rsvp", post(member::submit_rsvp_handler))
        .route("/api/groups/{id}/export-contacts", get(member::export_contacts_handler))
        .route("/api/groups/{id}/venues", get(member::list_session_venues_handler).post(member::upsert_session_venue_handler))
        .route("/api/groups/{id}/calendar.ics", get(member::calendar_feed_handler))
        .route("/api/groups/{id}/discipleship", get(member::get_discipleship_track_handler).post(member::upsert_discipleship_track_handler))
        .route("/api/groups/{id}/discipleship/endorse", post(member::endorse_disciple_handler))
        .route("/api/groups/{id}/deviations", post(member::report_pastoral_deviation_handler))
        .route("/api/groups/{id}/season-closure", get(member::get_season_closure_handler).post(member::record_season_closure_handler))
        .route("/api/groups/{id}/host-sabbatical", get(member::get_host_sabbatical_handler).post(member::record_host_sabbatical_handler))
        .route("/api/groups/{id}/dunbar-fission", post(member::execute_dunbar_fission_handler))
        // Data Plane: Deacon Care Desk (GOLD-263, GOLD-277) & Presbytery Eldership (GOLD-273) & Pastoral HUD (Josh)
        .route("/api/deacon/groups", get(pastor::deacon_groups_handler))
        .route("/api/deacon/contact-log", get(pastor::list_deacon_logs_handler).post(pastor::deacon_contact_log_handler))
        .route("/api/deacon/deviations", get(pastor::list_pastoral_deviations_handler))
        .route("/api/deacon/deviations/{id}/resolve", post(pastor::resolve_pastoral_deviation_handler))
        .route("/api/deacon/deviations/{id}/escalate", post(pastor::escalate_pastoral_deviation_handler))
        .route("/api/deacon/visits", get(pastor::list_diaconal_visits_handler).post(pastor::record_diaconal_visit_handler))
        .route("/api/pastor/eldership-councils", get(pastor::list_eldership_councils_handler).post(pastor::create_eldership_council_handler))
        .route("/api/pastor/elders/{elder_id}/deacons", get(pastor::list_elder_deacons_handler))
        .route("/api/pastor/elders/assign-deacon", post(pastor::assign_elder_deacon_handler))
        .route("/api/pastor/deacon-roundtables", get(pastor::list_deacon_roundtables_handler).post(pastor::record_deacon_roundtable_handler))
        .route("/api/pastor/fatigue-radar", get(pastor::get_fatigue_radar_handler))
        .route("/api/pastor/emeritus-guardians", get(pastor::list_emeritus_guardians_handler).post(pastor::enroll_emeritus_guardian_handler))
        .route("/api/pastor/curriculum", post(pastor::create_curriculum_handler))
        .route("/api/pastor/neighborhood-complaints", get(pastor::list_neighborhood_complaints_handler))
        .route("/api/pastor/neighborhood-complaints/{id}/resolve", post(pastor::resolve_neighborhood_complaint_handler))
        .route("/api/pastor/deacon-assignments", post(pastor::assign_deacon_handler))
        .route("/api/pastor/overview", get(pastor::overview_handler))
        .route("/api/pastor/groups", get(pastor::list_groups_handler))
        .route("/api/pastor/seasons", post(pastor::create_season_handler))
        .route("/api/pastor/seasons/{id}/transition", post(pastor::transition_season_handler))
        .route("/api/pastor/safeguards", get(pastor::list_safeguard_alerts_handler))
        .route("/api/pastor/safeguards/{id}/triage", post(pastor::triage_safeguard_alert_handler))
        .route("/api/pastor/restricted-pairings", get(pastor::list_restricted_pairings_handler).post(pastor::create_restricted_pairing_handler))
        .route("/api/elder/restricted-pairings", get(pastor::list_restricted_pairings_handler).post(pastor::create_restricted_pairing_handler))
        .route("/api/pastor/veto", post(pastor::veto_handler))
        .route("/api/pastor/discipline", post(pastor::discipline_handler))
        .route("/api/pastor/broadcasts", post(pastor::create_broadcast_handler))
        .route("/api/broadcasts", get(pastor::list_broadcasts_handler))
        .route("/api/church/config", get(pastor::get_church_config_handler).put(pastor::update_church_config_handler))
        .route("/api/pastor/audit-overview", get(pastor::audit_overview_handler))
        .route("/api/pastor/export-sovereign-archive", get(pastor::export_sovereign_archive_handler))
        .with_state(state);

    // If built frontend exists, serve it seamlessly as fallback SPA
    let dist_candidates = [
        Path::new("../frontend/dist"),
        Path::new("./frontend/dist"),
        Path::new("../../frontend/dist"),
    ];

    for dist in &dist_candidates {
        if dist.exists() {
            let index_html = dist.join("index.html");
            if index_html.exists() {
                return api_router.fallback_service(
                    ServeDir::new(dist).not_found_service(ServeFile::new(index_html)),
                );
            }
        }
    }

    api_router
}
