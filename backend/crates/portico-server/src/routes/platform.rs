use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use portico_core::db::control_plane::{
    get_tenant_by_slug, insert_tenant, list_all_tenants, update_license_status,
};
use portico_core::db::data_plane::initialize_data_plane;
use portico_core::domain::{LicenseStatus, NamingScheme, Tenant};
use crate::state::AppState;

#[derive(Serialize)]
pub struct TenantSummary {
    pub id: String,
    pub slug: String,
    pub domain: Option<String>,
    pub church_name: String,
    pub license_status: String,
    pub naming_scheme: NamingScheme,
    pub group_count: i64,
    pub member_count: i64,
}

#[derive(Deserialize)]
pub struct LoginPayload {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct CreateTenantPayload {
    pub slug: String,
    pub church_name: String,
    pub domain: Option<String>,
    pub naming: Option<String>,
}

pub async fn login_handler(
    Json(payload): Json<LoginPayload>,
) -> impl IntoResponse {
    if payload.email == "admin@portico.lat" && payload.password == "portico2026!" {
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "token": "operator_hq_token_secret_2026",
                "email": payload.email,
                "role": "platform_operator"
            })),
        )
    } else {
        (
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({
                "error": "Credenciales inválidas de operador"
            })),
        )
    }
}

pub async fn list_tenants_handler(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let master_conn = match state.get_master_conn() {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let tenants = match list_all_tenants(&master_conn) {
        Ok(t) => t,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let mut summaries = Vec::new();
    for t in tenants {
        let (group_count, member_count) = if let Ok(t_conn) = state.get_tenant_conn(&t) {
            let g_count: i64 = t_conn
                .query_row("SELECT count(*) FROM edition", [], |r| r.get(0))
                .unwrap_or(0);
            let m_count: i64 = t_conn
                .query_row("SELECT count(*) FROM member", [], |r| r.get(0))
                .unwrap_or(0);
            (g_count, m_count)
        } else {
            (0, 0)
        };

        let status_str = match t.license_status {
            LicenseStatus::Active => "active",
            LicenseStatus::Trial => "trial",
            LicenseStatus::Suspended => "suspended",
        };

        summaries.push(TenantSummary {
            id: t.id,
            slug: t.slug,
            domain: t.domain,
            church_name: t.church_name,
            license_status: status_str.to_string(),
            naming_scheme: t.naming_scheme,
            group_count,
            member_count,
        });
    }

    (StatusCode::OK, Json(serde_json::to_value(summaries).unwrap()))
}

pub async fn create_tenant_handler(
    State(state): State<AppState>,
    Json(payload): Json<CreateTenantPayload>,
) -> impl IntoResponse {
    let master_conn = match state.get_master_conn() {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    let tenants_dir = state.inner.data_dir.join("tenants");
    let _ = std::fs::create_dir_all(&tenants_dir);

    let tenant_id = Uuid::new_v4().to_string();
    let db_path = tenants_dir.join(format!("{}.db", tenant_id));

    let naming_scheme = match payload.naming.as_deref() {
        Some("iglesia") => NamingScheme::iglesia(),
        Some("casa") => NamingScheme::casa(),
        _ => NamingScheme::campus(),
    };

    let tenant = Tenant {
        id: tenant_id.clone(),
        slug: payload.slug.clone(),
        domain: payload.domain,
        church_name: payload.church_name,
        db_path: db_path.to_string_lossy().to_string(),
        license_status: LicenseStatus::Active,
        naming_scheme,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    if let Err(e) = insert_tenant(&master_conn, &tenant) {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({"error": e.to_string()})));
    }

    if let Ok(tenant_conn) = Connection::open(&tenant.db_path) {
        let _ = initialize_data_plane(&tenant_conn);
    }

    (
        StatusCode::CREATED,
        Json(serde_json::json!({
            "id": tenant.id,
            "slug": tenant.slug,
            "church_name": tenant.church_name,
            "license_status": "active"
        })),
    )
}

pub async fn suspend_tenant_handler(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> impl IntoResponse {
    let master_conn = match state.get_master_conn() {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match get_tenant_by_slug(&master_conn, &slug) {
        Ok(Some(tenant)) => {
            let _ = update_license_status(&master_conn, &tenant.id, LicenseStatus::Suspended);
            (StatusCode::OK, Json(serde_json::json!({"message": "Tenant suspendido", "slug": slug})))
        }
        _ => (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Tenant no encontrado"}))),
    }
}

pub async fn activate_tenant_handler(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> impl IntoResponse {
    let master_conn = match state.get_master_conn() {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": e.to_string()}))),
    };

    match get_tenant_by_slug(&master_conn, &slug) {
        Ok(Some(tenant)) => {
            let _ = update_license_status(&master_conn, &tenant.id, LicenseStatus::Active);
            (StatusCode::OK, Json(serde_json::json!({"message": "Tenant activado", "slug": slug})))
        }
        _ => (StatusCode::NOT_FOUND, Json(serde_json::json!({"error": "Tenant no encontrado"}))),
    }
}
