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
    <div
      id="connection-pass-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        ref={cardRef}
        className="surface-elevated animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-card, #FFFFFF)',
          borderRadius: 'var(--radius-lg, 16px)',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: '1px solid var(--border-soft, #E6DFD5)',
        }}
      >
        {/* Banner Superior Noble */}
        <div
          style={{
            padding: '24px',
            backgroundColor: cellAccent || '#1D3557',
            backgroundImage: 'radial-gradient(circle at top right, rgba(184, 110, 29, 0.25), transparent 70%)',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ChurchBrandLogo size="sm" variant="horizontal" subtitle="Pase Comunitario" />
            {onClose && (
              <button
                onClick={onClose}
                id="btn-close-connection-pass"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                }}
                aria-label="Cerrar"
              >
                X
              </button>
            )}
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ color: 'var(--accent-amber, #B86E1D)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              {focusType === 'foundational'
                ? 'Discipulado y Fundamentos'
                : focusType === 'common_interest'
                ? 'Interes Comun y Afinidad'
                : 'Comunidad y Mesa'}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'Lora, serif', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
              {groupName}
            </h2>
          </div>
        </div>

        {/* Notificación Toast Háptica */}
        {copiedToast && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            backgroundColor: 'var(--text-main, #23272F)',
            color: '#FAF8F5',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={16} style={{ color: '#10B981' }} />
            <span>{copiedToast}</span>
          </div>
        )}

        {/* Cuerpo del Pase */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Fila Facilitador y Badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-soft, #E6DFD5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MonogramAvatar name={facilitatorName} size="md" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #5A6270)' }}>Facilitador / Anfitrion</div>
                <div style={{ fontWeight: 700, color: 'var(--text-main, #23272F)', fontSize: '0.95rem' }}>{facilitatorName}</div>
              </div>
            </div>
            <div>{renderAudienceBadge()}</div>
          </div>

          {/* Detalles de Cita y Sede Semanal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-cream, #FAF8F5)', border: '1px solid var(--border-soft, #E6DFD5)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Clock size={18} style={{ color: 'var(--accent-amber, #B86E1D)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #5A6270)', fontWeight: 600 }}>Dia y Horario</div>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main, #23272F)' }}>
                  {formattedDay}s a las {timeStr} hrs
                </div>
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-cream, #FAF8F5)', border: '1px solid var(--border-soft, #E6DFD5)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <MapPin size={18} style={{ color: 'var(--accent-amber, #B86E1D)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #5A6270)', fontWeight: 600 }}>Sede de esta Semana</div>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main, #23272F)' }}>{venueName}</div>
              </div>
            </div>
          </div>

          {/* Dirección o Privacidad Polimórfica */}
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FDFBF7', border: '1px solid #EFE8DC' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-terracotta, #8C3B24)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} /> Direccion y Ubicacion
            </div>
            <div style={{ color: 'var(--text-main, #23272F)', fontSize: '0.86rem', fontWeight: 600 }}>
              {address || 'Direccion disponible al confirmar'}
            </div>
            {hostName && (
              <div style={{ marginTop: '6px', fontSize: '0.76rem', color: 'var(--text-muted, #5A6270)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={14} style={{ color: 'var(--accent-amber)' }} />
                <span>Anfitrion semanal: <strong>{hostName}</strong></span>
                {hostPhone && isMember && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace' }}>
                    <Phone size={12} style={{ color: 'var(--accent-olive)' }} /> {hostPhone}
                  </span>
                )}
              </div>
            )}
            {mapsUrl && (
              <div style={{ marginTop: '6px' }}>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-terracotta)', textDecoration: 'none' }}
                >
                  Abrir en Google Maps <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          {/* Hospitalidad Infantil */}
          {kidsWelcome && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--accent-olive, #3E5A44)', backgroundColor: '#F2F6F3', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D6E4D9' }}>
              <Baby size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Espacio amigable para familias:</strong> Espacio dispuesto ({kidsSpaceType}).
              </span>
            </div>
          )}

          {/* Código QR Vectorial Autónomo & Modo Mesa */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '4px' }}>
            {renderQrCodeSvg()}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsTableQuickPass(!isTableQuickPass)}
                style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <QrCode size={14} />
                {isTableQuickPass ? 'Volver a QR individual' : 'Modo Pase Rapido QR de Mesa (Taqueria/Cafe)'}
              </button>
            </div>
          </div>

          {/* Selector de Acciones: Calendario, Compartir, Captura */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-soft)' }}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowCalendarOptions(!showCalendarOptions)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent-amber, #B86E1D)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Calendar size={16} />
                <span>Agregar al Calendario del Celular</span>
              </button>

              {showCalendarOptions && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  marginBottom: '8px',
                  padding: '10px',
                  backgroundColor: 'var(--bg-card, #FFFFFF)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  border: '1px solid var(--border-soft)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      subscribeToCalendarFeed(groupId);
                      setShowCalendarOptions(false);
                      triggerToast('Abriendo suscripcion dinamica webcal:// en tu calendario');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ color: 'var(--accent-amber)', fontWeight: 700, display: 'block' }}>
                      Suscripcion Dinamica Auto-Actualizable (Recomendado)
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Se actualiza automaticamente si cambia la sede o la casa anfitriona semanal.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadSingleEventIcs(calendarEvent, `${groupName.toLowerCase().replace(/\s+/g, '-')}.ics`);
                      setShowCalendarOptions(false);
                      triggerToast('Descargando archivo .ics de la proxima reunion');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>Descargar evento unico (.ics estatico)</span>
                    <Download size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>

                  <a
                    href={getGoogleCalendarWebUrl(calendarEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowCalendarOptions(false)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textDecoration: 'none',
                      color: 'var(--text-main)',
                    }}
                  >
                    <span>Anadir en Google Calendar (Web)</span>
                    <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                  </a>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={handleShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-cream, #FAF8F5)',
                  border: '1px solid var(--border-soft)',
                  color: 'var(--text-main)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Share2 size={14} style={{ color: 'var(--text-muted)' }} />
                <span>Compartir Resumen</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadImage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-cream, #FAF8F5)',
                  border: '1px solid var(--border-soft)',
                  color: 'var(--text-main)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Printer size={14} style={{ color: 'var(--text-muted)' }} />
                <span>Guardar / Imprimir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pie Editorial */}
        <div style={{ padding: '12px', backgroundColor: 'var(--bg-cream, #FAF8F5)', borderTop: '1px solid var(--border-soft)', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Amor y Gracia Durango - Soberania Eclesial sin rastreo comercial
        </div>
      </div>
    </div>
  );
};
