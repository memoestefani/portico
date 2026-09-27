use chrono::{NaiveDate, Utc};
use rusqlite::{params, Connection};
use uuid::Uuid;

use crate::db::control_plane::{initialize_control_plane, insert_tenant};
use crate::db::data_plane::{
    assign_deacon_to_group, create_membership, initialize_data_plane, insert_campus, insert_edition,
    insert_meeting_headcount, insert_member, insert_pastoral_broadcast, insert_prayer_need,
    insert_resource_link, insert_restricted_pairing, insert_season, insert_service_ministry,
    insert_session_venue, upsert_church_configuration, upsert_discipleship_track, upsert_meeting_rsvp,
    insert_eldership_council, insert_elder_assignment, record_deacon_care_roundtable,
    record_host_sabbatical, insert_emeritus_guardian, insert_curated_curriculum,
    record_diaconal_visit, insert_neighborhood_complaint,
};
use crate::domain::{
    AgeCategory, AttendanceRangeBin, BiologicalSex, Campus, ChurchConfiguration, ChurchNomenclature, CuratedCurriculum,
    DeaconCareRoundtable, DiaconalVisit, DiscipleshipStage, DiscipleshipTrack,
    Edition, EditionState, ElderAssignment, EldershipCouncil, EmeritusGuardian, GroupModality,
    HostSabbatical, MeetingHeadcount, MeetingMoodPulse, MeetingRsvp, MeetingTemplate, Member,
    Membership, MembershipState, NamingScheme, NeighborhoodComplaint, PastoralBroadcast,
    PrayerCategory, PrayerNeed, ResourceLink, RestrictedPairing, Season,
    SeasonState, ServiceMinistry, SessionVenue, Tenant, VenueNature, VenueType,
};
use crate::error::Result;

pub struct SeedResult {
    pub tenant_a: Tenant,
    pub tenant_b: Tenant,
}

pub fn seed_master_and_tenants(
    master_conn: &Connection,
    data_dir: &std::path::Path,
) -> Result<SeedResult> {
    initialize_control_plane(master_conn)?;

    let tenants_dir = data_dir.join("tenants");
    std::fs::create_dir_all(&tenants_dir).map_err(|e| {
        crate::error::PorticoError::Validation(format!("Cannot create tenants dir: {}", e))
    })?;

    // 1. Tenant A: Amor y Gracia Durango
    let tenant_a_id = Uuid::new_v4().to_string();
    let tenant_a_db_path = tenants_dir.join(format!("{}.db", tenant_a_id));
    let tenant_a = Tenant {
        id: tenant_a_id.clone(),
        slug: "amorygracia".to_string(),
        domain: Some("grupos.amorygracia.mx".to_string()),
        church_name: "Amor y Gracia Durango".to_string(),
        db_path: tenant_a_db_path.to_string_lossy().to_string(),
        license_status: crate::domain::LicenseStatus::Active,
        naming_scheme: NamingScheme::campus(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    insert_tenant(master_conn, &tenant_a)?;

    {
        let conn_a = Connection::open(&tenant_a.db_path)?;
        seed_tenant_a_data(&conn_a)?;
    }

    // 2. Tenant B: Synthetic Church B (Comunidad Betel)
    let tenant_b_id = Uuid::new_v4().to_string();
    let tenant_b_db_path = tenants_dir.join(format!("{}.db", tenant_b_id));
    let tenant_b = Tenant {
        id: tenant_b_id.clone(),
        slug: "comunidadbetel".to_string(),
        domain: None,
        church_name: "Comunidad Cristiana Betel".to_string(),
        db_path: tenant_b_db_path.to_string_lossy().to_string(),
        license_status: crate::domain::LicenseStatus::Active,
        naming_scheme: NamingScheme::iglesia(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    insert_tenant(master_conn, &tenant_b)?;

    {
        let conn_b = Connection::open(&tenant_b.db_path)?;
        seed_tenant_b_data(&conn_b)?;
    }

    Ok(SeedResult {
        tenant_a,
        tenant_b,
    })
}

pub fn seed_tenant_a_data(conn: &Connection) -> Result<()> {
    initialize_data_plane(conn)?;

    let org_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        r#"
        INSERT INTO organization (
            id, nombre_publico, pais, public_domain, responsable_legal_nombre,
            contacto_privacidad, status, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
        "#,
        params![
            org_id,
            "Amor y Gracia Durango",
            "México",
            "amorygracia.mx",
            "Pastor Josh Gayosso",
            "privacidad@amorygracia.mx",
            "active",
            now,
            now
        ],
    )?;

    // 5 Macro-Campus Descentralizados de Durango (GOLD-274)
    let campus_id = Uuid::new_v4().to_string();
    let campus = Campus {
        id: campus_id.clone(),
        organization_id: org_id.clone(),
        nombre_publico: "Campus Central Durango".to_string(),
        ciudad: "Durango".to_string(),
        slug: "durango-centro".to_string(),
        sort_order: 1,
        timezone: "America/Monterrey".to_string(),
        status: "active".to_string(),
        address: Some("Blvd. Dolores del Río 105, Zona Centro, Durango".to_string()),
        macro_zone: Some("Centro".to_string()),
        capacity_per_service: Some(1500),
        pastor_name: Some("Pastor Samuel Gómez".to_string()),
        atrium_welcome_lead: Some("Mateo Valenzuela (Diácono)".to_string()),
    };
    insert_campus(conn, &campus)?;

    let campus_norte = Campus {
        id: Uuid::new_v4().to_string(),
        organization_id: org_id.clone(),
        nombre_publico: "Campus Norte Durango".to_string(),
        ciudad: "Durango".to_string(),
        slug: "durango-norte".to_string(),
        sort_order: 2,
        timezone: "America/Monterrey".to_string(),
        status: "active".to_string(),
        address: Some("Av. Fidel Velázquez 402, Cd. Industrial, Durango".to_string()),
        macro_zone: Some("Norte".to_string()),
        capacity_per_service: Some(1200),
        pastor_name: Some("Pastor Daniel Herrera".to_string()),
        atrium_welcome_lead: Some("Elena Rostova (Servidora)".to_string()),
    };
    insert_campus(conn, &campus_norte)?;

    let campus_sur = Campus {
        id: Uuid::new_v4().to_string(),
        organization_id: org_id.clone(),
        nombre_publico: "Campus Sur Durango".to_string(),
        ciudad: "Durango".to_string(),
        slug: "durango-sur".to_string(),
        sort_order: 3,
        timezone: "America/Monterrey".to_string(),
        status: "active".to_string(),
        address: Some("Prolongación Pino Suárez 1800, Huizache, Durango".to_string()),
        macro_zone: Some("Sur".to_string()),
        capacity_per_service: Some(1200),
        pastor_name: Some("Pastor David Morales".to_string()),
        atrium_welcome_lead: Some("Lucas Silva (Servidor)".to_string()),
    };
    insert_campus(conn, &campus_sur)?;

    let campus_poniente = Campus {
        id: Uuid::new_v4().to_string(),
        organization_id: org_id.clone(),
        nombre_publico: "Campus Poniente Durango".to_string(),
        ciudad: "Durango".to_string(),
        slug: "durango-poniente".to_string(),
        sort_order: 4,
        timezone: "America/Monterrey".to_string(),
        status: "active".to_string(),
        address: Some("Av. Normal 215, Lomas del Parque, Durango".to_string()),
        macro_zone: Some("Poniente".to_string()),
        capacity_per_service: Some(1300),
        pastor_name: Some("Pastor Andrés Vega".to_string()),
        atrium_welcome_lead: Some("Marta Treviño (Servidora)".to_string()),
    };
    insert_campus(conn, &campus_poniente)?;

    let campus_oriente = Campus {
        id: Uuid::new_v4().to_string(),
        organization_id: org_id.clone(),
        nombre_publico: "Campus Oriente Durango".to_string(),
        ciudad: "Durango".to_string(),
        slug: "durango-oriente".to_string(),
        sort_order: 5,
        timezone: "America/Monterrey".to_string(),
        status: "active".to_string(),
        address: Some("Blvd. Francisco Villa 2450, Jardines de Durango".to_string()),
        macro_zone: Some("Oriente".to_string()),
        capacity_per_service: Some(1400),
        pastor_name: Some("Pastor Esteban Ruiz".to_string()),
        atrium_welcome_lead: Some("Mariana Soto (Servidora)".to_string()),
    };
    insert_campus(conn, &campus_oriente)?;


    // Affinities
    let aff_jovenes = Uuid::new_v4().to_string();
    let aff_matrimonios = Uuid::new_v4().to_string();
    let aff_familias = Uuid::new_v4().to_string();
    let aff_universitarios = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO affinity (id, organization_id, nombre_publico, sort_order, status) VALUES (?1, ?2, ?3, 1, 'active')",
        params![aff_jovenes, org_id, "Jóvenes Profesionistas"],
    )?;
    conn.execute(
        "INSERT INTO affinity (id, organization_id, nombre_publico, sort_order, status) VALUES (?1, ?2, ?3, 2, 'active')",
        params![aff_matrimonios, org_id, "Matrimonios"],
    )?;
    conn.execute(
        "INSERT INTO affinity (id, organization_id, nombre_publico, sort_order, status) VALUES (?1, ?2, ?3, 3, 'active')",
        params![aff_familias, org_id, "Familias"],
    )?;
    conn.execute(
        "INSERT INTO affinity (id, organization_id, nombre_publico, sort_order, status) VALUES (?1, ?2, ?3, 4, 'active')",
        params![aff_universitarios, org_id, "Universitarios"],
    )?;

    // Zones
    let zone_centro = Uuid::new_v4().to_string();
    let zone_lomas = Uuid::new_v4().to_string();
    let zone_oriente = Uuid::new_v4().to_string();
    let zone_poniente = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO zone (id, campus_id, label, sort_order, status) VALUES (?1, ?2, 'Zona Centro', 1, 'active')",
        params![zone_centro, campus_id],
    )?;
    conn.execute(
        "INSERT INTO zone (id, campus_id, label, sort_order, status) VALUES (?1, ?2, 'Zona Lomas del Parque', 2, 'active')",
        params![zone_lomas, campus_id],
    )?;
    conn.execute(
        "INSERT INTO zone (id, campus_id, label, sort_order, status) VALUES (?1, ?2, 'Zona Oriente', 3, 'active')",
        params![zone_oriente, campus_id],
    )?;
    conn.execute(
        "INSERT INTO zone (id, campus_id, label, sort_order, status) VALUES (?1, ?2, 'Zona Poniente', 4, 'active')",
        params![zone_poniente, campus_id],
    )?;

    // Active Season: Otoño 2026 (12 weeks: 2026-10-04 to 2026-12-20)
    let season_id = Uuid::new_v4().to_string();
    let season = Season {
        id: season_id.clone(),
        campus_id: campus_id.clone(),
        nombre_publico: "Temporada Otoño 2026".to_string(),
        fecha_inicio: NaiveDate::from_ymd_opt(2026, 10, 4).unwrap(),
        fecha_fin: NaiveDate::from_ymd_opt(2026, 12, 20).unwrap(),
        estado: SeasonState::EnCurso,
    };
    insert_season(conn, &season)?;

    // Past Closed Season: Primavera 2026 (for testing member trajectory memory!)
    let past_season_id = Uuid::new_v4().to_string();
    let past_season = Season {
        id: past_season_id.clone(),
        campus_id: campus_id.clone(),
        nombre_publico: "Temporada Primavera 2026".to_string(),
        fecha_inicio: NaiveDate::from_ymd_opt(2026, 3, 1).unwrap(),
        fecha_fin: NaiveDate::from_ymd_opt(2026, 5, 24).unwrap(),
        estado: SeasonState::Cerrada,
    };
    insert_season(conn, &past_season)?;

    // Members
    let josh_id = Uuid::new_v4().to_string();
    let carlos_id = Uuid::new_v4().to_string();
    let mariana_id = Uuid::new_v4().to_string();
    let roberto_id = Uuid::new_v4().to_string();
    let elena_id = Uuid::new_v4().to_string();
    let david_id = Uuid::new_v4().to_string();
    let sofia_id = Uuid::new_v4().to_string();

    let members = vec![
        Member {
            id: josh_id.clone(),
            organization_id: org_id.clone(),
            nombre_visible: "Pastor Josh".to_string(),
            estado: "activo".to_string(),
            sexo: Some(BiologicalSex::Hombre),
            age_category: Some(AgeCategory::Adulto),
            guardian_id: None,
        },
        Member {
            id: carlos_id.clone(),
            organization_id: org_id.clone(),
            nombre_visible: "Carlos Mendoza".to_string(),
            estado: "activo".to_string(),
            sexo: Some(BiologicalSex::Hombre),
            age_category: Some(AgeCategory::Adulto),
            guardian_id: None,
        },
        Member {
            id: mariana_id.clone(),
            organization_id: org_id.clone(),
            nombre_visible: "Mariana Torres".to_string(),
            estado: "activo".to_string(),
            sexo: Some(BiologicalSex::Mujer),
            age_category: Some(AgeCategory::Adulto),
            guardian_id: None,
        },
        Member {
            id: roberto_id.clone(),
            organization_id: org_id.clone(),
            nombre_visible: "Roberto Gómez".to_string(),
            estado: "activo".to_string(),
            sexo: Some(BiologicalSex::Hombre),
            age_category: Some(AgeCategory::Adulto),
            guardian_id: None,
        },
        Member {
            id: elena_id.clone(),
            organization_id: org_id.clone(),
            nombre_visible: "Elena Ramos".to_string(),
            estado: "activo".to_string(),
            sexo: Some(BiologicalSex::Mujer),
            age_category: Some(AgeCategory::Adulto),
            guardian_id: None,
        },
        Member {
            id: david_id.clone(),
            organization_id: org_id.clone(),
            nombre_visible: "David Soto".to_string(),
            estado: "activo".to_string(),
            sexo: Some(BiologicalSex::Hombre),
            age_category: Some(AgeCategory::Adulto),
            guardian_id: None,
        },
        Member {
            id: sofia_id.clone(),
            organization_id: org_id.clone(),
            nombre_visible: "Sofía Castro".to_string(),
            estado: "activo".to_string(),
            sexo: Some(BiologicalSex::Mujer),
            age_category: Some(AgeCategory::Adulto),
            guardian_id: None,
        },
        Member {
            id: "deacon_mateo".to_string(),
            organization_id: org_id.clone(),
            nombre_visible: "Mateo Valenzuela (Diácono)".to_string(),
            estado: "activo".to_string(),
            sexo: Some(BiologicalSex::Hombre),
            age_category: Some(AgeCategory::Adulto),
            guardian_id: None,
        },
    ];

    for m in &members {
        insert_member(conn, m)?;
    }

    // Credentials / logins
    conn.execute(
        "INSERT INTO credential (id, member_id, type, secret_hash, status, created_at) VALUES (?1, ?2, 'email_pin', ?3, 'active', ?4)",
        params![Uuid::new_v4().to_string(), josh_id, "josh@amorygracia.mx", now],
    )?;
    conn.execute(
        "INSERT INTO credential (id, member_id, type, secret_hash, status, created_at) VALUES (?1, ?2, 'email_pin', ?3, 'active', ?4)",
        params![Uuid::new_v4().to_string(), carlos_id, "carlos@amorygracia.mx", now],
    )?;
    conn.execute(
        "INSERT INTO credential (id, member_id, type, secret_hash, status, created_at) VALUES (?1, ?2, 'email_pin', ?3, 'active', ?4)",
        params![Uuid::new_v4().to_string(), elena_id, "elena@gmail.com", now],
    )?;
    conn.execute(
        "INSERT INTO credential (id, member_id, type, secret_hash, status, created_at) VALUES (?1, ?2, 'email_pin', ?3, 'active', ?4)",
        params![Uuid::new_v4().to_string(), "deacon_mateo", "mateo@amorygracia.mx", now],
    )?;

    // 4 Groups (Editions)
    // Group 1: GP Centro Jóvenes (Private Home, WhatsApp active)
    let gp1_id = Uuid::new_v4().to_string();
    let gp1 = Edition {
        id: gp1_id.clone(),
        season_id: season_id.clone(),
        created_from_template_id: None,
        nombre_publico: "GP Centro Jóvenes".to_string(),
        proposito: "Comunidad de profesionistas jóvenes que buscan crecer en fe y vida cotidiana.".to_string(),
        affinity_id: aff_jovenes.clone(),
        portada_asset_id: None,
        dia_habitual: 4, // Jueves
        hora_habitual: "20:00".to_string(),
        cupo_orientativo: 15,
        responsible_member_id: carlos_id.clone(),
        public_responsible_visibility: true,
        estado: EditionState::Reconocida,
        is_full: false,
        aviso_breve: Some("Traer libreta de apuntes".to_string()),
        whatsapp_chat_url: Some("https://chat.whatsapp.com/sample123".to_string()),
        logistics_version: 1,
        modality: GroupModality::NomadicTour, // Ruta nómada por diseño
        cell_accent: Some("navy".to_string()),
        transit_friendly: true,
        carpool_available: true,
        macro_zone: Some("Centro".to_string()),
        campus_id: Some(campus_id.clone()),
        consecutive_seasons_hosted: 1,
        venue_nature: VenueNature::Home,
        good_neighbor_pledge: true,
        child_safeguarding_certified: true,
        parent_group_id: None,
        liaison_name: None,
        liaison_role: None,
        access_protocol: None,
    };
    let tmpl1 = MeetingTemplate {
        weekday: 4,
        time: "20:00".to_string(),
        venue_type: VenueType::PrivateHome,
        zone_id: Some(zone_centro.clone()),
        public_location_name: Some("Zona Centro".to_string()),
        public_location_url: None,
        private_reference: Some("Timbre blanco con etiqueta GP.".to_string()),
        private_address: Some("Calle Victoria 402, Apt 3, Zona Centro, Durango".to_string()),
        host_reference: Some("Carlos Mendoza".to_string()),
        host_phone: Some("+526181000001".to_string()),
        apprentice_id: Some(david_id.clone()),
        kids_welcome: false,
        kids_space_type: "adults_only".to_string(),
        rsvp_cutoff_hours: 4,
    };
    insert_edition(conn, &gp1, &tmpl1)?;

    // Group 2: GP Lomas Matrimonios (Private Home, NO WhatsApp - purely native!)
    let gp2_id = Uuid::new_v4().to_string();
    let gp2 = Edition {
        id: gp2_id.clone(),
        season_id: season_id.clone(),
        created_from_template_id: None,
        nombre_publico: "GP Lomas Matrimonios".to_string(),
        proposito: "Creciendo juntos como parejas en un ambiente íntimo y seguro.".to_string(),
        affinity_id: aff_matrimonios.clone(),
        portada_asset_id: None,
        dia_habitual: 3, // Miércoles
        hora_habitual: "19:30".to_string(),
        cupo_orientativo: 12,
        responsible_member_id: roberto_id.clone(),
        public_responsible_visibility: true,
        estado: EditionState::Reconocida,
        is_full: false,
        aviso_breve: None,
        whatsapp_chat_url: None, // No WhatsApp! Native Pórtico group
        logistics_version: 1,
        modality: GroupModality::Residential,
        cell_accent: Some("forest".to_string()),
        transit_friendly: false,
        carpool_available: true,
        macro_zone: Some("Poniente".to_string()),
        campus_id: Some(campus_poniente.id.clone()),
        consecutive_seasons_hosted: 2, // Desgaste de anfitrión para disparar advertencia sabática (GOLD-275)
        venue_nature: VenueNature::Home,
        good_neighbor_pledge: true,
        child_safeguarding_certified: true,
        parent_group_id: None,
        liaison_name: None,
        liaison_role: None,
        access_protocol: None,
    };
    let tmpl2 = MeetingTemplate {
        weekday: 3,
        time: "19:30".to_string(),
        venue_type: VenueType::PrivateHome,
        zone_id: Some(zone_lomas.clone()),
        public_location_name: Some("Zona Lomas del Parque".to_string()),
        public_location_url: None,
        private_reference: Some("Estacionamiento disponible frente al parque infantil.".to_string()),
        private_address: Some("Privada de los Cedros 12, Lomas del Parque, Durango".to_string()),
        host_reference: Some("Roberto Gómez".to_string()),
        host_phone: Some("+526181000003".to_string()),
        apprentice_id: None,
        kids_welcome: true,
        kids_space_type: "play_area".to_string(), // Patio y área de juegos para matrimonios jóvenes
        rsvp_cutoff_hours: 4,
    };
    insert_edition(conn, &gp2, &tmpl2)?;

    // Group 3: GP Café & Fe Oriente (Public Venue - Café)
    let gp3_id = Uuid::new_v4().to_string();
    let gp3 = Edition {
        id: gp3_id.clone(),
        season_id: season_id.clone(),
        created_from_template_id: None,
        nombre_publico: "GP Café & Fe Oriente".to_string(),
        proposito: "Estudiantes universitarios compartiendo la palabra con una taza de café.".to_string(),
        affinity_id: aff_universitarios.clone(),
        portada_asset_id: None,
        dia_habitual: 2, // Martes
        hora_habitual: "18:00".to_string(),
        cupo_orientativo: 20,
        responsible_member_id: mariana_id.clone(),
        public_responsible_visibility: true,
        estado: EditionState::Reconocida,
        is_full: false,
        aviso_breve: Some("Nos vemos en la terraza posterior".to_string()),
        whatsapp_chat_url: Some("https://chat.whatsapp.com/sample456".to_string()),
        logistics_version: 1,
        modality: GroupModality::OutdoorActivity,
        cell_accent: Some("sand".to_string()),
        transit_friendly: true,
        carpool_available: false,
        macro_zone: Some("Oriente".to_string()),
        campus_id: Some(campus_oriente.id.clone()),
        consecutive_seasons_hosted: 1,
        venue_nature: VenueNature::CivicCafe,
        good_neighbor_pledge: true,
        child_safeguarding_certified: true,
        parent_group_id: None,
        liaison_name: None,
        liaison_role: None,
        access_protocol: None,
    };
    let tmpl3 = MeetingTemplate {
        weekday: 2,
        time: "18:00".to_string(),
        venue_type: VenueType::PublicVenue,
        zone_id: Some(zone_oriente.clone()),
        public_location_name: Some("Café Central Universitario".to_string()),
        public_location_url: Some("https://maps.google.com/?q=24.0150,-104.6400".to_string()),
        private_reference: None,
        private_address: Some("Av. Universidad 300, Col. Valle del Sur, Durango".to_string()),
        host_reference: Some("Mariana Torres".to_string()),
        host_phone: Some("+526181000002".to_string()),
        apprentice_id: None,
        kids_welcome: false,
        kids_space_type: "shared_living".to_string(),
        rsvp_cutoff_hours: 4,
    };
    insert_edition(conn, &gp3, &tmpl3)?;

    // Add exception for Group 3: Session 4 special meeting at Taquería
    conn.execute(
        r#"
        INSERT INTO meeting_exception (
            id, edition_id, date, status, venue_type, zone_id,
            public_location_name, public_location_url, private_reference,
            private_address, host_reference, note, logistics_version
        ) VALUES (
            ?1, ?2, '2026-10-27', 'scheduled', 'public_venue', ?3,
            'Taquería Los Tarascos', 'https://maps.google.com/?q=24.0180,-104.6450',
            NULL, 'Blvd. Domingo Arrieta 501, Durango', NULL,
            'Noche especial de tacos y convivencia', 2
        )
        "#,
        params![Uuid::new_v4().to_string(), gp3_id, zone_oriente],
    )?;

    // Group 4: GP Online Frontera (Online Session)
    let gp4_id = Uuid::new_v4().to_string();
    let gp4 = Edition {
        id: gp4_id.clone(),
        season_id: season_id.clone(),
        created_from_template_id: None,
        nombre_publico: "GP Online Frontera".to_string(),
        proposito: "Reunión virtual para familias con horarios rotativos o en tránsito.".to_string(),
        affinity_id: aff_familias.clone(),
        portada_asset_id: None,
        dia_habitual: 6, // Sábado
        hora_habitual: "10:00".to_string(),
        cupo_orientativo: 30,
        responsible_member_id: carlos_id.clone(),
        public_responsible_visibility: true,
        estado: EditionState::Reconocida,
        is_full: false,
        aviso_breve: None,
        whatsapp_chat_url: Some("https://chat.whatsapp.com/sampleonline".to_string()),
        logistics_version: 1,
        modality: GroupModality::Residential,
        cell_accent: Some("slate".to_string()),
        transit_friendly: false,
        carpool_available: false,
        macro_zone: Some("Sur".to_string()),
        campus_id: Some(campus_sur.id.clone()),
        consecutive_seasons_hosted: 1,
        venue_nature: VenueNature::CampusRoom,
        good_neighbor_pledge: true,
        child_safeguarding_certified: true,
        parent_group_id: None,
        liaison_name: None,
        liaison_role: None,
        access_protocol: None,
    };
    let tmpl4 = MeetingTemplate {
        weekday: 6,
        time: "10:00".to_string(),
        venue_type: VenueType::OnlineSession,
        zone_id: Some(zone_poniente.clone()),
        public_location_name: Some("Enlace Virtual Zoom".to_string()),
        public_location_url: None,
        private_reference: Some("Código de acceso: 123456".to_string()),
        private_address: Some("https://zoom.us/j/88812345678".to_string()),
        host_reference: Some("Carlos Mendoza".to_string()),
        host_phone: Some("+526181000001".to_string()),
        apprentice_id: None,
        kids_welcome: true,
        kids_space_type: "shared_living".to_string(),
        rsvp_cutoff_hours: 4,
    };
    insert_edition(conn, &gp4, &tmpl4)?;

    // Memberships for Active Season
    create_membership(
        conn,
        &Membership {
            id: Uuid::new_v4().to_string(),
            member_id: carlos_id.clone(),
            edition_id: gp1_id.clone(),
            status: MembershipState::Activa,
            contact_visibility: "edition_members".to_string(),
            created_at: Utc::now(),
            closed_at: None,
        },
    )?;
    create_membership(
        conn,
        &Membership {
            id: Uuid::new_v4().to_string(),
            member_id: elena_id.clone(),
            edition_id: gp1_id.clone(),
            status: MembershipState::Activa,
            contact_visibility: "edition_members".to_string(),
            created_at: Utc::now(),
            closed_at: None,
        },
    )?;
    create_membership(
        conn,
        &Membership {
            id: Uuid::new_v4().to_string(),
            member_id: david_id.clone(),
            edition_id: gp1_id.clone(),
            status: MembershipState::Activa,
            contact_visibility: "hidden".to_string(),
            created_at: Utc::now(),
            closed_at: None,
        },
    )?;
    create_membership(
        conn,
        &Membership {
            id: Uuid::new_v4().to_string(),
            member_id: sofia_id.clone(),
            edition_id: gp3_id.clone(),
            status: MembershipState::Activa,
            contact_visibility: "hidden".to_string(),
            created_at: Utc::now(),
            closed_at: None,
        },
    )?;

    // Past group in Closed Season Primavera 2026 for Elena ("Mi Trayectoria")
    let past_gp_id = Uuid::new_v4().to_string();
    let past_gp = Edition {
        id: past_gp_id.clone(),
        season_id: past_season_id.clone(),
        created_from_template_id: None,
        nombre_publico: "GP Fundamentos Primavera".to_string(),
        proposito: "Estudio de las bases de la fe.".to_string(),
        affinity_id: aff_jovenes.clone(),
        portada_asset_id: None,
        dia_habitual: 4,
        hora_habitual: "20:00".to_string(),
        cupo_orientativo: 15,
        responsible_member_id: carlos_id.clone(),
        public_responsible_visibility: true,
        estado: EditionState::Cerrada,
        is_full: false,
        aviso_breve: None,
        whatsapp_chat_url: None,
        logistics_version: 1,
        modality: GroupModality::Residential,
        cell_accent: None,
        transit_friendly: false,
        carpool_available: false,
        macro_zone: Some("Centro".to_string()),
        campus_id: Some(campus_id.clone()),
        consecutive_seasons_hosted: 1,
        venue_nature: VenueNature::Home,
        good_neighbor_pledge: true,
        child_safeguarding_certified: true,
        parent_group_id: None,
        liaison_name: None,
        liaison_role: None,
        access_protocol: None,
    };
    let past_tmpl = MeetingTemplate {
        weekday: 4,
        time: "20:00".to_string(),
        venue_type: VenueType::PrivateHome,
        zone_id: Some(zone_centro.clone()),
        public_location_name: Some("Zona Centro".to_string()),
        public_location_url: None,
        private_reference: None,
        private_address: Some("Calle 5 de Febrero 800, Durango".to_string()),
        host_reference: None,
        host_phone: None,
        apprentice_id: None,
        kids_welcome: true,
        kids_space_type: "play_area".to_string(),
        rsvp_cutoff_hours: 4,
    };
    insert_edition(conn, &past_gp, &past_tmpl)?;

    create_membership(
        conn,
        &Membership {
            id: Uuid::new_v4().to_string(),
            member_id: elena_id.clone(),
            edition_id: past_gp_id.clone(),
            status: MembershipState::Finalizada,
            contact_visibility: "edition_members".to_string(),
            created_at: Utc::now(),
            closed_at: Some(Utc::now()),
        },
    )?;

    // Semilla de Avisos Reales
    conn.execute(
        r#"
        INSERT INTO notice (id, edition_id, author_id, titulo, contenido, es_fijado, created_at, updated_at)
        VALUES (?1, ?2, ?3, '¡Bienvenidos a la Temporada Otoño!', 'Este jueves arrancamos en Laurel 204. Traer libreta y su porción de estudio bíblico.', 1, ?4, ?4)
        "#,
        params![Uuid::new_v4().to_string(), gp1_id, carlos_id, Utc::now().to_rfc3339()],
    )?;

    // Semilla de Recursos Clave (máx 5)
    let _ = insert_resource_link(conn, &ResourceLink {
        id: Uuid::new_v4().to_string(),
        edition_id: gp1_id.clone(),
        title: "Guía de Estudio Semanal (PDF)".to_string(),
        url: "https://drive.google.com/sample_guia_estudio.pdf".to_string(),
        link_type: "drive".to_string(),
        sort_order: 1,
        created_at: Utc::now().to_rfc3339(),
    });
    let _ = insert_resource_link(conn, &ResourceLink {
        id: Uuid::new_v4().to_string(),
        edition_id: gp1_id.clone(),
        title: "Video Temático: Hospitalidad en Hogares".to_string(),
        url: "https://youtube.com/watch?v=sample123".to_string(),
        link_type: "youtube".to_string(),
        sort_order: 2,
        created_at: Utc::now().to_rfc3339(),
    });

    // Semilla de Headcount (Asistencia Cualitativa en Gracia - GOLD-252)
    let _ = insert_meeting_headcount(conn, &MeetingHeadcount {
        id: Uuid::new_v4().to_string(),
        edition_id: gp1_id.clone(),
        meeting_date: "2026-09-24".to_string(),
        attendee_count: 12,
        range_bin: Some(AttendanceRangeBin::Range11To15),
        mood_pulse: Some(MeetingMoodPulse::Edifying),
        did_meet: true,
        notes: Some("Reunión de arranque con gran asistencia y comunión.".to_string()),
        reported_by_user_id: carlos_id.clone(),
        created_at: Utc::now().to_rfc3339(),
    });

    // Semilla de Linaje Estacional
    let _ = conn.execute(
        r#"
        INSERT INTO edition_lineage (id, previous_edition_id, new_edition_id, lineage_type, created_at)
        VALUES (?1, ?2, ?3, 'replicated', ?4)
        "#,
        params![Uuid::new_v4().to_string(), past_gp_id, gp1_id, Utc::now().to_rfc3339()],
    );


    // Join Request
    conn.execute(
        r#"
        INSERT INTO join_request (
            id, edition_id, name, whatsapp, status, created_at
        ) VALUES (
            ?1, ?2, 'Rodrigo Guzmán', '+526183334455', 'solicitada', ?3
        )
        "#,
        params![Uuid::new_v4().to_string(), gp1_id, now],
    )?;

    // Semilla de Intercesión Estructurada Comunitaria (Cero secretos en BD)
    let _ = insert_prayer_need(conn, &PrayerNeed {
        id: Uuid::new_v4().to_string(),
        edition_id: gp1_id.clone(),
        author_id: elena_id.clone(),
        author_name: "Elena Ramos".to_string(),
        category: PrayerCategory::Salud,
        public_tag: "[Salud] Elena Ramos - Recuperación médica familiar".to_string(),
        is_answered: false,
        created_at: Utc::now().to_rfc3339(),
    });
    let _ = insert_prayer_need(conn, &PrayerNeed {
        id: Uuid::new_v4().to_string(),
        edition_id: gp1_id.clone(),
        author_id: david_id.clone(),
        author_name: "David Soto".to_string(),
        category: PrayerCategory::Trabajo,
        public_tag: "[Trabajo] David Soto - Nueva oportunidad laboral".to_string(),
        is_answered: true,
        created_at: Utc::now().to_rfc3339(),
    });

    // Semilla de Itinerario Nómada Multi-Sede (Ruta de Taquerías - GOLD-261)
    let _ = insert_session_venue(conn, &SessionVenue {
        id: Uuid::new_v4().to_string(),
        edition_id: gp1_id.clone(),
        week_number: 1,
        venue_name: "Taquería El Pastorcito".to_string(),
        address: "Blvd. Durango 102, Col. San Antonio".to_string(),
        maps_url: Some("https://maps.google.com/?q=Taqueria+El+Pastorcito+Durango".to_string()),
        notes: Some("Llevar efectivo para consumo personal".to_string()),
        venue_type: VenueType::PublicVenue,
        host_name: None,
        host_phone: None,
        created_at: Utc::now().to_rfc3339(),
    });
    let _ = insert_session_venue(conn, &SessionVenue {
        id: Uuid::new_v4().to_string(),
        edition_id: gp1_id.clone(),
        week_number: 2,
        venue_name: "Tacos de Asada Los Cuñados".to_string(),
        address: "Av. 20 de Noviembre 804".to_string(),
        maps_url: Some("https://maps.google.com/?q=Tacos+Los+Cunados+Durango".to_string()),
        notes: Some("Mesas en terraza exterior".to_string()),
        venue_type: VenueType::PublicVenue,
        host_name: None,
        host_phone: None,
        created_at: Utc::now().to_rfc3339(),
    });
    let _ = insert_session_venue(conn, &SessionVenue {
        id: Uuid::new_v4().to_string(),
        edition_id: gp1_id.clone(),
        week_number: 3,
        venue_name: "Casa Familia Morales".to_string(),
        address: "Calle Pino Suárez 514, Zona Centro".to_string(),
        maps_url: Some("https://maps.google.com/?q=Pino+Suarez+514+Durango".to_string()),
        notes: Some("Traer botana o postre para compartir, timbre blanco".to_string()),
        venue_type: VenueType::PrivateHome,
        host_name: Some("Ricardo y Sofía Morales".to_string()),
        host_phone: Some("+526189998877".to_string()),
        created_at: Utc::now().to_rfc3339(),
    });

    // Semilla de Transmisión Pastoral Masiva Unidireccional (GOLD-256)
    let _ = insert_pastoral_broadcast(conn, &PastoralBroadcast {
        id: Uuid::new_v4().to_string(),
        sender_id: josh_id.clone(),
        sender_name: "Pastor Josh".to_string(),
        title: "Arranque de Temporada de Otoño".to_string(),
        message: "Bienvenidos a todos los facilitadores. Este ciclo nos enfocaremos en la hospitalidad sin fingimiento y en abrir las puertas a nuevos amigos en cada reunión.".to_string(),
        priority: "liturgical".to_string(),
        is_active: true,
        created_at: Utc::now().to_rfc3339(),
    });

    // Semilla de Configuración Institucional y White-Labeling (GOLD-255, GOLD-257)
    let _ = upsert_church_configuration(conn, &ChurchConfiguration {
        id: "amorygracia_config".to_string(),
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
    });

    // Semilla de Pipeline de Discipulado Práctico (GOLD-262)
    let _ = upsert_discipleship_track(conn, &DiscipleshipTrack {
        id: Uuid::new_v4().to_string(),
        group_id: gp1_id.clone(),
        disciple_name: "David Morales".to_string(),
        stage: DiscipleshipStage::CoFacilitator,
        seasons_completed: 2,
        endorsed_for_launch: false,
        endorsed_at: None,
        updated_at: Utc::now().to_rfc3339(),
    });

    // Semilla de Diácono de Acompañamiento Fraternal (GOLD-263)
    let _ = assign_deacon_to_group(conn, "deacon_mateo", "Mateo Valenzuela (Diácono)", &gp1_id);
    let _ = assign_deacon_to_group(conn, "deacon_mateo", "Mateo Valenzuela (Diácono)", &gp2_id);

    // Semilla de Presbiterios Colegiados de Macro-Campus (GOLD-273)
    let council_centro = EldershipCouncil {
        id: "council_centro".to_string(),
        macro_zone: "Centro".to_string(),
        name: "Presbiterio Centro Durango".to_string(),
        leader_name: "Elder Marcos Peña".to_string(),
        active_deacon_count: 70,
        created_at: Utc::now().to_rfc3339(),
    };
    let council_norte = EldershipCouncil {
        id: "council_norte".to_string(),
        macro_zone: "Norte".to_string(),
        name: "Presbiterio Norte Durango".to_string(),
        leader_name: "Elder Samuel Garza".to_string(),
        active_deacon_count: 70,
        created_at: Utc::now().to_rfc3339(),
    };
    let council_sur = EldershipCouncil {
        id: "council_sur".to_string(),
        macro_zone: "Sur".to_string(),
        name: "Presbiterio Sur Durango".to_string(),
        leader_name: "Elder Tomás Cordero".to_string(),
        active_deacon_count: 70,
        created_at: Utc::now().to_rfc3339(),
    };
    let council_poniente = EldershipCouncil {
        id: "council_poniente".to_string(),
        macro_zone: "Poniente".to_string(),
        name: "Presbiterio Poniente Durango".to_string(),
        leader_name: "Elder Bernabé Morales".to_string(),
        active_deacon_count: 70,
        created_at: Utc::now().to_rfc3339(),
    };
    let council_oriente = EldershipCouncil {
        id: "council_oriente".to_string(),
        macro_zone: "Oriente".to_string(),
        name: "Presbiterio Oriente Durango".to_string(),
        leader_name: "Elder Esteban Ruiz".to_string(),
        active_deacon_count: 70,
        created_at: Utc::now().to_rfc3339(),
    };
    let _ = insert_eldership_council(conn, &council_centro);
    let _ = insert_eldership_council(conn, &council_norte);
    let _ = insert_eldership_council(conn, &council_sur);
    let _ = insert_eldership_council(conn, &council_poniente);
    let _ = insert_eldership_council(conn, &council_oriente);

    // Asignación de Anciano a Diácono Mateo (GOLD-273)
    let _ = insert_elder_assignment(conn, &ElderAssignment {
        id: Uuid::new_v4().to_string(),
        council_id: "council_poniente".to_string(),
        elder_id: "elder_bernabe".to_string(),
        elder_name: "Elder Bernabé Morales".to_string(),
        deacon_id: "deacon_mateo".to_string(),
        created_at: Utc::now().to_rfc3339(),
    });

    // Mesa Redonda de Cuidado Diaconal (GOLD-273)
    let _ = record_deacon_care_roundtable(conn, &DeaconCareRoundtable {
        id: Uuid::new_v4().to_string(),
        council_id: "council_poniente".to_string(),
        elder_id: "elder_bernabe".to_string(),
        attended_deacon_count: 11,
        notes: "Comunión presencial mensual. Todos los facilitadores del sector poniente reportan ánimo y estabilidad.".to_string(),
        created_at: Utc::now().to_rfc3339(),
    });

    // Control de Sabático de Anfitrión para Roberto Gómez (GOLD-275)
    let _ = record_host_sabbatical(conn, &HostSabbatical {
        id: Uuid::new_v4().to_string(),
        group_id: gp2_id.clone(),
        host_name: "Roberto Gómez".to_string(),
        consecutive_seasons: 2,
        is_on_sabbatical: false,
        sabbatical_reason: Some("Cumpliendo 2 temporadas consecutivas; programado para descanso sabático".to_string()),
        next_eligible_season: Some("Primavera 2027".to_string()),
        created_at: Utc::now().to_rfc3339(),
    });

    // Servidores Eméritos y Guardianes del ADN (GOLD-276)
    let _ = insert_emeritus_guardian(conn, &EmeritusGuardian {
        id: Uuid::new_v4().to_string(),
        member_id: elena_id.clone(),
        member_name: "Elena Rostova".to_string(),
        original_join_year: 2012,
        ministry_role: "atrium_dean".to_string(),
        commissioned_by: "Pastor Josh Gayosso".to_string(),
        commissioned_at: Utc::now().to_rfc3339(),
    });
    let _ = insert_emeritus_guardian(conn, &EmeritusGuardian {
        id: Uuid::new_v4().to_string(),
        member_id: david_id.clone(),
        member_name: "David Morales".to_string(),
        original_join_year: 2014,
        ministry_role: "intercession_pillar".to_string(),
        commissioned_by: "Pastor Josh Gayosso".to_string(),
        commissioned_at: Utc::now().to_rfc3339(),
    });

    // Currículo Litúrgico Curado Semana 4 (GOLD-277)
    let _ = insert_curated_curriculum(conn, &CuratedCurriculum {
        id: "curriculum_w4".to_string(),
        season_name: "Temporada de Otoño 2026".to_string(),
        week_number: 4,
        title: "Semana 4: El Atrio y la Hospitalidad Radical".to_string(),
        scripture_passage: "Romanos 12:9-13 / Hebreos 13:1-2".to_string(),
        video_prompt_url: "https://vimeo.com/portico/liturgia-w4".to_string(),
        pair_share_question: "¿En qué aspecto concreto de tu hogar puedes abrir espacio para que un extraño experimente pertenencia?".to_string(),
        pastoral_notes: "Cuatro momentos: (1) Conexión en la mesa con pan y café, (2) Video-prompt pastoral de 3 minutos, (3) Diálogo en parejas de 2, (4) Oración mutua de cobertura.".to_string(),
        created_at: Utc::now().to_rfc3339(),
    });

    // Visita Fraternal Diaconal (GOLD-277)
    let _ = record_diaconal_visit(conn, &DiaconalVisit {
        id: Uuid::new_v4().to_string(),
        deacon_id: "deacon_mateo".to_string(),
        deacon_name: "Mateo Valenzuela (Diácono)".to_string(),
        group_id: gp1_id.clone(),
        visited_at: Utc::now().to_rfc3339(),
        atmosphere_pulse: "peaceful".to_string(),
        notes: "Visita fraternal regular (cada 6 semanas). El grupo fluye en profunda unidad y los jóvenes están integrados.".to_string(),
    });

    // Buzón Cívico de Buena Vecindad en Durango (GOLD-278)
    let _ = insert_neighborhood_complaint(conn, &NeighborhoodComplaint {
        id: "complaint_01".to_string(),
        group_id: Some(gp2_id.clone()),
        colonia_name: "Lomas del Parque".to_string(),
        reporter_contact: Some("lic.alvarez@colonia.org".to_string()),
        category: "parking".to_string(),
        comments: "Un auto de los asistentes tapó parcialmente la cochera número 14 los miércoles por la noche.".to_string(),
        status: "pending".to_string(),
        sla_deadline: (Utc::now() + chrono::Duration::hours(24)).to_rfc3339(),
        resolution_notes: None,
        created_at: Utc::now().to_rfc3339(),
    });

    // Semilla de Ministerios de Servicio para Veteranos y Fundadores (GOLD-265)
    let _ = insert_service_ministry(conn, &ServiceMinistry {
        id: "min_atrium".to_string(),
        name: "Hospitalidad y Punto de Conexión en el Atrio".to_string(),
        description: "Recepción de nuevos visitantes el primer día de la semana con calidez y orientación.".to_string(),
        category: "welcome_atrium".to_string(),
        leader_name: "Don Esteban Ríos".to_string(),
        active: true,
    });
    let _ = insert_service_ministry(conn, &ServiceMinistry {
        id: "min_prayer".to_string(),
        name: "Intercesión y Muro de Oración".to_string(),
        description: "Acompañamiento en oración comunitaria por las necesidades de las comunidades.".to_string(),
        category: "intercession".to_string(),
        leader_name: "Hna. Carmen Salinas".to_string(),
        active: true,
    });
    let _ = insert_service_ministry(conn, &ServiceMinistry {
        id: "min_hosts".to_string(),
        name: "Consejo y Cuidado de Anfitriones de Hogar".to_string(),
        description: "Orientación práctica a familias que abren su sala para reuniones de grupos pequeños.".to_string(),
        category: "host_coaching".to_string(),
        leader_name: "Roberto Gómez".to_string(),
        active: true,
    });
    let _ = insert_service_ministry(conn, &ServiceMinistry {
        id: "min_logistics".to_string(),
        name: "Logística y Soporte Tecnológico".to_string(),
        description: "Montaje dominical y apoyo con equipamiento audiovisual.".to_string(),
        category: "logistics".to_string(),
        leader_name: "Ing. Fernando Vega".to_string(),
        active: true,
    });

    // Semilla de Restricción de Pares (GOLD-246)
    let _ = insert_restricted_pairing(conn, &RestrictedPairing {
        id: Uuid::new_v4().to_string(),
        phone_a: "+526189990001".to_string(),
        phone_b: "+526189990002".to_string(),
        reason_category: "consejería".to_string(),
        created_at: Utc::now().to_rfc3339(),
    });

    // Semilla de Micro-RSVP para Anfitrión (GOLD-243)
    let _ = upsert_meeting_rsvp(conn, &MeetingRsvp {
        id: Uuid::new_v4().to_string(),
        edition_id: gp1_id.clone(),
        meeting_date: "2026-10-01".to_string(),
        member_id: elena_id.clone(),
        status: "attending".to_string(),
        created_at: Utc::now().to_rfc3339(),
    });
    let _ = upsert_meeting_rsvp(conn, &MeetingRsvp {
        id: Uuid::new_v4().to_string(),
        edition_id: gp1_id.clone(),
        meeting_date: "2026-10-01".to_string(),
        member_id: david_id.clone(),
        status: "attending".to_string(),
        created_at: Utc::now().to_rfc3339(),
    });

    Ok(())
}

pub fn seed_tenant_b_data(conn: &Connection) -> Result<()> {
    initialize_data_plane(conn)?;

    let org_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        r#"
        INSERT INTO organization (
            id, nombre_publico, pais, public_domain, responsable_legal_nombre,
            contacto_privacidad, status, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
        "#,
        params![
            org_id,
            "Comunidad Cristiana Betel",
            "México",
            None::<String>,
            "Pastor Samuel Prieto",
            "samuel@betel.org",
            "active",
            now,
            now
        ],
    )?;

    let campus_id = Uuid::new_v4().to_string();
    let campus = Campus {
        id: campus_id.clone(),
        organization_id: org_id.clone(),
        nombre_publico: "Betel Norte".to_string(),
        ciudad: "Torreón".to_string(),
        slug: "betel-norte".to_string(),
        sort_order: 1,
        timezone: "America/Monterrey".to_string(),
        status: "active".to_string(),
        address: Some("Blvd. Independencia 1200, Oriente, Torreón".to_string()),
        macro_zone: Some("Norte".to_string()),
        capacity_per_service: Some(1500),
        pastor_name: Some("Pastor Samuel Prieto".to_string()),
        atrium_welcome_lead: Some("Raquel Soto".to_string()),
    };
    insert_campus(conn, &campus)?;

    let season_id = Uuid::new_v4().to_string();
    let season = Season {
        id: season_id.clone(),
        campus_id: campus_id.clone(),
        nombre_publico: "Ciclo Alfa 2026".to_string(),
        fecha_inicio: NaiveDate::from_ymd_opt(2026, 10, 1).unwrap(),
        fecha_fin: NaiveDate::from_ymd_opt(2026, 12, 17).unwrap(),
        estado: SeasonState::EnCurso,
    };
    insert_season(conn, &season)?;

    let pastor_id = Uuid::new_v4().to_string();
    insert_member(
        conn,
        &Member {
            id: pastor_id,
            organization_id: org_id.clone(),
            nombre_visible: "Pastor Samuel Prieto".to_string(),
            estado: "activo".to_string(),
            sexo: Some(BiologicalSex::Hombre),
            age_category: Some(AgeCategory::Adulto),
            guardian_id: None,
        },
    )?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::control_plane::get_tenant_by_slug;
    use crate::db::data_plane::list_member_history;

    #[test]
    fn test_seed_and_physical_database_isolation() {
        let temp_dir = std::env::temp_dir().join(format!("portico_test_{}", Uuid::new_v4()));
        std::fs::create_dir_all(&temp_dir).unwrap();

        let master_db_path = temp_dir.join("master.db");
        let master_conn = Connection::open(&master_db_path).unwrap();

        let _result = seed_master_and_tenants(&master_conn, &temp_dir).unwrap();

        // 1. Verify master catalog has both tenants
        let tenant_a = get_tenant_by_slug(&master_conn, "amorygracia")
            .unwrap()
            .expect("tenant a exists");
        assert_eq!(tenant_a.church_name, "Amor y Gracia Durango");

        let tenant_b = get_tenant_by_slug(&master_conn, "comunidadbetel")
            .unwrap()
            .expect("tenant b exists");
        assert_eq!(tenant_b.church_name, "Comunidad Cristiana Betel");

        // 2. Verify physical isolation: check database paths are distinct files
        assert_ne!(tenant_a.db_path, tenant_b.db_path);
        assert!(std::path::Path::new(&tenant_a.db_path).exists());
        assert!(std::path::Path::new(&tenant_b.db_path).exists());

        // 3. Inspect Tenant A database content
        let conn_a = Connection::open(&tenant_a.db_path).unwrap();
        let count_groups_a: i64 = conn_a
            .query_row("SELECT count(*) FROM edition", [], |row| row.get(0))
            .unwrap();
        assert_eq!(count_groups_a, 5); // 4 active + 1 past closed

        // 4. Inspect Tenant B database content
        let conn_b = Connection::open(&tenant_b.db_path).unwrap();
        let count_groups_b: i64 = conn_b
            .query_row("SELECT count(*) FROM edition", [], |row| row.get(0))
            .unwrap();
        assert_eq!(count_groups_b, 0); // Tenant B has no groups created yet

        // 5. Cross-Tenant Leakage Check (Zero Leakage!):
        // Querying Tenant B for Elena Ramos returns ZERO records.
        let elena_in_b: i64 = conn_b
            .query_row(
                "SELECT count(*) FROM member WHERE nombre_visible = 'Elena Ramos'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(elena_in_b, 0);

        // Querying Tenant A for Elena Ramos returns 1 record.
        let elena_id: String = conn_a
            .query_row(
                "SELECT id FROM member WHERE nombre_visible = 'Elena Ramos'",
                [],
                |row| row.get(0),
            )
            .unwrap();

        // 6. Institutional Memory Check: Verify Elena has 2 memberships in her trajectory
        // (1 active in Autumn 2026, 1 completed in Spring 2026)
        let history = list_member_history(&conn_a, &elena_id).unwrap();
        assert_eq!(history.len(), 2);
        let has_finalizada = history
            .iter()
            .any(|(m, _, _)| m.status == MembershipState::Finalizada);
        let has_activa = history
            .iter()
            .any(|(m, _, _)| m.status == MembershipState::Activa);
        assert!(has_finalizada);
        assert!(has_activa);

        // Cleanup
        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}
