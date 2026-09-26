use std::path::PathBuf;
use axum::{
    body::{to_bytes, Body},
    http::{header, Request, StatusCode},
};
use serde_json::Value;
use tower::ServiceExt;
use uuid::Uuid;

use portico_core::db::seed::seed_master_and_tenants;
use portico_server::routes::create_router;
use portico_server::state::AppState;

fn setup_test_env() -> (PathBuf, AppState) {
    let temp_dir = std::env::temp_dir().join(format!("portico_server_test_{}", Uuid::new_v4()));
    std::fs::create_dir_all(&temp_dir).unwrap();

    let state = AppState::new(temp_dir.clone());
    let master_conn = state.get_master_conn().unwrap();
    seed_master_and_tenants(&master_conn, &temp_dir).unwrap();

    (temp_dir, state)
}

#[tokio::test]
async fn test_public_catalog_and_polymorphic_privacy() {
    let (_temp_dir, state) = setup_test_env();
    let app = create_router(state);

    // 1. GET /api/config
    let req = Request::builder()
        .uri("/api/config")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();

    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let config: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(config["church_name"], "Amor y Gracia Durango");
    assert_eq!(config["slug"], "amorygracia");
    assert_eq!(config["campuses"].as_array().unwrap().len(), 5);

    // 2. GET /api/catalog
    let req = Request::builder()
        .uri("/api/catalog")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();

    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let catalog: Value = serde_json::from_slice(&body).unwrap();
    let groups = catalog.as_array().unwrap();
    assert_eq!(groups.len(), 4);

    // Find GP Centro Jóvenes (Private Home)
    let gp_priv = groups
        .iter()
        .find(|g| g["nombre_publico"] == "GP Centro Jóvenes")
        .unwrap();
    assert_eq!(gp_priv["venue_category"], "Casa particular");
    // Verify street address is NOT leaked
    let summary = gp_priv["location_summary"].as_str().unwrap();
    assert!(!summary.contains("Calle Victoria 402"));
    assert!(!summary.contains("Apt 3"));
    assert!(gp_priv["map_url"].is_null());

    // Find GP Café & Fe Oriente (Public Venue)
    let gp_pub = groups
        .iter()
        .find(|g| g["nombre_publico"] == "GP Café & Fe Oriente")
        .unwrap();
    assert_eq!(gp_pub["venue_category"], "Lugar público");
    assert!(gp_pub["location_summary"].as_str().unwrap().contains("Café Central"));
    assert!(gp_pub["map_url"].as_str().unwrap().contains("maps.google.com"));

    // Verify upcoming session resolves next chronological meeting
    let next_summary = gp_pub["next_meeting_summary"].as_str().unwrap();
    assert!(next_summary.starts_with("Próx. sesión:"));
}

#[tokio::test]
async fn test_auth_member_silo_and_trajectory() {
    let (_temp_dir, state) = setup_test_env();
    let app = create_router(state);

    // 1. Request Magic Link for Elena
    let req = Request::builder()
        .method("POST")
        .uri("/api/auth/magic-link/request")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(r#"{"contact":"elena@gmail.com"}"#))
        .unwrap();

    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let ml_resp: Value = serde_json::from_slice(&body).unwrap();
    let token = ml_resp["token"].as_str().unwrap();

    // 2. Verify Magic Link
    let verify_payload = serde_json::json!({ "token": token });
    let req = Request::builder()
        .method("POST")
        .uri("/api/auth/magic-link/verify")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(verify_payload.to_string()))
        .unwrap();

    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let verify_res: Value = serde_json::from_slice(&body).unwrap();
    let session_token = verify_res["session_token"].as_str().unwrap();
    assert_eq!(verify_res["nombre_visible"], "Elena Ramos");

    // 3. GET /api/me with session token
    let req = Request::builder()
        .uri("/api/me")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .body(Body::empty())
        .unwrap();

    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let me: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(me["nombre_visible"], "Elena Ramos");

    // Verify Active Groups
    let active_groups = me["active_groups"].as_array().unwrap();
    assert_eq!(active_groups.len(), 1);
    let active_gp = &active_groups[0];
    assert_eq!(active_gp["nombre_publico"], "GP Centro Jóvenes");

    // Verify Institutional Memory ("Mi Trayectoria")
    // Elena's past group from closed Spring 2026 season must be preserved!
    let trajectory = me["trajectory"].as_array().unwrap();
    assert_eq!(trajectory.len(), 1);
    assert_eq!(trajectory[0]["group_name"], "GP Fundamentos Primavera");
    assert_eq!(trajectory[0]["season_name"], "Temporada Primavera 2026");
    assert_eq!(trajectory[0]["status"], "finalizada");

    // 4. GET /api/groups/{id} -> Enrolled member accesses full private details
    let gp_id = active_gp["id"].as_str().unwrap();
    let req = Request::builder()
        .uri(format!("/api/groups/{}", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .body(Body::empty())
        .unwrap();

    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let detail: Value = serde_json::from_slice(&body).unwrap();

    // Now private address and WhatsApp ARE revealed inside the authenticated silo!
    assert!(detail["full_venue_address"].as_str().unwrap().contains("Calle Victoria 402"));
    assert_eq!(detail["whatsapp_chat_url"], "https://chat.whatsapp.com/sample123");
    assert_eq!(detail["schedule"].as_array().unwrap().len(), 12);
}

#[tokio::test]
async fn test_pastor_hud_and_operator_hq() {
    let (_temp_dir, state) = setup_test_env();
    let app = create_router(state);

    // 1. Pastor Josh HUD Overview: GET /api/pastor/overview
    let req = Request::builder()
        .uri("/api/pastor/overview")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();

    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let overview: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(overview["church_name"], "Amor y Gracia Durango");
    assert_eq!(overview["total_groups"], 4);
    assert_eq!(overview["pending_join_requests"], 1);

    // 2. Operator HQ Login: POST /api/platform/auth/login
    let req = Request::builder()
        .method("POST")
        .uri("/api/platform/auth/login")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(r#"{"email":"admin@portico.lat","password":"portico2026!"}"#))
        .unwrap();

    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    // 3. Operator HQ List Tenants: GET /api/platform/tenants
    let req = Request::builder()
        .uri("/api/platform/tenants")
        .body(Body::empty())
        .unwrap();

    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let tenants: Value = serde_json::from_slice(&body).unwrap();
    let list = tenants.as_array().unwrap();
    assert_eq!(list.len(), 2);
}

#[tokio::test]
async fn test_canonical_10_decisions_flow() {
    let (_temp_dir, state) = setup_test_env();
    let app = create_router(state);

    // 1. Authenticate Carlos Mendoza (Leader of GP Centro Jóvenes)
    let req = Request::builder()
        .method("POST")
        .uri("/api/auth/magic-link/request")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(r#"{"contact":"carlos@amorygracia.mx"}"#))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let ml: Value = serde_json::from_slice(&body).unwrap();
    let token = ml["token"].as_str().unwrap();

    let req = Request::builder()
        .method("POST")
        .uri("/api/auth/magic-link/verify")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::json!({ "token": token }).to_string()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let verify: Value = serde_json::from_slice(&body).unwrap();
    let session_token = verify["session_token"].as_str().unwrap();

    // Retrieve active group from /api/me
    let req = Request::builder()
        .uri("/api/me")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let me: Value = serde_json::from_slice(&body).unwrap();
    let active_gps = me["active_groups"].as_array().unwrap();
    assert!(!active_gps.is_empty());
    let gp = active_gps.iter().find(|g| g["nombre_publico"] == "GP Centro Jóvenes").unwrap();
    let gp_id = gp["id"].as_str().unwrap().to_string();

    // 2. Decision 5-C: GET /api/groups/{id} must have Cache-Control: no-store
    let req = Request::builder()
        .uri(format!("/api/groups/{}", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(
        resp.headers().get("cache-control").unwrap(),
        "no-store, no-cache, must-revalidate, private"
    );
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let detail: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(detail["is_responsible"], true);
    assert!(detail["my_contact_visibility"].as_str().is_some());

    // 3. Decision 1-C: Create Notice (Tablón)
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/notices", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::json!({
            "titulo": "Traer comida para compartir",
            "contenido": "Este viernes tendremos cena comunitaria tras el estudio."
        }).to_string()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);

    // 4. Decision 3-C: Materialized Resource Links (capped at max 5)
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/resources", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::json!({
            "title": "Guía de Estudio Semanal",
            "url": "https://amorygracia.org/estudios/semana1.pdf",
            "link_type": "pdf"
        }).to_string()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);

    // 5. Decision 6-B: Aggregate Headcount Reporting (zero surveillance roll-call)
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/headcount", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::json!({
            "meeting_date": "2026-09-25",
            "attendee_count": 14,
            "did_meet": true,
            "notes": "Excelente reunión, llegaron dos visitas."
        }).to_string()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);

    // 6. Decision 7-B: Update Contact Visibility to 'edition_members'
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/privacy", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::json!({
            "contact_visibility": "edition_members"
        }).to_string()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    // 7. Decision 9-C: Clone Edition to Draft with Lineage (Pastor Action)
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/clone-draft", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::json!({
            "cloned_by": "carlos",
            "lineage_type": "replicated"
        }).to_string()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let clone_res: Value = serde_json::from_slice(&body).unwrap();
    let draft_id = clone_res["new_edition_id"].as_str().unwrap();
    assert!(!draft_id.is_empty());

    // 8. Decision 6-B & 8-B: Pastor HUD groups with Jetro split suggestion and aggregate attendance
    let req = Request::builder()
        .uri("/api/pastor/groups")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let groups: Value = serde_json::from_slice(&body).unwrap();
    let list = groups.as_array().unwrap();
    let centro_gp = list.iter().find(|g| g["id"] == gp_id).unwrap();
    assert_eq!(centro_gp["meetings_reported"], 2);
    assert!(centro_gp["average_headcount"].as_f64().is_some());
}

#[tokio::test]
async fn test_cycle3_canonical_10_decisions_integration_flow() {
    let (_temp_dir, state) = setup_test_env();
    let app = create_router(state);

    // 1. Authenticate Carlos Mendoza (Leader of GP Centro Jóvenes)
    let req = Request::builder()
        .method("POST")
        .uri("/api/auth/magic-link/request")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(r#"{"contact":"carlos@amorygracia.mx"}"#))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let ml: Value = serde_json::from_slice(&body).unwrap();
    let token = ml["token"].as_str().unwrap();

    let req = Request::builder()
        .method("POST")
        .uri("/api/auth/magic-link/verify")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::json!({ "token": token }).to_string()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let verify: Value = serde_json::from_slice(&body).unwrap();
    let session_token = verify["session_token"].as_str().unwrap();

    // Get active group ID
    let req = Request::builder()
        .uri("/api/me")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let me: Value = serde_json::from_slice(&body).unwrap();
    let gp = me["active_groups"].as_array().unwrap().iter().find(|g| g["nombre_publico"] == "GP Centro Jóvenes").unwrap();
    let gp_id = gp["id"].as_str().unwrap().to_string();

    // Decision 1-C (GOLD-240): Anti-Schism: Export contacts blocked with 403 Forbidden for laity
    let req = Request::builder()
        .uri(format!("/api/groups/{}/export-contacts", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::FORBIDDEN);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let err_json: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(err_json["error"], "Acceso Restringido");
    assert!(err_json["message"].as_str().unwrap().contains("restringida"));

    // Decision 2-C (GOLD-241): Structured prayer intercession by closed categories
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/prayers", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::json!({
            "category": "salud"
        }).to_string()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let prayer_res: Value = serde_json::from_slice(&body).unwrap();
    assert!(prayer_res["id"].as_str().is_some());

    // Decision 3-C (GOLD-242): Fast-Track pastoral safeguard escalation
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/safeguard-alert", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::json!({
            "urgency_level": "high"
        }).to_string()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let alert_res: Value = serde_json::from_slice(&body).unwrap();
    let alert_id = alert_res["alert_id"].as_str().unwrap();

    // Verify Pastor can triage the safeguard alert
    let req = Request::builder()
        .uri("/api/pastor/safeguards")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let alerts: Value = serde_json::from_slice(&body).unwrap();
    let found = alerts.as_array().unwrap().iter().find(|a| a["id"] == alert_id).unwrap();
    assert_eq!(found["urgency_level"], "high");

    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/pastor/safeguards/{}/triage", alert_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::json!({
            "status": "contacted",
            "pastoral_notes": "Llamada realizada por el Pastor Josh"
        }).to_string()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    // Decision 4-C (GOLD-243): Micro-RSVP with Catering Lock
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/rsvp", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::json!({
            "meeting_date": "2026-10-02",
            "status": "attending"
        }).to_string()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let rsvp_res: Value = serde_json::from_slice(&body).unwrap();
    assert!(rsvp_res["catering_headcount_confirmed"].as_i64().unwrap() >= 1);

    // Decision 7-C (GOLD-246): Anti-Collision Restricted Pairing Registration & Join Blocking
    let req = Request::builder()
        .method("POST")
        .uri("/api/pastor/restricted-pairings")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::json!({
            "phone_a": "+526189990001",
            "phone_b": "+526189990002",
            "reason_category": "conflicto_previo"
        }).to_string()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);

    // Decision 8-C (GOLD-247) & 10-C (GOLD-249): Catalog filtering with kids_welcome and sidewalk WhatsApp URL
    let req = Request::builder()
        .uri("/api/catalog?kids_welcome=true")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let kids_catalog: Value = serde_json::from_slice(&body).unwrap();
    for g in kids_catalog.as_array().unwrap() {
        assert_eq!(g["kids_welcome"], true);
        assert!(g["kids_space_type"].as_str().is_some());
    }

    // Decision 9-C (GOLD-248): Triad structure presence in group detail
    let req = Request::builder()
        .uri(format!("/api/groups/{}", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let detail: Value = serde_json::from_slice(&body).unwrap();
    assert!(detail["facilitator_name"].as_str().is_some());
    assert!(detail["host_reference"].as_str().is_some());
    assert!(detail["apprentice_name"].as_str().is_some());
    assert_eq!(detail["facilitator_name"], "Carlos Mendoza");
    assert_eq!(detail["host_reference"], "Carlos Mendoza");
    assert_eq!(detail["apprentice_name"], "David Soto");
}

#[tokio::test]
async fn test_nomadic_venues_and_webcal_subscription_feed() {
    let (_temp_dir, state) = setup_test_env();
    let app = create_router(state);

    // 1. Obtener catálogo para sacar el ID de GP Centro Jóvenes
    let req = Request::builder()
        .uri("/api/catalog")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let catalog: Value = serde_json::from_slice(&body).unwrap();
    let gp_id = catalog
        .as_array()
        .unwrap()
        .iter()
        .find(|g| g["nombre_publico"] == "GP Centro Jóvenes")
        .unwrap()["id"]
        .as_str()
        .unwrap();

    // 2. GET /api/groups/{id}/venues (itinerario nómada inicial de semillas)
    let req = Request::builder()
        .uri(format!("/api/groups/{}/venues", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let venues: Value = serde_json::from_slice(&body).unwrap();
    assert!(venues.as_array().unwrap().len() >= 2);
    assert_eq!(venues[0]["week_number"], 1);
    assert!(venues[0]["venue_name"].as_str().unwrap().contains("Taquería El Pastorcito"));

    // 3. Iniciar sesión para obtener token de miembro
    let req = Request::builder()
        .method("POST")
        .uri("/api/auth/magic-link/request")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&serde_json::json!({"contact": "carlos@amorygracia.mx"})).unwrap()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let ml_resp: Value = serde_json::from_slice(&body).unwrap();
    let token = ml_resp["token"].as_str().unwrap();

    let req = Request::builder()
        .method("POST")
        .uri("/api/auth/magic-link/verify")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&serde_json::json!({"token": token})).unwrap()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let v_resp: Value = serde_json::from_slice(&body).unwrap();
    let session_token = v_resp["session_token"].as_str().unwrap();

    // 4. POST /api/groups/{id}/venues (programar semana 4 en casa particular rotativa)
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/venues", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::AUTHORIZATION, format!("Bearer {}", session_token))
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&serde_json::json!({
            "week_number": 4,
            "venue_name": "Casa Familia Andrade",
            "address": "Calle Laurel 204, Lomas",
            "maps_url": "https://maps.google.com/?q=laurel204",
            "notes": "Timbre azul, portón blanco",
            "venue_type": "private_home",
            "host_name": "Jorge y Lucy Andrade",
            "host_phone": "+526182223344"
        })).unwrap()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    // 5. GET /api/groups/{id}/calendar.ics como visitante (sin sesión) -> dirección de semana 4 enmascarada
    let req = Request::builder()
        .uri(format!("/api/groups/{}/calendar.ics", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(resp.headers().get("content-type").unwrap(), "text/calendar; charset=utf-8");
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let ics = String::from_utf8(body.to_vec()).unwrap();
    assert!(ics.contains("BEGIN:VCALENDAR"));
    assert!(ics.contains("METHOD:PUBLISH"));
    assert!(ics.contains("Taquería El Pastorcito"));
    // Casa particular de semana 4 enmascarada para visitantes
    assert!(!ics.contains("Calle Laurel 204"));
    assert!(ics.contains("Casa particular · Dirección exacta revelada al unirse o confirmar"));

    // 6. GET /api/groups/{id}/calendar.ics con token de miembro -> dirección completa y contacto visible
    let req = Request::builder()
        .uri(format!("/api/groups/{}/calendar.ics?token={}", gp_id, session_token))
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let ics_member = String::from_utf8(body.to_vec()).unwrap();
    assert!(ics_member.contains("Calle Laurel 204"));
    assert!(ics_member.contains("Jorge y Lucy Andrade"));
}

#[tokio::test]
async fn test_pastoral_governance_veto_discipline_broadcast_and_church_config() {
    let (_temp_dir, state) = setup_test_env();
    let app = create_router(state);

    // 1. POST /api/pastor/broadcasts (emitir comunicado)
    let req = Request::builder()
        .method("POST")
        .uri("/api/pastor/broadcasts")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&serde_json::json!({
            "sender_name": "Pastor Josh",
            "title": "Aviso Urgente a Facilitadores",
            "message": "Nos vemos el sábado a las 9am para el desayuno de líderes.",
            "priority": "urgent"
        })).unwrap()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);

    // 2. GET /api/broadcasts (consumir comunicados activos)
    let req = Request::builder()
        .uri("/api/broadcasts")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let broadcasts: Value = serde_json::from_slice(&body).unwrap();
    assert!(broadcasts.as_array().unwrap().len() >= 2);

    // 3. GET y PUT /api/church/config (nomenclatura y paleta noble)
    let req = Request::builder()
        .uri("/api/church/config")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    let req = Request::builder()
        .method("PUT")
        .uri("/api/church/config")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&serde_json::json!({
            "nomenclature_json": r#"{"campus_singular":"Campus","campus_plural":"Campuses","group_singular":"Comunidad","group_plural":"Comunidades","leader_title":"Guía","host_title":"Anfitrión","meeting_term":"Conexión"}"#,
            "brand_palette_id": "forest",
            "season_name": "Temporada de Cosecha",
            "season_motto": "Firmes en la Fe",
            "season_start_date": "2026-10-01",
            "season_end_date": "2026-12-20"
        })).unwrap()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let cfg: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(cfg["brand_palette_id"], "forest");
    assert_eq!(cfg["season_name"], "Temporada de Cosecha");

    // 4. Veto pastoral y disciplina
    let req = Request::builder()
        .uri("/api/catalog")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let catalog: Value = serde_json::from_slice(&body).unwrap();
    let gp_id = catalog[0]["id"].as_str().unwrap();

    let req = Request::builder()
        .method("POST")
        .uri("/api/pastor/veto")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&serde_json::json!({
            "edition_id": gp_id
        })).unwrap()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    // 5. GET /api/pastor/audit-overview (Consejo de Ancianos: CERO PII)
    let req = Request::builder()
        .uri("/api/pastor/audit-overview")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let audit: Value = serde_json::from_slice(&body).unwrap();
    assert!(audit["total_active_editions"].as_i64().is_some());
    assert!(audit["total_active_members"].as_i64().is_some());
    assert!(audit["total_headcount_reported"].as_i64().is_some());
    // Verificación estricta de CERO PII en la respuesta de auditoría
    assert!(audit.get("members").is_none());
    assert!(audit.get("names").is_none());
    assert!(audit.get("phones").is_none());
    assert!(audit.get("addresses").is_none());
}

#[tokio::test]
async fn test_cycle5_discipleship_endorsement_and_deacon_flow() {
    let (_temp_dir, state) = setup_test_env();
    let app = create_router(state);

    // 1. Obtener catálogo y extraer GP Centro Jóvenes
    let req = Request::builder()
        .uri("/api/catalog")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let catalog: Value = serde_json::from_slice(&body).unwrap();
    let gp_id = catalog[0]["id"].as_str().unwrap();

    // 2. Discipulado: Registrar discípulo co-facilitador
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/discipleship", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&serde_json::json!({
            "disciple_name": "Samuel Aprendiz",
            "stage": "co_facilitator",
            "seasons_completed": 2
        })).unwrap()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    // 3. Endoso pastoral en semana 10
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/discipleship/endorse", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let endorse_resp: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(endorse_resp["track"]["stage"], "ready_for_launch");
    assert_eq!(endorse_resp["track"]["endorsed_for_launch"], true);

    // 4. Asignación Diaconal Fraternal (GOLD-263)
    let req = Request::builder()
        .method("POST")
        .uri("/api/pastor/deacon-assignments")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&serde_json::json!({
            "deacon_id": "deacon_mateo",
            "deacon_name": "Mateo Valenzuela (Diácono)",
            "group_id": gp_id
        })).unwrap()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);

    // 5. Mesa Diaconal: GET /api/deacon/groups
    let req = Request::builder()
        .uri("/api/deacon/groups")
        .header("X-Tenant-Slug", "amorygracia")
        .header("X-Deacon-Id", "deacon_mateo")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let deacon_groups: Value = serde_json::from_slice(&body).unwrap();
    assert!(!deacon_groups.as_array().unwrap().is_empty());

    // 6. Registro de contacto fraternal
    let req = Request::builder()
        .method("POST")
        .uri("/api/deacon/contact-log")
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&serde_json::json!({
            "deacon_id": "deacon_mateo",
            "group_id": gp_id,
            "contact_type": "call",
            "notes": "Llamada de ánimo previa al servicio del domingo"
        })).unwrap()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);

    // 7. Reporte formal de desviación (GOLD-268)
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/deviations", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&serde_json::json!({
            "reporter_member_id": "deacon_mateo",
            "category": "unhealthy_atmosphere",
            "comments": "Sugerencia de mantener el tiempo de oración más enfocado en Cristo."
        })).unwrap()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let dev_resp: Value = serde_json::from_slice(&body).unwrap();
    let dev_id = dev_resp["deviation_id"].as_str().unwrap();

    // 8. Resolver desviación
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/deacon/deviations/{}/resolve", dev_id))
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    // 9. Cierre fraternal de temporada (GOLD-264)
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/groups/{}/season-closure", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&serde_json::json!({
            "season_name": "Temporada de Otoño 2026",
            "closure_decision": "multiply_with_disciple",
            "disciple_new_group_name": "Comunidad Gracia y Paz",
            "notes": "Acordamos enviar a Samuel con 3 familias para plantar en Enero."
        })).unwrap()))
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::CREATED);

    // 10. Ministerios de servicio (GOLD-265)
    let req = Request::builder()
        .uri("/api/ministries")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let ministries: Value = serde_json::from_slice(&body).unwrap();
    assert!(ministries.as_array().unwrap().len() >= 4);

    // 11. Open Graph preview social card (GOLD-272)
    let req = Request::builder()
        .uri(format!("/api/groups/{}/social-preview", gp_id))
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();
    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let body = to_bytes(resp.into_body(), 1024 * 1024).await.unwrap();
    let html = String::from_utf8(body.to_vec()).unwrap();
    assert!(html.contains("og:title"));
    assert!(html.contains("Pórtico OS"));
    assert!(html.contains("Punto de Conexión Dominical en el Atrio"));
}

#[tokio::test]
async fn test_sovereign_archive_zip_export() {
    let (_temp_dir, state) = setup_test_env();
    let app = create_router(state);

    let req = Request::builder()
        .uri("/api/pastor/export-sovereign-archive")
        .header("X-Tenant-Slug", "amorygracia")
        .body(Body::empty())
        .unwrap();

    let resp = app.clone().oneshot(req).await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(
        resp.headers().get("Content-Type").unwrap(),
        "application/zip"
    );
    let disposition = resp.headers().get("Content-Disposition").unwrap().to_str().unwrap();
    assert!(disposition.contains("attachment; filename=\"amorygracia_respaldo_soberano_"));

    let body = to_bytes(resp.into_body(), 10 * 1024 * 1024).await.unwrap();
    assert!(!body.is_empty());

    let mut archive = zip::ZipArchive::new(std::io::Cursor::new(body)).expect("Valid zip archive");
    
    // Check files in archive
    let mut file_names: Vec<String> = Vec::new();
    for i in 0..archive.len() {
        let file = archive.by_index(i).unwrap();
        file_names.push(file.name().to_string());
    }

    assert!(file_names.iter().any(|n| n == "miembros.csv"), "miembros.csv must exist in sovereign archive");
    assert!(file_names.iter().any(|n| n == "celulas.csv"), "celulas.csv must exist in sovereign archive");
    assert!(file_names.iter().any(|n| n == "MANIFIESTO_SOBERANO.txt"), "MANIFIESTO_SOBERANO.txt must exist in sovereign archive");

    // Read MANIFIESTO_SOBERANO.txt
    let mut manifest_file = archive.by_name("MANIFIESTO_SOBERANO.txt").unwrap();
    let mut manifest_content = String::new();
    std::io::Read::read_to_string(&mut manifest_file, &mut manifest_content).unwrap();
    assert!(manifest_content.contains("Amor y Gracia"));
    assert!(manifest_content.contains("Garantía Soberana"));
}



