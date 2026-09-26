use std::path::PathBuf;
use std::sync::Arc;
use rusqlite::Connection;
use portico_core::db::control_plane::{get_tenant_by_domain, get_tenant_by_slug, initialize_control_plane};
use portico_core::domain::Tenant;
use portico_core::error::PorticoError;

#[derive(Clone)]
pub struct AppState {
    pub inner: Arc<AppStateInner>,
}

pub struct AppStateInner {
    pub data_dir: PathBuf,
    pub master_db_path: PathBuf,
}

impl AppState {
    pub fn new(data_dir: PathBuf) -> Self {
        let master_db_path = data_dir.join("portico_master.db");
        // Ensure master db is initialized
        if let Ok(conn) = Connection::open(&master_db_path) {
            let _ = initialize_control_plane(&conn);
        }
        Self {
            inner: Arc::new(AppStateInner {
                data_dir,
                master_db_path,
            }),
        }
    }

    pub fn get_master_conn(&self) -> Result<Connection, PorticoError> {
        let conn = Connection::open(&self.inner.master_db_path)?;
        conn.execute_batch(r#"
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA busy_timeout = 5000;
        "#)?;
        Ok(conn)
    }

    pub fn get_tenant(&self, identifier: &str) -> Result<Option<Tenant>, PorticoError> {
        let master_conn = self.get_master_conn()?;
        
        // 1. Try slug
        if let Some(t) = get_tenant_by_slug(&master_conn, identifier)? {
            return Ok(Some(t));
        }

        // 2. Try domain
        if let Some(t) = get_tenant_by_domain(&master_conn, identifier)? {
            return Ok(Some(t));
        }

        Ok(None)
    }

    pub fn get_tenant_conn(&self, tenant: &Tenant) -> Result<Connection, PorticoError> {
        let conn = Connection::open(&tenant.db_path)?;
        conn.execute_batch(r#"
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA busy_timeout = 5000;
            PRAGMA foreign_keys = ON;
        "#)?;
        Ok(conn)
    }
}
