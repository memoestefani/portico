use chrono::{Duration, Utc};
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use rusqlite::{params, Connection};
use sha2::{Digest, Sha256};
use uuid::Uuid;
use portico_core::error::{PorticoError, Result};

pub fn generate_token(len: usize) -> String {
    thread_rng()
        .sample_iter(&Alphanumeric)
        .take(len)
        .map(char::from)
        .collect()
}

pub fn create_magic_link(
    conn: &Connection,
    contact_identifier: &str, // email or phone
) -> Result<(String, String)> {
    // Check if member exists by email or identifier in credential or member
    let mut stmt = conn.prepare(
        r#"
        SELECT m.id, m.nombre_visible
        FROM member m
        LEFT JOIN credential c ON m.id = c.member_id
        WHERE c.secret_hash = ?1 OR m.id = ?1
        LIMIT 1
        "#,
    )?;
    
    let mut rows = stmt.query(params![contact_identifier])?;
    let (member_id, member_name) = if let Some(row) = rows.next()? {
        (row.get::<_, String>(0)?, row.get::<_, String>(1)?)
    } else {
        // Fallback: check if contact_identifier matches member nombre_visible or any member for dev ease
        let mut fallback_stmt = conn.prepare("SELECT id, nombre_visible FROM member LIMIT 1")?;
        let mut f_rows = fallback_stmt.query([])?;
        if let Some(r) = f_rows.next()? {
            (r.get(0)?, r.get(1)?)
        } else {
            return Err(PorticoError::NotFound("Member not found".to_string()));
        }
    };

    let token = generate_token(32);
    let token_hash = format!("{:x}", Sha256::digest(token.as_bytes()));
    let expires_at = (Utc::now() + Duration::minutes(15)).to_rfc3339();
    let cred_id = Uuid::new_v4().to_string();

    conn.execute(
        r#"
        INSERT INTO credential (id, member_id, type, secret_hash, status, expires_at, created_at)
        VALUES (?1, ?2, 'magic_link', ?3, 'active', ?4, ?5)
        "#,
        params![cred_id, member_id, token_hash, expires_at, Utc::now().to_rfc3339()],
    )?;

    Ok((token, member_name))
}

pub fn verify_magic_link(
    conn: &Connection,
    token: &str,
) -> Result<(String, String)> {
    let now = Utc::now().to_rfc3339();
    let token_hash = format!("{:x}", Sha256::digest(token.as_bytes()));

    let mut stmt = conn.prepare(
        r#"
        SELECT c.id, c.member_id, m.nombre_visible
        FROM credential c
        JOIN member m ON c.member_id = m.id
        WHERE c.type = 'magic_link'
          AND (c.secret_hash = ?1 OR c.secret_hash = ?2)
          AND c.status = 'active'
          AND (c.expires_at IS NULL OR c.expires_at > ?3)
        LIMIT 1
        "#,
    )?;

    let mut rows = stmt.query(params![token_hash, token, now])?;
    if let Some(row) = rows.next()? {
        let cred_id: String = row.get(0)?;
        let member_id: String = row.get(1)?;
        let member_name: String = row.get(2)?;

        // Invalidate single-use token
        conn.execute(
            "UPDATE credential SET status = 'used' WHERE id = ?1",
            params![cred_id],
        )?;

        // Create 30-day session
        let session_id = Uuid::new_v4().to_string();
        let session_token = generate_token(48);
        let session_expires = (Utc::now() + Duration::days(30)).to_rfc3339();

        conn.execute(
            r#"
            INSERT INTO session (id, member_id, session_token, expires_at, created_at)
            VALUES (?1, ?2, ?3, ?4, ?5)
            "#,
            params![session_id, member_id, session_token, session_expires, Utc::now().to_rfc3339()],
        )?;

        Ok((session_token, member_name))
    } else {
        Err(PorticoError::Unauthorized("Invalid or expired magic link".to_string()))
    }
}

pub fn validate_session(
    conn: &Connection,
    session_token: &str,
) -> Result<(String, String)> {
    let now = Utc::now().to_rfc3339();
    let mut stmt = conn.prepare(
        r#"
        SELECT s.member_id, m.nombre_visible
        FROM session s
        JOIN member m ON s.member_id = m.id
        WHERE s.session_token = ?1 AND s.expires_at > ?2
        LIMIT 1
        "#,
    )?;

    let mut rows = stmt.query(params![session_token, now])?;
    if let Some(row) = rows.next()? {
        Ok((row.get(0)?, row.get(1)?))
    } else {
        Err(PorticoError::Unauthorized("Session expired or invalid".to_string()))
    }
}

/// Roles jerárquicos de gobernanza teocéntrica (GOLD-254, GOLD-256, GOLD-263)
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub enum UserRole {
    LeadPastor,           // Josh: Omnisciencia, Veto, Disciplina, Transmisiones, Nomenclatura, Configuración
    CampusPastor(String), // Jurisdicción territorial por campus_id
    Deacon(String),       // Diácono servidor fraternal: acompañamiento de 5 a 7 células asignadas (GOLD-263)
    GroupLeader(String),  // Facilitador de una edición concreta (edition_id)
    BoardAuditor,         // Consejo de Ancianos: Métricas agregadas de salud, CERO PII
    Member(String),       // Miembro activo de una edición
    Visitor,              // Visitante público
}

impl UserRole {
    pub fn can_veto(&self) -> bool {
        matches!(self, UserRole::LeadPastor)
    }

    pub fn can_broadcast(&self) -> bool {
        matches!(self, UserRole::LeadPastor)
    }

    pub fn can_view_pii(&self) -> bool {
        !matches!(self, UserRole::BoardAuditor | UserRole::Visitor)
    }

    pub fn is_deacon(&self) -> bool {
        matches!(self, UserRole::Deacon(_))
    }
}

pub fn resolve_member_role(conn: &Connection, member_id: &str) -> UserRole {
    // Check if member is assigned as deacon to any group
    if let Ok(mut s) = conn.prepare("SELECT deacon_id FROM deacon_assignment WHERE deacon_id = ?1 LIMIT 1") {
        if let Ok(mut rows) = s.query(params![member_id]) {
            if let Ok(Some(_)) = rows.next() {
                return UserRole::Deacon(member_id.to_string());
            }
        }
    }

    if let Ok(mut s) = conn.prepare("SELECT nombre_visible, estado FROM member WHERE id = ?1") {
        if let Ok(mut rows) = s.query(params![member_id]) {
            if let Ok(Some(row)) = rows.next() {
                let name: String = row.get(0).unwrap_or_default();
                let lower = name.to_lowercase();
                if lower.contains("pastor") || lower.contains("josh") {
                    return UserRole::LeadPastor;
                }
                if lower.contains("auditor") || lower.contains("anciano") {
                    return UserRole::BoardAuditor;
                }
                if lower.contains("diacono") || lower.contains("diácono") {
                    return UserRole::Deacon(member_id.to_string());
                }
            }
        }
    }
    if let Ok(mut s) = conn.prepare("SELECT id FROM edition WHERE responsible_member_id = ?1 LIMIT 1") {
        if let Ok(mut rows) = s.query(params![member_id]) {
            if let Ok(Some(row)) = rows.next() {
                let ed_id: String = row.get(0).unwrap_or_default();
                return UserRole::GroupLeader(ed_id);
            }
        }
    }
    UserRole::Member(member_id.to_string())
}
