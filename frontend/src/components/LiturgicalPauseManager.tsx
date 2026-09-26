import React, { useState } from 'react';
import type { LiturgicalPause } from '../types';
import { Calendar, Plus, Sun } from 'lucide-react';

const INITIAL_PAUSES: LiturgicalPause[] = [
  {
    id: 'pause-semana-santa-2026',
    title: 'Pausa Litúrgica de Semana Santa',
    start_date: '2026-03-29',
    end_date: '2026-04-05',
    congregation_id: 'org_amorygracia',
  },
  {
    id: 'pause-campamento-2026',
    title: 'Pausa por Campamento y Retiro Congregacional',
    start_date: '2026-07-13',
    end_date: '2026-07-19',
    congregation_id: 'org_amorygracia',
  },
];

export const LiturgicalPauseManager: React.FC = () => {
  const [pauses, setPauses] = useState<LiturgicalPause[]>(INITIAL_PAUSES);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newStartDate, setNewStartDate] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAddPause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStartDate || !newEndDate) return;

    const newPause: LiturgicalPause = {
      id: `pause-${Date.now()}`,
      title: newTitle.trim(),
      start_date: newStartDate,
      end_date: newEndDate,
      congregation_id: 'org_amorygracia',
    };

    setPauses((prev) => [...prev, newPause]);
    setShowAddModal(false);
    setNewTitle('');
    setNewStartDate('');
    setNewEndDate('');
    setSuccessMsg(`✓ Pausa litúrgica "${newPause.title}" declarada exitosamente. El cómputo de semanas se congela en esas fechas.`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="liturgical-pause-manager" style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-indigo, #818cf8)', textTransform: 'uppercase', marginBottom: '4px' }}>
            <Calendar size={14} />
            <span>Gestión Litúrgica de Temporada & Cerrojo Dominical (GOLD-302)</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontFamily: 'var(--font-serif)' }}>
            Pausas Litúrgicas Oficiales de la Congregación
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#94a3b8', maxWidth: '720px', lineHeight: 1.4 }}>
            Las pausas litúrgicas (Semana Santa, congresos generales, asuetos) congelan el contador de semanas de las células sin generar inasistencias ni penalizar el semáforo de permanencia.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            background: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Plus size={15} />
          <span>Declarar Pausa Litúrgica</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '10px', color: '#10b981', fontSize: '0.86rem', fontWeight: 600, marginBottom: '16px' }}>
          {successMsg}
        </div>
      )}

      {/* Sunday Sabbatical Lock Card */}
      <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Sun size={24} className="text-amber-400" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.4 }}>
          <strong style={{ color: '#fbbf24' }}>Cerrojo Litúrgico Dominical Activo:</strong> Por diseño arquitectónico, el domingo está bloqueado como día de reunión para células entre semana. Toda la congregación se reúne unánime el primer día de la semana (Hechos 20:7).
        </div>
      </div>

      {/* Pauses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {pauses.map((p) => (
          <div
            key={p.id}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{p.title}</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                Del {p.start_date} al {p.end_date} (1 semana de reposo litúrgico)
              </div>
            </div>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              ✓ Semáforo Celular Congelado (Cero Deuda)
            </span>
          </div>
        ))}
      </div>

      {/* Modal Add Liturgical Pause */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#f8fafc' }}>
              Declarar Pausa Litúrgica
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              Define el período en que la iglesia suspende reuniones en hogares para enfocarse en actividades congregacionales o reposo.
            </p>

            <form onSubmit={handleAddPause}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Motivo o Título de la Pausa:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Semana Santa / Campamento Anual"
                  style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Fecha de Inicio:</label>
                <input
                  type="date"
                  required
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Fecha de Término:</label>
                <input
                  type="date"
                  required
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #475569', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', background: '#4f46e5', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Guardar Pausa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
