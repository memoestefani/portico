/**
 * Pórtico OS v3.1 - Sincronización Móvil de Calendario Nativo (GOLD-260 & GOLD-260b)
 * 1. Suscripción Dinámica Auto-Actualizable mediante protocolo webcal:// (RFC 5545)
 *    Se actualiza automáticamente en el celular del usuario cuando el líder cambia la sede/anfitrión de la semana.
 * 2. Descarga de evento individual estático .ics para archivo sin suscripción.
 * 3. Enlace web directo a Google Calendar como alternativa desktop.
 */

export interface SingleCalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  durationMinutes: number;
}

/**
 * Convierte una fecha JavaScript a formato UTC RFC 5545 (YYYYMMDDTHHMMSSZ).
 */
export function formatIcsDate(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Limpia y escapa texto para formato RFC 5545 iCalendar.
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Obtiene la URL de suscripción auto-actualizable `webcal://` para el grupo.
 * Si el servidor está en `https://amorygracia.mx/api/groups/1/calendar.ics`,
 * genera `webcal://amorygracia.mx/api/groups/1/calendar.ics`.
 */
export function getCalendarSubscriptionUrl(groupId: string): string {
  if (typeof window === 'undefined') {
    return `webcal://localhost:3000/api/groups/${groupId}/calendar.ics`;
  }
  const loc = window.location;
  const host = loc.host;
  // Usar protocolo webcal para que iOS Calendar y Google Calendar lo registren como suscripción activa
  return `webcal://${host}/api/groups/${groupId}/calendar.ics`;
}

/**
 * Dispara la suscripción activa al calendario en el dispositivo del usuario.
 * Abre el feed con protocolo webcal:// provocando que iOS/Android/macOS abran
 * la app nativa de calendario para suscribirse.
 */
export function subscribeToCalendarFeed(groupId: string): void {
  const url = getCalendarSubscriptionUrl(groupId);
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}

/**
 * Genera el archivo .ics RFC 5545 para un evento individual estático.
 */
export function generateSingleEventIcs(event: SingleCalendarEvent): string {
  const dtStamp = formatIcsDate(new Date());
  const dtStart = formatIcsDate(event.startDate);
  const endDate = new Date(event.startDate.getTime() + event.durationMinutes * 60 * 1000);
  const dtEnd = formatIcsDate(endDate);
  const uid = `portico-single-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@amorygracia.mx`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Portico OS//Calendario Cristiano v3.1//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Recordatorio: ${escapeIcsText(event.title)} en 2 horas`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Descarga directamente el archivo .ics al dispositivo.
 */
export function downloadSingleEventIcs(event: SingleCalendarEvent, filename = 'reunion-portico.ics'): void {
  const icsContent = generateSingleEventIcs(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Genera el enlace directo para añadir el evento en Google Calendar Web (Desktop).
 */
export function getGoogleCalendarWebUrl(event: SingleCalendarEvent): string {
  const startStr = formatIcsDate(event.startDate);
  const endDate = new Date(event.startDate.getTime() + event.durationMinutes * 60 * 1000);
  const endStr = formatIcsDate(endDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startStr}/${endStr}`,
    details: event.description,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
