import React from 'react';
import type { PastorGroupRow } from '../types';
import { Users, ShieldCheck, HeartHandshake, Phone, MessageSquare, X } from 'lucide-react';

interface GroupPastoralCardProps {
  group: PastorGroupRow;
  onClose: () => void;
  onGrantSabbatical?: (groupId: string) => void;
}

export const GroupPastoralCard: React.FC<GroupPastoralCardProps> = ({
  group,
  onClose,
  onGrantSabbatical,
}) => {
  // In a real church context, we determine the pastoral oversight for this group:
  const isInstitutional = group.nombre_publico.toLowerCase().includes('cereso') || group.nombre_publico.toLowerCase().includes('hospital');

  const triad = {
    facilitatorName: group.responsible_name || group.leader_name || 'Carlos Mendoza',
    facilitatorPhone: '+52 618 100 0001',
    hostTitle: isInstitutional ? 'Contacto / Enlace Institucional' : 'Anfitrión de Hogar',
    hostName: isInstitutional ? 'Lic. Sergio Beltrán (Trabajo Social)' : 'Roberto Gómez y Familia',
    hostPhone: isInstitutional ? '+52 618 100 0012' : '+52 618 100 0003',
    apprenticeName: 'David Soto',
    apprenticePhone: '+52 618 100 0006',
  };

  const pastoralChain = {
    deaconName: 'Mateo Valenzuela (Diácono Asignado)',
    deaconPhone: '+52 618 100 0020',
    lastVisitDate: 'Hace 3 semanas (12 de Septiembre)',
    visitAtmosphere: 'Serena y Fraterna · Sin tensiones detectadas',
    elderName: 'Andrés Ramos (Anciano de Sector)',
    elderPhone: '+52 618 100 0030',
    elderSector: group.zone || 'Sector Centro',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1500,
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '20px',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
          padding: '28px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber, #fbbf24)', textTransform: 'uppercase', marginBottom: '6px' }}>
              <ShieldCheck size={14} />
              <span>Ficha Pastoral & Trazabilidad de Cuidado (GOLD-300)</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc', fontFamily: 'var(--font-serif)' }}>
              {group.nombre_publico}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Zona {group.zone} · {group.hora_habitual} hrs · {group.members_count ?? group.enrolled_count ?? 12} miembros activos
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '999px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Sección 1: Tríada Operativa de la Célula */}
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={15} />
            <span>Tríada Relacional de la Célula</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {/* Facilitador */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Facilitador</div>
              <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700, marginTop: '2px' }}>{triad.facilitatorName}</div>
              <a href={`tel:${triad.facilitatorPhone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#38bdf8', marginTop: '6px', textDecoration: 'none' }}>
                <Phone size={12} /> {triad.facilitatorPhone}
              </a>
            </div>

            {/* Anfitrión / Contacto */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.72rem', color: isInstitutional ? '#c084fc' : '#94a3b8', fontWeight: 600 }}>
                {triad.hostTitle}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700, marginTop: '2px' }}>{triad.hostName}</div>
              <a href={`tel:${triad.hostPhone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#38bdf8', marginTop: '6px', textDecoration: 'none' }}>
                <Phone size={12} /> {triad.hostPhone}
              </a>
            </div>

            {/* Aprendiz */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Aprendiz de Relevo</div>
              <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700, marginTop: '2px' }}>{triad.apprenticeName}</div>
              <a href={`tel:${triad.apprenticePhone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#38bdf8', marginTop: '6px', textDecoration: 'none' }}>
                <Phone size={12} /> {triad.apprenticePhone}
              </a>
            </div>
          </div>
        </div>

        {/* Sección 2: Cobertura Pastoral (Diácono & Anciano) */}
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} />
            <span>Cadena de Acompañamiento y Supervisión Pastoral</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Diácono Asignado */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Diácono de Apoyo (Cuidado Fraternal y Sabáticos):</div>
                <div style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 700 }}>{pastoralChain.deaconName}</div>
                <div style={{ fontSize: '0.76rem', color: '#34d399', marginTop: '2px' }}>
                  ✓ Última visita diaconal: {pastoralChain.lastVisitDate} ({pastoralChain.visitAtmosphere})
                </div>
              </div>
              <a
                href={`tel:${pastoralChain.deaconPhone}`}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Phone size={13} />
                <span>Llamar Diácono</span>
              </a>
            </div>

            {/* Anciano Responsable */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Anciano de Sector (Gobierno Espiritual y Consejo):</div>
                <div style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 700 }}>{pastoralChain.elderName}</div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                  Jurisdicción: {pastoralChain.elderSector}
                </div>
              </div>
              <a
                href={`tel:${pastoralChain.elderPhone}`}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <MessageSquare size={13} />
                <span>Mensaje Anciano</span>
              </a>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {onGrantSabbatical && (
            <button
              type="button"
              onClick={() => onGrantSabbatical(group.id)}
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <HeartHandshake size={15} />
              <span>Conceder Sabático Fraternal a la Célula</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              background: '#334155',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
