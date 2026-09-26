import React, { useState } from 'react';
import type { PastorCollisionDispute } from '../types';
import { ShieldAlert, CheckCircle, Ban, Phone, Users, ChevronRight } from 'lucide-react';

const INITIAL_DISPUTES: PastorCollisionDispute[] = [
  {
    id: 'disp-001',
    member_id: 'mem_pedro_morales',
    member_name: 'Pedro Morales',
    member_phone: '+52 618 123 4567',
    source_group_id: 'gp1_centro',
    source_group_name: 'GP Centro Jóvenes (Carlos Mendoza)',
    target_group_id: 'gp2_lomas',
    target_group_name: 'GP Lomas Matrimonios (Roberto Gómez)',
    elder_id: 'elder_andres',
    elder_name: 'Andrés Ramos',
    elder_sector: 'Sector Poniente',
    reason: 'Cambio de domicilio familiar a Lomas del Parque y deseo de integrarse con matrimonios jóvenes tras matrimonio reciente.',
    status: 'pending',
  },
  {
    id: 'disp-002',
    member_id: 'mem_lucia_vargas',
    member_name: 'Lucía Vargas',
    member_phone: '+52 618 987 6543',
    source_group_id: 'gp3_oriente',
    source_group_name: 'GP Café & Fe Oriente (Mariana Torres)',
    target_group_id: 'gp4_frontera',
    target_group_name: 'GP Online Frontera (Carlos Mendoza)',
    elder_id: 'elder_samuel',
    elder_name: 'Samuel Prieto',
    elder_sector: 'Sector Oriente',
    reason: 'Cambio de turno laboral rotativo; requiere modalidad virtual los sábados.',
    status: 'pending',
  },
];

export const PastorAntiCollisionDesk: React.FC = () => {
  const [disputes, setDisputes] = useState<PastorCollisionDispute[]>(INITIAL_DISPUTES);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleRatify = (id: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'ratified' } : d))
    );
    const item = disputes.find((d) => d.id === id);
    setStatusMsg(`✓ Transición ratificada con bendición pastoral para ${item?.member_name}. Ambos facilitadores han sido notificados.`);
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleVeto = (id: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'vetoed' } : d))
    );
    const item = disputes.find((d) => d.id === id);
    setStatusMsg(`⏸ Veto pastoral preventivo aplicado a ${item?.member_name}. La transferencia está pausada para diálogo fraterno con el Anciano ${item?.elder_name}.`);
    setTimeout(() => setStatusMsg(null), 6000);
  };

  return (
    <div className="pastor-anti-collision-desk" style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber, #fbbf24)', textTransform: 'uppercase', marginBottom: '4px' }}>
            <ShieldAlert size={14} />
            <span>Desanonimización Contextual Exclusiva para Pastor Principal (GOLD-301)</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontFamily: 'var(--font-serif)' }}>
            Ruteo Anti-Colisión y Mediación Pastoral de Traslados
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#94a3b8', maxWidth: '720px', lineHeight: 1.4 }}>
            Visualización desanonimizada de hermanos en procesos de cambio celular o duplicidad. Josh dispone de nombres reales, motivos asentados y contacto con el anciano responsable para ejercer discernimiento consciente.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid #38bdf8', borderRadius: '10px', color: '#38bdf8', fontSize: '0.86rem', fontWeight: 600, marginBottom: '16px' }}>
          {statusMsg}
        </div>
      )}

      {disputes.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
          ✓ Todas las transiciones celulares están en paz y armonía. Cero conflictos de ruteo activos.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {disputes.map((disp) => {
            const isPending = disp.status === 'pending';

            return (
              <div
                key={disp.id}
                style={{
                  background: '#1e293b',
                  border: `1px solid ${disp.status === 'ratified' ? '#10b981' : disp.status === 'vetoed' ? '#f59e0b' : '#475569'}`,
                  borderRadius: '14px',
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                      {disp.member_name}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#38bdf8', marginLeft: '10px' }}>
                      <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {disp.member_phone}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: disp.status === 'ratified' ? 'rgba(16, 185, 129, 0.15)' : disp.status === 'vetoed' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      color: disp.status === 'ratified' ? '#34d399' : disp.status === 'vetoed' ? '#fbbf24' : '#38bdf8',
                    }}
                  >
                    {disp.status === 'ratified' ? 'Ratificado por Josh' : disp.status === 'vetoed' ? 'Veto Pastoral en Diálogo' : 'Pendiente de Visto Bueno Pastoral'}
                  </span>
                </div>

                {/* Transfer Route */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#cbd5e1', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#94a3b8' }}>Origen:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{disp.source_group_name}</span>
                  <ChevronRight size={16} className="text-amber-400" />
                  <span style={{ color: '#94a3b8' }}>Destino Solicitado:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{disp.target_group_name}</span>
                </div>

                {/* Elder Responsible */}
                <div style={{ fontSize: '0.8rem', color: '#c084fc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} />
                  <span>Anciano de Supervisión: {disp.elder_name} ({disp.elder_sector})</span>
                </div>

                {/* Reason */}
                <div style={{ background: '#0f172a', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem', color: '#94a3b8', marginBottom: '14px', borderLeft: '3px solid #fbbf24' }}>
                  <strong style={{ color: '#e2e8f0' }}>Motivo Relacional Asentado:</strong> "{disp.reason}"
                </div>

                {/* Pastoral Action Buttons */}
                {isPending && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleVeto(disp.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#fbbf24',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Ban size={14} />
                      <span>Veto Pastoral con Diálogo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRatify(disp.id)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '8px',
                        background: '#10b981',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle size={14} />
                      <span>Ratificar Transición</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
