import React, { useState, useEffect } from 'react';

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
    description: 'Desayuno, comunión y asado fraternal para hombres y padres de familia en Terraza Central.',
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
  onJointDecisionChange?: (isJoint: boolean, sisterGroup: string, details?: string) => void;
  initialJointState?: { isJoint: boolean; sisterGroup: string };
}

export const CellHarmonizer: React.FC<CellHarmonizerProps> = ({
  cellName,
  cellWeekday = 5,
  onHarmonizationSelected,
  onJointDecisionChange,
  initialJointState,
}) => {
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, 'join_general' | 'offset_day' | 'keep_regular'>>(() => {
    try {
      const saved = localStorage.getItem('portico_cell_harmonizer_decisions');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      'desayuno-varones-2026': 'join_general',
    };
  });

  const [savedFeedMessage, setSavedFeedMessage] = useState<string | null>(null);

  // Convivio Fraternal Inter-Celular / Carne Asada State
  const [isJointGathering, setIsJointGathering] = useState<boolean>(initialJointState?.isJoint ?? true);
  const [jointSisterCell, setJointSisterCell] = useState<string>(initialJointState?.sisterGroup ?? 'grp-varones-sur');
  const [jointVenueNotes, setJointVenueNotes] = useState<string>('Terraza Central / Asadores Parque Guadiana');
  const [jointStatusMsg, setJointStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('portico_cell_harmonizer_decisions', JSON.stringify(selectedDecisions));
    } catch {
      // ignore
    }
  }, [selectedDecisions]);

  // Lista de eventos congregacionales y magnos
  const eventsToShow = CONGREGATIONAL_EVENTS;
  const isDirectCollision = (evtWeekday: number) => evtWeekday === cellWeekday;

  const handleDecision = (eventId: string, decision: 'join_general' | 'offset_day' | 'keep_regular') => {
    setSelectedDecisions((prev) => ({ ...prev, [eventId]: decision }));
    if (onHarmonizationSelected) {
      onHarmonizationSelected(decision, eventId);
    }
  };

  const handleConfirmJointGathering = () => {
    setIsJointGathering(true);
    setJointStatusMsg(`Confirmado: Grupo ${cellName} integrado a Carne Asada / Convivio con Célula Hermana.`);
    if (onJointDecisionChange) {
      onJointDecisionChange(true, jointSisterCell, jointVenueNotes);
    }
    setTimeout(() => setJointStatusMsg(null), 5000);
  };

  const handleCancelJointGathering = () => {
    setIsJointGathering(false);
    setJointStatusMsg(`Reunión regular mantenida en sede habitual sin fusión inter-celular.`);
    if (onJointDecisionChange) {
      onJointDecisionChange(false, '');
    }
    setTimeout(() => setJointStatusMsg(null), 5000);
  };

  const handleSubscribeWebCal = () => {
    const webcalUrl = 'webcal://localhost:3000/api/calendar/liturgical.ics';
    setSavedFeedMessage('Enlace de suscripción copiado (RFC 5545). Sincronizable con Apple Calendar, Google Calendar u Outlook.');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(webcalUrl);
    }
    setTimeout(() => setSavedFeedMessage(null), 5000);
  };

  return (
    <div className="cell-harmonizer" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle, #334155)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber, #fbbf24)', textTransform: 'uppercase', marginBottom: '4px' }}>
            <span>Armonizador de Pulso Celular & Agenda Litúrgica (GOLD-297)</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary, #f8fafc)' }}>
            Decisión de Integración a Eventos y Convivios para {cellName}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
            Los líderes deciden con soberanía si su grupo se suma en cuerpo a eventos generales o se reúne para la carne asada y convivio fraternal.
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
          <span>Feed WebCal / ICS</span>
        </button>
      </div>

      {savedFeedMessage && (
        <div style={{ padding: '10px 14px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', borderRadius: '8px', color: '#38bdf8', fontSize: '0.82rem', marginBottom: '14px' }}>
          {savedFeedMessage}
        </div>
      )}

      {/* SECCIÓN 1: CONVIVIO INTER-CELULAR / CARNE ASADA (GOLD-304 & Solicitud de Líderes) */}
      <div
        id="section-joint-bbq-harmonizer"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.85)',
          border: '1.5px solid var(--accent-amber, #fbbf24)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-amber, #fbbf24)' }}>
              Convivio Inter-Celular / Carne Asada Fraternal
            </span>
            <h4 style={{ margin: '2px 0 0 0', fontSize: '1rem', color: '#f8fafc' }}>
              ¿Reunir a los grupos para la Carne Asada o Convivencia Conjunta?
            </h4>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>
            <input
              type="checkbox"
              id="toggle-harmonizer-joint-bbq"
              checked={isJointGathering}
              onChange={(e) => {
                if (e.target.checked) {
                  handleConfirmJointGathering();
                } else {
                  handleCancelJointGathering();
                }
              }}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>Unir con Célula Hermana</span>
          </label>
        </div>

        <p style={{ margin: '0 0 12px 0', fontSize: '0.83rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
          Permite fusionar la reunión de esta semana para un asado fraternal o vigilia unida con deduplicación automática de asistentes y sin falsas inasistencias en la temporada.
        </p>

        {isJointGathering && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid #475569' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  Seleccionar Célula Hermana Participante:
                </label>
                <select
                  id="select-harmonizer-sister-cell"
                  value={jointSisterCell}
                  onChange={(e) => {
                    setJointSisterCell(e.target.value);
                    if (onJointDecisionChange) {
                      onJointDecisionChange(true, e.target.value, jointVenueNotes);
                    }
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f8fafc', fontSize: '0.85rem' }}
                >
                  <option value="grp-varones-sur">Célula de Varones - Jardines / Valle del Sur</option>
                  <option value="grp-jovenes-centro">Célula de Jóvenes - Zona Centro</option>
                  <option value="grp-damas-norte">Célula Femenina - Fidel Velázquez</option>
                  <option value="grp-lomas-oriente">Célula Familiar - Lomas del Parque</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  Sede / Punto del Asado Fraternal:
                </label>
                <input
                  type="text"
                  value={jointVenueNotes}
                  onChange={(e) => setJointVenueNotes(e.target.value)}
                  placeholder="Ej. Terraza Central / Kiosco Parque Guadiana"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f8fafc', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                id="btn-confirm-joint-bbq"
                onClick={handleConfirmJointGathering}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--accent-amber, #fbbf24)',
                  color: '#161513',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Confirmar Integración a Carne Asada
              </button>
              <button
                type="button"
                id="btn-cancel-joint-bbq"
                onClick={handleCancelJointGathering}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #475569',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Mantener Reunión Regular
              </button>
            </div>
          </div>
        )}

        {jointStatusMsg && (
          <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', fontSize: '0.82rem' }}>
            {jointStatusMsg}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: EVENTOS LITÚRGICOS Y GENERALES */}
      <div style={{ marginBottom: '10px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.96rem', color: '#f8fafc' }}>
          Eventos Convocados por la Congregación:
        </h4>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {eventsToShow.map((evt) => {
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#f8fafc' }}>
                    {evt.title}
                  </span>
                  {isDirectCollision(evt.weekday) && (
                    <span style={{ fontSize: '0.72rem', color: '#fbbf24', border: '1px solid #fbbf24', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      Mismo día habitual
                    </span>
                  )}
                </div>
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
                      border: currentDecision === 'join_general' ? '1.5px solid #10b981' : '1px solid #334155',
                      background: currentDecision === 'join_general' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                      color: currentDecision === 'join_general' ? '#34d399' : '#94a3b8',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      fontWeight: currentDecision === 'join_general' ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>1. Sumarnos en cuerpo al evento</span>
                    {currentDecision === 'join_general' && (
                      <span style={{ fontSize: '0.72rem', background: '#10b981', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>Activo</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision(evt.id, 'offset_day')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: currentDecision === 'offset_day' ? '1.5px solid #38bdf8' : '1px solid #334155',
                      background: currentDecision === 'offset_day' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                      color: currentDecision === 'offset_day' ? '#38bdf8' : '#94a3b8',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      fontWeight: currentDecision === 'offset_day' ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>2. Mover reunión 24h antes/después</span>
                    {currentDecision === 'offset_day' && (
                      <span style={{ fontSize: '0.72rem', background: '#38bdf8', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>Activo</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision(evt.id, 'keep_regular')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: currentDecision === 'keep_regular' ? '1.5px solid #fbbf24' : '1px solid #334155',
                      background: currentDecision === 'keep_regular' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                      color: currentDecision === 'keep_regular' ? '#fbbf24' : '#94a3b8',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      fontWeight: currentDecision === 'keep_regular' ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>3. Mantener reunión regular</span>
                    {currentDecision === 'keep_regular' && (
                      <span style={{ fontSize: '0.72rem', background: '#fbbf24', color: '#161513', padding: '2px 6px', borderRadius: '4px' }}>Activo</span>
                    )}
                  </button>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                  {currentDecision === 'join_general' && 'El sistema acredita la comunión comunitaria sin penalización de inasistencias en la temporada.'}
                  {currentDecision === 'offset_day' && 'Se notifica automáticamente al anfitrión y miembros sobre el ajuste de día de reunión.'}
                  {currentDecision === 'keep_regular' && 'El grupo sesiona normalmente en su horario habitual de siempre.'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
