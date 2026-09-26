import React, { useState } from 'react';
import type { CommunityInitiative } from '../types';
import { Users, CheckCircle, Plus, Sparkles, MapPin, Calendar, Phone } from 'lucide-react';

const INITIAL_INITIATIVES: CommunityInitiative[] = [
  {
    id: 'init-hospital-450',
    title: 'Hospital General 450: Café y Acompañamiento en Sala de Espera',
    category: 'servicio',
    date: 'Sábado 10 de Octubre · 08:00 hrs',
    meeting_point: 'Explanada Principal Hospital 450, Blvd. José María Patoni',
    coordinator_name: 'Hermano Pedro Valenzuela',
    coordinator_phone: '+52 618 100 0005',
    pledges: [
      { item: 'Termos de Café Caliente (5L)', committed_by: 'Familia Mendoza', quantity: 2 },
      { item: 'Termos de Café Caliente (5L)', committed_by: 'Pedro Valenzuela', quantity: 1 },
      { item: 'Tortas y Sándwiches Empacados', committed_by: 'Elena Ramos', quantity: 30 },
      { item: 'Cobijas Térmicas Nuevas', committed_by: 'Carlos Mendoza', quantity: 15 },
    ],
    volunteers: [
      { name: 'Pedro Valenzuela', phone: '+52 618 100 0005' },
      { name: 'Elena Ramos', phone: '+52 618 100 0004' },
      { name: 'David Soto', phone: '+52 618 100 0006' },
    ],
  },
  {
    id: 'init-narnia-colloquium',
    title: 'Coloquio Literario: Las Crónicas de Narnia y Teología de C.S. Lewis',
    category: 'lectura_cultura',
    date: 'Jueves 15 de Octubre · 19:30 hrs',
    meeting_point: 'Terraza de Café Central Universitario (Av. Universidad 300)',
    coordinator_name: 'Mariana Torres',
    coordinator_phone: '+52 618 100 0002',
    pledges: [
      { item: 'Ejemplares de "El León, la Bruja y el Ropero"', committed_by: 'Mariana Torres', quantity: 6 },
      { item: 'Guías de Discusión Filosófica y Teológica', committed_by: 'David Soto', quantity: 15 },
      { item: 'Café de Grano y Galletas Artesanales', committed_by: 'Sofía Castro', quantity: 20 },
    ],
    volunteers: [
      { name: 'Mariana Torres', phone: '+52 618 100 0002' },
      { name: 'Sofía Castro', phone: '+52 618 100 0007' },
      { name: 'Carlos Mendoza', phone: '+52 618 100 0001' },
    ],
  },
  {
    id: 'init-parque-reforestacion',
    title: 'Convivencia y Reforestación Comunitaria: Parque Los Pinos',
    category: 'convivencia',
    date: 'Sábado 24 de Octubre · 09:00 hrs',
    meeting_point: 'Kiosco Central Parque Los Pinos, Col. Jardines',
    coordinator_name: 'Roberto Gómez',
    coordinator_phone: '+52 618 100 0003',
    pledges: [
      { item: 'Árboles Jóvenes Nativos de Durango', committed_by: 'Roberto Gómez', quantity: 10 },
      { item: 'Palas, Rastrillos y Guantes de Jardinería', committed_by: 'Comunidad Lomas', quantity: 8 },
      { item: 'Garrafones de Agua Fresca y Fruta', committed_by: 'Martha Gómez', quantity: 4 },
    ],
    volunteers: [
      { name: 'Roberto Gómez', phone: '+52 618 100 0003' },
      { name: 'Martha Gómez', phone: '+52 618 100 0008' },
    ],
  },
];

interface CommunityInitiativesHubProps {
  publicShowcaseOnly?: boolean;
}

export const CommunityInitiativesHub: React.FC<CommunityInitiativesHubProps> = ({
  publicShowcaseOnly = false,
}) => {
  const [initiatives, setInitiatives] = useState<CommunityInitiative[]>(INITIAL_INITIATIVES);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showPledgeModal, setShowPledgeModal] = useState<string | null>(null);
  const [volunteerName, setVolunteerName] = useState<string>('');
  const [volunteerPhone, setVolunteerPhone] = useState<string>('');
  const [pledgeItem, setPledgeItem] = useState<string>('');
  const [pledgeQty, setPledgeQty] = useState<number>(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filtered = initiatives.filter(
    (i) => activeCategory === 'all' || i.category === activeCategory
  );

  const handlePledgeSubmit = (e: React.FormEvent, initId: string) => {
    e.preventDefault();
    if (!volunteerName.trim() || !volunteerPhone.trim()) return;

    setInitiatives((prev) =>
      prev.map((init) => {
        if (init.id !== initId) return init;
        const newPledges = pledgeItem.trim()
          ? [...init.pledges, { item: pledgeItem.trim(), committed_by: volunteerName.trim(), quantity: Number(pledgeQty) || 1 }]
          : init.pledges;
        const newVolunteers = [...init.volunteers, { name: volunteerName.trim(), phone: volunteerPhone.trim() }];
        return { ...init, pledges: newPledges, volunteers: newVolunteers };
      })
    );

    setSuccessMsg(`✓ ¡Gracias ${volunteerName}! Te has sumado a la actividad.`);
    setShowPledgeModal(null);
    setVolunteerName('');
    setVolunteerPhone('');
    setPledgeItem('');
    setPledgeQty(1);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="community-initiatives-hub" style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
          <Sparkles size={14} />
          <span>Iniciativas Abiertas y Buenas Obras · Sin estructura celular de 12 semanas</span>
        </div>
        <h2 style={{ fontSize: '1.4rem', margin: '4px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
          Actividades Comunitarias y Servicio Abierto
        </h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '680px', lineHeight: 1.4 }}>
          Cualquier persona puede sumarse con su presencia o aportar insumos concretos para bendecir a la ciudad de Durango, compartir lecturas o estrechar lazos comunitarios.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '10px', color: '#10b981', fontSize: '0.88rem', fontWeight: 600, marginBottom: '16px' }}>
          {successMsg}
        </div>
      )}

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        {[
          { id: 'all', label: 'Todas las Actividades' },
          { id: 'servicio', label: 'Servicio en Hospital / Misericordia' },
          { id: 'lectura_cultura', label: 'Coloquios de Lectura y Cultura' },
          { id: 'convivencia', label: 'Convivencia y Espacio Público' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeCategory === cat.id ? 'var(--text-primary)' : 'rgba(255,255,255,0.06)',
              color: activeCategory === cat.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Initiative Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.map((init) => (
          <div
            key={init.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: init.category === 'servicio' ? 'rgba(56, 189, 248, 0.15)' : init.category === 'lectura_cultura' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: init.category === 'servicio' ? '#38bdf8' : init.category === 'lectura_cultura' ? '#c084fc' : '#fbbf24',
                  }}
                >
                  {init.category === 'servicio' ? 'Servicio Hospitalario' : init.category === 'lectura_cultura' ? 'Coloquio Cultural' : 'Convivencia'}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={13} /> {init.volunteers.length} voluntarios
                </span>
              </div>

              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {init.title}
              </h3>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} className="text-amber-400" />
                  <span>{init.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} className="text-emerald-400" />
                  <span>{init.meeting_point}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} className="text-indigo-400" />
                  <span>Coordinación: {init.coordinator_name}{!publicShowcaseOnly ? ` (${init.coordinator_phone})` : ''}</span>
                </div>
              </div>

              {/* Pledges List (Solo en Silo del Miembro / GOLD-320) */}
              {!publicShowcaseOnly ? (
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Insumos Comprometidos por la Comunidad:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {init.pledges.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={13} style={{ color: 'var(--accent-emerald)' }} />
                          {p.item} ({p.quantity})
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.committed_by}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '16px', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>Amor y Acompañamiento Ciudadano</strong>
                  Actividad de servicio abierta a toda la comunidad de Durango. Los discípulos y miembros coordinan insumos en sus reuniones de hogar.
                </div>
              )}
            </div>

            {/* Action Buttons (Solo miembros activos pueden comprometer insumos / GOLD-320) */}
            <div>
              {!publicShowcaseOnly ? (
                <button
                  type="button"
                  id={`btn-volunteer-${init.id}`}
                  className="btn-volunteer"
                  onClick={() => setShowPledgeModal(init.id)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'var(--accent-terracotta, #93432F)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Plus size={16} />
                  <span>Sumarme como Voluntario o Llevar Insumo</span>
                </button>
              ) : (
                <div style={{ fontSize: '0.84rem', color: 'var(--accent-emerald)', fontWeight: 600, textAlign: 'center', padding: '8px' }}>
                  ✓ Actividad abierta a la comunidad de Durango
                </div>
              )}
            </div>

            {/* Modal for Pledging */}
            {showPledgeModal === init.id && (
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
                    background: 'var(--bg-surface-elevated, var(--bg-surface))',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '16px',
                    padding: '24px',
                    maxWidth: '440px',
                    width: '100%',
                    boxShadow: 'var(--shadow-elevated)',
                  }}
                >
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    Sumarte a: {init.title}
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Registra tu contacto para coordinar con {init.coordinator_name}.
                  </p>

                  <form onSubmit={(e) => handlePledgeSubmit(e, init.id)}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Tu Nombre:</label>
                      <input
                        type="text"
                        required
                        value={volunteerName}
                        onChange={(e) => setVolunteerName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Teléfono / WhatsApp:</label>
                      <input
                        type="tel"
                        required
                        value={volunteerPhone}
                        onChange={(e) => setVolunteerPhone(e.target.value)}
                        placeholder="Ej. +52 618 123 4567"
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Insumo que deseas aportar (Opcional):</label>
                      <input
                        type="text"
                        value={pledgeItem}
                        onChange={(e) => setPledgeItem(e.target.value)}
                        placeholder="Ej. 1 termo de café de olla / 10 tortas"
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Cantidad de insumo:</label>
                      <input
                        type="number"
                        min="1"
                        value={pledgeQty}
                        onChange={(e) => setPledgeQty(Number(e.target.value) || 1)}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setShowPledgeModal(null)}
                        style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        style={{ padding: '8px 18px', background: 'var(--accent-emerald)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Confirmar Participación
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
