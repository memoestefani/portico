use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

/// Nomenclatura eclesiológica configurable por organización
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct NamingScheme {
    pub singular: String,
    pub plural: String,
}

impl Default for NamingScheme {
    fn default() -> Self {
        Self::iglesia()
    }
}

impl NamingScheme {
    pub fn campus() -> Self {
        Self {
            singular: "Campus".to_string(),
            plural: "Campuses".to_string(),
        }
    }

    pub fn iglesia() -> Self {
        Self {
            singular: "Iglesia".to_string(),
            plural: "Iglesias".to_string(),
        }
    }

    pub fn casa() -> Self {
        Self {
            singular: "Casa".to_string(),
            plural: "Casas".to_string(),
        }
    }
}

/// Estado de licencia de una organización en el Control Plane
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum LicenseStatus {
    Active,
    Trial,
    Suspended,
}

/// Organización o tenant registrado en el Control Plane (portico_master.db)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tenant {
    pub id: String,
    pub slug: String,
    pub domain: Option<String>,
    pub church_name: String,
    pub db_path: String,
    pub license_status: LicenseStatus,
    pub naming_scheme: NamingScheme,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Administrador de la plataforma (operador de Pórtico HQ)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformAdmin {
    pub id: String,
    pub email: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
}

/// Sede local u operadora de asambleas (Campus / Iglesia / Casa)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Campus {
    pub id: String,
    pub organization_id: String,
    pub nombre_publico: String,
    pub ciudad: String,
    pub slug: String,
    pub sort_order: i32,
    pub timezone: String,
    pub status: String,
    #[serde(default)]
    pub address: Option<String>,
    #[serde(default)]
    pub macro_zone: Option<String>,
    #[serde(default)]
    pub capacity_per_service: Option<u32>,
    #[serde(default)]
    pub pastor_name: Option<String>,
    #[serde(default)]
    pub atrium_welcome_lead: Option<String>,
}

impl Default for Campus {
    fn default() -> Self {
        Self {
            id: String::new(),
            organization_id: String::new(),
            nombre_publico: String::new(),
            ciudad: "Durango".to_string(),
            slug: String::new(),
            sort_order: 1,
            timezone: "America/Monterrey".to_string(),
            status: "active".to_string(),
            address: None,
            macro_zone: Some("Centro".to_string()),
            capacity_per_service: Some(1500),
            pastor_name: None,
            atrium_welcome_lead: None,
        }
    }
}


/// Estado de una temporada
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SeasonState {
    Borrador,
    Convocatoria,
    EnCurso,
    Cerrada,
}

/// Temporada de 12 semanas + 1 semana sabática
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Season {
    pub id: String,
    pub campus_id: String,
    pub nombre_publico: String,
    pub fecha_inicio: NaiveDate,
    pub fecha_fin: NaiveDate,
    pub estado: SeasonState,
}

/// Afinidad temática (jóvenes, matrimonios, café, tacos, etc.)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Affinity {
    pub id: String,
    pub organization_id: String,
    pub nombre_publico: String,
    pub sort_order: i32,
    pub status: String,
}

/// Zona geográfica de la ciudad (lista corta, no colonia libre)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Zone {
    pub id: String,
    pub campus_id: String,
    pub label: String,
    pub sort_order: i32,
    pub status: String,
}

/// Naturaleza de la sede para resolución de privacidad polimórfica
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum VenueType {
    PublicVenue, // Taquería, café, parque: mapa público
    PrivateHome, // Casa particular: calle sellada en silo
    OnlineSession, // Zoom / Meet: enlace sellado en silo
    Other,
}

/// Estado de una edición de grupo pequeño
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum EditionState {
    Borrador,
    Reconocida,
    Cerrada,
}

/// Edición de grupo pequeño en una temporada concreta
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Edition {
    pub id: String,
    pub season_id: String,
    pub created_from_template_id: Option<String>,
    pub nombre_publico: String,
    pub proposito: String,
    pub affinity_id: String,
    pub portada_asset_id: Option<String>,
    pub dia_habitual: u8, // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    pub hora_habitual: String, // "19:30"
    pub cupo_orientativo: i32,
    pub responsible_member_id: String,
    pub public_responsible_visibility: bool,
    pub estado: EditionState,
    pub is_full: bool,
    pub aviso_breve: Option<String>,
    pub whatsapp_chat_url: Option<String>,
    pub logistics_version: i64,
    #[serde(default)]
    pub modality: GroupModality,
    #[serde(default)]
    pub cell_accent: Option<String>,
    #[serde(default)]
    pub transit_friendly: bool,
    #[serde(default)]
    pub carpool_available: bool,
    #[serde(default)]
    pub macro_zone: Option<String>,
    #[serde(default)]
    pub campus_id: Option<String>,
    #[serde(default = "default_consecutive_seasons")]
    pub consecutive_seasons_hosted: u32,
    #[serde(default)]
    pub venue_nature: VenueNature,
    #[serde(default = "default_true_flag")]
    pub good_neighbor_pledge: bool,
    #[serde(default = "default_true_flag")]
    pub child_safeguarding_certified: bool,
    #[serde(default)]
    pub parent_group_id: Option<String>,
    #[serde(default)]
    pub liaison_name: Option<String>,
    #[serde(default)]
    pub liaison_role: Option<String>,
    #[serde(default)]
    pub access_protocol: Option<String>,
}

fn default_consecutive_seasons() -> u32 {
    1
}

fn default_true_flag() -> bool {
    true
}

impl Default for Edition {
    fn default() -> Self {
        Self {
            id: String::new(),
            season_id: String::new(),
            created_from_template_id: None,
            nombre_publico: String::new(),
            proposito: String::new(),
            affinity_id: String::new(),
            portada_asset_id: None,
            dia_habitual: 1,
            hora_habitual: "19:00".to_string(),
            cupo_orientativo: 15,
            responsible_member_id: String::new(),
            public_responsible_visibility: true,
            estado: EditionState::Borrador,
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
        }
    }
}


/// Naturaleza física del espacio de reunión y control sabático (GOLD-275 / GOLD-305)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum VenueNature {
    Home,          // Hogar particular (sujeto a descanso sabático)
    CampusRoom,    // Salón comunitario de Macro-Campus (sede neutral)
    CivicCafe,     // Cafetería o taquería local
    PublicPark,    // Área verde pública / parque
    Institutional, // Sede institucional o especial (Cereso, Hospital, Asilo, Empresa) - GOLD-305
}

impl Default for VenueNature {
    fn default() -> Self {
        Self::Home
    }
}


/// Modalidad del grupo pequeño
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum GroupModality {
    Residential,     // Hogar fijo (dirección privada sellada)
    NomadicTour,     // Ruta de 12 taquerías, cafés, restaurantes (sedes públicas)
    OutdoorActivity, // Running, parques, monumentos, senderismo
}

impl Default for GroupModality {
    fn default() -> Self {
        Self::Residential
    }
}

fn default_session_venue_type() -> VenueType {
    VenueType::PublicVenue
}

/// Sede programada de una sesión concreta en un itinerario nómada (taquerías, cafés, o casas particulares rotativas con anfitriones variables)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionVenue {
    pub id: String,
    pub edition_id: String,
    pub week_number: u8, // 1 a 12
    pub venue_name: String, // "Taquería El Pastorcito" o "Casa Familia Ramírez"
    pub address: String, // "Blvd. Durango 102" o "Calle Hidalgo 312"
    pub maps_url: Option<String>,
    pub notes: Option<String>, // "Llevar efectivo" o "Timbre blanco, hay perro en patio"
    #[serde(default = "default_session_venue_type")]
    pub venue_type: VenueType, // PublicVenue vs PrivateHome
    #[serde(default)]
    pub host_name: Option<String>, // Anfitrión de esa semana (ej. "Carlos y Martha")
    #[serde(default)]
    pub host_phone: Option<String>, // Teléfono del anfitrión rotativo de esa semana
    pub created_at: String,
}

impl SessionVenue {
    pub fn scoped_for_viewer(&self, is_member: bool) -> Self {
        if self.venue_type == VenueType::PrivateHome && !is_member {
            let mut masked = self.clone();
            masked.address = "Casa particular · Dirección exacta revelada al unirse o confirmar".to_string();
            masked.maps_url = None;
            masked.host_phone = None;
            masked
        } else {
            self.clone()
        }
    }
}

/// Plantilla logística habitual de reunión
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeetingTemplate {
    pub weekday: u8,
    pub time: String,
    pub venue_type: VenueType,
    pub zone_id: Option<String>,
    pub public_location_name: Option<String>,
    pub public_location_url: Option<String>,
    pub private_reference: Option<String>,
    pub private_address: Option<String>,
    pub host_reference: Option<String>,
    pub host_phone: Option<String>,
    pub apprentice_id: Option<String>,
    pub kids_welcome: bool,
    pub kids_space_type: String, // "play_area", "shared_living", "adults_only"
    pub rsvp_cutoff_hours: u32,  // Por defecto 4 horas antes de la reunión
}

/// Estado de una excepción puntual de reunión
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ExceptionStatus {
    Scheduled, // Reunión confirmada con posible cambio de lugar/hora
    Cancelled, // Cancelada para esta fecha específica
}

/// Excepción para una fecha de reunión concreta
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeetingException {
    pub id: String,
    pub edition_id: String,
    pub date: NaiveDate,
    pub status: ExceptionStatus,
    pub venue_type: VenueType,
    pub zone_id: Option<String>,
    pub public_location_name: Option<String>,
    pub public_location_url: Option<String>,
    pub private_reference: Option<String>,
    pub private_address: Option<String>,
    pub host_reference: Option<String>,
    pub note: Option<String>,
    pub logistics_version: i64,
}

/// Información proyectada de la próxima reunión resuelta
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResolvedMeeting {
    pub date: NaiveDate,
    pub time: String,
    pub venue_type: VenueType,
    pub public_location_name: Option<String>,
    pub public_location_url: Option<String>,
    pub zone_label: Option<String>,
    pub private_reference: Option<String>,
    pub private_address: Option<String>,
    pub host_reference: Option<String>,
    pub note: Option<String>,
    pub is_cancelled: bool,
    pub logistics_version: i64,
}

/// Sexo biológico sobrio para segmentación fraternal legítima (Tito 2) y salvaguarda (GOLD-298)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum BiologicalSex {
    Hombre,
    Mujer,
}

/// Categoría etaria y salvaguarda de menores (GOLD-306)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AgeCategory {
    Adulto,
    Adolescente, // 12 a 17 años: cuenta supervisada, chat 1:1 adulto-menor bloqueado
    Nino,        // 0 a 11 años: dependiente tutelado sin cuenta propia
}

/// Persona dentro de una organización
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Member {
    pub id: String,
    pub organization_id: String,
    pub nombre_visible: String,
    pub estado: String, // activo, bloqueado, anonimizado, desactivado
    #[serde(default)]
    pub sexo: Option<BiologicalSex>,
    #[serde(default)]
    pub age_category: Option<AgeCategory>,
    #[serde(default)]
    pub guardian_id: Option<String>,
}

/// Estado de una pertenencia a una edición
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum MembershipState {
    Solicitada,
    Activa,
    Revocada,
    Finalizada,
    Rechazada,
}

/// Pertenencia a una edición de grupo pequeño
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Membership {
    pub id: String,
    pub member_id: String,
    pub edition_id: String,
    pub status: MembershipState,
    pub contact_visibility: String, // "hidden" o "edition_members"
    pub created_at: DateTime<Utc>,
    pub closed_at: Option<DateTime<Utc>>,
}

/// Aviso o anuncio oficial para la edición
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Notice {
    pub id: String,
    pub edition_id: String,
    pub author_id: String,
    pub titulo: String,
    pub contenido: String,
    pub es_fijado: bool,
    pub created_at: String,
    pub updated_at: String,
}

/// Recurso de discipulado (máximo 5 por edición)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceLink {
    pub id: String,
    pub edition_id: String,
    pub title: String,
    pub url: String,
    pub link_type: String, // 'drive', 'pdf', 'youtube', 'notion', 'whatsapp', 'other'
    pub sort_order: i32,
    pub created_at: String,
}

/// Rangos discretos amables de asistencia en gracia (GOLD-252)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AttendanceRangeBin {
    Range1To5,   // 1 a 5 (Íntima)
    Range6To10,  // 6 a 10 (Estándar)
    Range11To15, // 11 a 15 (Llena)
    Range15Plus, // 15+ (Macro-Encuentro / Célula Abierta / Multiplicación)
}

impl AttendanceRangeBin {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Range1To5 => "1_5",
            Self::Range6To10 => "6_10",
            Self::Range11To15 => "11_15",
            Self::Range15Plus => "15_plus",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "1_5" | "1-5" => Some(Self::Range1To5),
            "6_10" | "6-10" => Some(Self::Range6To10),
            "11_15" | "11-15" => Some(Self::Range11To15),
            "15_plus" | "15+" | "30+" | "31+" => Some(Self::Range15Plus),
            _ => None,
        }
    }
}

/// Pulso emocional de la reunión (GOLD-252)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum MeetingMoodPulse {
    Peaceful,      // Tranquilo
    Edifying,      // Edificante
    Vulnerable,    // Intenso / Vulnerable
    SupportNeeded, // Necesita Acompañamiento
}

impl MeetingMoodPulse {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Peaceful => "tranquilo",
            Self::Edifying => "edificante",
            Self::Vulnerable => "vulnerable",
            Self::SupportNeeded => "apoyo",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "tranquilo" | "peaceful" => Some(Self::Peaceful),
            "edificante" | "edifying" => Some(Self::Edifying),
            "vulnerable" => Some(Self::Vulnerable),
            "apoyo" | "support_needed" => Some(Self::SupportNeeded),
            _ => None,
        }
    }
}

/// Reporte numérico de asistencia real por reunión (conteo agregado sin vigilancia nominal)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeetingHeadcount {
    pub id: String,
    pub edition_id: String,
    pub meeting_date: String, // "YYYY-MM-DD"
    pub attendee_count: u32,
    #[serde(default)]
    pub range_bin: Option<AttendanceRangeBin>,
    #[serde(default)]
    pub mood_pulse: Option<MeetingMoodPulse>,
    pub did_meet: bool,
    pub notes: Option<String>,
    pub reported_by_user_id: String,
    pub created_at: String,
}

/// Linaje y trazabilidad entre temporadas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EditionLineage {
    pub id: String,
    pub previous_edition_id: String,
    pub new_edition_id: String,
    pub lineage_type: String, // 'replicated', 'split'
    pub created_at: String,
}

/// Petición remota de afiliación ("Quiero probar")
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JoinRequest {
    pub id: String,
    pub edition_id: String,
    pub name: String,
    pub whatsapp: String,
    pub status: String, // solicitada, aceptada, rechazada
    pub created_at: DateTime<Utc>,
}

/// Categorías cerradas de necesidad de intercesión (LFPDPPP - Cero difamación)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum PrayerCategory {
    Salud,
    Trabajo,
    Familia,
    Gratitud,
    Direccion,
}

impl PrayerCategory {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Salud => "salud",
            Self::Trabajo => "trabajo",
            Self::Familia => "familia",
            Self::Gratitud => "gratitud",
            Self::Direccion => "direccion",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "salud" => Self::Salud,
            "trabajo" => Self::Trabajo,
            "familia" => Self::Familia,
            "gratitud" => Self::Gratitud,
            _ => Self::Direccion,
        }
    }
}

/// Petición de oración estructurada comunitaria (motivo público/categoría para intercesión grupal; detalles íntimos se tratan en persona o mensajería 1:1, nunca en BD)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrayerNeed {
    pub id: String,
    pub edition_id: String,
    pub author_id: String,
    pub author_name: String,
    pub category: PrayerCategory,
    #[serde(default)]
    pub public_tag: String, // Visible en silo: ej. "[Salud] Martha - Recuperación médica"
    pub is_answered: bool,
    pub created_at: String,
}

/// Alerta pastoral silenciosa ante crisis graves (violencia, ideación suicida)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SafeguardAlert {
    pub id: String,
    pub edition_id: String,
    pub reporter_id: String,
    pub reporter_name: String,
    pub urgency_level: String, // 'high', 'critical'
    pub status: String, // 'pending', 'attended'
    pub created_at: String,
}

/// Registro interno de pares incompatibles (ex-parejas, litigios en consejería)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RestrictedPairing {
    pub id: String,
    pub phone_a: String,
    pub phone_b: String,
    pub reason_category: String, // 'consejería', 'familiar', 'legal'
    pub created_at: String,
}

/// Confirmación de asistencia con hora de corte (Catering Lock)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeetingRsvp {
    pub id: String,
    pub edition_id: String,
    pub meeting_date: String, // "YYYY-MM-DD"
    pub member_id: String,
    pub status: String, // 'attending', 'not_attending'
    pub created_at: String,
}

/// Transmisión pastoral masiva unidireccional a facilitadores (GOLD-256)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PastoralBroadcast {
    pub id: String,
    pub sender_id: String,
    pub sender_name: String,
    pub title: String,
    pub message: String,
    pub priority: String, // "normal", "urgent", "liturgical"
    pub is_active: bool,
    pub created_at: String,
}

/// Nomenclatura institucional configurable (GOLD-255)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChurchNomenclature {
    pub campus_singular: String,
    pub campus_plural: String,
    pub group_singular: String,
    pub group_plural: String,
    pub leader_title: String,
    pub host_title: String,
    pub meeting_term: String,
}

impl Default for ChurchNomenclature {
    fn default() -> Self {
        Self {
            campus_singular: "Sede".to_string(),
            campus_plural: "Sedes".to_string(),
            group_singular: "Comunidad".to_string(),
            group_plural: "Comunidades".to_string(),
            leader_title: "Facilitador".to_string(),
            host_title: "Anfitrión".to_string(),
            meeting_term: "Reunión de Conexión".to_string(),
        }
    }
}

/// Configuración institucional y white-labeling noble (GOLD-257)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChurchConfiguration {
    pub id: String,
    pub nomenclature: ChurchNomenclature,
    pub brand_palette_id: String, // "navy", "forest", "sand", "burgundy", "slate", "bronze"
    pub season_name: String,
    pub season_motto: String,
    pub season_start_date: Option<String>,
    pub season_end_date: Option<String>,
    #[serde(default = "default_season_duration_weeks")]
    pub season_duration_weeks: u32,
    #[serde(default = "default_true_flag")]
    pub enable_deacon_system: bool,
    #[serde(default = "default_true_flag")]
    pub enable_eldership_system: bool,
    #[serde(default = "default_growth_target")]
    pub growth_target_members: u32,
    pub updated_at: String,
}

fn default_growth_target() -> u32 {
    25000
}

fn default_season_duration_weeks() -> u32 {
    12
}


/// Etapas del pipeline de discipulado práctico en el hogar (GOLD-262)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DiscipleshipStage {
    Observer,       // Temporada 1: Observador activo (apoyo en mesa y bienvenida)
    CoFacilitator,  // Temporada 2: Co-facilitador (guía dinámicas de 5 minutos)
    ReadyForLaunch, // Semana 10+: Endosado por el facilitador para enviar
}

impl Default for DiscipleshipStage {
    fn default() -> Self {
        Self::Observer
    }
}

/// Registro de discipulado de aprendices en el grupo pequeño (GOLD-262)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscipleshipTrack {
    pub id: String,
    pub group_id: String,
    pub disciple_name: String,
    pub stage: DiscipleshipStage,
    pub seasons_completed: u32,
    pub endorsed_for_launch: bool,
    pub endorsed_at: Option<String>,
    pub updated_at: String,
}

/// Asignación diaconal fraternal (1 diácono por cada 5 a 7 células) (GOLD-263)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeaconAssignment {
    pub id: String,
    pub deacon_id: String,
    pub deacon_name: String,
    pub group_id: String,
    pub created_at: String,
}

/// Registro sobrio de acompañamiento diaconal (GOLD-263)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeaconContactLog {
    pub id: String,
    pub deacon_id: String,
    pub group_id: String,
    pub contact_type: String, // "call", "in_person", "whatsapp_message"
    pub notes: String,
    pub created_at: String,
}

/// Reporte formal de desviación o anomalía pastoral en reunión (GOLD-268, GOLD-277)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PastoralDeviation {
    pub id: String,
    pub group_id: String,
    pub reporter_member_id: String,
    pub category: String, // "doctrinal_drift", "unhealthy_atmosphere", "inappropriate_conduct", "other"
    pub comments: String,
    pub status: String, // "pending", "reviewed_by_deacon", "resolved"
    #[serde(default)]
    pub sla_deadline: Option<String>,
    #[serde(default)]
    pub assigned_elder_id: Option<String>,
    pub created_at: String,
}

impl Default for PastoralDeviation {
    fn default() -> Self {
        Self {
            id: String::new(),
            group_id: String::new(),
            reporter_member_id: String::new(),
            category: String::new(),
            comments: String::new(),
            status: "pending".to_string(),
            sla_deadline: None,
            assigned_elder_id: None,
            created_at: String::new(),
        }
    }
}


/// Decisión fraternal de cierre de temporada (GOLD-264)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SeasonClosureDecision {
    ContinueSame,
    MultiplyWithDisciple,
    SabbaticalRest,
}

/// Registro del acuerdo fraternal en la última semana de temporada (GOLD-264)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeasonClosure {
    pub id: String,
    pub group_id: String,
    pub season_name: String,
    pub closure_decision: SeasonClosureDecision,
    pub disciple_new_group_name: Option<String>,
    pub notes: String,
    pub created_at: String,
}

/// Ministerio de servicio eclesial activo para miembros y veteranos (GOLD-265)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceMinistry {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String, // "welcome_atrium", "intercession", "host_coaching", "logistics", "emeritus_guardian"
    pub leader_name: String,
    pub active: bool,
}

/// Inscripción a ministerio de servicio activo (GOLD-265)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MinistryEnrollment {
    pub id: String,
    pub ministry_id: String,
    pub member_name: String,
    pub member_phone: String,
    pub notes: Option<String>,
    pub created_at: String,
}

// =========================================================================
// Ciclo 6: Escala a 25,000 Miembros, Multi-Campus y Presbiterios (GOLD-273 a GOLD-279)
// =========================================================================

/// Presbiterio Colegiado de Macro-Campus (GOLD-273)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EldershipCouncil {
    pub id: String,
    pub macro_zone: String, // "Norte", "Sur", "Poniente", "Oriente", "Centro"
    pub name: String,
    pub leader_name: String,
    pub active_deacon_count: u32,
    pub created_at: String,
}

/// Asignación de Anciano a Diácono (franjas de 10 a 12 diáconos por anciano) (GOLD-273)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElderAssignment {
    pub id: String,
    pub council_id: String,
    pub elder_id: String,
    pub elder_name: String,
    pub deacon_id: String,
    pub created_at: String,
}

/// Registro de Mesa Redonda Mensual de Cuidado Diaconal (GOLD-273)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeaconCareRoundtable {
    pub id: String,
    pub council_id: String,
    pub elder_id: String,
    pub attended_deacon_count: u32,
    pub notes: String,
    pub created_at: String,
}

/// Control de tenure y sabático de hogares anfitriones (GOLD-275)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HostSabbatical {
    pub id: String,
    pub group_id: String,
    pub host_name: String,
    pub consecutive_seasons: u32,
    pub is_on_sabbatical: bool,
    pub sabbatical_reason: Option<String>,
    pub next_eligible_season: Option<String>,
    pub created_at: String,
}

/// Padrón de la Orden de Servidores Eméritos y Guardianes del ADN (GOLD-276)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmeritusGuardian {
    pub id: String,
    pub member_id: String,
    pub member_name: String,
    pub original_join_year: u32,
    pub ministry_role: String, // "atrium_dean", "intercession_pillar", "tito2_mentor"
    pub commissioned_by: String,
    pub commissioned_at: String,
}

/// Currículo Litúrgico Curado Semanal (GOLD-277)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CuratedCurriculum {
    pub id: String,
    pub season_name: String,
    pub week_number: u32,
    pub title: String,
    pub scripture_passage: String,
    pub video_prompt_url: String,
    pub pair_share_question: String,
    pub pastoral_notes: String,
    pub created_at: String,
}

/// Registro de visita presencial diaconal (cada 6 semanas) (GOLD-277)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiaconalVisit {
    pub id: String,
    pub deacon_id: String,
    pub deacon_name: String,
    pub group_id: String,
    pub visited_at: String,
    pub atmosphere_pulse: String, // "peaceful", "encouraging", "needs_support"
    pub notes: String,
}

/// Queja o reporte vecinal cívico en colonias de Durango (GOLD-278)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NeighborhoodComplaint {
    pub id: String,
    pub group_id: Option<String>,
    pub colonia_name: String,
    pub reporter_contact: Option<String>,
    pub category: String, // "parking", "noise", "other"
    pub comments: String,
    pub status: String, // "pending", "in_progress", "resolved"
    pub sla_deadline: String, // T + 24 horas
    pub resolution_notes: Option<String>,
    pub created_at: String,
}

/// Especificación de Núcleo Plantador para Fisión de Dunbar (GOLD-279)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlantingSeedNucleus {
    pub parent_group_id: String,
    pub apprentice_id: String,
    pub apprentice_name: String,
    pub seed_member_ids: Vec<String>,
    pub seed_member_names: Vec<String>,
    pub new_group_name: String,
    pub new_macro_zone: String,
    pub new_dia_habitual: u8,
    pub new_hora_habitual: String,
}

/// Resultado de Fisión Celular por Grafo de Dunbar (GOLD-279)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DunbarFissionResult {
    pub parent_group_id: String,
    pub parent_remaining_count: u32,
    pub child_group_id: String,
    pub child_initial_count: u32,
    pub fission_date: String,
}

/// Pausa litúrgica oficial que congela el cómputo de semanas y temporadas (GOLD-302)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiturgicalPause {
    pub id: String,
    pub title: String,
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    pub congregation_id: String,
}

/// Iniciativa o actividad comunitaria abierta y agnóstica (GOLD-303)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommunityInitiative {
    pub id: String,
    pub title: String,
    pub category: String, // "servicio", "lectura_cultura", "convivencia", "apoyo_vecinal"
    pub date: String,
    pub meeting_point: String,
    pub coordinator_name: String,
    pub coordinator_phone: String,
    #[serde(default)]
    pub pledges: Vec<InitiativePledge>,
    #[serde(default)]
    pub volunteers: Vec<InitiativeVolunteer>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitiativePledge {
    pub item: String,
    pub committed_by: String,
    pub quantity: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitiativeVolunteer {
    pub name: String,
    pub phone: String,
}

/// Registro de reunión fraternal compartida entre células hermanadas (GOLD-304)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JointMeetingLog {
    pub id: String,
    pub host_group_id: String,
    pub guest_group_id: String,
    pub date: NaiveDate,
    pub notes: Option<String>,
    pub attendee_ids: Vec<String>,
}

/// Concesión de sabático de hogar otorgado directamente por el diácono en visita (GOLD-306)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeaconSabbaticalGrant {
    pub id: String,
    pub group_id: String,
    pub deacon_id: String,
    pub deacon_name: String,
    pub weeks: u32,
    pub reason: String,
    pub granted_at: DateTime<Utc>,
}





