use crate::domain::NamingScheme;

pub struct NamingFormatter;

impl NamingFormatter {
    /// Formatea el nombre de la sede usando el esquema configurado por la iglesia
    pub fn format_campus_title(scheme: &NamingScheme, city_or_name: &str) -> String {
        format!("{} {}", scheme.singular, city_or_name)
    }

    /// Retorna el título para el selector público (ej. "Nuestras Iglesias" o "Nuestros Campuses")
    pub fn format_selector_heading(scheme: &NamingScheme) -> String {
        format!("Nuestras {}", scheme.plural)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_naming_scheme_iglesia() {
        let scheme = NamingScheme {
            singular: "Iglesia".to_string(),
            plural: "Iglesias".to_string(),
        };

        assert_eq!(
            NamingFormatter::format_campus_title(&scheme, "Durango"),
            "Iglesia Durango"
        );
        assert_eq!(
            NamingFormatter::format_selector_heading(&scheme),
            "Nuestras Iglesias"
        );
    }

    #[test]
    fn test_naming_scheme_campus() {
        let scheme = NamingScheme {
            singular: "Campus".to_string(),
            plural: "Campuses".to_string(),
        };

        assert_eq!(
            NamingFormatter::format_campus_title(&scheme, "Norte"),
            "Campus Norte"
        );
    }

    #[test]
    fn test_naming_scheme_casa() {
        let scheme = NamingScheme {
            singular: "Casa".to_string(),
            plural: "Casas".to_string(),
        };

        assert_eq!(
            NamingFormatter::format_campus_title(&scheme, "San Pedro"),
            "Casa San Pedro"
        );
    }
}
