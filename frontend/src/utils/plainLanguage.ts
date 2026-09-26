/**
 * ============================================================================
 * PÓRTICO OS v3.2 — MÓDULO DE LENGUAJE CLARO Y ACCESIBILIDAD COGNITIVA (GOLD-280)
 * Norma ISO 24495-1:2023 / W3C WCAG Criterio 3.1.5 (Reading Level)
 * La Prueba de Elena Ramos: Comprensibilidad de primaria en México sin perder rigor.
 * ============================================================================
 */

export interface PlainCommitment {
  id: number;
  title: string;
  description: string;
}

/**
 * Los 4 Acuerdos Fraternos de Convivencia Comunitaria (Reemplazo humano del Pacto)
 * Diseñados para que cualquier persona en Durango con educación básica los entienda a la primera lectura.
 */
export const ELENA_RAMOS_COMMITMENTS: PlainCommitment[] = [
  {
    id: 1,
    title: 'Nos escuchamos con paciencia y respeto',
    description: 'En cada reunión hablamos de corazón sin juzgar a nadie.',
  },
  {
    id: 2,
    title: 'Lo que platicamos aquí, aquí se queda',
    description: 'Cuidamos la confianza de todos. Lo que se cuenta en el grupo no sale de la sala.',
  },
  {
    id: 3,
    title: 'No venimos a hacer ventas ni pedir dinero',
    description: 'Este grupo es para convivir en paz. No se hacen ventas de catálogo, tandas ni negocios.',
  },
  {
    id: 4,
    title: 'Nos apoyamos como una familia',
    description: 'Si alguien enferma o pasa un mal rato, oramos juntos y nos cuidamos con cariño.',
  },
];

/**
 * Diccionario de Mapeo Léxico: Del Jargon Técnico al Español Cotidiano y Cálido
 */
export const PLAIN_LANGUAGE_DICTIONARY: Record<string, string> = {
  // Conceptos Estructurales
  silo: 'Mi Grupo y Comunidad',
  silo_de_miembro: 'Mi Grupo y Comunidad',
  member_silo: 'Mi Grupo y Comunidad',
  covenant: 'Nuestro Compromiso de Amor y Respeto',
  pacto: 'Nuestro Compromiso de Amor y Respeto',
  pacto_temporada: 'Nuestro Compromiso de Amor y Respeto',
  triage: 'Inquietudes que atenderemos en persona',
  triaje: 'Inquietudes que atenderemos en persona',
  sla_72h: 'Atención en menos de 3 días',
  sla: 'Atención cercana en pocos días',
  pair_share: 'Plática en parejas (5 min)',
  dunbar_fission: 'Multiplicación para recibir a más vecinos',
  fision_celular: 'Multiplicación para recibir a más vecinos',
  venue_sabbatical: 'Tiempo de descanso para la familia anfitriona',
  sabatico_hogar: 'Tiempo de descanso para la familia anfitriona',
  lfpdppp: 'Tus datos están protegidos y son estrictamente privados',
  aviso_privacidad: 'Tus datos están protegidos y son estrictamente privados',

  // Roles Eclesiales a Nombres Humanos
  leader: 'Líder del Hogar',
  facilitador: 'Líder del Hogar',
  deacon: 'Diácono de Acompañamiento',
  elder: 'Anciano de Sector',
  pastor: 'Pastor de la Comunidad',
  operator: 'Mesa de Servicio Técnico',
  admin: 'Servidor Administrador',

  // Dinámicas de la Reunión
  rsvp: '¿Quiénes vienen a cenar hoy?',
  liturgy_4_moments: 'Nuestra Guía de Reunión (4 Momentos)',
  attendance: 'Anotar asistencia en 1 toque',
  health_alert: 'Aviso confidencial de salud o apoyo',
  deacon_visit_request: 'Platicar con un Diácono de apoyo',
};

/**
 * Traduce términos técnicos a vocabulario de fácil comprensión.
 */
export function humanizeTerm(termKey: string, fallback?: string): string {
  const normalized = termKey.toLowerCase().trim().replace(/[-\s]+/g, '_');
  return PLAIN_LANGUAGE_DICTIONARY[normalized] || fallback || termKey;
}

/**
 * Traduce roles para la interfaz de Elena Ramos y la congregación.
 */
export function humanizeRole(roleKey: string): string {
  return humanizeTerm(roleKey, roleKey);
}

/**
 * Calcula el Índice de Legibilidad de Fernández-Huerta para textos en español.
 * Fórmula: IFH = 206.84 - (0.60 * P) - (1.02 * F)
 * P = número de sílabas por cada 100 palabras
 * F = número de frases por cada 100 palabras
 * Score > 75 = "Muy fácil / Apto para educación primaria" (Criterio Elena Ramos)
 */
export function calculateFernandezHuerta(text: string): { score: number; level: string; isElenaFriendly: boolean } {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return { score: 100, level: 'Muy fácil', isElenaFriendly: true };

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // Estimador fonético de sílabas en español reduciendo diptongos habituales
  const syllableCount = words.reduce((acc, word) => {
    const cleaned = word.toLowerCase().replace(/(ai|au|ei|eu|oi|ou|ia|ie|io|ua|ue|uo|ui|ue)/g, 'a');
    const vowels = cleaned.match(/[aeiouáéíóúü]/g);
    return acc + (vowels ? vowels.length : 1);
  }, 0);

  const P = (syllableCount / words.length) * 100;
  const F = (sentenceCount / words.length) * 100;

  const score = Math.round(206.84 - (0.60 * P) - (1.02 * F));

  let level = 'Muy difícil';
  if (score >= 90) level = 'Muy fácil (4to de primaria)';
  else if (score >= 70) level = 'Fácil (6to de primaria)';
  else if (score >= 60) level = 'Normal (Secundaria)';
  else if (score >= 50) level = 'Algo difícil (Bachillerato)';
  else level = 'Difícil (Universidad)';

  return {
    score,
    level,
    isElenaFriendly: score >= 70,
  };
}
