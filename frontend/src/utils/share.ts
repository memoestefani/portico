/**
 * Pórtico OS v3.1 - Despacho Universal de Compartir (GOLD-250)
 * Desacoplamiento total de WhatsApp: Web Share API nativa móvil con fallback inteligente a Portapapeles
 */

export interface UniversalSharePayload {
  title: string;
  text: string;
  url?: string;
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'manual';
  message: string;
}

/**
 * Despacha el contenido de forma universal respetando el entorno del usuario:
 * 1. Intenta `navigator.share()` en dispositivos móviles (abre WhatsApp, Telegram, Correo, Notas, etc.)
 * 2. Si no está disponible o falla, copia al portapapeles con `navigator.clipboard.writeText()`
 * 3. En caso extremo sin soporte de clipboard, retorna el texto para copia manual.
 */
export async function dispatchUniversalShare(payload: UniversalSharePayload): Promise<ShareResult> {
  const fullText = payload.url ? `${payload.text}\n\nEnlace: ${payload.url}` : payload.text;

  // 1. Detección de Web Share API nativa (Móviles iOS / Android)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
      return {
        success: true,
        method: 'native',
        message: 'Compartido mediante el menú nativo del sistema.',
      };
    } catch (err: unknown) {
      // Si el usuario canceló la hoja de compartir (AbortError), no es un fallo crítico
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          success: true,
          method: 'native',
          message: 'Compartir cancelado por el usuario.',
        };
      }
      // Si falló por otra razón, continúa hacia el fallback de portapapeles
    }
  }

  // 2. Fallback a Portapapeles del navegador
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(fullText);
      return {
        success: true,
        method: 'clipboard',
        message: '✓ Resumen copiado al portapapeles. Puedes pegarlo en cualquier aplicación.',
      };
    } catch {
      // Continuar al fallback manual
    }
  }

  // 3. Fallback manual con textarea temporal
  try {
    const textArea = document.createElement('textarea');
    textArea.value = fullText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      return {
        success: true,
        method: 'clipboard',
        message: '✓ Resumen copiado al portapapeles.',
      };
    }
  } catch {
    // Silencioso
  }

  return {
    success: false,
    method: 'manual',
    message: 'No se pudo copiar automáticamente. Por favor copia el texto manualmente.',
  };
}

/**
 * Genera el texto limpio y legible del Resumen de Anfitrión / Sesión Semanal
 * sin etiquetas raras, sin emojis excesivos, sobrio y litúrgico.
 */
export function formatHostMeetingSummary(params: {
  groupName: string;
  sessionNumber?: number;
  dateStr: string;
  timeStr: string;
  venueName: string;
  address: string;
  hostName?: string;
  hostPhone?: string;
  mapsUrl?: string;
  notes?: string;
}): string {
  const lines: string[] = [];
  lines.push(`🏛️ ${params.groupName.toUpperCase()}`);
  if (params.sessionNumber) {
    lines.push(`Sesión Semanal #${params.sessionNumber}`);
  }
  lines.push('──────────────────────────────');
  lines.push(`📅 Cita: ${params.dateStr} a las ${params.timeStr} hrs`);
  lines.push(`📍 Lugar: ${params.venueName}`);
  if (params.address) {
    lines.push(`🏠 Dirección: ${params.address}`);
  }
  if (params.hostName) {
    lines.push(`🤝 Anfitrión de la semana: ${params.hostName}`);
    if (params.hostPhone) {
      lines.push(`📞 Contacto anfitrión: ${params.hostPhone}`);
    }
  }
  if (params.mapsUrl) {
    lines.push(`🗺️ Ubicación en mapa: ${params.mapsUrl}`);
  }
  if (params.notes) {
    lines.push(`📝 Notas importantes: ${params.notes}`);
  }
  lines.push('──────────────────────────────');
  lines.push('¡Te esperamos con alegría y reverencia!');

  return lines.join('\n');
}
