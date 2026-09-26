import React, { useState } from 'react';
import { Calendar, Check, Download } from 'lucide-react';

export interface LiturgicalEvent {
  id: string;
  title: string;
  date_str: string;
  weekday: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  time: string;
  scope: 'all' | 'jovenes' | 'mujeres' | 'varones';
  description: string;
}

export const CONGREGATIONAL_EVENTS: LiturgicalEvent[] = [
  {
    id: 'congreso-jovenes-2026',
    title: 'Congreso Anual de Jóvenes: "Firmes en la Verdad"',
    date_str: '2026-10-16',
    weekday: 5, // Viernes
    time: '19:30',
    scope: 'jovenes',
    description: 'Encuentro magno con todas las comunidades de jóvenes de Durango en Auditorio Central.',
  },
  {
    id: 'retiro-mujeres-2026',
    title: 'Retiro Femenino: "Gracia y Sabiduría" (Tito 2)',
    date_str: '2026-11-06',
    weekday: 5, // Viernes
    time: '18:00',
    scope: 'mujeres',
    description: 'Convocatoria para mujeres y madres de familia organizada por el ministerio de damas.',
  },
  {
    id: 'desayuno-varones-2026',
    title: 'Encuentro de Varones y Asado Fraternal',
    date_str: '2026-11-21',
    weekday: 6, // Sábado
    time: '09:00',
    scope: 'varones',
    description: 'Desayuno y comunión para hombres y padres de familia en Terraza Central.',
  },
];

interface CellHarmonizerProps {
  cellName: string;
  cellWeekday?: number; // 0..6
  cellDay?: string;
  cellTime?: string;
  upcomingGeneralEvents?: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    category: string;
  }>;
  onHarmonizationSelected?: (decision: 'join_general' | 'offset_day' | 'keep_regular', eventId: string) => void;
}

export const CellHarmonizer: React.FC<CellHarmonizerProps> = ({
  cellName,
  cellWeekday = 5,
  onHarmonizationSelected,
}) => {
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, 'join_general' | 'offset_day' | 'keep_regular'>>({});
  const [savedFeedMessage, setSavedFeedMessage] = useState<string | null>(null);

  // Check if any congregational event collides with this cell's weekday
  const conflictingEvents = CONGREGATIONAL_EVENTS.filter((e) => e.weekday === cellWeekday);

  const handleDecision = (eventId: string, decision: 'join_general' | 'offset_day' | 'keep_regular') => {
    setSelectedDecisions((prev) => ({ ...prev, [eventId]: decision }));
    if (onHarmonizationSelected) {
      onHarmonizationSelected(decision, eventId);
    }
  };

  const handleSubscribeWebCal = () => {
    const webcalUrl = 'webcal://localhost:3000/api/calendar/liturgical.ics';
    setSavedFeedMessage('✓ Enlace de suscripción copiado (RFC 5545). Sincronizable con Apple Calendar, Google Calendar u Outlook.');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(webcalUrl);
    }
    setTimeout(() => setSavedFeedMessage(null), 5000);
  };

  return (
    <div className="cell-harmonizer" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle, #334155)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber, #fbbf24)', textTransform: 'uppercase', marginBottom: '4px' }}>
            <Calendar size={14} />
            <span>Armonizador de Pulso Celular & Agenda Litúrgica (GOLD-297)</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary, #f8fafc)' }}>
            Convivencia de Eventos Generales con {cellName}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
            Cuando la iglesia convoca un congreso o retiro general, la célula armoniza su ritmo sin burocracia ni falsas inasistencias.
          </p>
        </div>

        <button
          type="button"
          id="btn-webcal-sync"
          onClick={handleSubscribeWebCal}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.12)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Download size={14} />
          <span>Suscribir Calendario (WebCal/ICS)</span>
        </button>
      </div>

      {savedFeedMessage && (
        <div style={{ padding: '10px 14px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', borderRadius: '8px', color: '#38bdf8', fontSize: '0.82rem', marginBottom: '14px' }}>
          {savedFeedMessage}
        </div>
      )}

      {conflictingEvents.length === 0 ? (
        <div style={{ fontSize: '0.86rem', color: 'var(--text-muted, #94a3b8)', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px' }}>
          ✓ No hay colisiones litúrgicas con el día semanal de tu grupo en las próximas 6 semanas. La reunión habitual transcurre con normalidad.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {conflictingEvents.map((evt) => {
            const currentDecision = selectedDecisions[evt.id] || 'join_general';

            return (
              <div
                key={evt.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid #475569',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
                    {evt.title}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
                    {evt.date_str} · {evt.time} hrs
                  </span>
                </div>

                <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {evt.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>
                    Opciones de Armonización Fraternal:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleDecision(evt.id, 'join_general')}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: currentDecision === 'join_general' ? '1px solid #10b981' : '1px solid #334155',
                        background: currentDecision === 'join_general' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                        color: currentDecision === 'join_general' ? '#34d399' : '#94a3b8',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        fontWeight: currentDecision === 'join_general' ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>1. Sumarnos en cuerpo al evento</span>
                      {currentDecision === 'join_general' && <Check size={14} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDecision(evt.id, 'offset_day')}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: currentDecision === 'offset_day' ? '1px solid #38bdf8' : '1px solid #334155',
                        background: currentDecision === 'offset_day' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                        color: currentDecision === 'offset_day' ? '#38bdf8' : '#94a3b8',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        fontWeight: currentDecision === 'offset_day' ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>2. Mover reunión 24h antes/después</span>
                      {currentDecision === 'offset_day' && <Check size={14} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDecision(evt.id, 'keep_regular')}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: currentDecision === 'keep_regular' ? '1px solid #fbbf24' : '1px solid #334155',
                        background: currentDecision === 'keep_regular' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                        color: currentDecision === 'keep_regular' ? '#fbbf24' : '#94a3b8',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        fontWeight: currentDecision === 'keep_regular' ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>3. Mantener reunión regular</span>
                      {currentDecision === 'keep_regular' && <Check size={14} />}
                    </button>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                    {currentDecision === 'join_general' && '✓ El sistema acredita la comunión comunitaria sin penalización de inasistencias en la temporada.'}
                    {currentDecision === 'offset_day' && '✓ Se notifica automáticamente al anfitrión y miembros sobre el ajuste de día de reunión.'}
                    {currentDecision === 'keep_regular' && '✓ El grupo sesiona normalmente en su horario habitual de siempre.'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
