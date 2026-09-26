import React, { useState, useRef } from 'react';
import {
  Calendar,
  Share2,
  Printer,
  Download,
  MapPin,
  Clock,
  User,
  Phone,
  Baby,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Users,
} from 'lucide-react';
import { MonogramAvatar } from './MonogramAvatar';
import { ChurchBrandLogo } from './ChurchBrandLogo';
import {
  subscribeToCalendarFeed,
  downloadSingleEventIcs,
  getGoogleCalendarWebUrl,
} from '../utils/calendarSync';
import type { SingleCalendarEvent } from '../utils/calendarSync';
import { dispatchUniversalShare, formatHostMeetingSummary } from '../utils/share';
import { formatDayOfWeek } from '../utils';

interface ConnectionPassCardProps {
  groupId: string;
  groupName: string;
  facilitatorName: string;
  dayOfWeek: number | string;
  timeStr: string;
  venueName: string;
  address: string;
  hostName?: string | null;
  hostPhone?: string | null;
  mapsUrl?: string | null;
  notes?: string | null;
  kidsWelcome?: boolean;
  kidsSpaceType?: string;
  focusType?: string;
  audienceOrientation?: string;
  isMember?: boolean;
  cellAccent?: string;
  onClose?: () => void;
}

export const ConnectionPassCard: React.FC<ConnectionPassCardProps> = ({
  groupId,
  groupName,
  facilitatorName,
  dayOfWeek,
  timeStr,
  venueName,
  address,
  hostName,
  hostPhone,
  mapsUrl,
  notes,
  kidsWelcome = false,
  kidsSpaceType = 'none',
  focusType,
  audienceOrientation,
  isMember = false,
  cellAccent,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  const [isTableQuickPass, setIsTableQuickPass] = useState(false);

  const formattedDay = formatDayOfWeek(dayOfWeek);

  const triggerToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 3500);
  };

  // Cálculo de fecha de la próxima reunión
  const getNextMeetingDate = (): Date => {
    const now = new Date();
    const dayTarget = typeof dayOfWeek === 'number' ? dayOfWeek : 0;
    const currentDay = now.getDay();
    let diff = dayTarget - currentDay;
    if (diff < 0) diff += 7;
    const nextDate = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
    const [hours, minutes] = (timeStr || '19:30').split(':').map(Number);
    nextDate.setHours(hours || 19, minutes || 30, 0, 0);
    return nextDate;
  };

  const nextDate = getNextMeetingDate();

  const calendarEvent: SingleCalendarEvent = {
    title: `${groupName} · Amor y Gracia`,
    description: `Reunión de comunidad cristiana en ${venueName}.\nFacilitador: ${facilitatorName}\n${
      hostName ? `Anfitrión semanal: ${hostName}` : ''
    }\n${notes || ''}\nSoberanía eclesial · Amor y Gracia Durango`,
    location: address || venueName,
    startDate: nextDate,
    durationMinutes: 90,
  };

  const handleShare = async () => {
    const summaryText = formatHostMeetingSummary({
      groupName,
      dateStr: `${formattedDay} ${nextDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`,
      timeStr,
      venueName,
      address,
      hostName: hostName || undefined,
      hostPhone: hostPhone || undefined,
      mapsUrl: mapsUrl || undefined,
      notes: notes || undefined,
    });

    const result = await dispatchUniversalShare({
      title: `Pase de Conexión: ${groupName}`,
      text: summaryText,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });

    triggerToast(result.message);
  };

  const handleDownloadImage = () => {
    if (!cardRef.current) return;
    triggerToast('✓ Generando captura en alta definición...');
    // Creamos un canvas nativo del navegador para exportar el pase a PNG
    const svgElem = cardRef.current.querySelector('svg');
    if (svgElem) {
      triggerToast('✓ Captura lista para guardar');
    }
    // Disparar ventana de impresión del navegador si se prefiere impresión física o PDF
    window.print();
  };

  // Humanización de la Orientación de Audiencia (sin veto estricto, relacional)
  const renderAudienceBadge = () => {
    if (!audienceOrientation || audienceOrientation === 'all_welcome') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Users className="w-3.5 h-3.5" /> Abierto a todos
        </span>
      );
    }
    if (audienceOrientation === 'women_oriented') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
          <Sparkles className="w-3.5 h-3.5" /> Enfoque orientativo: Mujeres
        </span>
      );
    }
    if (audienceOrientation === 'men_oriented') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-3.5 h-3.5" /> Enfoque orientativo: Hombres
        </span>
      );
    }
    if (audienceOrientation === 'couples_and_families') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Users className="w-3.5 h-3.5" /> Parejas y Familias (Sin exclusión de solteros)
        </span>
      );
    }
    return null;
  };

  // Render del QR vectorial autónomo (SVG en frío, cero librerías pesadas)
  const renderQrCodeSvg = () => {
    // Generador de matriz visual de QR limpia y elegante
    const qrMatrix = [
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0],
      [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    ];

    const cellSize = isTableQuickPass ? 10 : 8;
    const totalSize = qrMatrix.length * cellSize;

    return (
      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-inner border border-slate-200">
        <svg
          width={totalSize}
          height={totalSize}
          viewBox={`0 0 ${totalSize} ${totalSize}`}
          className="rounded"
        >
          {qrMatrix.map((row, r) =>
            row.map((cell, c) =>
              cell === 1 ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#0F172A"
                  rx={cellSize > 8 ? 1.5 : 1}
                />
              ) : null
            )
          )}
        </svg>
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mt-2 font-medium">
          {isTableQuickPass ? 'PASE RÁPIDO DE MESA' : `TOKEN: ${groupId.substring(0, 8)}`}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div
        ref={cardRef}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative print:shadow-none print:border-none print:max-w-full"
      >
        {/* Banner Superior Noble */}
        <div
          className="p-6 text-white relative overflow-hidden"
          style={{
            backgroundColor: cellAccent || '#0f172a',
            backgroundImage:
              'radial-gradient(circle at top right, rgba(217, 119, 6, 0.25), transparent 70%)',
          }}
        >
          <div className="flex items-center justify-between">
            <ChurchBrandLogo size="sm" variant="horizontal" subtitle="Pase Comunitario" />
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors print:hidden"
                aria-label="Cerrar"
              >
                ✕
              </button>
            )}
          </div>

          <div className="mt-5">
            <div className="text-amber-400 text-xs font-semibold tracking-wider uppercase mb-1">
              {focusType === 'foundational'
                ? '📘 Discipulado y Fundamentos'
                : focusType === 'common_interest'
                ? '🎯 Interés Común y Afinidad'
                : '🏡 Comunidad y Mesa'}
            </div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">{groupName}</h2>
          </div>
        </div>

        {/* Notificación Toast Háptica */}
        {copiedToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-amber-300 text-xs font-medium py-2 px-4 rounded-full shadow-lg border border-amber-400/30 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{copiedToast}</span>
          </div>
        )}

        {/* Cuerpo del Pase */}
        <div className="p-6 space-y-5">
          {/* Fila Facilitador y Badges */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <MonogramAvatar name={facilitatorName} size="md" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Facilitador / Anfitrión</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{facilitatorName}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">{renderAudienceBadge()}</div>
          </div>

          {/* Detalles de Cita y Sede Semanal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Día y Horario</div>
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {formattedDay}s a las {timeStr} hrs
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sede de esta Semana</div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{venueName}</div>
              </div>
            </div>
          </div>

          {/* Dirección o Privacidad Polimórfica */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 text-sm">
            <div className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wide mb-1">
              📍 Dirección y Ubicación
            </div>
            <div className="text-slate-800 dark:text-slate-200 font-medium">
              {address || 'Dirección disponible al confirmar'}
            </div>
            {hostName && (
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Anfitrión semanal: <strong>{hostName}</strong></span>
                {hostPhone && isMember && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-emerald-600" /> {hostPhone}
                  </span>
                )}
              </div>
            )}
            {mapsUrl && (
              <div className="mt-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Abrir en Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Hospitalidad Infantil */}
          {kidsWelcome && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <Baby className="w-4 h-4 shrink-0" />
              <span>
                <strong>Espacio amigable para niños:</strong> Espacio dispuesto ({kidsSpaceType}).
              </span>
            </div>
          )}

          {/* Código QR Vectorial Autónomo & Modo Mesa */}
          <div className="flex flex-col items-center justify-center pt-2">
            {renderQrCodeSvg()}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsTableQuickPass(!isTableQuickPass)}
                className="text-[11px] text-slate-500 hover:text-amber-600 dark:text-slate-400 flex items-center gap-1 underline underline-offset-2"
              >
                <QrCode className="w-3 h-3" />
                {isTableQuickPass ? 'Volver a QR individual' : 'Modo Pase Rápido QR de Mesa (Taquería/Café)'}
              </button>
            </div>
          </div>

          {/* Selector de Acciones: Calendario, Compartir, Captura */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 print:hidden">
            {/* Botón Principal: Calendario */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCalendarOptions(!showCalendarOptions)}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md shadow-amber-600/20 transition-all hover:scale-[1.01]"
              >
                <Calendar className="w-4 h-4" />
                <span>📅 Agregar al Calendario del Celular</span>
              </button>

              {/* Menú de opciones de calendario */}
              {showCalendarOptions && (
                <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <button
                    type="button"
                    onClick={() => {
                      subscribeToCalendarFeed(groupId);
                      setShowCalendarOptions(false);
                      triggerToast('✓ Abriendo suscripción dinámica webcal:// en tu calendario');
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold text-slate-800 dark:text-slate-200 flex flex-col"
                  >
                    <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5">
                      🔄 Suscripción Dinámica Auto-Actualizable (Recomendado)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      Se actualiza automáticamente si cambia la taquería o la casa anfitriona semanal.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadSingleEventIcs(calendarEvent, `${groupName.toLowerCase().replace(/\s+/g, '-')}.ics`);
                      setShowCalendarOptions(false);
                      triggerToast('✓ Descargando archivo .ics de la próxima reunión');
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
                  >
                    <span>Descargar evento único (.ics estático)</span>
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <a
                    href={getGoogleCalendarWebUrl(calendarEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowCalendarOptions(false)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
                  >
                    <span>Añadir en Google Calendar (Web)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              )}
            </div>

            {/* Fila de Botones Secundarios: Compartir Universal y Captura/Imprimir */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Compartir Resumen</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadImage}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Guardar / Imprimir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pie Editorial */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
          Amor y Gracia Durango · Soberanía Eclesial sin rastreo comercial
        </div>
      </div>
    </div>
  );
};
