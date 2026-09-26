/**
 * Pórtico OS v3.1 - Utilidades de Calendario Cristiano y Formateo
 */

/**
 * Normaliza nombres de días respetando el calendario cristiano (Domingo como Día 1 / Índice 0)
 * y corrigiendo invariancias de plural en español (ej. evita "Martess", "Miércoless").
 */
export function formatDayOfWeek(dayIndexOrName: number | string): string {
  if (typeof dayIndexOrName === 'number') {
    // Calendario Cristiano: Domingo es el Día 1 (Índice 0 / GOLD-233)
    const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return names[dayIndexOrName % 7] || 'Día no definido';
  }
  const clean = dayIndexOrName.trim().toLowerCase();
  const map: Record<string, string> = {
    domingo: 'Domingo',
    lunes: 'Lunes',
    luness: 'Lunes',
    martes: 'Martes',
    martess: 'Martes',
    miercoles: 'Miércoles',
    miércoles: 'Miércoles',
    miercoless: 'Miércoles',
    jueves: 'Jueves',
    juevess: 'Jueves',
    viernes: 'Viernes',
    vierness: 'Viernes',
    sabado: 'Sábado',
    sábado: 'Sábado',
  };
  return map[clean] || (dayIndexOrName.charAt(0).toUpperCase() + dayIndexOrName.slice(1));
}

/**
 * Nombres completos en plural para citas semanales (ej. "Martes a las 19:30 hrs")
 */
export const CHRISTIAN_WEEKDAY_PLURALS = [
  'Domingos',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábados',
] as const;

export {
  extractInitials,
  getPaletteForName,
  getMonogram,
  getDeterministicPalette,
  type MonogramPalette,
  NOBLE_PALETTES,
} from './components/MonogramAvatar';

