use chrono::{Datelike, Days, NaiveDate};
use crate::domain::{Edition, EditionState, ExceptionStatus, MeetingException, MeetingTemplate, ResolvedMeeting, Season, SeasonState, VenueType};

/// Calcula las 12 fechas habituales de una temporada para un día de la semana concreto
pub fn generate_season_schedule(
    start_date: NaiveDate,
    weekday: u8, // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    weeks_count: usize,
) -> Vec<NaiveDate> {
    let mut dates = Vec::with_capacity(weeks_count);
    let mut current = start_date;

    // Avanzar hasta el primer día de la semana correspondiente
    while current.weekday().num_days_from_sunday() != weekday as u32 {
        current = current.checked_add_days(Days::new(1)).unwrap_or(current);
    }

    // Generar exactamente `weeks_count` ocurrencias semanales (ej. 12 semanas)
    for _ in 0..weeks_count {
        dates.push(current);
        current = current.checked_add_days(Days::new(7)).unwrap_or(current);
    }

    dates
}

/// Función pura y determinista para resolver la próxima reunión válida
///
/// Entrada:
/// - edition: grupo pequeño actual
/// - template: logística habitual de la reunión
/// - exceptions: lista de excepciones conocidas
/// - current_date: fecha lógica de consulta
/// - season: temporada vigente del grupo
///
/// Salida:
/// - Some(ResolvedMeeting) o None si el grupo o temporada están cerrados o no hay fechas futuras
pub fn resolve_next_meeting(
    edition: &Edition,
    template: &MeetingTemplate,
    exceptions: &[MeetingException],
    current_date: NaiveDate,
    season: &Season,
) -> Option<ResolvedMeeting> {
    // Si la temporada o la edición no están vigentes, no hay próxima reunión
    if season.estado == SeasonState::Cerrada || edition.estado != EditionState::Reconocida {
        return None;
    }

    // Si la fecha actual ya superó el fin de la temporada, terminó el ciclo
    if current_date > season.fecha_fin {
        return None;
    }

    // Generar las fechas posibles de la temporada según la duración real
    let days_diff = (season.fecha_fin - season.fecha_inicio).num_days();
    let weeks_count = if days_diff > 0 { std::cmp::max(1, ((days_diff as usize) + 6) / 7) } else { 12 };
    let schedule = generate_season_schedule(season.fecha_inicio, edition.dia_habitual, weeks_count);

    for candidate_date in schedule {
        // Ignorar fechas pasadas
        if candidate_date < current_date {
            continue;
        }

        // Si sobrepasa el fin de la temporada, detener
        if candidate_date > season.fecha_fin {
            break;
        }

        // Buscar si existe una excepción para esta fecha exacta
        let maybe_exception = exceptions.iter().find(|ex| ex.date == candidate_date);

        if let Some(exception) = maybe_exception {
            match exception.status {
                ExceptionStatus::Cancelled => {
                    // Cancelada esta fecha: continuar a la siguiente fecha válida
                    continue;
                }
                ExceptionStatus::Scheduled => {
                    // Sustituye la plantilla con la excepción
                    return Some(ResolvedMeeting {
                        date: candidate_date,
                        time: template.time.clone(),
                        venue_type: exception.venue_type.clone(),
                        public_location_name: exception.public_location_name.clone(),
                        public_location_url: exception.public_location_url.clone(),
                        zone_label: None,
                        private_reference: exception.private_reference.clone(),
                        private_address: exception.private_address.clone(),
                        host_reference: exception.host_reference.clone(),
                        note: exception.note.clone(),
                        is_cancelled: false,
                        logistics_version: exception.logistics_version,
                    });
                }
            }
        } else {
            // No hay excepción: se usa la plantilla habitual
            return Some(ResolvedMeeting {
                date: candidate_date,
                time: template.time.clone(),
                venue_type: template.venue_type.clone(),
                public_location_name: template.public_location_name.clone(),
                public_location_url: template.public_location_url.clone(),
                zone_label: None,
                private_reference: template.private_reference.clone(),
                private_address: template.private_address.clone(),
                host_reference: template.host_reference.clone(),
                note: None,
                is_cancelled: false,
                logistics_version: edition.logistics_version,
            });
        }
    }

    None
}

/// Aplica las reglas de visibilidad polimórfica a una reunión resuelta según quién la consulte
pub fn filter_meeting_for_viewer(
    meeting: &ResolvedMeeting,
    is_member: bool,
) -> ResolvedMeeting {
    let mut filtered = meeting.clone();

    match meeting.venue_type {
        VenueType::PublicVenue => {
            // En sedes públicas (café, taquería, parque), el nombre y mapa son públicos para todos
            // No hay datos privados que ocultar
        }
        VenueType::PrivateHome => {
            // En casas particulares, la calle y timbre solo se revelan a miembros autenticados
            if !is_member {
                filtered.private_address = None;
                filtered.private_reference = None;
                filtered.host_reference = None;
            }
        }
        VenueType::OnlineSession => {
            // En sesiones de Zoom/Meet, el enlace oficial solo se revela a miembros autenticados
            if !is_member {
                filtered.public_location_url = None;
                filtered.private_reference = None;
            }
        }
        VenueType::Other => {
            if !is_member {
                filtered.private_address = None;
                filtered.private_reference = None;
            }
        }
    }

    filtered
}

use crate::domain::SessionVenue;
use chrono::Utc;

/// Genera un feed de calendario estándar RFC 5545 iCalendar (`.ics` / `webcal://`)
/// para una edición completa, inyectando el itinerario nómada y respetando la privacidad
/// polimórfica (enmascarando direcciones de casas particulares para no miembros).
pub fn generate_edition_calendar_feed(
    edition: &Edition,
    template: &MeetingTemplate,
    season_start: NaiveDate,
    venues: &[SessionVenue],
    is_member: bool,
) -> String {
    let schedule = generate_season_schedule(season_start, edition.dia_habitual, 12);
    let now_stamp = Utc::now().format("%Y%m%dT%H%M%SZ").to_string();

    let mut ics = String::new();
    ics.push_str("BEGIN:VCALENDAR\r\n");
    ics.push_str("VERSION:2.0\r\n");
    ics.push_str("PRODID:-//Amor y Gracia//Portico OS 3.1//ES\r\n");
    ics.push_str("CALSCALE:GREGORIAN\r\n");
    ics.push_str("METHOD:PUBLISH\r\n");
    ics.push_str(&format!("X-WR-CALNAME:{}\r\n", edition.nombre_publico));
    ics.push_str(&format!("X-WR-CALDESC:Itinerario de {}\r\n", edition.nombre_publico));
    ics.push_str("X-WR-TIMEZONE:America/Monterrey\r\n");

    // Formatear hora de inicio y fin (duración aproximada: 2 horas)
    let time_parts: Vec<&str> = template.time.split(':').collect();
    let (hour, minute): (u32, u32) = if time_parts.len() >= 2 {
        (time_parts[0].parse().unwrap_or(19), time_parts[1].parse().unwrap_or(0))
    } else {
        (19, 0)
    };
    let end_hour = (hour + 2) % 24;

    for (idx, date) in schedule.iter().enumerate() {
        let week_num = (idx + 1) as u8;
        let date_str = date.format("%Y%m%d").to_string();
        let dtstart = format!("{}T{:02}{:02}00", date_str, hour, minute);
        let dtend = format!("{}T{:02}{:02}00", date_str, end_hour, minute);

        let maybe_venue = venues.iter().find(|v| v.week_number == week_num);

        let (summary, location, description) = if let Some(v) = maybe_venue {
            let scoped = v.scoped_for_viewer(is_member);
            let sum = format!("{} - Sem {} ({})", edition.nombre_publico, week_num, scoped.venue_name);
            let loc = scoped.address.clone();
            let mut desc = format!("Reunión semanal de {}.\\nSede: {}", edition.nombre_publico, scoped.venue_name);
            if let Some(host) = &scoped.host_name {
                desc.push_str(&format!("\\nAnfitrión: {}", host));
            }
            if let Some(phone) = &scoped.host_phone {
                desc.push_str(&format!("\\nTeléfono: {}", phone));
            }
            if let Some(notes) = &scoped.notes {
                desc.push_str(&format!("\\nNotas: {}", notes));
            }
            if let Some(map) = &scoped.maps_url {
                desc.push_str(&format!("\\nMapa: {}", map));
            }
            (sum, loc, desc)
        } else {
            let sum = format!("{} - Sem {}", edition.nombre_publico, week_num);
            let loc = match template.venue_type {
                VenueType::PrivateHome => {
                    if is_member {
                        template.private_address.clone().unwrap_or_else(|| "Casa particular".to_string())
                    } else {
                        "Casa particular · Dirección al unirse o confirmar".to_string()
                    }
                }
                VenueType::PublicVenue => template.public_location_name.clone().unwrap_or_else(|| "Lugar público".to_string()),
                _ => "Reunión de grupo".to_string(),
            };
            let mut desc = format!("Reunión semanal de {}.", edition.nombre_publico);
            if let Some(ref_note) = &template.host_reference {
                desc.push_str(&format!("\\nReferencia: {}", ref_note));
            }
            (sum, loc, desc)
        };

        let escaped_loc = location.replace(',', "\\,");
        let escaped_summary = summary.replace(',', "\\,");

        ics.push_str("BEGIN:VEVENT\r\n");
        ics.push_str(&format!("UID:{}-week-{}@portico.amorygracia.org\r\n", edition.id, week_num));
        ics.push_str(&format!("DTSTAMP:{}\r\n", now_stamp));
        ics.push_str(&format!("DTSTART:{}\r\n", dtstart));
        ics.push_str(&format!("DTEND:{}\r\n", dtend));
        ics.push_str(&format!("SUMMARY:{}\r\n", escaped_summary));
        ics.push_str(&format!("LOCATION:{}\r\n", escaped_loc));
        ics.push_str(&format!("DESCRIPTION:{}\r\n", description));
        ics.push_str("STATUS:CONFIRMED\r\n");
        ics.push_str("SEQUENCE:1\r\n");
        ics.push_str("END:VEVENT\r\n");
    }

    ics.push_str("END:VCALENDAR\r\n");
    ics
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_season() -> Season {
        Season {
            id: "season_fall_2026".to_string(),
            campus_id: "campus_durango".to_string(),
            nombre_publico: "Otoño 2026".to_string(),
            fecha_inicio: NaiveDate::from_ymd_opt(2026, 9, 28).unwrap(), // Lunes 28 Sept 2026
            fecha_fin: NaiveDate::from_ymd_opt(2026, 12, 20).unwrap(),   // 12 semanas
            estado: SeasonState::EnCurso,
        }
    }

    fn test_edition() -> Edition {
        Edition {
            id: "ed_jovenes".to_string(),
            season_id: "season_fall_2026".to_string(),
            created_from_template_id: None,
            nombre_publico: "Jóvenes Durango".to_string(),
            proposito: "Conexión y amistad".to_string(),
            affinity_id: "aff_jovenes".to_string(),
            portada_asset_id: None,
            dia_habitual: 4, // Jueves
            hora_habitual: "19:30".to_string(),
            cupo_orientativo: 15,
            responsible_member_id: "mem_carlos".to_string(),
            public_responsible_visibility: true,
            estado: EditionState::Reconocida,
            is_full: false,
            aviso_breve: None,
            whatsapp_chat_url: None,
            logistics_version: 1,
            modality: crate::domain::GroupModality::Residential,
            cell_accent: None,
            transit_friendly: false,
            carpool_available: false,
            macro_zone: Some("Centro".to_string()),
            campus_id: None,
            consecutive_seasons_hosted: 1,
            venue_nature: crate::domain::VenueNature::Home,
            good_neighbor_pledge: true,
            child_safeguarding_certified: true,
            parent_group_id: None,
            liaison_name: None,
            liaison_role: None,
            access_protocol: None,
        }
    }

    fn test_template() -> MeetingTemplate {
        MeetingTemplate {
            weekday: 4, // Jueves
            time: "19:30".to_string(),
            venue_type: VenueType::PrivateHome,
            zone_id: Some("zone_jardines".to_string()),
            public_location_name: None,
            public_location_url: None,
            private_reference: Some("Frente al parque de los pinos".to_string()),
            private_address: Some("Calle Las Rosas 123".to_string()),
            host_reference: Some("Familia Gómez".to_string()),
            host_phone: Some("6181234567".to_string()),
            apprentice_id: None,
            kids_welcome: true,
            kids_space_type: "play_area".to_string(),
            rsvp_cutoff_hours: 4,
        }
    }

    #[test]
    fn test_generate_12_week_schedule() {
        let start = NaiveDate::from_ymd_opt(2026, 9, 28).unwrap(); // Lunes
        let dates = generate_season_schedule(start, 4, 12); // Jueves

        assert_eq!(dates.len(), 12);
        assert_eq!(dates[0], NaiveDate::from_ymd_opt(2026, 10, 1).unwrap()); // Primer jueves
        assert_eq!(dates[11], NaiveDate::from_ymd_opt(2026, 12, 17).unwrap()); // Semana 12
    }

    #[test]
    fn test_resolve_normal_meeting_without_exceptions() {
        let season = test_season();
        let edition = test_edition();
        let template = test_template();
        let exceptions = vec![];
        let today = NaiveDate::from_ymd_opt(2026, 9, 29).unwrap();

        let next = resolve_next_meeting(&edition, &template, &exceptions, today, &season);
        assert!(next.is_some());
        let meeting = next.unwrap();
        assert_eq!(meeting.date, NaiveDate::from_ymd_opt(2026, 10, 1).unwrap());
        assert_eq!(meeting.venue_type, VenueType::PrivateHome);
    }

    #[test]
    fn test_resolve_with_cancellation_skips_to_next_week() {
        let season = test_season();
        let edition = test_edition();
        let template = test_template();
        let exceptions = vec![MeetingException {
            id: "ex_cancel".to_string(),
            edition_id: edition.id.clone(),
            date: NaiveDate::from_ymd_opt(2026, 10, 1).unwrap(),
            status: ExceptionStatus::Cancelled,
            venue_type: VenueType::PrivateHome,
            zone_id: None,
            public_location_name: None,
            public_location_url: None,
            private_reference: None,
            private_address: None,
            host_reference: None,
            note: Some("Cancelado por lluvia".to_string()),
            logistics_version: 2,
        }];
        let today = NaiveDate::from_ymd_opt(2026, 9, 29).unwrap();

        let next = resolve_next_meeting(&edition, &template, &exceptions, today, &season);
        assert!(next.is_some());
        let meeting = next.unwrap();
        // Saltó del 1 de Octubre al 8 de Octubre
        assert_eq!(meeting.date, NaiveDate::from_ymd_opt(2026, 10, 8).unwrap());
    }

    #[test]
    fn test_resolve_with_taqueria_exception() {
        let season = test_season();
        let edition = test_edition();
        let template = test_template();
        let exceptions = vec![MeetingException {
            id: "ex_tacos".to_string(),
            edition_id: edition.id.clone(),
            date: NaiveDate::from_ymd_opt(2026, 10, 1).unwrap(),
            status: ExceptionStatus::Scheduled,
            venue_type: VenueType::PublicVenue,
            zone_id: None,
            public_location_name: Some("Taquería El Pastorcito".to_string()),
            public_location_url: Some("https://maps.google.com/?q=ElPastorcito".to_string()),
            private_reference: None,
            private_address: None,
            host_reference: None,
            note: Some("Esta semana comemos tacos juntos".to_string()),
            logistics_version: 3,
        }];
        let today = NaiveDate::from_ymd_opt(2026, 9, 29).unwrap();

        let next = resolve_next_meeting(&edition, &template, &exceptions, today, &season);
        assert!(next.is_some());
        let meeting = next.unwrap();
        assert_eq!(meeting.venue_type, VenueType::PublicVenue);
        assert_eq!(meeting.public_location_name.unwrap(), "Taquería El Pastorcito");
        assert_eq!(meeting.logistics_version, 3);
    }

    #[test]
    fn test_privacy_filtering_hides_private_home_address_from_non_members() {
        let meeting = ResolvedMeeting {
            date: NaiveDate::from_ymd_opt(2026, 10, 1).unwrap(),
            time: "19:30".to_string(),
            venue_type: VenueType::PrivateHome,
            public_location_name: None,
            public_location_url: None,
            zone_label: Some("Jardines".to_string()),
            private_reference: Some("Frente al parque".to_string()),
            private_address: Some("Calle Las Rosas 123".to_string()),
            host_reference: Some("Familia Gómez".to_string()),
            note: None,
            is_cancelled: false,
            logistics_version: 1,
        };

        // Si es visitante (no miembro):
        let visitor_view = filter_meeting_for_viewer(&meeting, false);
        assert!(visitor_view.private_address.is_none());
        assert!(visitor_view.private_reference.is_none());

        // Si es miembro activo:
        let member_view = filter_meeting_for_viewer(&meeting, true);
        assert_eq!(member_view.private_address.unwrap(), "Calle Las Rosas 123");
        assert_eq!(member_view.private_reference.unwrap(), "Frente al parque");
    }

    #[test]
    fn test_generate_edition_calendar_feed_auto_updating() {
        let edition = test_edition();
        let template = test_template();
        let start_date = NaiveDate::from_ymd_opt(2026, 10, 1).unwrap();

        let venues = vec![
            SessionVenue {
                id: "v1".to_string(),
                edition_id: edition.id.clone(),
                week_number: 1,
                venue_name: "Taquería El Pastorcito".to_string(),
                address: "Blvd. Durango 102".to_string(),
                maps_url: Some("https://maps.google.com/?q=pastorcito".to_string()),
                notes: Some("Llevar efectivo".to_string()),
                venue_type: VenueType::PublicVenue,
                host_name: None,
                host_phone: None,
                created_at: "2026-09-01".to_string(),
            },
            SessionVenue {
                id: "v2".to_string(),
                edition_id: edition.id.clone(),
                week_number: 2,
                venue_name: "Casa Familia Ramírez".to_string(),
                address: "Calle Hidalgo 312".to_string(),
                maps_url: Some("https://maps.google.com/?q=hidalgo312".to_string()),
                notes: Some("Timbre blanco".to_string()),
                venue_type: VenueType::PrivateHome,
                host_name: Some("Carlos y Martha Ramírez".to_string()),
                host_phone: Some("+526181112233".to_string()),
                created_at: "2026-09-01".to_string(),
            },
        ];

        // 1. Vista de Miembro Inscrito: ve la casa particular de la semana 2 con dirección completa
        let feed_member = generate_edition_calendar_feed(&edition, &template, start_date, &venues, true);
        assert!(feed_member.contains("BEGIN:VCALENDAR"));
        assert!(feed_member.contains("METHOD:PUBLISH"));
        assert!(feed_member.contains("X-WR-CALNAME:Jóvenes Durango"));
        assert!(feed_member.contains("SUMMARY:Jóvenes Durango - Sem 1 (Taquería El Pastorcito)"));
        assert!(feed_member.contains("LOCATION:Blvd. Durango 102"));
        assert!(feed_member.contains("SUMMARY:Jóvenes Durango - Sem 2 (Casa Familia Ramírez)"));
        assert!(feed_member.contains("LOCATION:Calle Hidalgo 312"));
        assert!(feed_member.contains("Anfitrión: Carlos y Martha Ramírez"));

        // 2. Vista de Visitante Público: la dirección de la casa de semana 2 está enmascarada
        let feed_visitor = generate_edition_calendar_feed(&edition, &template, start_date, &venues, false);
        assert!(feed_visitor.contains("SUMMARY:Jóvenes Durango - Sem 1 (Taquería El Pastorcito)"));
        assert!(feed_visitor.contains("LOCATION:Blvd. Durango 102"));
        assert!(!feed_visitor.contains("LOCATION:Calle Hidalgo 312"));
        assert!(feed_visitor.contains("Casa particular · Dirección exacta revelada al unirse o confirmar"));
    }
}
