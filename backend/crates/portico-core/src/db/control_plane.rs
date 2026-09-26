use chrono::Utc;
use rusqlite::{params, Connection};
use crate::domain::{LicenseStatus, NamingScheme, PlatformAdmin, Tenant};
use crate::error::Result;

pub const CONTROL_PLANE_SCHEMA: &str = r#"
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT UNIQUE,
    church_name TEXT NOT NULL,
    db_path TEXT NOT NULL,
    license_status TEXT NOT NULL,
    naming_scheme TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_admins (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
"#;

pub fn initialize_control_plane(conn: &Connection) -> Result<()> {
    conn.execute_batch(r#"
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA busy_timeout = 5000;
    "#)?;
    conn.execute_batch(CONTROL_PLANE_SCHEMA)?;
    Ok(())
}

pub fn insert_tenant(conn: &Connection, tenant: &Tenant) -> Result<()> {
    let naming_json = serde_json::to_string(&tenant.naming_scheme)?;
    let status_str = match tenant.license_status {
        LicenseStatus::Active => "active",
        LicenseStatus::Trial => "trial",
        LicenseStatus::Suspended => "suspended",
    };

    conn.execute(
        r#"
        INSERT INTO tenants (id, slug, domain, church_name, db_path, license_status, naming_scheme, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
        "#,
        params![
            tenant.id,
            tenant.slug,
            tenant.domain,
            tenant.church_name,
            tenant.db_path,
            status_str,
            naming_json,
            tenant.created_at.to_rfc3339(),
            tenant.updated_at.to_rfc3339()
        ],
    )?;

    Ok(())
}

pub fn get_tenant_by_slug(conn: &Connection, slug: &str) -> Result<Option<Tenant>> {
    let mut stmt = conn.prepare(
        "SELECT id, slug, domain, church_name, db_path, license_status, naming_scheme, created_at, updated_at FROM tenants WHERE slug = ?1",
    )?;

    let mut rows = stmt.query(params![slug])?;

    if let Some(row) = rows.next()? {
        let naming_json: String = row.get(6)?;
        let naming_scheme: NamingScheme = serde_json::from_str(&naming_json)?;
        let status_str: String = row.get(5)?;
        let license_status = match status_str.as_str() {
            "active" => LicenseStatus::Active,
            "trial" => LicenseStatus::Trial,
            _ => LicenseStatus::Suspended,
        };
        let created_at_str: String = row.get(7)?;
        let updated_at_str: String = row.get(8)?;

        Ok(Some(Tenant {
            id: row.get(0)?,
            slug: row.get(1)?,
            domain: row.get(2)?,
            church_name: row.get(3)?,
            db_path: row.get(4)?,
            license_status,
            naming_scheme,
            created_at: chrono::DateTime::parse_from_rfc3339(&created_at_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
            updated_at: chrono::DateTime::parse_from_rfc3339(&updated_at_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
        }))
    } else {
        Ok(None)
    }
}

pub fn get_tenant_by_domain(conn: &Connection, domain: &str) -> Result<Option<Tenant>> {
    let mut stmt = conn.prepare(
        "SELECT id, slug, domain, church_name, db_path, license_status, naming_scheme, created_at, updated_at FROM tenants WHERE domain = ?1",
    )?;

    let mut rows = stmt.query(params![domain])?;

    if let Some(row) = rows.next()? {
        let naming_json: String = row.get(6)?;
        let naming_scheme: NamingScheme = serde_json::from_str(&naming_json)?;
        let status_str: String = row.get(5)?;
        let license_status = match status_str.as_str() {
            "active" => LicenseStatus::Active,
            "trial" => LicenseStatus::Trial,
            _ => LicenseStatus::Suspended,
        };
        let created_at_str: String = row.get(7)?;
        let updated_at_str: String = row.get(8)?;

        Ok(Some(Tenant {
            id: row.get(0)?,
            slug: row.get(1)?,
            domain: row.get(2)?,
            church_name: row.get(3)?,
            db_path: row.get(4)?,
            license_status,
            naming_scheme,
            created_at: chrono::DateTime::parse_from_rfc3339(&created_at_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
            updated_at: chrono::DateTime::parse_from_rfc3339(&updated_at_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
        }))
    } else {
        Ok(None)
    }
}

pub fn list_all_tenants(conn: &Connection) -> Result<Vec<Tenant>> {
    let mut stmt = conn.prepare(
        "SELECT id, slug, domain, church_name, db_path, license_status, naming_scheme, created_at, updated_at FROM tenants ORDER BY church_name ASC",
    )?;

    let mut rows = stmt.query([])?;
    let mut tenants = Vec::new();

    while let Some(row) = rows.next()? {
        let naming_json: String = row.get(6)?;
        let naming_scheme: NamingScheme = serde_json::from_str(&naming_json)?;
        let status_str: String = row.get(5)?;
        let license_status = match status_str.as_str() {
            "active" => LicenseStatus::Active,
            "trial" => LicenseStatus::Trial,
            _ => LicenseStatus::Suspended,
        };
        let created_at_str: String = row.get(7)?;
        let updated_at_str: String = row.get(8)?;

        tenants.push(Tenant {
            id: row.get(0)?,
            slug: row.get(1)?,
            domain: row.get(2)?,
            church_name: row.get(3)?,
            db_path: row.get(4)?,
            license_status,
            naming_scheme,
            created_at: chrono::DateTime::parse_from_rfc3339(&created_at_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
            updated_at: chrono::DateTime::parse_from_rfc3339(&updated_at_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
        });
    }

    Ok(tenants)
}

pub fn insert_platform_admin(conn: &Connection, admin: &PlatformAdmin) -> Result<()> {
    conn.execute(
        "INSERT INTO platform_admins (id, email, password_hash, created_at) VALUES (?1, ?2, ?3, ?4)",
        params![admin.id, admin.email, admin.password_hash, admin.created_at.to_rfc3339()],
    )?;
    Ok(())
}

pub fn update_license_status(conn: &Connection, tenant_id: &str, status: LicenseStatus) -> Result<()> {
    let status_str = match status {
        LicenseStatus::Active => "active",
        LicenseStatus::Trial => "trial",
        LicenseStatus::Suspended => "suspended",
    };
    conn.execute(
        "UPDATE tenants SET license_status = ?1, updated_at = ?2 WHERE id = ?3",
        params![status_str, Utc::now().to_rfc3339(), tenant_id],
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_control_plane_crud() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_control_plane(&conn).unwrap();

        let tenant = Tenant {
            id: "tenant_amorygracia".to_string(),
            slug: "amorygracia".to_string(),
            domain: Some("amorygracia.mx".to_string()),
            church_name: "Amor y Gracia".to_string(),
            db_path: "amorygracia.db".to_string(),
            license_status: LicenseStatus::Active,
            naming_scheme: NamingScheme::default(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        insert_tenant(&conn, &tenant).unwrap();

        // Buscar por slug
        let found_slug = get_tenant_by_slug(&conn, "amorygracia").unwrap();
        assert!(found_slug.is_some());
        assert_eq!(found_slug.unwrap().church_name, "Amor y Gracia");

        // Buscar por dominio
        let found_domain = get_tenant_by_domain(&conn, "amorygracia.mx").unwrap();
        assert!(found_domain.is_some());

        // Listar
        let all = list_all_tenants(&conn).unwrap();
        assert_eq!(all.len(), 1);
    }
}
