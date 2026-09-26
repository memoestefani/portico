use chrono::{DateTime, NaiveDate, Utc};
use rusqlite::{params, Connection};
use crate::domain::{
    AttendanceRangeBin, Campus, ChurchConfiguration, ChurchNomenclature, DeaconAssignment,
    DeaconContactLog, DiscipleshipStage, DiscipleshipTrack, Edition, EditionLineage, EditionState,
    ExceptionStatus, GroupModality, MeetingException, MeetingHeadcount, MeetingMoodPulse,
    MeetingRsvp, MeetingTemplate, Member, Membership, MembershipState, MinistryEnrollment, Notice,
    PastoralBroadcast, PastoralDeviation, PrayerCategory, PrayerNeed, ResourceLink, RestrictedPairing,
    SafeguardAlert, Season, SeasonClosure, SeasonClosureDecision, SeasonState, ServiceMinistry,
    SessionVenue, VenueNature, VenueType,
    CuratedCurriculum, DeaconCareRoundtable, DiaconalVisit, DunbarFissionResult, ElderAssignment,
    EldershipCouncil, EmeritusGuardian, HostSabbatical, NeighborhoodComplaint, PlantingSeedNucleus,
};
use crate::error::{PorticoError, Result};

pub const DATA_PLANE_SCHEMA: &str = r#"
CREATE TABLE IF NOT EXISTS organization (
    id TEXT PRIMARY KEY,
    nombre_publico TEXT NOT NULL,
    pais TEXT NOT NULL,
    public_domain TEXT,
    responsable_legal_nombre TEXT,
    contacto_privacidad TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS campus (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    nombre_publico TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    timezone TEXT NOT NULL DEFAULT 'America/Monterrey',
    status TEXT NOT NULL DEFAULT 'active',
    address TEXT,
    macro_zone TEXT,
    capacity_per_service INTEGER,
    pastor_name TEXT,
    atrium_welcome_lead TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS season (
    id TEXT PRIMARY KEY,
    campus_id TEXT NOT NULL,
    nombre_publico TEXT NOT NULL,
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'borrador',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(campus_id) REFERENCES campus(id)
);

CREATE TABLE IF NOT EXISTS affinity (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    nombre_publico TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS zone (
    id TEXT PRIMARY KEY,
    campus_id TEXT NOT NULL,
    label TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    FOREIGN KEY(campus_id) REFERENCES campus(id)
);

CREATE TABLE IF NOT EXISTS small_group_template (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    nombre_publico TEXT NOT NULL,
    proposito_base TEXT NOT NULL,
    affinity_id TEXT,
    default_location_type TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS edition (
    id TEXT PRIMARY KEY,
    season_id TEXT NOT NULL,
    created_from_template_id TEXT,
    nombre_publico TEXT NOT NULL,
    proposito TEXT NOT NULL,
    affinity_id TEXT NOT NULL,
    portada_asset_id TEXT,
    dia_habitual INTEGER NOT NULL,
    hora_habitual TEXT NOT NULL,
    cupo_orientativo INTEGER NOT NULL DEFAULT 15,
    responsible_member_id TEXT NOT NULL,
    public_responsible_visibility INTEGER NOT NULL DEFAULT 1,
    estado TEXT NOT NULL DEFAULT 'borrador',
    is_full INTEGER NOT NULL DEFAULT 0,
    aviso_breve TEXT,
    whatsapp_chat_url TEXT,
    logistics_version INTEGER NOT NULL DEFAULT 1,
    modality TEXT NOT NULL DEFAULT 'residential',
    cell_accent TEXT,
    transit_friendly INTEGER NOT NULL DEFAULT 0,
    carpool_available INTEGER NOT NULL DEFAULT 0,
    macro_zone TEXT DEFAULT 'Centro',
    campus_id TEXT,
    consecutive_seasons_hosted INTEGER NOT NULL DEFAULT 1,
    venue_nature TEXT NOT NULL DEFAULT 'home',
    good_neighbor_pledge INTEGER NOT NULL DEFAULT 1,
    child_safeguarding_certified INTEGER NOT NULL DEFAULT 1,
    parent_group_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(season_id) REFERENCES season(id)
);

CREATE TABLE IF NOT EXISTS meeting_template (
    edition_id TEXT PRIMARY KEY,
    weekday INTEGER NOT NULL,
    time TEXT NOT NULL,
    venue_type TEXT NOT NULL,
    zone_id TEXT,
    public_location_name TEXT,
    public_location_url TEXT,
    private_reference TEXT,
    private_address TEXT,
    host_reference TEXT,
    host_phone TEXT,
    apprentice_id TEXT,
    kids_welcome INTEGER NOT NULL DEFAULT 1,
    kids_space_type TEXT NOT NULL DEFAULT 'play_area',
    rsvp_cutoff_hours INTEGER NOT NULL DEFAULT 4,
    FOREIGN KEY(edition_id) REFERENCES edition(id)
);

CREATE TABLE IF NOT EXISTS meeting_exception (
    id TEXT PRIMARY KEY,
    edition_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    venue_type TEXT NOT NULL,
    zone_id TEXT,
    public_location_name TEXT,
    public_location_url TEXT,
    private_reference TEXT,
    private_address TEXT,
    host_reference TEXT,
    note TEXT,
    logistics_version INTEGER NOT NULL,
    UNIQUE(edition_id, date),
    FOREIGN KEY(edition_id) REFERENCES edition(id)
);

CREATE TABLE IF NOT EXISTS member (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    nombre_visible TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'activo',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credential (
    id TEXT PRIMARY KEY,
    member_id TEXT,
    type TEXT NOT NULL,
    secret_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    expires_at TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(member_id) REFERENCES member(id)
);

CREATE TABLE IF NOT EXISTS membership (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    edition_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'activa',
    contact_visibility TEXT NOT NULL DEFAULT 'hidden',
    created_at TEXT NOT NULL,
    closed_at TEXT,
    UNIQUE(member_id, edition_id),
    FOREIGN KEY(member_id) REFERENCES member(id),
    FOREIGN KEY(edition_id) REFERENCES edition(id)
);

CREATE TABLE IF NOT EXISTS notice (
    id TEXT PRIMARY KEY,
    edition_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    es_fijado INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(edition_id) REFERENCES edition(id) ON DELETE CASCADE,
    FOREIGN KEY(author_id) REFERENCES member(id)
);

CREATE TABLE IF NOT EXISTS resource_link (
    id TEXT PRIMARY KEY,
    edition_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    link_type TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(edition_id) REFERENCES edition(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meeting_headcount (
    id TEXT PRIMARY KEY,
    edition_id TEXT NOT NULL,
    meeting_date TEXT NOT NULL,
    attendee_count INTEGER NOT NULL,
    did_meet INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    reported_by_user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(edition_id) REFERENCES edition(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS edition_lineage (
    id TEXT PRIMARY KEY,
    previous_edition_id TEXT NOT NULL,
    new_edition_id TEXT NOT NULL,
    lineage_type TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS join_request (
    id TEXT PRIMARY KEY,
    edition_id TEXT NOT NULL,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'solicitada',
    created_at TEXT NOT NULL,
    FOREIGN KEY(edition_id) REFERENCES edition(id)
);

CREATE TABLE IF NOT EXISTS audit_event (
    id TEXT PRIMARY KEY,
    actor_id TEXT,
    action TEXT NOT NULL,
    object_type TEXT NOT NULL,
    object_id TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    ip_truncated TEXT
);

CREATE TABLE IF NOT EXISTS prayer_need (
    id TEXT PRIMARY KEY,
    edition_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    category TEXT NOT NULL,
    is_answered INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(edition_id) REFERENCES edition(id) ON DELETE CASCADE,
    FOREIGN KEY(author_id) REFERENCES member(id)
);

CREATE TABLE IF NOT EXISTS safeguard_alert (
    id TEXT PRIMARY KEY,
    edition_id TEXT NOT NULL,
    reporter_id TEXT NOT NULL,
    urgency_level TEXT NOT NULL DEFAULT 'high',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    FOREIGN KEY(edition_id) REFERENCES edition(id),
    FOREIGN KEY(reporter_id) REFERENCES member(id)
);

CREATE TABLE IF NOT EXISTS restricted_pairing (
    id TEXT PRIMARY KEY,
    phone_a TEXT NOT NULL,
    phone_b TEXT NOT NULL,
    reason_category TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meeting_rsvp (
    id TEXT PRIMARY KEY,
    edition_id TEXT NOT NULL,
    meeting_date TEXT NOT NULL,
    member_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(edition_id, meeting_date, member_id),
    FOREIGN KEY(edition_id) REFERENCES edition(id),
    FOREIGN KEY(member_id) REFERENCES member(id)
);

CREATE TABLE IF NOT EXISTS session_venue (
    id TEXT PRIMARY KEY,
    edition_id TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    venue_name TEXT NOT NULL,
    address TEXT NOT NULL,
    maps_url TEXT,
    notes TEXT,
    venue_type TEXT NOT NULL DEFAULT 'public_venue',
    host_name TEXT,
    host_phone TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(edition_id, week_number),
    FOREIGN KEY(edition_id) REFERENCES edition(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pastoral_broadcast (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS church_configuration (
    id TEXT PRIMARY KEY,
    nomenclature_json TEXT NOT NULL,
    brand_palette_id TEXT NOT NULL DEFAULT 'navy',
    season_name TEXT NOT NULL DEFAULT 'Temporada Activa',
    season_motto TEXT NOT NULL DEFAULT 'Arraigados en la Gracia',
    season_start_date TEXT,
    season_end_date TEXT,
    season_duration_weeks INTEGER NOT NULL DEFAULT 12,
    enable_deacon_system INTEGER NOT NULL DEFAULT 1,
    enable_eldership_system INTEGER NOT NULL DEFAULT 1,
    growth_target_members INTEGER NOT NULL DEFAULT 25000,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS discipleship_track (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    disciple_name TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'observer',
    seasons_completed INTEGER NOT NULL DEFAULT 1,
    endorsed_for_launch INTEGER NOT NULL DEFAULT 0,
    endorsed_at TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(group_id) REFERENCES edition(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deacon_assignment (
    id TEXT PRIMARY KEY,
    deacon_id TEXT NOT NULL,
    deacon_name TEXT NOT NULL,
    group_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(deacon_id) REFERENCES member(id),
    FOREIGN KEY(group_id) REFERENCES edition(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deacon_contact_log (
    id TEXT PRIMARY KEY,
    deacon_id TEXT NOT NULL,
    group_id TEXT NOT NULL,
    contact_type TEXT NOT NULL DEFAULT 'call',
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(deacon_id) REFERENCES member(id),
    FOREIGN KEY(group_id) REFERENCES edition(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pastoral_deviation (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    reporter_member_id TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other',
    comments TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    sla_deadline TEXT,
    assigned_elder_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(group_id) REFERENCES edition(id) ON DELETE CASCADE,
    FOREIGN KEY(reporter_member_id) REFERENCES member(id)
);

CREATE TABLE IF NOT EXISTS season_closure (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    season_name TEXT NOT NULL,
    closure_decision TEXT NOT NULL,
    disciple_new_group_name TEXT,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(group_id) REFERENCES edition(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_ministry (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'welcome_atrium',
    leader_name TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ministry_enrollment (
    id TEXT PRIMARY KEY,
    ministry_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    member_phone TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(ministry_id) REFERENCES service_ministry(id) ON DELETE CASCADE
);

-- Ciclo 6: Escala 25,000, Presbiterio, Multi-Campus & Fisión Dunbar (GOLD-273 a GOLD-279)
CREATE TABLE IF NOT EXISTS eldership_councils (
    id TEXT PRIMARY KEY,
    macro_zone TEXT NOT NULL,
    name TEXT NOT NULL,
    leader_name TEXT NOT NULL,
    active_deacon_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS elder_assignments (
    id TEXT PRIMARY KEY,
    council_id TEXT NOT NULL,
    elder_id TEXT NOT NULL,
    elder_name TEXT NOT NULL,
    deacon_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(council_id) REFERENCES eldership_councils(id)
);

CREATE TABLE IF NOT EXISTS deacon_care_roundtables (
    id TEXT PRIMARY KEY,
    council_id TEXT NOT NULL,
    elder_id TEXT NOT NULL,
    attended_deacon_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(council_id) REFERENCES eldership_councils(id)
);

CREATE TABLE IF NOT EXISTS host_sabbaticals (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    host_name TEXT NOT NULL,
    consecutive_seasons INTEGER NOT NULL DEFAULT 1,
    is_on_sabbatical INTEGER NOT NULL DEFAULT 0,
    sabbatical_reason TEXT,
    next_eligible_season TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(group_id) REFERENCES edition(id)
);

CREATE TABLE IF NOT EXISTS emeritus_guardians (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    original_join_year INTEGER NOT NULL DEFAULT 2010,
    ministry_role TEXT NOT NULL,
    commissioned_by TEXT NOT NULL,
    commissioned_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS curated_curricula (
    id TEXT PRIMARY KEY,
    season_name TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    scripture_passage TEXT NOT NULL,
    video_prompt_url TEXT NOT NULL,
    pair_share_question TEXT NOT NULL,
    pastoral_notes TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS diaconal_visits (
    id TEXT PRIMARY KEY,
    deacon_id TEXT NOT NULL,
    deacon_name TEXT NOT NULL,
    group_id TEXT NOT NULL,
    visited_at TEXT NOT NULL,
    atmosphere_pulse TEXT NOT NULL,
    notes TEXT NOT NULL,
    FOREIGN KEY(group_id) REFERENCES edition(id)
);

CREATE TABLE IF NOT EXISTS neighborhood_complaints (
    id TEXT PRIMARY KEY,
    group_id TEXT,
    colonia_name TEXT NOT NULL,
    reporter_contact TEXT,
    category TEXT NOT NULL,
    comments TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    sla_deadline TEXT NOT NULL,
    resolution_notes TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dunbar_fission_log (
    id TEXT PRIMARY KEY,
    parent_group_id TEXT NOT NULL,
    parent_remaining_count INTEGER NOT NULL,
    child_group_id TEXT NOT NULL,
    child_initial_count INTEGER NOT NULL,
    fission_date TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_editions_season ON edition(season_id);
CREATE INDEX IF NOT EXISTS idx_membership_member ON membership(member_id);
CREATE INDEX IF NOT EXISTS idx_membership_edition ON membership(edition_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON session(session_token);
CREATE INDEX IF NOT EXISTS idx_notice_edition_created ON notice(edition_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resource_edition ON resource_link(edition_id, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_headcount_edition_date ON meeting_headcount(edition_id, meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_lineage_prev ON edition_lineage(previous_edition_id);
CREATE INDEX IF NOT EXISTS idx_lineage_new ON edition_lineage(new_edition_id);
CREATE INDEX IF NOT EXISTS idx_prayer_edition ON prayer_need(edition_id);
CREATE INDEX IF NOT EXISTS idx_safeguard_edition ON safeguard_alert(edition_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_lookup ON meeting_rsvp(edition_id, meeting_date);
CREATE INDEX IF NOT EXISTS idx_session_venue_lookup ON session_venue(edition_id, week_number);
CREATE INDEX IF NOT EXISTS idx_pastoral_broadcast_active ON pastoral_broadcast(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discipleship_group ON discipleship_track(group_id);
CREATE INDEX IF NOT EXISTS idx_deacon_assign ON deacon_assignment(deacon_id);
CREATE INDEX IF NOT EXISTS idx_deacon_logs ON deacon_contact_log(deacon_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pastoral_deviations ON pastoral_deviation(group_id, status);
CREATE INDEX IF NOT EXISTS idx_season_closure ON season_closure(group_id, season_name);
CREATE INDEX IF NOT EXISTS idx_ministry_enrollment ON ministry_enrollment(ministry_id);
CREATE INDEX IF NOT EXISTS idx_elder_assign ON elder_assignments(elder_id);
CREATE INDEX IF NOT EXISTS idx_host_sabbatical ON host_sabbaticals(group_id);
CREATE INDEX IF NOT EXISTS idx_neighborhood_complaints ON neighborhood_complaints(status);
CREATE INDEX IF NOT EXISTS idx_curated_curricula ON curated_curricula(week_number);
"#;

pub fn initialize_data_plane(conn: &Connection) -> Result<()> {
    conn.execute_batch(r#"
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA busy_timeout = 5000;
        PRAGMA foreign_keys = ON;
    "#)?;
    conn.execute_batch(DATA_PLANE_SCHEMA)?;

    let _ = conn.execute("ALTER TABLE meeting_template ADD COLUMN apprentice_id TEXT;", []);
    let _ = conn.execute("ALTER TABLE meeting_template ADD COLUMN kids_welcome INTEGER NOT NULL DEFAULT 0;", []);
    let _ = conn.execute("ALTER TABLE meeting_template ADD COLUMN kids_space_type TEXT NOT NULL DEFAULT 'ninguno';", []);
    let _ = conn.execute("ALTER TABLE meeting_template ADD COLUMN rsvp_cutoff_hours INTEGER NOT NULL DEFAULT 4;", []);
    let _ = conn.execute("ALTER TABLE prayer_need ADD COLUMN public_tag TEXT NOT NULL DEFAULT '';", []);
    let _ = conn.execute("ALTER TABLE meeting_headcount ADD COLUMN range_bin TEXT;", []);
    let _ = conn.execute("ALTER TABLE meeting_headcount ADD COLUMN mood_pulse TEXT;", []);
    let _ = conn.execute("ALTER TABLE edition ADD COLUMN modality TEXT NOT NULL DEFAULT 'residential';", []);
    let _ = conn.execute("ALTER TABLE edition ADD COLUMN cell_accent TEXT;", []);
    let _ = conn.execute("ALTER TABLE edition ADD COLUMN transit_friendly INTEGER NOT NULL DEFAULT 0;", []);
    let _ = conn.execute("ALTER TABLE edition ADD COLUMN carpool_available INTEGER NOT NULL DEFAULT 0;", []);
    let _ = conn.execute("ALTER TABLE edition ADD COLUMN macro_zone TEXT NOT NULL DEFAULT 'Centro';", []);
    let _ = conn.execute("ALTER TABLE church_configuration ADD COLUMN season_duration_weeks INTEGER NOT NULL DEFAULT 12;", []);
    let _ = conn.execute("ALTER TABLE session_venue ADD COLUMN venue_type TEXT NOT NULL DEFAULT 'public_venue';", []);
    let _ = conn.execute("ALTER TABLE session_venue ADD COLUMN host_name TEXT;", []);
    let _ = conn.execute("ALTER TABLE session_venue ADD COLUMN host_phone TEXT;", []);

    // Ciclo 6 Migraciones
    let _ = conn.execute("ALTER TABLE campus ADD COLUMN address TEXT;", []);
    let _ = conn.execute("ALTER TABLE campus ADD COLUMN macro_zone TEXT;", []);
    let _ = conn.execute("ALTER TABLE campus ADD COLUMN capacity_per_service INTEGER;", []);
    let _ = conn.execute("ALTER TABLE campus ADD COLUMN pastor_name TEXT;", []);
    let _ = conn.execute("ALTER TABLE campus ADD COLUMN atrium_welcome_lead TEXT;", []);

    let _ = conn.execute("ALTER TABLE edition ADD COLUMN campus_id TEXT;", []);
    let _ = conn.execute("ALTER TABLE edition ADD COLUMN consecutive_seasons_hosted INTEGER NOT NULL DEFAULT 1;", []);
    let _ = conn.execute("ALTER TABLE edition ADD COLUMN venue_nature TEXT NOT NULL DEFAULT 'home';", []);
    let _ = conn.execute("ALTER TABLE edition ADD COLUMN good_neighbor_pledge INTEGER NOT NULL DEFAULT 1;", []);
    let _ = conn.execute("ALTER TABLE edition ADD COLUMN child_safeguarding_certified INTEGER NOT NULL DEFAULT 1;", []);
    let _ = conn.execute("ALTER TABLE edition ADD COLUMN parent_group_id TEXT;", []);

    let _ = conn.execute("ALTER TABLE pastoral_deviation ADD COLUMN sla_deadline TEXT;", []);
    let _ = conn.execute("ALTER TABLE pastoral_deviation ADD COLUMN assigned_elder_id TEXT;", []);

    let _ = conn.execute("ALTER TABLE church_configuration ADD COLUMN enable_deacon_system INTEGER NOT NULL DEFAULT 1;", []);
    let _ = conn.execute("ALTER TABLE church_configuration ADD COLUMN enable_eldership_system INTEGER NOT NULL DEFAULT 1;", []);
    let _ = conn.execute("ALTER TABLE church_configuration ADD COLUMN growth_target_members INTEGER NOT NULL DEFAULT 25000;", []);

    Ok(())
}

// ---------------- Operaciones Campus & Season ----------------

pub fn insert_campus(conn: &Connection, campus: &Campus) -> Result<()> {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        r#"
        INSERT INTO campus (
            id, organization_id, nombre_publico, ciudad, slug, sort_order, timezone, status,
            address, macro_zone, capacity_per_service, pastor_name, atrium_welcome_lead,
            created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
        "#,
        params![
            campus.id,
            campus.organization_id,
            campus.nombre_publico,
            campus.ciudad,
            campus.slug,
            campus.sort_order,
            campus.timezone,
            campus.status,
            campus.address,
            campus.macro_zone,
            campus.capacity_per_service,
            campus.pastor_name,
            campus.atrium_welcome_lead,
            now,
            now
        ],
    )?;
    Ok(())
}

pub fn list_campuses(conn: &Connection) -> Result<Vec<Campus>> {
    let mut stmt = conn.prepare(
        "SELECT id, organization_id, nombre_publico, ciudad, slug, sort_order, timezone, status, address, macro_zone, capacity_per_service, pastor_name, atrium_welcome_lead FROM campus WHERE status = 'active' ORDER BY sort_order ASC",
    )?;
    let mut rows = stmt.query([])?;
    let mut campuses = Vec::new();
    while let Some(row) = rows.next()? {
        campuses.push(Campus {
            id: row.get(0)?,
            organization_id: row.get(1)?,
            nombre_publico: row.get(2)?,
            ciudad: row.get(3)?,
            slug: row.get(4)?,
            sort_order: row.get(5)?,
            timezone: row.get(6)?,
            status: row.get(7)?,
            address: row.get(8)?,
            macro_zone: row.get(9)?,
            capacity_per_service: row.get(10)?,
            pastor_name: row.get(11)?,
            atrium_welcome_lead: row.get(12)?,
        });
    }
    Ok(campuses)
}

pub fn get_campus_by_id(conn: &Connection, campus_id: &str) -> Result<Option<Campus>> {
    let mut stmt = conn.prepare(
        "SELECT id, organization_id, nombre_publico, ciudad, slug, sort_order, timezone, status, address, macro_zone, capacity_per_service, pastor_name, atrium_welcome_lead FROM campus WHERE id = ?1 LIMIT 1",
    )?;
    let mut rows = stmt.query(params![campus_id])?;
    if let Some(row) = rows.next()? {
        Ok(Some(Campus {
            id: row.get(0)?,
            organization_id: row.get(1)?,
            nombre_publico: row.get(2)?,
            ciudad: row.get(3)?,
            slug: row.get(4)?,
            sort_order: row.get(5)?,
            timezone: row.get(6)?,
            status: row.get(7)?,
            address: row.get(8)?,
            macro_zone: row.get(9)?,
            capacity_per_service: row.get(10)?,
            pastor_name: row.get(11)?,
            atrium_welcome_lead: row.get(12)?,
        }))
    } else {
        Ok(None)
    }
}

pub fn insert_season(conn: &Connection, season: &Season) -> Result<()> {
    let now = Utc::now().to_rfc3339();
    let estado_str = match season.estado {
        SeasonState::Borrador => "borrador",
        SeasonState::Convocatoria => "convocatoria",
        SeasonState::EnCurso => "en_curso",
        SeasonState::Cerrada => "cerrada",
    };

    conn.execute(
        r#"
        INSERT INTO season (id, campus_id, nombre_publico, fecha_inicio, fecha_fin, estado, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
        "#,
        params![
            season.id,
            season.campus_id,
            season.nombre_publico,
            season.fecha_inicio.to_string(),
            season.fecha_fin.to_string(),
            estado_str,
            now,
            now
        ],
    )?;
    Ok(())
}

pub fn get_current_season_for_campus(conn: &Connection, campus_id: &str) -> Result<Option<Season>> {
    let mut stmt = conn.prepare(
        "SELECT id, campus_id, nombre_publico, fecha_inicio, fecha_fin, estado FROM season WHERE campus_id = ?1 AND estado IN ('convocatoria', 'en_curso') LIMIT 1",
    )?;
    let mut rows = stmt.query(params![campus_id])?;

    if let Some(row) = rows.next()? {
        let estado_str: String = row.get(5)?;
        let estado = match estado_str.as_str() {
            "convocatoria" => SeasonState::Convocatoria,
            "en_curso" => SeasonState::EnCurso,
            "cerrada" => SeasonState::Cerrada,
            _ => SeasonState::Borrador,
        };
        let start_str: String = row.get(3)?;
        let end_str: String = row.get(4)?;

        Ok(Some(Season {
            id: row.get(0)?,
            campus_id: row.get(1)?,
            nombre_publico: row.get(2)?,
            fecha_inicio: NaiveDate::parse_from_str(&start_str, "%Y-%m-%d").unwrap_or_default(),
            fecha_fin: NaiveDate::parse_from_str(&end_str, "%Y-%m-%d").unwrap_or_default(),
            estado,
        }))
    } else {
        Ok(None)
    }
}

// ---------------- Operaciones Edition & Template ----------------

pub fn insert_edition(
    conn: &Connection,
    edition: &Edition,
    template: &MeetingTemplate,
) -> Result<()> {
    let now = Utc::now().to_rfc3339();
    let estado_str = match edition.estado {
        EditionState::Borrador => "borrador",
        EditionState::Reconocida => "reconocida",
        EditionState::Cerrada => "cerrada",
    };

    conn.execute(
        r#"
        INSERT INTO edition (
            id, season_id, created_from_template_id, nombre_publico, proposito, affinity_id,
            portada_asset_id, dia_habitual, hora_habitual, cupo_orientativo, responsible_member_id,
            public_responsible_visibility, estado, is_full, aviso_breve, whatsapp_chat_url,
            logistics_version, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)
        "#,
        params![
            edition.id,
            edition.season_id,
            edition.created_from_template_id,
            edition.nombre_publico,
            edition.proposito,
            edition.affinity_id,
            edition.portada_asset_id,
            edition.dia_habitual,
            edition.hora_habitual,
            edition.cupo_orientativo,
            edition.responsible_member_id,
            if edition.public_responsible_visibility { 1 } else { 0 },
            estado_str,
            if edition.is_full { 1 } else { 0 },
            edition.aviso_breve,
            edition.whatsapp_chat_url,
            edition.logistics_version,
            now,
            now
        ],
    )?;

    let venue_str = match template.venue_type {
        VenueType::PublicVenue => "public_venue",
        VenueType::PrivateHome => "private_home",
        VenueType::OnlineSession => "online_session",
        VenueType::Other => "other",
    };

    conn.execute(
        r#"
        INSERT INTO meeting_template (
            edition_id, weekday, time, venue_type, zone_id, public_location_name,
            public_location_url, private_reference, private_address, host_reference, host_phone,
            apprentice_id, kids_welcome, kids_space_type, rsvp_cutoff_hours
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
        "#,
        params![
            edition.id,
            template.weekday,
            template.time,
            venue_str,
            template.zone_id,
            template.public_location_name,
            template.public_location_url,
            template.private_reference,
            template.private_address,
            template.host_reference,
            template.host_phone,
            template.apprentice_id,
            if template.kids_welcome { 1 } else { 0 },
            template.kids_space_type,
            template.rsvp_cutoff_hours,
        ],
    )?;

    Ok(())
}

pub fn list_recognized_editions_for_season(
    conn: &Connection,
    season_id: &str,
) -> Result<Vec<(Edition, MeetingTemplate)>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT e.id, e.season_id, e.created_from_template_id, e.nombre_publico, e.proposito,
               e.affinity_id, e.portada_asset_id, e.dia_habitual, e.hora_habitual, e.cupo_orientativo,
               e.responsible_member_id, e.public_responsible_visibility, e.estado, e.is_full,
               e.aviso_breve, e.whatsapp_chat_url, e.logistics_version,
               t.weekday, t.time, t.venue_type, t.zone_id, t.public_location_name,
               t.public_location_url, t.private_reference, t.private_address, t.host_reference, t.host_phone,
               t.apprentice_id, t.kids_welcome, t.kids_space_type, t.rsvp_cutoff_hours
        FROM edition e
        JOIN meeting_template t ON e.id = t.edition_id
        WHERE e.season_id = ?1 AND e.estado = 'reconocida'
        ORDER BY e.dia_habitual ASC, e.hora_habitual ASC
        "#,
    )?;

    let mut rows = stmt.query(params![season_id])?;
    let mut editions = Vec::new();

    while let Some(row) = rows.next()? {
        let venue_str: String = row.get(19)?;
        let venue_type = match venue_str.as_str() {
            "public_venue" => VenueType::PublicVenue,
            "online_session" => VenueType::OnlineSession,
            "private_home" => VenueType::PrivateHome,
            _ => VenueType::Other,
        };

        let edition = Edition {
            id: row.get(0)?,
            season_id: row.get(1)?,
            created_from_template_id: row.get(2)?,
            nombre_publico: row.get(3)?,
            proposito: row.get(4)?,
            affinity_id: row.get(5)?,
            portada_asset_id: row.get(6)?,
            dia_habitual: row.get(7)?,
            hora_habitual: row.get(8)?,
            cupo_orientativo: row.get(9)?,
            responsible_member_id: row.get(10)?,
            public_responsible_visibility: row.get::<_, i32>(11)? == 1,
            estado: EditionState::Reconocida,
            is_full: row.get::<_, i32>(13)? == 1,
            aviso_breve: row.get(14)?,
            whatsapp_chat_url: row.get(15)?,
            logistics_version: row.get(16)?,
            modality: GroupModality::Residential,
            cell_accent: None,
            transit_friendly: false,
            carpool_available: false,
            macro_zone: Some("Centro".to_string()),
            campus_id: None,
            consecutive_seasons_hosted: 1,
            venue_nature: VenueNature::Home,
            good_neighbor_pledge: true,
            child_safeguarding_certified: true,
            parent_group_id: None,
            liaison_name: None,
            liaison_role: None,
            access_protocol: None,
        };

        let template = MeetingTemplate {
            weekday: row.get(17)?,
            time: row.get(18)?,
            venue_type,
            zone_id: row.get(20)?,
            public_location_name: row.get(21)?,
            public_location_url: row.get(22)?,
            private_reference: row.get(23)?,
            private_address: row.get(24)?,
            host_reference: row.get(25)?,
            host_phone: row.get(26)?,
            apprentice_id: row.get(27)?,
            kids_welcome: row.get::<_, Option<i32>>(28)?.unwrap_or(1) == 1,
            kids_space_type: row.get::<_, Option<String>>(29)?.unwrap_or_else(|| "play_area".to_string()),
            rsvp_cutoff_hours: row.get::<_, Option<u32>>(30)?.unwrap_or(4),
        };

        editions.push((edition, template));
    }

    Ok(editions)
}

// ---------------- Operaciones Membresía y Silo ----------------

pub fn insert_member(conn: &Connection, member: &Member) -> Result<()> {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO member (id, organization_id, nombre_visible, estado, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![member.id, member.organization_id, member.nombre_visible, member.estado, now, now],
    )?;
    Ok(())
}

pub fn create_membership(conn: &Connection, membership: &Membership) -> Result<()> {
    let status_str = match membership.status {
        MembershipState::Solicitada => "solicitada",
        MembershipState::Activa => "activa",
        MembershipState::Revocada => "revocada",
        MembershipState::Finalizada => "finalizada",
        MembershipState::Rechazada => "rechazada",
    };
    let closed_str = membership.closed_at.map(|dt| dt.to_rfc3339());
    let contact_vis = if membership.contact_visibility.is_empty() {
        "hidden"
    } else {
        &membership.contact_visibility
    };

    conn.execute(
        "INSERT INTO membership (id, member_id, edition_id, status, contact_visibility, created_at, closed_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            membership.id,
            membership.member_id,
            membership.edition_id,
            status_str,
            contact_vis,
            membership.created_at.to_rfc3339(),
            closed_str
        ],
    )?;
    Ok(())
}

pub fn is_active_member_of_edition(
    conn: &Connection,
    member_id: &str,
    edition_id: &str,
) -> Result<bool> {
    let mut stmt = conn.prepare(
        "SELECT COUNT(*) FROM membership WHERE member_id = ?1 AND edition_id = ?2 AND status = 'activa'",
    )?;
    let count: i64 = stmt.query_row(params![member_id, edition_id], |row| row.get(0))?;
    Ok(count > 0)
}

pub fn list_member_history(
    conn: &Connection,
    member_id: &str,
) -> Result<Vec<(Membership, Edition, Season)>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT m.id, m.member_id, m.edition_id, m.status, m.contact_visibility, m.created_at, m.closed_at,
               e.id, e.season_id, e.nombre_publico, e.proposito, e.affinity_id, e.dia_habitual, e.hora_habitual,
               s.id, s.campus_id, s.nombre_publico, s.fecha_inicio, s.fecha_fin, s.estado
        FROM membership m
        JOIN edition e ON m.edition_id = e.id
        JOIN season s ON e.season_id = s.id
        WHERE m.member_id = ?1
        ORDER BY s.fecha_inicio DESC
        "#,
    )?;

    let mut rows = stmt.query(params![member_id])?;
    let mut history = Vec::new();

    while let Some(row) = rows.next()? {
        let status_str: String = row.get(3)?;
        let status = match status_str.as_str() {
            "activa" => MembershipState::Activa,
            "finalizada" => MembershipState::Finalizada,
            "solicitada" => MembershipState::Solicitada,
            "revocada" => MembershipState::Revocada,
            _ => MembershipState::Rechazada,
        };
        let contact_visibility: String = row.get::<_, Option<String>>(4)?.unwrap_or_else(|| "hidden".to_string());
        let created_str: String = row.get(5)?;
        let closed_str: Option<String> = row.get(6)?;

        let membership = Membership {
            id: row.get(0)?,
            member_id: row.get(1)?,
            edition_id: row.get(2)?,
            status,
            contact_visibility,
            created_at: DateTime::parse_from_rfc3339(&created_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
            closed_at: closed_str.and_then(|s| {
                DateTime::parse_from_rfc3339(&s)
                    .map(|dt| dt.with_timezone(&Utc))
                    .ok()
            }),
        };

        let edition = Edition {
            id: row.get(7)?,
            season_id: row.get(8)?,
            created_from_template_id: None,
            nombre_publico: row.get(9)?,
            proposito: row.get(10)?,
            affinity_id: row.get(11)?,
            portada_asset_id: None,
            dia_habitual: row.get(12)?,
            hora_habitual: row.get(13)?,
            cupo_orientativo: 15,
            responsible_member_id: String::new(),
            public_responsible_visibility: true,
            estado: EditionState::Reconocida,
            is_full: false,
            aviso_breve: None,
            whatsapp_chat_url: None,
            logistics_version: 1,
            modality: GroupModality::Residential,
            cell_accent: None,
            transit_friendly: false,
            carpool_available: false,
            macro_zone: Some("Centro".to_string()),
            campus_id: None,
            consecutive_seasons_hosted: 1,
            venue_nature: VenueNature::Home,
            good_neighbor_pledge: true,
            child_safeguarding_certified: true,
            parent_group_id: None,
            liaison_name: None,
            liaison_role: None,
            access_protocol: None,
        };

        let s_estado_str: String = row.get(19)?;
        let s_estado = match s_estado_str.as_str() {
            "en_curso" => SeasonState::EnCurso,
            "cerrada" => SeasonState::Cerrada,
            "convocatoria" => SeasonState::Convocatoria,
            _ => SeasonState::Borrador,
        };
        let start_str: String = row.get(17)?;
        let end_str: String = row.get(18)?;

        let season = Season {
            id: row.get(14)?,
            campus_id: row.get(15)?,
            nombre_publico: row.get(16)?,
            fecha_inicio: NaiveDate::parse_from_str(&start_str, "%Y-%m-%d").unwrap_or_default(),
            fecha_fin: NaiveDate::parse_from_str(&end_str, "%Y-%m-%d").unwrap_or_default(),
            estado: s_estado,
        };

        history.push((membership, edition, season));
    }

    Ok(history)
}

pub fn list_exceptions_for_edition(
    conn: &Connection,
    edition_id: &str,
) -> Result<Vec<MeetingException>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, edition_id, date, status, venue_type, zone_id, public_location_name,
               public_location_url, private_reference, private_address, host_reference,
               note, logistics_version
        FROM meeting_exception
        WHERE edition_id = ?1
        ORDER BY date ASC
        "#,
    )?;

    let mut rows = stmt.query(params![edition_id])?;
    let mut exceptions = Vec::new();

    while let Some(row) = rows.next()? {
        let date_str: String = row.get(2)?;
        let status_str: String = row.get(3)?;
        let venue_str: String = row.get(4)?;

        let status = match status_str.as_str() {
            "cancelled" => ExceptionStatus::Cancelled,
            _ => ExceptionStatus::Scheduled,
        };

        let venue_type = match venue_str.as_str() {
            "public_venue" => VenueType::PublicVenue,
            "online_session" => VenueType::OnlineSession,
            _ => VenueType::PrivateHome,
        };

        exceptions.push(MeetingException {
            id: row.get(0)?,
            edition_id: row.get(1)?,
            date: NaiveDate::parse_from_str(&date_str, "%Y-%m-%d").unwrap_or_default(),
            status,
            venue_type,
            zone_id: row.get(5)?,
            public_location_name: row.get(6)?,
            public_location_url: row.get(7)?,
            private_reference: row.get(8)?,
            private_address: row.get(9)?,
            host_reference: row.get(10)?,
            note: row.get(11)?,
            logistics_version: row.get(12)?,
        });
    }

    Ok(exceptions)
}

// ---------------- Operaciones de Avisos, Recursos, Headcount y Linaje ----------------

pub fn purge_expired_notices(conn: &Connection, retention_days: i64) -> Result<usize> {
    let cutoff = (Utc::now() - chrono::Duration::days(retention_days)).to_rfc3339();
    let count = conn.execute(
        "DELETE FROM notice WHERE created_at < ?1 AND es_fijado = 0",
        params![cutoff],
    )?;
    Ok(count)
}

pub fn list_notices_for_edition(conn: &Connection, edition_id: &str) -> Result<Vec<Notice>> {
    let mut stmt = conn.prepare(
        "SELECT id, edition_id, author_id, titulo, contenido, es_fijado, created_at, updated_at FROM notice WHERE edition_id = ?1 ORDER BY created_at DESC"
    )?;
    let rows = stmt.query_map(params![edition_id], |row| {
        let es_fijado_i64: i64 = row.get(5)?;
        Ok(Notice {
            id: row.get(0)?,
            edition_id: row.get(1)?,
            author_id: row.get(2)?,
            titulo: row.get(3)?,
            contenido: row.get(4)?,
            es_fijado: es_fijado_i64 == 1,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    })?;
    let mut notices = Vec::new();
    for n in rows {
        notices.push(n?);
    }
    Ok(notices)
}

pub fn get_edition_lineage(conn: &Connection, edition_id: &str) -> Result<Option<EditionLineage>> {
    let mut stmt = conn.prepare(
        "SELECT id, previous_edition_id, new_edition_id, lineage_type, created_at FROM edition_lineage WHERE new_edition_id = ?1"
    )?;
    let mut rows = stmt.query(params![edition_id])?;
    if let Some(row) = rows.next()? {
        Ok(Some(EditionLineage {
            id: row.get(0)?,
            previous_edition_id: row.get(1)?,
            new_edition_id: row.get(2)?,
            lineage_type: row.get(3)?,
            created_at: row.get(4)?,
        }))
    } else {
        Ok(None)
    }
}


pub fn insert_resource_link(conn: &Connection, link: &ResourceLink) -> Result<()> {
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM resource_link WHERE edition_id = ?1")?;
    let count: i64 = stmt.query_row(params![link.edition_id], |row| row.get(0))?;
    if count >= 5 {
        return Err(PorticoError::Validation(
            "Límite máximo de 5 recursos por edición alcanzado".to_string(),
        ));
    }
    conn.execute(
        r#"
        INSERT INTO resource_link (id, edition_id, title, url, link_type, sort_order, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        "#,
        params![
            link.id,
            link.edition_id,
            link.title,
            link.url,
            link.link_type,
            link.sort_order,
            link.created_at
        ],
    )?;
    Ok(())
}

pub fn list_resource_links_for_edition(
    conn: &Connection,
    edition_id: &str,
) -> Result<Vec<ResourceLink>> {
    let mut stmt = conn.prepare(
        "SELECT id, edition_id, title, url, link_type, sort_order, created_at FROM resource_link WHERE edition_id = ?1 ORDER BY sort_order ASC, created_at ASC"
    )?;
    let rows = stmt.query_map(params![edition_id], |row| {
        Ok(ResourceLink {
            id: row.get(0)?,
            edition_id: row.get(1)?,
            title: row.get(2)?,
            url: row.get(3)?,
            link_type: row.get(4)?,
            sort_order: row.get(5)?,
            created_at: row.get(6)?,
        })
    })?;
    let mut links = Vec::new();
    for l in rows {
        links.push(l?);
    }
    Ok(links)
}

pub fn insert_meeting_headcount(conn: &Connection, hc: &MeetingHeadcount) -> Result<()> {
    let range_str = hc.range_bin.as_ref().map(|r| match r {
        AttendanceRangeBin::Range1To5 => "1_5",
        AttendanceRangeBin::Range6To10 => "6_10",
        AttendanceRangeBin::Range11To15 => "11_15",
        AttendanceRangeBin::Range15Plus => "15_plus",
    });
    let mood_str = hc.mood_pulse.as_ref().map(|m| match m {
        MeetingMoodPulse::Peaceful => "peaceful",
        MeetingMoodPulse::Edifying => "edifying",
        MeetingMoodPulse::Vulnerable => "vulnerable",
        MeetingMoodPulse::SupportNeeded => "support_needed",
    });

    conn.execute(
        r#"
        INSERT INTO meeting_headcount (id, edition_id, meeting_date, attendee_count, did_meet, notes, reported_by_user_id, created_at, range_bin, mood_pulse)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
        "#,
        params![
            hc.id,
            hc.edition_id,
            hc.meeting_date,
            hc.attendee_count as i64,
            if hc.did_meet { 1 } else { 0 },
            hc.notes,
            hc.reported_by_user_id,
            hc.created_at,
            range_str,
            mood_str,
        ],
    )?;
    Ok(())
}

pub fn list_headcount_for_edition(
    conn: &Connection,
    edition_id: &str,
) -> Result<Vec<MeetingHeadcount>> {
    let mut stmt = conn.prepare(
        "SELECT id, edition_id, meeting_date, attendee_count, did_meet, notes, reported_by_user_id, created_at, range_bin, mood_pulse FROM meeting_headcount WHERE edition_id = ?1 ORDER BY meeting_date DESC"
    )?;
    let rows = stmt.query_map(params![edition_id], |row| {
        let count_i64: i64 = row.get(3)?;
        let did_meet_i64: i64 = row.get(4)?;
        let range_raw: Option<String> = row.get(8).unwrap_or(None);
        let mood_raw: Option<String> = row.get(9).unwrap_or(None);
        let range_bin = range_raw.and_then(|s| match s.as_str() {
            "1_5" => Some(AttendanceRangeBin::Range1To5),
            "6_10" => Some(AttendanceRangeBin::Range6To10),
            "11_15" => Some(AttendanceRangeBin::Range11To15),
            "15_plus" => Some(AttendanceRangeBin::Range15Plus),
            _ => None,
        });
        let mood_pulse = mood_raw.and_then(|s| match s.as_str() {
            "peaceful" => Some(MeetingMoodPulse::Peaceful),
            "edifying" => Some(MeetingMoodPulse::Edifying),
            "vulnerable" => Some(MeetingMoodPulse::Vulnerable),
            "support_needed" => Some(MeetingMoodPulse::SupportNeeded),
            _ => None,
        });
        Ok(MeetingHeadcount {
            id: row.get(0)?,
            edition_id: row.get(1)?,
            meeting_date: row.get(2)?,
            attendee_count: count_i64 as u32,
            range_bin,
            mood_pulse,
            did_meet: did_meet_i64 == 1,
            notes: row.get(5)?,
            reported_by_user_id: row.get(6)?,
            created_at: row.get(7)?,
        })
    })?;
    let mut list = Vec::new();
    for h in rows {
        list.push(h?);
    }
    Ok(list)
}

pub fn clone_edition_to_draft(
    conn: &Connection,
    source_edition_id: &str,
    target_season_id: Option<&str>,
    lineage_type: &str,
) -> Result<String> {
    let mut stmt = conn.prepare(
        r#"
        SELECT season_id, nombre_publico, proposito, affinity_id, portada_asset_id,
               dia_habitual, hora_habitual, cupo_orientativo, responsible_member_id,
               public_responsible_visibility, aviso_breve, whatsapp_chat_url
        FROM edition WHERE id = ?1
        "#,
    )?;
    let row = stmt.query_row(params![source_edition_id], |r| {
        Ok((
            r.get::<_, String>(0)?,
            r.get::<_, String>(1)?,
            r.get::<_, String>(2)?,
            r.get::<_, String>(3)?,
            r.get::<_, Option<String>>(4)?,
            r.get::<_, u8>(5)?,
            r.get::<_, String>(6)?,
            r.get::<_, i32>(7)?,
            r.get::<_, String>(8)?,
            r.get::<_, bool>(9)?,
            r.get::<_, Option<String>>(10)?,
            r.get::<_, Option<String>>(11)?,
        ))
    })?;

    let target_season = target_season_id.unwrap_or(&row.0);
    let new_edition_id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        r#"
        INSERT INTO edition (
            id, season_id, created_from_template_id, nombre_publico, proposito,
            affinity_id, portada_asset_id, dia_habitual, hora_habitual, cupo_orientativo,
            responsible_member_id, public_responsible_visibility, estado, is_full,
            aviso_breve, whatsapp_chat_url, logistics_version, created_at, updated_at
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5,
            ?6, ?7, ?8, ?9, ?10,
            ?11, ?12, 'borrador', 0,
            ?13, ?14, 1, ?15, ?15
        )
        "#,
        params![
            new_edition_id,
            target_season,
            source_edition_id,
            row.1,
            row.2,
            row.3,
            row.4,
            row.5,
            row.6,
            row.7,
            row.8,
            row.9,
            row.10,
            row.11,
            now
        ],
    )?;

    // Copiar plantilla de sede si existe
    let _ = conn.execute(
        r#"
        INSERT INTO meeting_template (
            edition_id, weekday, time, venue_type, zone_id,
            public_location_name, public_location_url, private_reference,
            private_address, host_reference, host_phone,
            apprentice_id, kids_welcome, kids_space_type, rsvp_cutoff_hours
        )
        SELECT ?1, weekday, time, venue_type, zone_id,
               public_location_name, public_location_url, private_reference,
               private_address, host_reference, host_phone,
               apprentice_id, kids_welcome, kids_space_type, rsvp_cutoff_hours
        FROM meeting_template WHERE edition_id = ?2
        "#,
        params![new_edition_id, source_edition_id],
    );

    // Registrar linaje
    let lineage_id = uuid::Uuid::new_v4().to_string();
    conn.execute(
        r#"
        INSERT INTO edition_lineage (id, previous_edition_id, new_edition_id, lineage_type, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
        "#,
        params![lineage_id, source_edition_id, new_edition_id, lineage_type, now],
    )?;

    Ok(new_edition_id)
}

// ---------------- Operaciones Intercesión Estructurada Comunitaria ----------------
// Cero secretos en BD: motivos públicos para intercesión grupal; detalles íntimos se tratan en persona o mensajería 1:1

pub fn insert_prayer_need(conn: &Connection, prayer: &PrayerNeed) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO prayer_need (id, edition_id, author_id, category, is_answered, created_at, public_tag)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        "#,
        params![
            prayer.id,
            prayer.edition_id,
            prayer.author_id,
            prayer.category.as_str(),
            if prayer.is_answered { 1 } else { 0 },
            prayer.created_at,
            prayer.public_tag,
        ],
    )?;
    Ok(())
}

pub fn list_prayer_needs_for_edition(conn: &Connection, edition_id: &str) -> Result<Vec<PrayerNeed>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT p.id, p.edition_id, p.author_id, m.nombre_visible, p.category, p.is_answered, p.created_at, p.public_tag
        FROM prayer_need p
        JOIN member m ON p.author_id = m.id
        WHERE p.edition_id = ?1
        ORDER BY p.created_at DESC
        "#,
    )?;

    let rows = stmt.query_map(params![edition_id], |row| {
        let cat_str: String = row.get(4)?;
        let answered_int: i32 = row.get(5)?;
        let public_tag: String = row.get(7).unwrap_or_default();

        Ok(PrayerNeed {
            id: row.get(0)?,
            edition_id: row.get(1)?,
            author_id: row.get(2)?,
            author_name: row.get(3)?,
            category: PrayerCategory::from_str(&cat_str),
            public_tag,
            is_answered: answered_int == 1,
            created_at: row.get(6)?,
        })
    })?;

    let mut list = Vec::new();
    for r in rows {
        list.push(r?);
    }
    Ok(list)
}

// ---------------- Operaciones Salvaguarda Pastoral (GOLD-242) ----------------

pub fn insert_safeguard_alert(conn: &Connection, alert: &SafeguardAlert) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO safeguard_alert (id, edition_id, reporter_id, urgency_level, status, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        "#,
        params![
            alert.id,
            alert.edition_id,
            alert.reporter_id,
            alert.urgency_level,
            alert.status,
            alert.created_at
        ],
    )?;
    Ok(())
}

pub fn list_safeguard_alerts(conn: &Connection) -> Result<Vec<SafeguardAlert>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT a.id, a.edition_id, a.reporter_id, m.nombre_visible, a.urgency_level, a.status, a.created_at
        FROM safeguard_alert a
        JOIN member m ON a.reporter_id = m.id
        ORDER BY a.created_at DESC
        "#,
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(SafeguardAlert {
            id: row.get(0)?,
            edition_id: row.get(1)?,
            reporter_id: row.get(2)?,
            reporter_name: row.get(3)?,
            urgency_level: row.get(4)?,
            status: row.get(5)?,
            created_at: row.get(6)?,
        })
    })?;

    let mut list = Vec::new();
    for r in rows {
        list.push(r?);
    }
    Ok(list)
}

pub fn update_safeguard_alert_status(conn: &Connection, id: &str, status: &str) -> Result<()> {
    conn.execute(
        "UPDATE safeguard_alert SET status = ?1 WHERE id = ?2",
        params![status, id],
    )?;
    Ok(())
}

// ---------------- Operaciones Ruteo Anti-Colisión (GOLD-246) ----------------

pub fn insert_restricted_pairing(conn: &Connection, pairing: &RestrictedPairing) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO restricted_pairing (id, phone_a, phone_b, reason_category, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
        "#,
        params![pairing.id, pairing.phone_a, pairing.phone_b, pairing.reason_category, pairing.created_at],
    )?;
    Ok(())
}

pub fn list_restricted_pairings(conn: &Connection) -> Result<Vec<RestrictedPairing>> {
    let mut stmt = conn.prepare("SELECT id, phone_a, phone_b, reason_category, created_at FROM restricted_pairing ORDER BY created_at DESC")?;
    let rows = stmt.query_map([], |row| {
        Ok(RestrictedPairing {
            id: row.get(0)?,
            phone_a: row.get(1)?,
            phone_b: row.get(2)?,
            reason_category: row.get(3)?,
            created_at: row.get(4)?,
        })
    })?;
    let mut list = Vec::new();
    for r in rows {
        list.push(r?);
    }
    Ok(list)
}

pub fn is_pairing_restricted(conn: &Connection, phone_a: &str, phone_b: &str) -> Result<bool> {
    let count: i64 = conn.query_row(
        r#"
        SELECT COUNT(*) FROM restricted_pairing
        WHERE (phone_a = ?1 AND phone_b = ?2) OR (phone_a = ?2 AND phone_b = ?1)
        "#,
        params![phone_a, phone_b],
        |row| row.get(0),
    )?;
    Ok(count > 0)
}

// ---------------- Operaciones Micro-RSVP con Catering Lock (GOLD-243) ----------------

pub fn upsert_meeting_rsvp(conn: &Connection, rsvp: &MeetingRsvp) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO meeting_rsvp (id, edition_id, meeting_date, member_id, status, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT(edition_id, meeting_date, member_id) DO UPDATE SET
            status = excluded.status
        "#,
        params![rsvp.id, rsvp.edition_id, rsvp.meeting_date, rsvp.member_id, rsvp.status, rsvp.created_at],
    )?;
    Ok(())
}

pub fn get_catering_headcount(conn: &Connection, edition_id: &str, meeting_date: &str) -> Result<usize> {
    let count: i64 = conn.query_row(
        r#"
        SELECT COUNT(*) FROM meeting_rsvp
        WHERE edition_id = ?1 AND meeting_date = ?2 AND status = 'attending'
        "#,
        params![edition_id, meeting_date],
        |row| row.get(0),
    )?;
    Ok(count as usize)
}

// ---------------- Operaciones Itinerarios Nómadas Multi-Sede (GOLD-261) ----------------
// Soporta sedes públicas (taquerías, cafés, parques) y casas rotativas con anfitriones variables

pub fn insert_session_venue(conn: &Connection, venue: &SessionVenue) -> Result<()> {
    let vt_str = match venue.venue_type {
        VenueType::PublicVenue => "public_venue",
        VenueType::PrivateHome => "private_home",
        VenueType::OnlineSession => "online_session",
        VenueType::Other => "other",
    };

    conn.execute(
        r#"
        INSERT INTO session_venue (id, edition_id, week_number, venue_name, address, maps_url, notes, venue_type, host_name, host_phone, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
        ON CONFLICT(edition_id, week_number) DO UPDATE SET
            venue_name = excluded.venue_name,
            address = excluded.address,
            maps_url = excluded.maps_url,
            notes = excluded.notes,
            venue_type = excluded.venue_type,
            host_name = excluded.host_name,
            host_phone = excluded.host_phone
        "#,
        params![
            venue.id,
            venue.edition_id,
            venue.week_number as i64,
            venue.venue_name,
            venue.address,
            venue.maps_url,
            venue.notes,
            vt_str,
            venue.host_name,
            venue.host_phone,
            venue.created_at,
        ],
    )?;
    Ok(())
}

pub fn list_session_venues_for_edition(
    conn: &Connection,
    edition_id: &str,
) -> Result<Vec<SessionVenue>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, edition_id, week_number, venue_name, address, maps_url, notes, venue_type, host_name, host_phone, created_at
        FROM session_venue
        WHERE edition_id = ?1
        ORDER BY week_number ASC
        "#,
    )?;

    let rows = stmt.query_map(params![edition_id], |row| {
        let wk: i64 = row.get(2)?;
        let vt_str: String = row.get(7).unwrap_or_else(|_| "public_venue".to_string());
        let venue_type = match vt_str.as_str() {
            "private_home" => VenueType::PrivateHome,
            "online_session" => VenueType::OnlineSession,
            "other" => VenueType::Other,
            _ => VenueType::PublicVenue,
        };

        Ok(SessionVenue {
            id: row.get(0)?,
            edition_id: row.get(1)?,
            week_number: wk as u8,
            venue_name: row.get(3)?,
            address: row.get(4)?,
            maps_url: row.get(5)?,
            notes: row.get(6)?,
            venue_type,
            host_name: row.get(8).unwrap_or(None),
            host_phone: row.get(9).unwrap_or(None),
            created_at: row.get(10)?,
        })
    })?;

    let mut list = Vec::new();
    for r in rows {
        list.push(r?);
    }
    Ok(list)
}

// ---------------- Operaciones Transmisión Pastoral Masiva (GOLD-256) ----------------

pub fn insert_pastoral_broadcast(conn: &Connection, b: &PastoralBroadcast) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO pastoral_broadcast (id, sender_id, sender_name, title, message, priority, is_active, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
        "#,
        params![
            b.id,
            b.sender_id,
            b.sender_name,
            b.title,
            b.message,
            b.priority,
            if b.is_active { 1 } else { 0 },
            b.created_at,
        ],
    )?;
    Ok(())
}

pub fn list_active_pastoral_broadcasts(conn: &Connection) -> Result<Vec<PastoralBroadcast>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, sender_id, sender_name, title, message, priority, is_active, created_at
        FROM pastoral_broadcast
        WHERE is_active = 1
        ORDER BY created_at DESC
        "#,
    )?;

    let rows = stmt.query_map([], |row| {
        let active_int: i32 = row.get(6)?;
        Ok(PastoralBroadcast {
            id: row.get(0)?,
            sender_id: row.get(1)?,
            sender_name: row.get(2)?,
            title: row.get(3)?,
            message: row.get(4)?,
            priority: row.get(5)?,
            is_active: active_int == 1,
            created_at: row.get(7)?,
        })
    })?;

    let mut list = Vec::new();
    for r in rows {
        list.push(r?);
    }
    Ok(list)
}

// ---------------- Configuración Institucional y White-Labeling (GOLD-255, GOLD-257) ----------------

pub fn get_church_configuration(conn: &Connection) -> Result<ChurchConfiguration> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, nomenclature_json, brand_palette_id, season_name, season_motto, season_start_date, season_end_date, season_duration_weeks, enable_deacon_system, enable_eldership_system, growth_target_members, updated_at
        FROM church_configuration
        LIMIT 1
        "#,
    )?;

    let mut rows = stmt.query([])?;
    if let Some(row) = rows.next()? {
        let json_str: String = row.get(1)?;
        let nomenclature: ChurchNomenclature = serde_json::from_str(&json_str)
            .unwrap_or_default();
        Ok(ChurchConfiguration {
            id: row.get(0)?,
            nomenclature,
            brand_palette_id: row.get(2)?,
            season_name: row.get(3)?,
            season_motto: row.get(4)?,
            season_start_date: row.get(5)?,
            season_end_date: row.get(6)?,
            season_duration_weeks: row.get::<_, Option<u32>>(7)?.unwrap_or(12),
            enable_deacon_system: row.get::<_, Option<i32>>(8)?.unwrap_or(1) == 1,
            enable_eldership_system: row.get::<_, Option<i32>>(9)?.unwrap_or(1) == 1,
            growth_target_members: row.get::<_, Option<u32>>(10)?.unwrap_or(25000),
            updated_at: row.get(11)?,
        })
    } else {
        Ok(ChurchConfiguration {
            id: "default_config".to_string(),
            nomenclature: ChurchNomenclature::default(),
            brand_palette_id: "navy".to_string(),
            season_name: "Temporada de Otoño 2026".to_string(),
            season_motto: "Arraigados en la Gracia".to_string(),
            season_start_date: Some("2026-09-28".to_string()),
            season_end_date: Some("2026-12-20".to_string()),
            season_duration_weeks: 12,
            enable_deacon_system: true,
            enable_eldership_system: true,
            growth_target_members: 25000,
            updated_at: Utc::now().to_rfc3339(),
        })
    }
}

pub fn upsert_church_configuration(conn: &Connection, config: &ChurchConfiguration) -> Result<()> {
    let json_str = serde_json::to_string(&config.nomenclature)
        .map_err(PorticoError::Serialization)?;
    conn.execute(
        r#"
        INSERT INTO church_configuration (
            id, nomenclature_json, brand_palette_id, season_name, season_motto,
            season_start_date, season_end_date, season_duration_weeks,
            enable_deacon_system, enable_eldership_system, growth_target_members, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
        ON CONFLICT(id) DO UPDATE SET
            nomenclature_json = excluded.nomenclature_json,
            brand_palette_id = excluded.brand_palette_id,
            season_name = excluded.season_name,
            season_motto = excluded.season_motto,
            season_start_date = excluded.season_start_date,
            season_end_date = excluded.season_end_date,
            season_duration_weeks = excluded.season_duration_weeks,
            enable_deacon_system = excluded.enable_deacon_system,
            enable_eldership_system = excluded.enable_eldership_system,
            growth_target_members = excluded.growth_target_members,
            updated_at = excluded.updated_at
        "#,
        params![
            config.id,
            json_str,
            config.brand_palette_id,
            config.season_name,
            config.season_motto,
            config.season_start_date,
            config.season_end_date,
            config.season_duration_weeks,
            if config.enable_deacon_system { 1 } else { 0 },
            if config.enable_eldership_system { 1 } else { 0 },
            config.growth_target_members,
            config.updated_at,
        ],
    )?;
    Ok(())
}

// ---------------- Pipeline de Discipulado Práctico en el Hogar (GOLD-262) ----------------

pub fn upsert_discipleship_track(conn: &Connection, track: &DiscipleshipTrack) -> Result<()> {
    let stage_str = match track.stage {
        DiscipleshipStage::Observer => "observer",
        DiscipleshipStage::CoFacilitator => "co_facilitator",
        DiscipleshipStage::ReadyForLaunch => "ready_for_launch",
    };
    conn.execute(
        r#"
        INSERT INTO discipleship_track (id, group_id, disciple_name, stage, seasons_completed, endorsed_for_launch, endorsed_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
        ON CONFLICT(id) DO UPDATE SET
            group_id = excluded.group_id,
            disciple_name = excluded.disciple_name,
            stage = excluded.stage,
            seasons_completed = excluded.seasons_completed,
            endorsed_for_launch = excluded.endorsed_for_launch,
            endorsed_at = excluded.endorsed_at,
            updated_at = excluded.updated_at
        "#,
        params![
            track.id,
            track.group_id,
            track.disciple_name,
            stage_str,
            track.seasons_completed,
            if track.endorsed_for_launch { 1 } else { 0 },
            track.endorsed_at,
            track.updated_at,
        ],
    )?;
    Ok(())
}

pub fn get_discipleship_track(conn: &Connection, group_id: &str) -> Result<Option<DiscipleshipTrack>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, group_id, disciple_name, stage, seasons_completed, endorsed_for_launch, endorsed_at, updated_at
        FROM discipleship_track
        WHERE group_id = ?1
        LIMIT 1
        "#
    )?;
    let mut rows = stmt.query(params![group_id])?;
    if let Some(row) = rows.next()? {
        let stage_str: String = row.get(3)?;
        let stage = match stage_str.as_str() {
            "co_facilitator" => DiscipleshipStage::CoFacilitator,
            "ready_for_launch" => DiscipleshipStage::ReadyForLaunch,
            _ => DiscipleshipStage::Observer,
        };
        Ok(Some(DiscipleshipTrack {
            id: row.get(0)?,
            group_id: row.get(1)?,
            disciple_name: row.get(2)?,
            stage,
            seasons_completed: row.get(4)?,
            endorsed_for_launch: row.get::<_, i32>(5)? == 1,
            endorsed_at: row.get(6)?,
            updated_at: row.get(7)?,
        }))
    } else {
        Ok(None)
    }
}

pub fn endorse_disciple_for_launch(conn: &Connection, group_id: &str) -> Result<DiscipleshipTrack> {
    let now = Utc::now().to_rfc3339();
    let existing = get_discipleship_track(conn, group_id)?;
    if let Some(mut track) = existing {
        track.stage = DiscipleshipStage::ReadyForLaunch;
        track.endorsed_for_launch = true;
        track.endorsed_at = Some(now.clone());
        track.updated_at = now;
        upsert_discipleship_track(conn, &track)?;
        Ok(track)
    } else {
        let track = DiscipleshipTrack {
            id: uuid::Uuid::new_v4().to_string(),
            group_id: group_id.to_string(),
            disciple_name: "Discípulo en Forja".to_string(),
            stage: DiscipleshipStage::ReadyForLaunch,
            seasons_completed: 2,
            endorsed_for_launch: true,
            endorsed_at: Some(now.clone()),
            updated_at: now,
        };
        upsert_discipleship_track(conn, &track)?;
        Ok(track)
    }
}

// ---------------- Acompañamiento Diaconal Fraternal (GOLD-263) ----------------

pub fn assign_deacon_to_group(
    conn: &Connection,
    deacon_id: &str,
    deacon_name: &str,
    group_id: &str,
) -> Result<DeaconAssignment> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    conn.execute(
        r#"
        INSERT INTO deacon_assignment (id, deacon_id, deacon_name, group_id, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
        "#,
        params![id, deacon_id, deacon_name, group_id, now],
    )?;
    Ok(DeaconAssignment {
        id,
        deacon_id: deacon_id.to_string(),
        deacon_name: deacon_name.to_string(),
        group_id: group_id.to_string(),
        created_at: now,
    })
}

pub fn list_deacon_groups(
    conn: &Connection,
    deacon_id: &str,
) -> Result<Vec<(Edition, MeetingTemplate)>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT e.id, e.season_id, e.created_from_template_id, e.nombre_publico, e.proposito,
               e.affinity_id, e.portada_asset_id, e.dia_habitual, e.hora_habitual, e.cupo_orientativo,
               e.responsible_member_id, e.public_responsible_visibility, e.estado, e.is_full,
               e.aviso_breve, e.whatsapp_chat_url, e.logistics_version,
               t.weekday, t.time, t.venue_type, t.zone_id, t.public_location_name,
               t.public_location_url, t.private_reference, t.private_address, t.host_reference, t.host_phone,
               t.apprentice_id, t.kids_welcome, t.kids_space_type, t.rsvp_cutoff_hours
        FROM edition e
        JOIN meeting_template t ON e.id = t.edition_id
        JOIN deacon_assignment da ON da.group_id = e.id
        WHERE da.deacon_id = ?1 AND e.estado != 'cerrada'
        ORDER BY e.dia_habitual ASC
        "#,
    )?;
    let mut rows = stmt.query(params![deacon_id])?;
    let mut list = Vec::new();
    while let Some(row) = rows.next()? {
        let venue_str: String = row.get(19)?;
        let venue_type = match venue_str.as_str() {
            "public_venue" => VenueType::PublicVenue,
            "online_session" => VenueType::OnlineSession,
            "private_home" => VenueType::PrivateHome,
            _ => VenueType::Other,
        };
        let edition = Edition {
            id: row.get(0)?,
            season_id: row.get(1)?,
            created_from_template_id: row.get(2)?,
            nombre_publico: row.get(3)?,
            proposito: row.get(4)?,
            affinity_id: row.get(5)?,
            portada_asset_id: row.get(6)?,
            dia_habitual: row.get(7)?,
            hora_habitual: row.get(8)?,
            cupo_orientativo: row.get(9)?,
            responsible_member_id: row.get(10)?,
            public_responsible_visibility: row.get::<_, i32>(11)? == 1,
            estado: EditionState::Reconocida,
            is_full: row.get::<_, i32>(13)? == 1,
            aviso_breve: row.get(14)?,
            whatsapp_chat_url: row.get(15)?,
            logistics_version: row.get(16)?,
            modality: GroupModality::Residential,
            cell_accent: None,
            transit_friendly: false,
            carpool_available: false,
            macro_zone: Some("Centro".to_string()),
            campus_id: None,
            consecutive_seasons_hosted: 1,
            venue_nature: VenueNature::Home,
            good_neighbor_pledge: true,
            child_safeguarding_certified: true,
            parent_group_id: None,
            liaison_name: None,
            liaison_role: None,
            access_protocol: None,
        };
        let template = MeetingTemplate {
            weekday: row.get(17)?,
            time: row.get(18)?,
            venue_type,
            zone_id: row.get(20)?,
            public_location_name: row.get(21)?,
            public_location_url: row.get(22)?,
            private_reference: row.get(23)?,
            private_address: row.get(24)?,
            host_reference: row.get(25)?,
            host_phone: row.get(26)?,
            apprentice_id: row.get(27)?,
            kids_welcome: row.get::<_, Option<i32>>(28)?.unwrap_or(1) == 1,
            kids_space_type: row.get::<_, Option<String>>(29)?.unwrap_or_else(|| "play_area".to_string()),
            rsvp_cutoff_hours: row.get::<_, Option<u32>>(30)?.unwrap_or(4),
        };
        list.push((edition, template));
    }
    Ok(list)
}

pub fn insert_deacon_contact_log(conn: &Connection, log: &DeaconContactLog) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO deacon_contact_log (id, deacon_id, group_id, contact_type, notes, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        "#,
        params![
            log.id,
            log.deacon_id,
            log.group_id,
            log.contact_type,
            log.notes,
            log.created_at,
        ],
    )?;
    Ok(())
}

pub fn list_deacon_contact_logs(conn: &Connection, deacon_id: &str) -> Result<Vec<DeaconContactLog>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, deacon_id, group_id, contact_type, notes, created_at
        FROM deacon_contact_log
        WHERE deacon_id = ?1
        ORDER BY created_at DESC
        LIMIT 50
        "#
    )?;
    let mut rows = stmt.query(params![deacon_id])?;
    let mut list = Vec::new();
    while let Some(row) = rows.next()? {
        list.push(DeaconContactLog {
            id: row.get(0)?,
            deacon_id: row.get(1)?,
            group_id: row.get(2)?,
            contact_type: row.get(3)?,
            notes: row.get(4)?,
            created_at: row.get(5)?,
        });
    }
    Ok(list)
}

// ---------------- Reporte Formal de Desviaciones Pastorales (GOLD-268) ----------------

pub fn insert_pastoral_deviation(conn: &Connection, dev: &PastoralDeviation) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO pastoral_deviation (id, group_id, reporter_member_id, category, comments, status, sla_deadline, assigned_elder_id, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
        "#,
        params![
            dev.id,
            dev.group_id,
            dev.reporter_member_id,
            dev.category,
            dev.comments,
            dev.status,
            dev.sla_deadline,
            dev.assigned_elder_id,
            dev.created_at,
        ],
    )?;
    Ok(())
}

pub fn list_pastoral_deviations(conn: &Connection, group_id: Option<&str>) -> Result<Vec<PastoralDeviation>> {
    let mut list = Vec::new();
    if let Some(gid) = group_id {
        let mut stmt = conn.prepare(
            r#"
            SELECT id, group_id, reporter_member_id, category, comments, status, sla_deadline, assigned_elder_id, created_at
            FROM pastoral_deviation
            WHERE group_id = ?1
            ORDER BY created_at DESC
            "#
        )?;
        let mut rows = stmt.query(params![gid])?;
        while let Some(row) = rows.next()? {
            list.push(PastoralDeviation {
                id: row.get(0)?,
                group_id: row.get(1)?,
                reporter_member_id: row.get(2)?,
                category: row.get(3)?,
                comments: row.get(4)?,
                status: row.get(5)?,
                sla_deadline: row.get(6)?,
                assigned_elder_id: row.get(7)?,
                created_at: row.get(8)?,
            });
        }
    } else {
        let mut stmt = conn.prepare(
            r#"
            SELECT id, group_id, reporter_member_id, category, comments, status, sla_deadline, assigned_elder_id, created_at
            FROM pastoral_deviation
            ORDER BY created_at DESC
            "#
        )?;
        let mut rows = stmt.query([])?;
        while let Some(row) = rows.next()? {
            list.push(PastoralDeviation {
                id: row.get(0)?,
                group_id: row.get(1)?,
                reporter_member_id: row.get(2)?,
                category: row.get(3)?,
                comments: row.get(4)?,
                status: row.get(5)?,
                sla_deadline: row.get(6)?,
                assigned_elder_id: row.get(7)?,
                created_at: row.get(8)?,
            });
        }
    }
    Ok(list)
}

pub fn resolve_pastoral_deviation(conn: &Connection, dev_id: &str) -> Result<()> {
    conn.execute(
        "UPDATE pastoral_deviation SET status = 'resolved' WHERE id = ?1",
        params![dev_id],
    )?;
    Ok(())
}

// ---------------- Cierre Fraternal de Temporada (GOLD-264) ----------------

pub fn record_season_closure(conn: &Connection, closure: &SeasonClosure) -> Result<()> {
    let decision_str = match closure.closure_decision {
        SeasonClosureDecision::ContinueSame => "continue_same",
        SeasonClosureDecision::MultiplyWithDisciple => "multiply_with_disciple",
        SeasonClosureDecision::SabbaticalRest => "sabbatical_rest",
    };
    conn.execute(
        r#"
        INSERT INTO season_closure (id, group_id, season_name, closure_decision, disciple_new_group_name, notes, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        "#,
        params![
            closure.id,
            closure.group_id,
            closure.season_name,
            decision_str,
            closure.disciple_new_group_name,
            closure.notes,
            closure.created_at,
        ],
    )?;
    Ok(())
}

pub fn get_season_closure(conn: &Connection, group_id: &str, season_name: &str) -> Result<Option<SeasonClosure>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, group_id, season_name, closure_decision, disciple_new_group_name, notes, created_at
        FROM season_closure
        WHERE group_id = ?1 AND season_name = ?2
        ORDER BY created_at DESC
        LIMIT 1
        "#
    )?;
    let mut rows = stmt.query(params![group_id, season_name])?;
    if let Some(row) = rows.next()? {
        let dec_str: String = row.get(3)?;
        let decision = match dec_str.as_str() {
            "multiply_with_disciple" => SeasonClosureDecision::MultiplyWithDisciple,
            "sabbatical_rest" => SeasonClosureDecision::SabbaticalRest,
            _ => SeasonClosureDecision::ContinueSame,
        };
        Ok(Some(SeasonClosure {
            id: row.get(0)?,
            group_id: row.get(1)?,
            season_name: row.get(2)?,
            closure_decision: decision,
            disciple_new_group_name: row.get(4)?,
            notes: row.get(5)?,
            created_at: row.get(6)?,
        }))
    } else {
        Ok(None)
    }
}

// ---------------- Catálogo de Ministerios de Servicio para Miembros y Veteranos (GOLD-265) ----------------

pub fn list_service_ministries(conn: &Connection) -> Result<Vec<ServiceMinistry>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, name, description, category, leader_name, active
        FROM service_ministry
        WHERE active = 1
        ORDER BY name ASC
        "#
    )?;
    let mut rows = stmt.query([])?;
    let mut list = Vec::new();
    while let Some(row) = rows.next()? {
        list.push(ServiceMinistry {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            category: row.get(3)?,
            leader_name: row.get(4)?,
            active: row.get::<_, i32>(5)? == 1,
        });
    }
    Ok(list)
}

pub fn insert_service_ministry(conn: &Connection, min: &ServiceMinistry) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO service_ministry (id, name, description, category, leader_name, active)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            category = excluded.category,
            leader_name = excluded.leader_name,
            active = excluded.active
        "#,
        params![
            min.id,
            min.name,
            min.description,
            min.category,
            min.leader_name,
            if min.active { 1 } else { 0 },
        ],
    )?;
    Ok(())
}

pub fn enroll_in_service_ministry(conn: &Connection, enrollment: &MinistryEnrollment) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO ministry_enrollment (id, ministry_id, member_name, member_phone, notes, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        "#,
        params![
            enrollment.id,
            enrollment.ministry_id,
            enrollment.member_name,
            enrollment.member_phone,
            enrollment.notes,
            enrollment.created_at,
        ],
    )?;
    Ok(())
}

pub fn list_ministry_enrollments(conn: &Connection, ministry_id: &str) -> Result<Vec<MinistryEnrollment>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, ministry_id, member_name, member_phone, notes, created_at
        FROM ministry_enrollment
        WHERE ministry_id = ?1
        ORDER BY created_at DESC
        "#
    )?;
    let mut rows = stmt.query(params![ministry_id])?;
    let mut list = Vec::new();
    while let Some(row) = rows.next()? {
        list.push(MinistryEnrollment {
            id: row.get(0)?,
            ministry_id: row.get(1)?,
            member_name: row.get(2)?,
            member_phone: row.get(3)?,
            notes: row.get(4)?,
            created_at: row.get(5)?,
        });
    }
    Ok(list)
}

// ---------------- Veto y Disciplina Pastoral Teocéntrica (GOLD-254) ----------------

pub fn veto_edition(conn: &Connection, edition_id: &str) -> Result<()> {
    conn.execute(
        "UPDATE edition SET estado = 'cerrada', aviso_breve = 'Edición suspendida por Veto Pastoral' WHERE id = ?1",
        params![edition_id],
    )?;
    Ok(())
}

pub fn discipline_member(conn: &Connection, member_id: &str) -> Result<()> {
    conn.execute(
        "UPDATE member SET estado = 'disciplinado' WHERE id = ?1",
        params![member_id],
    )?;
    conn.execute(
        "UPDATE membership SET status = 'revocada' WHERE member_id = ?1",
        params![member_id],
    )?;
    Ok(())
}

// =========================================================================
// Ciclo 6: Escala 25,000 Miembros, Multi-Campus, Presbiterio y Fisión Dunbar (GOLD-273 a GOLD-279)
// =========================================================================

// ---------------- Presbiterio Colegiado de Macro-Campus (GOLD-273) ----------------

pub fn insert_eldership_council(conn: &Connection, council: &EldershipCouncil) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO eldership_councils (id, macro_zone, name, leader_name, active_deacon_count, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT(id) DO UPDATE SET
            macro_zone = excluded.macro_zone,
            name = excluded.name,
            leader_name = excluded.leader_name,
            active_deacon_count = excluded.active_deacon_count
        "#,
        params![
            council.id,
            council.macro_zone,
            council.name,
            council.leader_name,
            council.active_deacon_count,
            council.created_at,
        ],
    )?;
    Ok(())
}

pub fn list_eldership_councils(conn: &Connection) -> Result<Vec<EldershipCouncil>> {
    let mut stmt = conn.prepare(
        "SELECT id, macro_zone, name, leader_name, active_deacon_count, created_at FROM eldership_councils ORDER BY name ASC"
    )?;
    let mut rows = stmt.query([])?;
    let mut list = Vec::new();
    while let Some(row) = rows.next()? {
        list.push(EldershipCouncil {
            id: row.get(0)?,
            macro_zone: row.get(1)?,
            name: row.get(2)?,
            leader_name: row.get(3)?,
            active_deacon_count: row.get(4)?,
            created_at: row.get(5)?,
        });
    }
    Ok(list)
}

pub fn insert_elder_assignment(conn: &Connection, assignment: &ElderAssignment) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO elder_assignments (id, council_id, elder_id, elder_name, deacon_id, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT(id) DO UPDATE SET
            elder_name = excluded.elder_name,
            deacon_id = excluded.deacon_id
        "#,
        params![
            assignment.id,
            assignment.council_id,
            assignment.elder_id,
            assignment.elder_name,
            assignment.deacon_id,
            assignment.created_at,
        ],
    )?;
    Ok(())
}

pub fn list_elder_deacons(conn: &Connection, elder_id: &str) -> Result<Vec<ElderAssignment>> {
    let mut stmt = conn.prepare(
        "SELECT id, council_id, elder_id, elder_name, deacon_id, created_at FROM elder_assignments WHERE elder_id = ?1 ORDER BY created_at ASC"
    )?;
    let mut rows = stmt.query(params![elder_id])?;
    let mut list = Vec::new();
    while let Some(row) = rows.next()? {
        list.push(ElderAssignment {
            id: row.get(0)?,
            council_id: row.get(1)?,
            elder_id: row.get(2)?,
            elder_name: row.get(3)?,
            deacon_id: row.get(4)?,
            created_at: row.get(5)?,
        });
    }
    Ok(list)
}

pub fn record_deacon_care_roundtable(conn: &Connection, roundtable: &DeaconCareRoundtable) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO deacon_care_roundtables (id, council_id, elder_id, attended_deacon_count, notes, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        "#,
        params![
            roundtable.id,
            roundtable.council_id,
            roundtable.elder_id,
            roundtable.attended_deacon_count,
            roundtable.notes,
            roundtable.created_at,
        ],
    )?;
    Ok(())
}

pub fn list_deacon_care_roundtables(conn: &Connection, council_id: Option<&str>) -> Result<Vec<DeaconCareRoundtable>> {
    let mut list = Vec::new();
    if let Some(cid) = council_id {
        let mut stmt = conn.prepare(
            "SELECT id, council_id, elder_id, attended_deacon_count, notes, created_at FROM deacon_care_roundtables WHERE council_id = ?1 ORDER BY created_at DESC"
        )?;
        let mut rows = stmt.query(params![cid])?;
        while let Some(row) = rows.next()? {
            list.push(DeaconCareRoundtable {
                id: row.get(0)?,
                council_id: row.get(1)?,
                elder_id: row.get(2)?,
                attended_deacon_count: row.get(3)?,
                notes: row.get(4)?,
                created_at: row.get(5)?,
            });
        }
    } else {
        let mut stmt = conn.prepare(
            "SELECT id, council_id, elder_id, attended_deacon_count, notes, created_at FROM deacon_care_roundtables ORDER BY created_at DESC"
        )?;
        let mut rows = stmt.query([])?;
        while let Some(row) = rows.next()? {
            list.push(DeaconCareRoundtable {
                id: row.get(0)?,
                council_id: row.get(1)?,
                elder_id: row.get(2)?,
                attended_deacon_count: row.get(3)?,
                notes: row.get(4)?,
                created_at: row.get(5)?,
            });
        }
    }
    Ok(list)
}

// ---------------- Control de Tenure y Sabático de Hogares (GOLD-275) ----------------

pub fn record_host_sabbatical(conn: &Connection, sabbatical: &HostSabbatical) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO host_sabbaticals (id, group_id, host_name, consecutive_seasons, is_on_sabbatical, sabbatical_reason, next_eligible_season, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
        ON CONFLICT(id) DO UPDATE SET
            consecutive_seasons = excluded.consecutive_seasons,
            is_on_sabbatical = excluded.is_on_sabbatical,
            sabbatical_reason = excluded.sabbatical_reason,
            next_eligible_season = excluded.next_eligible_season
        "#,
        params![
            sabbatical.id,
            sabbatical.group_id,
            sabbatical.host_name,
            sabbatical.consecutive_seasons,
            if sabbatical.is_on_sabbatical { 1 } else { 0 },
            sabbatical.sabbatical_reason,
            sabbatical.next_eligible_season,
            sabbatical.created_at,
        ],
    )?;
    Ok(())
}

pub fn list_host_sabbaticals(conn: &Connection, group_id: Option<&str>) -> Result<Vec<HostSabbatical>> {
    let mut list = Vec::new();
    if let Some(gid) = group_id {
        let mut stmt = conn.prepare(
            "SELECT id, group_id, host_name, consecutive_seasons, is_on_sabbatical, sabbatical_reason, next_eligible_season, created_at FROM host_sabbaticals WHERE group_id = ?1 ORDER BY created_at DESC"
        )?;
        let mut rows = stmt.query(params![gid])?;
        while let Some(row) = rows.next()? {
            list.push(HostSabbatical {
                id: row.get(0)?,
                group_id: row.get(1)?,
                host_name: row.get(2)?,
                consecutive_seasons: row.get(3)?,
                is_on_sabbatical: row.get::<_, i32>(4)? == 1,
                sabbatical_reason: row.get(5)?,
                next_eligible_season: row.get(6)?,
                created_at: row.get(7)?,
            });
        }
    } else {
        let mut stmt = conn.prepare(
            "SELECT id, group_id, host_name, consecutive_seasons, is_on_sabbatical, sabbatical_reason, next_eligible_season, created_at FROM host_sabbaticals ORDER BY consecutive_seasons DESC"
        )?;
        let mut rows = stmt.query([])?;
        while let Some(row) = rows.next()? {
            list.push(HostSabbatical {
                id: row.get(0)?,
                group_id: row.get(1)?,
                host_name: row.get(2)?,
                consecutive_seasons: row.get(3)?,
                is_on_sabbatical: row.get::<_, i32>(4)? == 1,
                sabbatical_reason: row.get(5)?,
                next_eligible_season: row.get(6)?,
                created_at: row.get(7)?,
            });
        }
    }
    Ok(list)
}

pub fn get_fatigue_radar(conn: &Connection) -> Result<Vec<HostSabbatical>> {
    let mut stmt = conn.prepare(
        "SELECT id, group_id, host_name, consecutive_seasons, is_on_sabbatical, sabbatical_reason, next_eligible_season, created_at FROM host_sabbaticals WHERE consecutive_seasons >= 2 OR is_on_sabbatical = 1 ORDER BY consecutive_seasons DESC"
    )?;
    let mut rows = stmt.query([])?;
    let mut list = Vec::new();
    while let Some(row) = rows.next()? {
        list.push(HostSabbatical {
            id: row.get(0)?,
            group_id: row.get(1)?,
            host_name: row.get(2)?,
            consecutive_seasons: row.get(3)?,
            is_on_sabbatical: row.get::<_, i32>(4)? == 1,
            sabbatical_reason: row.get(5)?,
            next_eligible_season: row.get(6)?,
            created_at: row.get(7)?,
        });
    }
    Ok(list)
}

// ---------------- Servidores Eméritos y Guardianes del ADN (GOLD-276) ----------------

pub fn insert_emeritus_guardian(conn: &Connection, guardian: &EmeritusGuardian) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO emeritus_guardians (id, member_id, member_name, original_join_year, ministry_role, commissioned_by, commissioned_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        ON CONFLICT(id) DO UPDATE SET
            ministry_role = excluded.ministry_role,
            commissioned_by = excluded.commissioned_by
        "#,
        params![
            guardian.id,
            guardian.member_id,
            guardian.member_name,
            guardian.original_join_year,
            guardian.ministry_role,
            guardian.commissioned_by,
            guardian.commissioned_at,
        ],
    )?;
    Ok(())
}

pub fn list_emeritus_guardians(conn: &Connection) -> Result<Vec<EmeritusGuardian>> {
    let mut stmt = conn.prepare(
        "SELECT id, member_id, member_name, original_join_year, ministry_role, commissioned_by, commissioned_at FROM emeritus_guardians ORDER BY original_join_year ASC, member_name ASC"
    )?;
    let mut rows = stmt.query([])?;
    let mut list = Vec::new();
    while let Some(row) = rows.next()? {
        list.push(EmeritusGuardian {
            id: row.get(0)?,
            member_id: row.get(1)?,
            member_name: row.get(2)?,
            original_join_year: row.get(3)?,
            ministry_role: row.get(4)?,
            commissioned_by: row.get(5)?,
            commissioned_at: row.get(6)?,
        });
    }
    Ok(list)
}

// ---------------- Arquitectura Litúrgica Curada y Visita Diaconal (GOLD-277) ----------------

pub fn insert_curated_curriculum(conn: &Connection, curr: &CuratedCurriculum) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO curated_curricula (id, season_name, week_number, title, scripture_passage, video_prompt_url, pair_share_question, pastoral_notes, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
        ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            scripture_passage = excluded.scripture_passage,
            video_prompt_url = excluded.video_prompt_url,
            pair_share_question = excluded.pair_share_question,
            pastoral_notes = excluded.pastoral_notes
        "#,
        params![
            curr.id,
            curr.season_name,
            curr.week_number,
            curr.title,
            curr.scripture_passage,
            curr.video_prompt_url,
            curr.pair_share_question,
            curr.pastoral_notes,
            curr.created_at,
        ],
    )?;
    Ok(())
}

pub fn get_active_curated_curriculum(conn: &Connection, week_number: Option<u32>) -> Result<Option<CuratedCurriculum>> {
    let week = week_number.unwrap_or(4);
    let mut stmt = conn.prepare(
        "SELECT id, season_name, week_number, title, scripture_passage, video_prompt_url, pair_share_question, pastoral_notes, created_at FROM curated_curricula WHERE week_number = ?1 LIMIT 1"
    )?;
    let mut rows = stmt.query(params![week])?;
    if let Some(row) = rows.next()? {
        Ok(Some(CuratedCurriculum {
            id: row.get(0)?,
            season_name: row.get(1)?,
            week_number: row.get(2)?,
            title: row.get(3)?,
            scripture_passage: row.get(4)?,
            video_prompt_url: row.get(5)?,
            pair_share_question: row.get(6)?,
            pastoral_notes: row.get(7)?,
            created_at: row.get(8)?,
        }))
    } else {
        // Fallback default
        Ok(Some(CuratedCurriculum {
            id: "curriculum_w4".to_string(),
            season_name: "Temporada Activa 2026".to_string(),
            week_number: week,
            title: format!("Semana {}: El Atrio y la Hospitalidad Radical", week),
            scripture_passage: "Romanos 12:9-13 / Hebreos 13:1-2".to_string(),
            video_prompt_url: "https://vimeo.com/portico/liturgia-w4".to_string(),
            pair_share_question: "¿En qué área de tu vida cotidiana puedes abrir la puerta para que otro experimente gracia sincera?".to_string(),
            pastoral_notes: "Cuatro momentos sagrados: (1) Conexión en la mesa, (2) Video-prompt pastoral 3 min, (3) Diálogo en parejas, (4) Oración de cobertura.".to_string(),
            created_at: Utc::now().to_rfc3339(),
        }))
    }
}

pub fn record_diaconal_visit(conn: &Connection, visit: &DiaconalVisit) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO diaconal_visits (id, deacon_id, deacon_name, group_id, visited_at, atmosphere_pulse, notes)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        "#,
        params![
            visit.id,
            visit.deacon_id,
            visit.deacon_name,
            visit.group_id,
            visit.visited_at,
            visit.atmosphere_pulse,
            visit.notes,
        ],
    )?;
    Ok(())
}

pub fn list_diaconal_visits(conn: &Connection, group_id: Option<&str>) -> Result<Vec<DiaconalVisit>> {
    let mut list = Vec::new();
    if let Some(gid) = group_id {
        let mut stmt = conn.prepare(
            "SELECT id, deacon_id, deacon_name, group_id, visited_at, atmosphere_pulse, notes FROM diaconal_visits WHERE group_id = ?1 ORDER BY visited_at DESC"
        )?;
        let mut rows = stmt.query(params![gid])?;
        while let Some(row) = rows.next()? {
            list.push(DiaconalVisit {
                id: row.get(0)?,
                deacon_id: row.get(1)?,
                deacon_name: row.get(2)?,
                group_id: row.get(3)?,
                visited_at: row.get(4)?,
                atmosphere_pulse: row.get(5)?,
                notes: row.get(6)?,
            });
        }
    } else {
        let mut stmt = conn.prepare(
            "SELECT id, deacon_id, deacon_name, group_id, visited_at, atmosphere_pulse, notes FROM diaconal_visits ORDER BY visited_at DESC"
        )?;
        let mut rows = stmt.query([])?;
        while let Some(row) = rows.next()? {
            list.push(DiaconalVisit {
                id: row.get(0)?,
                deacon_id: row.get(1)?,
                deacon_name: row.get(2)?,
                group_id: row.get(3)?,
                visited_at: row.get(4)?,
                atmosphere_pulse: row.get(5)?,
                notes: row.get(6)?,
            });
        }
    }
    Ok(list)
}

pub fn escalate_pastoral_deviation_with_sla(conn: &Connection, dev_id: &str, elder_id: &str, sla_deadline: &str) -> Result<()> {
    conn.execute(
        "UPDATE pastoral_deviation SET assigned_elder_id = ?1, sla_deadline = ?2, status = 'reviewed_by_deacon' WHERE id = ?3",
        params![elder_id, sla_deadline, dev_id],
    )?;
    Ok(())
}

// ---------------- Protocolo Cívico de Buena Vecindad y Salvaguarda (GOLD-278) ----------------

pub fn insert_neighborhood_complaint(conn: &Connection, complaint: &NeighborhoodComplaint) -> Result<()> {
    conn.execute(
        r#"
        INSERT INTO neighborhood_complaints (id, group_id, colonia_name, reporter_contact, category, comments, status, sla_deadline, resolution_notes, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
        "#,
        params![
            complaint.id,
            complaint.group_id,
            complaint.colonia_name,
            complaint.reporter_contact,
            complaint.category,
            complaint.comments,
            complaint.status,
            complaint.sla_deadline,
            complaint.resolution_notes,
            complaint.created_at,
        ],
    )?;
    Ok(())
}

pub fn list_neighborhood_complaints(conn: &Connection, status: Option<&str>) -> Result<Vec<NeighborhoodComplaint>> {
    let mut list = Vec::new();
    if let Some(st) = status {
        let mut stmt = conn.prepare(
            "SELECT id, group_id, colonia_name, reporter_contact, category, comments, status, sla_deadline, resolution_notes, created_at FROM neighborhood_complaints WHERE status = ?1 ORDER BY created_at DESC"
        )?;
        let mut rows = stmt.query(params![st])?;
        while let Some(row) = rows.next()? {
            list.push(NeighborhoodComplaint {
                id: row.get(0)?,
                group_id: row.get(1)?,
                colonia_name: row.get(2)?,
                reporter_contact: row.get(3)?,
                category: row.get(4)?,
                comments: row.get(5)?,
                status: row.get(6)?,
                sla_deadline: row.get(7)?,
                resolution_notes: row.get(8)?,
                created_at: row.get(9)?,
            });
        }
    } else {
        let mut stmt = conn.prepare(
            "SELECT id, group_id, colonia_name, reporter_contact, category, comments, status, sla_deadline, resolution_notes, created_at FROM neighborhood_complaints ORDER BY created_at DESC"
        )?;
        let mut rows = stmt.query([])?;
        while let Some(row) = rows.next()? {
            list.push(NeighborhoodComplaint {
                id: row.get(0)?,
                group_id: row.get(1)?,
                colonia_name: row.get(2)?,
                reporter_contact: row.get(3)?,
                category: row.get(4)?,
                comments: row.get(5)?,
                status: row.get(6)?,
                sla_deadline: row.get(7)?,
                resolution_notes: row.get(8)?,
                created_at: row.get(9)?,
            });
        }
    }
    Ok(list)
}

pub fn resolve_neighborhood_complaint(conn: &Connection, complaint_id: &str, resolution_notes: &str) -> Result<()> {
    conn.execute(
        "UPDATE neighborhood_complaints SET status = 'resolved', resolution_notes = ?1 WHERE id = ?2",
        params![resolution_notes, complaint_id],
    )?;
    Ok(())
}

// ---------------- Fisión Celular Fractal por Grafo de Dunbar (GOLD-279) ----------------

pub fn execute_dunbar_fission(conn: &Connection, nucleus: &PlantingSeedNucleus) -> Result<DunbarFissionResult> {
    let now = Utc::now().to_rfc3339();
    let child_group_id = format!("fission-{}", &uuid::Uuid::new_v4().to_string()[..8]);

    // Obtener datos del grupo padre
    let mut stmt = conn.prepare(
        "SELECT season_id, affinity_id, cupo_orientativo FROM edition WHERE id = ?1 LIMIT 1"
    )?;
    let mut rows = stmt.query(params![nucleus.parent_group_id])?;
    let (season_id, affinity_id, cupo): (String, String, i32) = if let Some(row) = rows.next()? {
        (row.get(0)?, row.get(1)?, row.get(2)?)
    } else {
        return Err(PorticoError::NotFound("Parent group not found".to_string()));
    };

    // Crear edición hija con linaje parent_group_id
    let child_edition = Edition {
        id: child_group_id.clone(),
        season_id,
        created_from_template_id: None,
        nombre_publico: nucleus.new_group_name.clone(),
        proposito: format!("Célula hija plantada con bendición fraterna de {}", nucleus.parent_group_id),
        affinity_id,
        portada_asset_id: None,
        dia_habitual: nucleus.new_dia_habitual,
        hora_habitual: nucleus.new_hora_habitual.clone(),
        cupo_orientativo: cupo,
        responsible_member_id: nucleus.apprentice_id.clone(),
        public_responsible_visibility: true,
        estado: EditionState::Reconocida,
        is_full: false,
        aviso_breve: Some("Nueva célula comisionada por multiplicación saludable".to_string()),
        whatsapp_chat_url: None,
        logistics_version: 1,
        modality: GroupModality::Residential,
        cell_accent: Some("forest".to_string()),
        transit_friendly: true,
        carpool_available: true,
        macro_zone: Some(nucleus.new_macro_zone.clone()),
        campus_id: None,
        consecutive_seasons_hosted: 1,
        venue_nature: VenueNature::Home,
        good_neighbor_pledge: true,
        child_safeguarding_certified: true,
        parent_group_id: Some(nucleus.parent_group_id.clone()),
        liaison_name: None,
        liaison_role: None,
        access_protocol: None,
    };

    let child_template = MeetingTemplate {
        weekday: nucleus.new_dia_habitual,
        time: nucleus.new_hora_habitual.clone(),
        venue_type: VenueType::PrivateHome,
        zone_id: None,
        public_location_name: Some(format!("Sede Plantadora {}", nucleus.new_macro_zone)),
        public_location_url: None,
        private_reference: Some("Hogar del nuevo facilitador plantador".to_string()),
        private_address: Some(format!("Sector {}, Durango, Dgo.", nucleus.new_macro_zone)),
        host_reference: Some(nucleus.apprentice_name.clone()),
        host_phone: None,
        apprentice_id: None,
        kids_welcome: true,
        kids_space_type: "play_area".to_string(),
        rsvp_cutoff_hours: 4,
    };

    insert_edition(conn, &child_edition, &child_template)?;

    // Transferir al aprendiz como miembro activo del grupo hijo
    create_membership(conn, &Membership {
        id: uuid::Uuid::new_v4().to_string(),
        member_id: nucleus.apprentice_id.clone(),
        edition_id: child_group_id.clone(),
        status: MembershipState::Activa,
        contact_visibility: "edition_members".to_string(),
        created_at: Utc::now(),
        closed_at: None,
    })?;

    // Transferir a los miembros del núcleo plantador voluntario
    for mem_id in &nucleus.seed_member_ids {
        let _ = conn.execute(
            "UPDATE membership SET status = 'finalizada', closed_at = ?1 WHERE member_id = ?2 AND edition_id = ?3 AND status = 'activa'",
            params![now, mem_id, nucleus.parent_group_id],
        );
        create_membership(conn, &Membership {
            id: uuid::Uuid::new_v4().to_string(),
            member_id: mem_id.clone(),
            edition_id: child_group_id.clone(),
            status: MembershipState::Activa,
            contact_visibility: "edition_members".to_string(),
            created_at: Utc::now(),
            closed_at: None,
        })?;
    }

    let parent_remaining: u32 = conn.query_row(
        "SELECT COUNT(*) FROM membership WHERE edition_id = ?1 AND status = 'activa'",
        params![nucleus.parent_group_id],
        |r| r.get(0),
    ).unwrap_or(11);

    let child_initial = (nucleus.seed_member_ids.len() + 1) as u32;

    let log_id = uuid::Uuid::new_v4().to_string();
    conn.execute(
        r#"
        INSERT INTO dunbar_fission_log (id, parent_group_id, parent_remaining_count, child_group_id, child_initial_count, fission_date)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        "#,
        params![
            log_id,
            nucleus.parent_group_id,
            parent_remaining,
            child_group_id,
            child_initial,
            now,
        ],
    )?;

    Ok(DunbarFissionResult {
        parent_group_id: nucleus.parent_group_id.clone(),
        parent_remaining_count: parent_remaining,
        child_group_id,
        child_initial_count: child_initial,
        fission_date: now,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_data_plane_flow() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();

        // 1. Campus Durango
        let campus = Campus {
            id: "campus_durango".to_string(),
            organization_id: "org_amorygracia".to_string(),
            nombre_publico: "Durango".to_string(),
            ciudad: "Durango".to_string(),
            slug: "durango".to_string(),
            sort_order: 1,
            timezone: "America/Monterrey".to_string(),
            status: "active".to_string(),
            address: Some("Blvd. Durango 100".to_string()),
            macro_zone: Some("Centro".to_string()),
            capacity_per_service: Some(1200),
            pastor_name: Some("Josh Morales".to_string()),
            atrium_welcome_lead: Some("Mateo Silva".to_string()),
        };
        insert_campus(&conn, &campus).unwrap();

        // 2. Season Otoño 2026
        let season = Season {
            id: "season_fall_2026".to_string(),
            campus_id: "campus_durango".to_string(),
            nombre_publico: "Otoño 2026".to_string(),
            fecha_inicio: NaiveDate::from_ymd_opt(2026, 9, 28).unwrap(),
            fecha_fin: NaiveDate::from_ymd_opt(2026, 12, 20).unwrap(),
            estado: SeasonState::EnCurso,
        };
        insert_season(&conn, &season).unwrap();

        // 3. Edition Jóvenes en Café (Public Venue)
        let edition = Edition {
            id: "ed_jovenes".to_string(),
            season_id: "season_fall_2026".to_string(),
            created_from_template_id: None,
            nombre_publico: "Jóvenes y Amigos".to_string(),
            proposito: "Charla y café".to_string(),
            affinity_id: "aff_jovenes".to_string(),
            portada_asset_id: None,
            dia_habitual: 4,
            hora_habitual: "19:30".to_string(),
            cupo_orientativo: 15,
            responsible_member_id: "mem_carlos".to_string(),
            public_responsible_visibility: true,
            estado: EditionState::Reconocida,
            is_full: false,
            aviso_breve: Some("Nos vemos para cenar".to_string()),
            whatsapp_chat_url: Some("https://chat.whatsapp.com/test123".to_string()),
            logistics_version: 1,
            modality: GroupModality::Residential,
            cell_accent: None,
            transit_friendly: false,
            carpool_available: false,
            macro_zone: Some("Centro".to_string()),
            campus_id: Some("campus_durango".to_string()),
            consecutive_seasons_hosted: 1,
            venue_nature: VenueNature::CivicCafe,
            good_neighbor_pledge: true,
            child_safeguarding_certified: true,
            parent_group_id: None,
            liaison_name: None,
            liaison_role: None,
            access_protocol: None,
        };

        let template = MeetingTemplate {
            weekday: 4,
            time: "19:30".to_string(),
            venue_type: VenueType::PublicVenue,
            zone_id: None,
            public_location_name: Some("Café Central 5 de Mayo".to_string()),
            public_location_url: Some("https://maps.google.com/?q=CafeCentral".to_string()),
            private_reference: None,
            private_address: None,
            host_reference: None,
            host_phone: None,
            apprentice_id: None,
            kids_welcome: true,
            kids_space_type: "play_area".to_string(),
            rsvp_cutoff_hours: 4,
        };
        insert_edition(&conn, &edition, &template).unwrap();

        // 4. Member & Membership
        let member = Member {
            id: "mem_pedro".to_string(),
            organization_id: "org_amorygracia".to_string(),
            nombre_visible: "Pedro Infante".to_string(),
            estado: "activo".to_string(),
            sexo: Some(crate::domain::BiologicalSex::Hombre),
            age_category: Some(crate::domain::AgeCategory::Adulto),
            guardian_id: None,
        };
        insert_member(&conn, &member).unwrap();

        let membership = Membership {
            id: "mship_01".to_string(),
            member_id: "mem_pedro".to_string(),
            edition_id: "ed_jovenes".to_string(),
            status: MembershipState::Activa,
            contact_visibility: "hidden".to_string(),
            created_at: Utc::now(),
            closed_at: None,
        };
        create_membership(&conn, &membership).unwrap();

        // 5. Verificaciones
        assert!(is_active_member_of_edition(&conn, "mem_pedro", "ed_jovenes").unwrap());
        assert!(!is_active_member_of_edition(&conn, "mem_otro", "ed_jovenes").unwrap());

        // Verificar historial
        let history = list_member_history(&conn, "mem_pedro").unwrap();
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].1.nombre_publico, "Jóvenes y Amigos");
    }

    fn create_test_fixtures(conn: &Connection, edition_id: &str) {
        conn.execute(
            "INSERT OR IGNORE INTO campus (id, organization_id, nombre_publico, ciudad, slug, created_at, updated_at) VALUES ('camp_test', 'org_test', 'Campus Test', 'Durango', 'durango-test', '2026-09-01', '2026-09-01')",
            [],
        ).unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO season (id, campus_id, nombre_publico, fecha_inicio, fecha_fin, estado, created_at, updated_at) VALUES ('season_test', 'camp_test', 'Temporada Test', '2026-09-01', '2026-12-31', 'en_curso', '2026-09-01', '2026-09-01')",
            [],
        ).unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO member (id, organization_id, nombre_visible, estado, created_at, updated_at) VALUES ('author_test', 'org_test', 'Líder Test', 'activo', '2026-09-01', '2026-09-01')",
            [],
        ).unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO edition (id, season_id, nombre_publico, proposito, affinity_id, dia_habitual, hora_habitual, cupo_orientativo, responsible_member_id, public_responsible_visibility, estado, is_full, logistics_version, created_at, updated_at)
             VALUES (?1, 'season_test', 'Grupo Test', 'Proposito', 'aff_1', 3, '19:00', 15, 'author_test', 1, 'reconocida', 0, 1, '2026-09-01', '2026-09-01')",
            params![edition_id],
        ).unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO meeting_template (edition_id, weekday, time, venue_type) VALUES (?1, 3, '19:00', 'private_home')",
            params![edition_id],
        ).unwrap();
    }

    #[test]
    fn test_resource_links_max_five_constraint() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "ed_test");

        for i in 1..=5 {
            let link = ResourceLink {
                id: format!("link_{}", i),
                edition_id: "ed_test".to_string(),
                title: format!("Recurso {}", i),
                url: format!("https://drive.google.com/file/{}", i),
                link_type: "drive".to_string(),
                sort_order: i,
                created_at: Utc::now().to_rfc3339(),
            };
            assert!(insert_resource_link(&conn, &link).is_ok());
        }

        // Intento de 6º enlace debe fallar
        let sixth_link = ResourceLink {
            id: "link_6".to_string(),
            edition_id: "ed_test".to_string(),
            title: "Recurso 6 Excedente".to_string(),
            url: "https://youtube.com/watch?v=123".to_string(),
            link_type: "youtube".to_string(),
            sort_order: 6,
            created_at: Utc::now().to_rfc3339(),
        };
        let err = insert_resource_link(&conn, &sixth_link);
        assert!(err.is_err());

        let list = list_resource_links_for_edition(&conn, "ed_test").unwrap();
        assert_eq!(list.len(), 5);
    }

    #[test]
    fn test_meeting_headcount_recording_aggregate() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "ed_test");

        let hc = MeetingHeadcount {
            id: "hc_01".to_string(),
            edition_id: "ed_test".to_string(),
            meeting_date: "2026-10-01".to_string(),
            attendee_count: 14,
            range_bin: Some(AttendanceRangeBin::Range11To15),
            mood_pulse: Some(MeetingMoodPulse::Edifying),
            did_meet: true,
            notes: Some("Excelente tiempo de oración".to_string()),
            reported_by_user_id: "author_test".to_string(),
            created_at: Utc::now().to_rfc3339(),
        };

        insert_meeting_headcount(&conn, &hc).unwrap();

        let list = list_headcount_for_edition(&conn, "ed_test").unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].attendee_count, 14);
        assert!(list[0].did_meet);
    }

    #[test]
    fn test_edition_clone_draft_lineage() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();

        // Crear season origen y destino
        conn.execute(
            "INSERT OR IGNORE INTO campus (id, organization_id, nombre_publico, ciudad, slug, created_at, updated_at) VALUES ('c1', 'o1', 'Campus C1', 'Durango', 'durango-c1', '2026-09-01', '2026-09-01')",
            [],
        ).unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO season (id, campus_id, nombre_publico, fecha_inicio, fecha_fin, estado, created_at, updated_at) VALUES ('season_fall_2026', 'c1', 'Otoño', '2026-09-01', '2026-12-20', 'en_curso', '2026-09-01', '2026-09-01')",
            [],
        ).unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO season (id, campus_id, nombre_publico, fecha_inicio, fecha_fin, estado, created_at, updated_at) VALUES ('season_winter_2027', 'c1', 'Invierno', '2027-01-10', '2027-04-10', 'convocatoria', '2026-09-01', '2026-09-01')",
            [],
        ).unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO member (id, organization_id, nombre_visible, estado, created_at, updated_at) VALUES ('mem_carlos', 'o1', 'Carlos', 'activo', '2026-09-01', '2026-09-01')",
            [],
        ).unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO member (id, organization_id, nombre_visible, estado, created_at, updated_at) VALUES ('mem_pedro', 'o1', 'Pedro', 'activo', '2026-09-01', '2026-09-01')",
            [],
        ).unwrap();

        // Crear edición origen
        let edition = Edition {
            id: "ed_source".to_string(),
            season_id: "season_fall_2026".to_string(),
            created_from_template_id: None,
            nombre_publico: "Matrimonios Fuertes".to_string(),
            proposito: "Fortalecer el pacto".to_string(),
            affinity_id: "aff_matrimonios".to_string(),
            portada_asset_id: None,
            dia_habitual: 5,
            hora_habitual: "20:00".to_string(),
            cupo_orientativo: 15,
            responsible_member_id: "mem_carlos".to_string(),
            public_responsible_visibility: true,
            estado: EditionState::Reconocida,
            is_full: false,
            aviso_breve: None,
            whatsapp_chat_url: None,
            logistics_version: 1,
            modality: GroupModality::Residential,
            cell_accent: None,
            transit_friendly: false,
            carpool_available: false,
            macro_zone: Some("Centro".to_string()),
            campus_id: Some("campus_durango".to_string()),
            consecutive_seasons_hosted: 1,
            venue_nature: VenueNature::Home,
            good_neighbor_pledge: true,
            child_safeguarding_certified: true,
            parent_group_id: None,
            liaison_name: None,
            liaison_role: None,
            access_protocol: None,
        };
        let template = MeetingTemplate {
            weekday: 5,
            time: "20:00".to_string(),
            venue_type: VenueType::PrivateHome,
            zone_id: None,
            public_location_name: None,
            public_location_url: None,
            private_reference: Some("Col. Jardines".to_string()),
            private_address: Some("Calle Laurel 204".to_string()),
            host_reference: Some("Familia Soto".to_string()),
            host_phone: Some("6181112233".to_string()),
            apprentice_id: None,
            kids_welcome: true,
            kids_space_type: "shared_living".to_string(),
            rsvp_cutoff_hours: 4,
        };
        insert_edition(&conn, &edition, &template).unwrap();

        // Miembro en origen
        let m = Membership {
            id: "m_01".to_string(),
            member_id: "mem_pedro".to_string(),
            edition_id: "ed_source".to_string(),
            status: MembershipState::Activa,
            contact_visibility: "hidden".to_string(),
            created_at: Utc::now(),
            closed_at: None,
        };
        create_membership(&conn, &m).unwrap();

        // Clonar a borrador
        let new_ed_id = clone_edition_to_draft(&conn, "ed_source", Some("season_winter_2027"), "replicated").unwrap();
        assert_ne!(new_ed_id, "ed_source");

        // Verificar que la nueva edición está en borrador y NO tiene miembros
        let mut stmt = conn.prepare("SELECT estado, season_id FROM edition WHERE id = ?1").unwrap();
        let (estado_str, season_id): (String, String) = stmt.query_row(params![new_ed_id], |r| Ok((r.get(0)?, r.get(1)?))).unwrap();
        assert_eq!(estado_str, "borrador");
        assert_eq!(season_id, "season_winter_2027");

        let mut m_stmt = conn.prepare("SELECT COUNT(*) FROM membership WHERE edition_id = ?1").unwrap();
        let m_count: i64 = m_stmt.query_row(params![new_ed_id], |r| r.get(0)).unwrap();
        assert_eq!(m_count, 0); // 0 inscritos arrastrados

        // Verificar linaje
        let mut l_stmt = conn.prepare("SELECT previous_edition_id, lineage_type FROM edition_lineage WHERE new_edition_id = ?1").unwrap();
        let (prev_id, l_type): (String, String) = l_stmt.query_row(params![new_ed_id], |r| Ok((r.get(0)?, r.get(1)?))).unwrap();
        assert_eq!(prev_id, "ed_source");
        assert_eq!(l_type, "replicated");
    }

    #[test]
    fn test_notice_purge_retention() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "ed1");

        let old_date = (Utc::now() - chrono::Duration::days(200)).to_rfc3339();
        let fresh_date = Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO notice (id, edition_id, author_id, titulo, contenido, es_fijado, created_at, updated_at) VALUES ('n1', 'ed1', 'author_test', 'Aviso Viejo', 'Texto', 0, ?1, ?1)",
            params![old_date],
        ).unwrap();

        conn.execute(
            "INSERT INTO notice (id, edition_id, author_id, titulo, contenido, es_fijado, created_at, updated_at) VALUES ('n2', 'ed1', 'author_test', 'Aviso Nuevo', 'Texto', 0, ?1, ?1)",
            params![fresh_date],
        ).unwrap();

        let purged = purge_expired_notices(&conn, 180).unwrap();
        assert_eq!(purged, 1);

        let mut stmt = conn.prepare("SELECT id FROM notice").unwrap();
        let remaining: Vec<String> = stmt.query_map([], |r| r.get(0)).unwrap().map(|r| r.unwrap()).collect();
        assert_eq!(remaining, vec!["n2"]);
    }

    #[test]
    fn test_prayer_needs_crud_and_categories() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "ed_prayer");

        let p1 = PrayerNeed {
            id: "prayer_1".to_string(),
            edition_id: "ed_prayer".to_string(),
            author_id: "author_test".to_string(),
            author_name: "Líder Test".to_string(),
            category: PrayerCategory::Salud,
            public_tag: "[Salud] Salud familiar".to_string(),
            is_answered: false,
            created_at: Utc::now().to_rfc3339(),
        };
        let p2 = PrayerNeed {
            id: "prayer_2".to_string(),
            edition_id: "ed_prayer".to_string(),
            author_id: "author_test".to_string(),
            author_name: "Líder Test".to_string(),
            category: PrayerCategory::Trabajo,
            public_tag: "[Trabajo] Empleo".to_string(),
            is_answered: true,
            created_at: Utc::now().to_rfc3339(),
        };

        insert_prayer_need(&conn, &p1).unwrap();
        insert_prayer_need(&conn, &p2).unwrap();

        // Verificación comunitaria: todos los miembros ven los motivos de oración sin secretos en BD
        let list = list_prayer_needs_for_edition(&conn, "ed_prayer").unwrap();
        assert_eq!(list.len(), 2);
        assert_eq!(list[1].public_tag, "[Salud] Salud familiar");
        assert_eq!(list[0].public_tag, "[Trabajo] Empleo");
    }

    #[test]
    fn test_safeguard_alerts_triage() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "ed_safe");

        let alert = SafeguardAlert {
            id: "alert_1".to_string(),
            edition_id: "ed_safe".to_string(),
            reporter_id: "author_test".to_string(),
            reporter_name: "Líder Test".to_string(),
            urgency_level: "critical".to_string(),
            status: "pending".to_string(),
            created_at: Utc::now().to_rfc3339(),
        };

        insert_safeguard_alert(&conn, &alert).unwrap();

        let alerts = list_safeguard_alerts(&conn).unwrap();
        assert_eq!(alerts.len(), 1);
        assert_eq!(alerts[0].urgency_level, "critical");
        assert_eq!(alerts[0].status, "pending");
    }

    #[test]
    fn test_restricted_pairing_anti_collision() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();

        let pairing = RestrictedPairing {
            id: "pair_1".to_string(),
            phone_a: "+526181112233".to_string(),
            phone_b: "+526189998877".to_string(),
            reason_category: "consejería".to_string(),
            created_at: Utc::now().to_rfc3339(),
        };

        insert_restricted_pairing(&conn, &pairing).unwrap();

        // Debe detectar restricción en ambos sentidos
        assert!(is_pairing_restricted(&conn, "+526181112233", "+526189998877").unwrap());
        assert!(is_pairing_restricted(&conn, "+526189998877", "+526181112233").unwrap());
        // No restringido
        assert!(!is_pairing_restricted(&conn, "+526181112233", "+526180000000").unwrap());
    }

    #[test]
    fn test_meeting_rsvp_and_catering_lock() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "ed_rsvp");

        conn.execute(
            "INSERT INTO member (id, organization_id, nombre_visible, estado, created_at, updated_at) VALUES ('mem_2', 'org_test', 'Miembro 2', 'activo', '2026-09-01', '2026-09-01')",
            [],
        ).unwrap();

        // 2 miembros confirman asistencia
        let r1 = MeetingRsvp {
            id: "rsvp_1".to_string(),
            edition_id: "ed_rsvp".to_string(),
            meeting_date: "2026-10-01".to_string(),
            member_id: "author_test".to_string(),
            status: "attending".to_string(),
            created_at: Utc::now().to_rfc3339(),
        };
        let r2 = MeetingRsvp {
            id: "rsvp_2".to_string(),
            edition_id: "ed_rsvp".to_string(),
            meeting_date: "2026-10-01".to_string(),
            member_id: "mem_2".to_string(),
            status: "attending".to_string(),
            created_at: Utc::now().to_rfc3339(),
        };

        upsert_meeting_rsvp(&conn, &r1).unwrap();
        upsert_meeting_rsvp(&conn, &r2).unwrap();

        let count = get_catering_headcount(&conn, "ed_rsvp", "2026-10-01").unwrap();
        assert_eq!(count, 2);

        // Miembro 2 cambia a not_attending
        let r2_updated = MeetingRsvp {
            id: "rsvp_2".to_string(),
            edition_id: "ed_rsvp".to_string(),
            meeting_date: "2026-10-01".to_string(),
            member_id: "mem_2".to_string(),
            status: "not_attending".to_string(),
            created_at: Utc::now().to_rfc3339(),
        };
        upsert_meeting_rsvp(&conn, &r2_updated).unwrap();

        let count_after = get_catering_headcount(&conn, "ed_rsvp", "2026-10-01").unwrap();
        assert_eq!(count_after, 1);
    }

    #[test]
    fn test_nomadic_itinerary_multi_venue() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "ed_taquerias");

        let v1 = SessionVenue {
            id: "v1".to_string(),
            edition_id: "ed_taquerias".to_string(),
            week_number: 1,
            venue_name: "Taquería El Pastorcito".to_string(),
            address: "Blvd. Durango 102".to_string(),
            maps_url: Some("https://maps.google.com/?q=pastorcito".to_string()),
            notes: Some("Llevar efectivo".to_string()),
            venue_type: VenueType::PublicVenue,
            host_name: None,
            host_phone: None,
            created_at: Utc::now().to_rfc3339(),
        };
        let v2 = SessionVenue {
            id: "v2".to_string(),
            edition_id: "ed_taquerias".to_string(),
            week_number: 2,
            venue_name: "Casa Familia Ramírez".to_string(),
            address: "Calle Hidalgo 312".to_string(),
            maps_url: Some("https://maps.google.com/?q=hidalgo312".to_string()),
            notes: Some("Timbre blanco, portón negro".to_string()),
            venue_type: VenueType::PrivateHome,
            host_name: Some("Carlos y Martha Ramírez".to_string()),
            host_phone: Some("+526181112233".to_string()),
            created_at: Utc::now().to_rfc3339(),
        };

        insert_session_venue(&conn, &v1).unwrap();
        insert_session_venue(&conn, &v2).unwrap();

        let list = list_session_venues_for_edition(&conn, "ed_taquerias").unwrap();
        assert_eq!(list.len(), 2);
        assert_eq!(list[0].week_number, 1);
        assert_eq!(list[0].venue_name, "Taquería El Pastorcito");
        assert_eq!(list[0].venue_type, VenueType::PublicVenue);

        // Semana 2: Casa particular rotativa
        assert_eq!(list[1].week_number, 2);
        assert_eq!(list[1].venue_name, "Casa Familia Ramírez");
        assert_eq!(list[1].venue_type, VenueType::PrivateHome);
        assert_eq!(list[1].host_name.as_deref(), Some("Carlos y Martha Ramírez"));

        // Verificación de privacidad polimórfica para visitantes vs miembros
        let masked = list[1].scoped_for_viewer(false);
        assert!(!masked.address.contains("Calle Hidalgo 312"));
        assert!(masked.maps_url.is_none());
        assert!(masked.host_phone.is_none());

        let unmasked = list[1].scoped_for_viewer(true);
        assert_eq!(unmasked.address, "Calle Hidalgo 312");
        assert!(unmasked.maps_url.is_some());
        assert_eq!(unmasked.host_phone.as_deref(), Some("+526181112233"));
    }

    #[test]
    fn test_pastoral_broadcast_and_church_configuration() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();

        // 1. Configuración por defecto y customización
        let default_config = get_church_configuration(&conn).unwrap();
        assert_eq!(default_config.brand_palette_id, "navy");
        assert_eq!(default_config.nomenclature.leader_title, "Facilitador");

        let mut custom_config = default_config.clone();
        custom_config.brand_palette_id = "forest".to_string();
        custom_config.nomenclature.campus_singular = "Comunidad".to_string();
        upsert_church_configuration(&conn, &custom_config).unwrap();

        let saved = get_church_configuration(&conn).unwrap();
        assert_eq!(saved.brand_palette_id, "forest");
        assert_eq!(saved.nomenclature.campus_singular, "Comunidad");

        // 2. Comunicado Pastoral Masivo Unidireccional
        let broadcast = PastoralBroadcast {
            id: "b1".to_string(),
            sender_id: "pastor_josh".to_string(),
            sender_name: "Pastor Josh".to_string(),
            title: "Directriz Litúrgica".to_string(),
            message: "Orar por los enfermos en la cena".to_string(),
            priority: "liturgical".to_string(),
            is_active: true,
            created_at: Utc::now().to_rfc3339(),
        };
        insert_pastoral_broadcast(&conn, &broadcast).unwrap();

        let active = list_active_pastoral_broadcasts(&conn).unwrap();
        assert_eq!(active.len(), 1);
        assert_eq!(active[0].title, "Directriz Litúrgica");
    }

    #[test]
    fn test_veto_and_discipline() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "ed_veto");

        // Veto de edición
        veto_edition(&conn, "ed_veto").unwrap();
        let mut stmt = conn.prepare("SELECT estado, aviso_breve FROM edition WHERE id = ?1").unwrap();
        let (estado, aviso): (String, Option<String>) = stmt.query_row(params!["ed_veto"], |r| Ok((r.get(0)?, r.get(1)?))).unwrap();
        assert_eq!(estado, "cerrada");
        assert_eq!(aviso.as_deref(), Some("Edición suspendida por Veto Pastoral"));

        // Crear membresía para author_test para probar disciplina
        let mem = Membership {
            id: "mem_veto_1".to_string(),
            member_id: "author_test".to_string(),
            edition_id: "ed_veto".to_string(),
            status: MembershipState::Activa,
            contact_visibility: "hidden".to_string(),
            created_at: Utc::now(),
            closed_at: None,
        };
        create_membership(&conn, &mem).unwrap();

        // Disciplina de miembro
        discipline_member(&conn, "author_test").unwrap();
        let mut m_stmt = conn.prepare("SELECT estado FROM member WHERE id = ?1").unwrap();
        let m_estado: String = m_stmt.query_row(params!["author_test"], |r| r.get(0)).unwrap();
        assert_eq!(m_estado, "disciplinado");

        let mut mem_stmt = conn.prepare("SELECT status FROM membership WHERE member_id = ?1").unwrap();
        let mem_status: String = mem_stmt.query_row(params!["author_test"], |r| r.get(0)).unwrap();
        assert_eq!(mem_status, "revocada");
    }

    #[test]
    fn test_discipleship_stage_progression_and_endorsement() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "ed_disciple");

        // 1. Initial track as Observer
        let track = DiscipleshipTrack {
            id: "track_1".to_string(),
            group_id: "ed_disciple".to_string(),
            disciple_name: "Mateo Aprendiz".to_string(),
            stage: DiscipleshipStage::Observer,
            seasons_completed: 1,
            endorsed_for_launch: false,
            endorsed_at: None,
            updated_at: Utc::now().to_rfc3339(),
        };
        upsert_discipleship_track(&conn, &track).unwrap();

        let retrieved = get_discipleship_track(&conn, "ed_disciple").unwrap().unwrap();
        assert_eq!(retrieved.disciple_name, "Mateo Aprendiz");
        assert_eq!(retrieved.stage, DiscipleshipStage::Observer);
        assert!(!retrieved.endorsed_for_launch);

        // 2. Advance to Co-Facilitator
        let mut track_v2 = retrieved;
        track_v2.stage = DiscipleshipStage::CoFacilitator;
        track_v2.seasons_completed = 2;
        upsert_discipleship_track(&conn, &track_v2).unwrap();

        // 3. Week 10 Endorsement by Facilitator
        let endorsed = endorse_disciple_for_launch(&conn, "ed_disciple").unwrap();
        assert_eq!(endorsed.stage, DiscipleshipStage::ReadyForLaunch);
        assert!(endorsed.endorsed_for_launch);
        assert!(endorsed.endorsed_at.is_some());
    }

    #[test]
    fn test_deacon_care_cluster_scoping() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "ed_deacon_1");
        create_test_fixtures(&conn, "ed_deacon_2");

        conn.execute(
            "INSERT OR IGNORE INTO member (id, organization_id, nombre_visible, estado, created_at, updated_at) VALUES ('deacon_esteban', 'org_test', 'Esteban Diácono', 'activo', '2026-09-01', '2026-09-01')",
            [],
        ).unwrap();

        // Diácono Esteban asignado a ed_deacon_1 pero no a ed_deacon_2
        assign_deacon_to_group(&conn, "deacon_esteban", "Esteban Servidor", "ed_deacon_1").unwrap();

        let groups = list_deacon_groups(&conn, "deacon_esteban").unwrap();
        assert_eq!(groups.len(), 1);
        assert_eq!(groups[0].0.id, "ed_deacon_1");

        // Registro de llamada fraternal
        let log = DeaconContactLog {
            id: "dlog_1".to_string(),
            deacon_id: "deacon_esteban".to_string(),
            group_id: "ed_deacon_1".to_string(),
            contact_type: "call".to_string(),
            notes: "Llamada de ánimo al facilitador; todo en orden litúrgico.".to_string(),
            created_at: Utc::now().to_rfc3339(),
        };
        insert_deacon_contact_log(&conn, &log).unwrap();

        let logs = list_deacon_contact_logs(&conn, "deacon_esteban").unwrap();
        assert_eq!(logs.len(), 1);
        assert_eq!(logs[0].contact_type, "call");
    }

    #[test]
    fn test_configurable_season_duration_weeks() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();

        // Default 12 weeks
        let config = get_church_configuration(&conn).unwrap();
        assert_eq!(config.season_duration_weeks, 12);

        // Update to 10 weeks
        let mut custom = config;
        custom.season_duration_weeks = 10;
        upsert_church_configuration(&conn, &custom).unwrap();

        let saved = get_church_configuration(&conn).unwrap();
        assert_eq!(saved.season_duration_weeks, 10);
    }

    #[test]
    fn test_formal_pastoral_deviation_reporting_privacy() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "ed_dev_test");

        let dev = PastoralDeviation {
            id: "dev_01".to_string(),
            group_id: "ed_dev_test".to_string(),
            reporter_member_id: "author_test".to_string(),
            category: "unhealthy_atmosphere".to_string(),
            comments: "Comentarios que generaron tensión innecesaria durante la dinámica.".to_string(),
            status: "pending".to_string(),
            sla_deadline: Some("2026-10-01T12:00:00Z".to_string()),
            assigned_elder_id: None,
            created_at: Utc::now().to_rfc3339(),
        };
        insert_pastoral_deviation(&conn, &dev).unwrap();

        let list = list_pastoral_deviations(&conn, Some("ed_dev_test")).unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].status, "pending");

        // Resuelto con gracia pastoral
        resolve_pastoral_deviation(&conn, "dev_01").unwrap();
        let resolved_list = list_pastoral_deviations(&conn, Some("ed_dev_test")).unwrap();
        assert_eq!(resolved_list[0].status, "resolved");
    }

    #[test]
    fn test_season_closure_fraternal_decision() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "ed_closure_test");

        let closure = SeasonClosure {
            id: "close_01".to_string(),
            group_id: "ed_closure_test".to_string(),
            season_name: "Otoño 2026".to_string(),
            closure_decision: SeasonClosureDecision::MultiplyWithDisciple,
            disciple_new_group_name: Some("Comunidad Poniente Gracia".to_string()),
            notes: "Cierre festivo en restaurante de tacos; acordamos enviar a Mateo con 4 hermanos.".to_string(),
            created_at: Utc::now().to_rfc3339(),
        };
        record_season_closure(&conn, &closure).unwrap();

        let retrieved = get_season_closure(&conn, "ed_closure_test", "Otoño 2026").unwrap().unwrap();
        assert_eq!(retrieved.closure_decision, SeasonClosureDecision::MultiplyWithDisciple);
        assert_eq!(retrieved.disciple_new_group_name.as_deref(), Some("Comunidad Poniente Gracia"));
    }

    #[test]
    fn test_service_ministry_enrollment() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();

        let min = ServiceMinistry {
            id: "min_atrium".to_string(),
            name: "Hospitalidad en el Atrio Dominical".to_string(),
            description: "Recepción y bienvenida a nuevos visitantes el primer día de la semana.".to_string(),
            category: "welcome_atrium".to_string(),
            leader_name: "Don Esteban Ríos".to_string(),
            active: true,
        };
        insert_service_ministry(&conn, &min).unwrap();

        let list = list_service_ministries(&conn).unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].category, "welcome_atrium");

        let enr = MinistryEnrollment {
            id: "enr_01".to_string(),
            ministry_id: "min_atrium".to_string(),
            member_name: "Hna. Josefina (Fundadora)".to_string(),
            member_phone: "+526189990011".to_string(),
            notes: Some("Desea servir en la mesa de café los domingos por la mañana.".to_string()),
            created_at: Utc::now().to_rfc3339(),
        };
        enroll_in_service_ministry(&conn, &enr).unwrap();

        let enrollments = list_ministry_enrollments(&conn, "min_atrium").unwrap();
        assert_eq!(enrollments.len(), 1);
        assert_eq!(enrollments[0].member_name, "Hna. Josefina (Fundadora)");
    }

    #[test]
    fn test_eldership_councils_and_deacon_roundtables() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();

        // 1. Crear Consejo de Presbiterio (GOLD-273)
        let council = EldershipCouncil {
            id: "council_poniente".to_string(),
            macro_zone: "Poniente".to_string(),
            name: "Consejo Presbiteral Durango Poniente".to_string(),
            leader_name: "Bernabé Sandoval".to_string(),
            active_deacon_count: 12,
            created_at: Utc::now().to_rfc3339(),
        };
        insert_eldership_council(&conn, &council).unwrap();

        let councils = list_eldership_councils(&conn).unwrap();
        assert_eq!(councils.len(), 1);
        assert_eq!(councils[0].macro_zone, "Poniente");

        // 2. Asignar diácono a anciano
        let assignment = ElderAssignment {
            id: "asgn_01".to_string(),
            council_id: "council_poniente".to_string(),
            elder_id: "usr_elder_bernabé".to_string(),
            elder_name: "Bernabé Sandoval".to_string(),
            deacon_id: "usr_deacon_mateo".to_string(),
            created_at: Utc::now().to_rfc3339(),
        };
        insert_elder_assignment(&conn, &assignment).unwrap();

        let deacons = list_elder_deacons(&conn, "usr_elder_bernabé").unwrap();
        assert_eq!(deacons.len(), 1);
        assert_eq!(deacons[0].deacon_id, "usr_deacon_mateo");

        // 3. Mesa Redonda de Cuidado Diaconal
        let roundtable = DeaconCareRoundtable {
            id: "rt_01".to_string(),
            council_id: "council_poniente".to_string(),
            elder_id: "usr_elder_bernabé".to_string(),
            attended_deacon_count: 8,
            notes: "Cuidado pastoral y oración por el desgaste de líderes".to_string(),
            created_at: Utc::now().to_rfc3339(),
        };
        record_deacon_care_roundtable(&conn, &roundtable).unwrap();

        let roundtables = list_deacon_care_roundtables(&conn, Some("council_poniente")).unwrap();
        assert_eq!(roundtables.len(), 1);
        assert_eq!(roundtables[0].attended_deacon_count, 8);
    }

    #[test]
    fn test_multi_campus_catalog_and_atrium() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();

        let campus = Campus {
            id: "camp_dgo_sur".to_string(),
            organization_id: "org_amorygracia".to_string(),
            nombre_publico: "Pórtico Sur Durango".to_string(),
            ciudad: "Durango".to_string(),
            slug: "durango-sur".to_string(),
            sort_order: 3,
            timezone: "America/Monterrey".to_string(),
            status: "active".to_string(),
            address: Some("Prolongación Pino Suárez 800".to_string()),
            macro_zone: Some("Sur".to_string()),
            capacity_per_service: Some(1500),
            pastor_name: Some("Pr. David Morales".to_string()),
            atrium_welcome_lead: Some("Hna. Claudia Soto".to_string()),
        };
        insert_campus(&conn, &campus).unwrap();

        let found = get_campus_by_id(&conn, "camp_dgo_sur").unwrap().unwrap();
        assert_eq!(found.nombre_publico, "Pórtico Sur Durango");
        assert_eq!(found.atrium_welcome_lead.as_deref(), Some("Hna. Claudia Soto"));
        assert_eq!(found.capacity_per_service, Some(1500));
    }

    #[test]
    fn test_host_sabbatical_and_fatigue_radar() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "gp_matrimonios_sur");

        let sabbatical = HostSabbatical {
            id: "sab_01".to_string(),
            group_id: "gp_matrimonios_sur".to_string(),
            host_name: "Roberto Gómez".to_string(),
            consecutive_seasons: 2,
            is_on_sabbatical: true,
            sabbatical_reason: Some("Descanso bienal para la familia".to_string()),
            next_eligible_season: Some("Primavera 2027".to_string()),
            created_at: Utc::now().to_rfc3339(),
        };
        record_host_sabbatical(&conn, &sabbatical).unwrap();

        let sabbaticals = list_host_sabbaticals(&conn, Some("gp_matrimonios_sur")).unwrap();
        assert_eq!(sabbaticals.len(), 1);
        assert_eq!(sabbaticals[0].consecutive_seasons, 2);
        assert!(sabbaticals[0].is_on_sabbatical);

        let radar = get_fatigue_radar(&conn).unwrap();
        assert_eq!(radar.len(), 1);
    }

    #[test]
    fn test_emeritus_guardians_order() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();

        let guardian = EmeritusGuardian {
            id: "em_01".to_string(),
            member_id: "mem_elena_rostova".to_string(),
            member_name: "Elena Rostova (Fundadora)".to_string(),
            original_join_year: 2004,
            ministry_role: "atrium_dean".to_string(),
            commissioned_by: "Pr. Josh Morales".to_string(),
            commissioned_at: Utc::now().to_rfc3339(),
        };
        insert_emeritus_guardian(&conn, &guardian).unwrap();

        let guardians = list_emeritus_guardians(&conn).unwrap();
        assert_eq!(guardians.len(), 1);
        assert_eq!(guardians[0].original_join_year, 2004);
    }

    #[test]
    fn test_curated_curriculum_and_diaconal_visits() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "gp_jovenes_centro");

        let curr = CuratedCurriculum {
            id: "curr_w4".to_string(),
            season_name: "Otoño 2026".to_string(),
            week_number: 4,
            title: "Hospitalidad Radical sin Desgaste".to_string(),
            scripture_passage: "1 Pedro 4:8-10".to_string(),
            video_prompt_url: "https://portico.church/curriculum/w4-video.mp4".to_string(),
            pair_share_question: "¿Cómo discernir el límite entre servicio y fatiga?".to_string(),
            pastoral_notes: "Orar por los anfitriones del hogar".to_string(),
            created_at: Utc::now().to_rfc3339(),
        };
        insert_curated_curriculum(&conn, &curr).unwrap();

        let active = get_active_curated_curriculum(&conn, Some(4)).unwrap().unwrap();
        assert_eq!(active.title, "Hospitalidad Radical sin Desgaste");

        let visit = DiaconalVisit {
            id: "dv_01".to_string(),
            deacon_id: "usr_mateo_silva".to_string(),
            deacon_name: "Mateo Silva".to_string(),
            group_id: "gp_jovenes_centro".to_string(),
            visited_at: "2026-10-15".to_string(),
            atmosphere_pulse: "peaceful".to_string(),
            notes: "Grupo floreciendo en sana doctrina y armonía con vecinos.".to_string(),
        };
        record_diaconal_visit(&conn, &visit).unwrap();

        let visits = list_diaconal_visits(&conn, Some("gp_jovenes_centro")).unwrap();
        assert_eq!(visits.len(), 1);
        assert_eq!(visits[0].atmosphere_pulse, "peaceful");
    }

    #[test]
    fn test_neighborhood_complaints_civic_desk() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();

        let complaint = NeighborhoodComplaint {
            id: "nc_01".to_string(),
            group_id: Some("gp_matrimonios_oriente".to_string()),
            colonia_name: "Colonia Silvestre Dorador".to_string(),
            reporter_contact: Some("+526181234567".to_string()),
            category: "parking".to_string(),
            comments: "Vehículos estacionados frente a cochera privada".to_string(),
            status: "pending".to_string(),
            sla_deadline: (Utc::now() + chrono::Duration::hours(24)).to_rfc3339(),
            resolution_notes: None,
            created_at: Utc::now().to_rfc3339(),
        };
        insert_neighborhood_complaint(&conn, &complaint).unwrap();

        let list = list_neighborhood_complaints(&conn, Some("pending")).unwrap();
        assert_eq!(list.len(), 1);

        resolve_neighborhood_complaint(
            &conn,
            "nc_01",
            "Diácono coordinó con anfitrión para liberar acceso a cocheras y entregó carta de disculpa."
        ).unwrap();

        let resolved = list_neighborhood_complaints(&conn, Some("resolved")).unwrap();
        assert_eq!(resolved.len(), 1);
        assert_eq!(resolved[0].status, "resolved");
    }

    #[test]
    fn test_dunbar_cell_fission_with_seed_nucleus() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();
        create_test_fixtures(&conn, "gp_durango_fission_parent");

        conn.execute(
            "INSERT OR IGNORE INTO member (id, organization_id, nombre_visible, estado, created_at, updated_at) VALUES ('usr_disciple_carlos', 'org_test', 'Carlos Hernández', 'activo', '2026-09-01', '2026-09-01')",
            [],
        ).unwrap();
        for mem_id in &["mem_s1", "mem_s2", "mem_s3"] {
            conn.execute(
                "INSERT OR IGNORE INTO member (id, organization_id, nombre_visible, estado, created_at, updated_at) VALUES (?1, 'org_test', 'Miembro Semilla', 'activo', '2026-09-01', '2026-09-01')",
                params![mem_id],
            ).unwrap();
            conn.execute(
                "INSERT INTO membership (id, member_id, edition_id, status, contact_visibility, created_at) VALUES (?1, ?2, 'gp_durango_fission_parent', 'activa', 'edition_members', '2026-09-01T00:00:00Z')",
                params![format!("m_{}", mem_id), mem_id],
            ).unwrap();
        }

        // 11 miembros que permanecen en el grupo padre tras la fisión saludable
        for i in 1..=11 {
            let pid = format!("mem_parent_{}", i);
            conn.execute(
                "INSERT OR IGNORE INTO member (id, organization_id, nombre_visible, estado, created_at, updated_at) VALUES (?1, 'org_test', 'Hermano Local', 'activo', '2026-09-01', '2026-09-01')",
                params![pid],
            ).unwrap();
            conn.execute(
                "INSERT INTO membership (id, member_id, edition_id, status, contact_visibility, created_at) VALUES (?1, ?2, 'gp_durango_fission_parent', 'activa', 'edition_members', '2026-09-01T00:00:00Z')",
                params![format!("m_{}", pid), pid],
            ).unwrap();
        }

        let nucleus = PlantingSeedNucleus {
            parent_group_id: "gp_durango_fission_parent".to_string(),
            apprentice_id: "usr_disciple_carlos".to_string(),
            apprentice_name: "Carlos Hernández".to_string(),
            seed_member_ids: vec!["mem_s1".to_string(), "mem_s2".to_string(), "mem_s3".to_string()],
            seed_member_names: vec!["Hermano A".to_string(), "Hermana B".to_string(), "Hermano C".to_string()],
            new_group_name: "Comunidad Poniente Sendero".to_string(),
            new_macro_zone: "Poniente".to_string(),
            new_dia_habitual: 4,
            new_hora_habitual: "19:30".to_string(),
        };

        let result = execute_dunbar_fission(&conn, &nucleus).unwrap();
        assert_eq!(result.parent_remaining_count, 11);
        assert_eq!(result.child_initial_count, 4);
        assert!(result.child_group_id.starts_with("fission-"));
    }

    #[test]
    fn test_church_configuration_growth_toggles() {
        let conn = Connection::open_in_memory().unwrap();
        initialize_data_plane(&conn).unwrap();

        let mut config = get_church_configuration(&conn).unwrap();
        assert!(config.enable_deacon_system);
        assert!(config.enable_eldership_system);
        assert_eq!(config.growth_target_members, 25000);

        // Josh configura crecimiento desactivando temporalmente presbiterio
        config.enable_eldership_system = false;
        config.growth_target_members = 30000;
        upsert_church_configuration(&conn, &config).unwrap();

        let updated = get_church_configuration(&conn).unwrap();
        assert!(updated.enable_deacon_system);
        assert!(!updated.enable_eldership_system);
        assert_eq!(updated.growth_target_members, 30000);
    }
}


