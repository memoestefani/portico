import React, { useState, useEffect } from 'react';
import type { CommunityInitiative, InitiativeSuggestion } from '../types';

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

const INITIAL_SUGGESTIONS: InitiativeSuggestion[] = [
  {
    id: 'sug-varones-asado',
    title: 'Carne Asada Inter-Grupal de Varones en Parque Guadiana',
    category: 'convivencia',
    proposed_date: 'Sábado 21 de Noviembre · 14:00 hrs',
    proposed_location: 'Kiosco y Asadores de Parque Guadiana',
    suggested_by_name: 'Carlos Mendoza',
    suggested_by_role: 'leader',
    notes: 'Reunir a los grupos de varones para convivencia fraternal y carne asada inter-celular.',
    status: 'pending',
  },
  {
    id: 'sug-hospital-materno',
    title: 'Brigada de Café y Pan Dulce en Hospital Materno Infantil',
    category: 'servicio',
    proposed_date: 'Sábado 28 de Noviembre · 08:30 hrs',
    proposed_location: 'Sala de Espera Hospital Materno Infantil',
    suggested_by_name: 'Pedro Valenzuela',
    suggested_by_role: 'deacon',
    notes: 'Llevar termos con café caliente y acompañamiento a familiares en urgencias.',
    status: 'pending',
  },
];

interface CommunityInitiativesHubProps {
  publicShowcaseOnly?: boolean;
  role?: 'public' | 'member' | 'leader' | 'deacon' | 'pastor' | 'elder';
}

export const CommunityInitiativesHub: React.FC<CommunityInitiativesHubProps> = ({
  publicShowcaseOnly = false,
  role = 'public',
}) => {
  const [initiatives, setInitiatives] = useState<CommunityInitiative[]>(() => {
    try {
      const saved = localStorage.getItem('portico_community_initiatives_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_INITIATIVES;
  });

  const [suggestions, setSuggestions] = useState<InitiativeSuggestion[]>(() => {
    try {
      const saved = localStorage.getItem('portico_initiative_suggestions_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_SUGGESTIONS;
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showPledgeModal, setShowPledgeModal] = useState<string | null>(null);
  const [volunteerName, setVolunteerName] = useState<string>('');
  const [volunteerPhone, setVolunteerPhone] = useState<string>('');
  const [pledgeItem, setPledgeItem] = useState<string>('');
  const [pledgeQty, setPledgeQty] = useState<number>(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Elder / Pastor Administration states
  const [showNewActivityModal, setShowNewActivityModal] = useState<boolean>(false);
  const [showSuggestionsDrawer, setShowSuggestionsDrawer] = useState<boolean>(false);
  const [showProposeModal, setShowProposeModal] = useState<boolean>(false);

  // Form states for creating an official activity
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'servicio' | 'lectura_cultura' | 'convivencia' | 'apoyo_vecinal'>('servicio');
  const [newDate, setNewDate] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newCoordName, setNewCoordName] = useState<string>('');
  const [newCoordPhone, setNewCoordPhone] = useState<string>('');

  // Form states for leader / deacon proposing an activity
  const [propTitle, setPropTitle] = useState<string>('');
  const [propCategory, setPropCategory] = useState<'servicio' | 'lectura_cultura' | 'convivencia' | 'apoyo_vecinal'>('convivencia');
  const [propDate, setPropDate] = useState<string>('');
  const [propLocation, setPropLocation] = useState<string>('');
  const [propNotes, setPropNotes] = useState<string>('');
  const [propAuthorName, setPropAuthorName] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('portico_community_initiatives_v3', JSON.stringify(initiatives));
    } catch {
      // Ignore
    }
  }, [initiatives]);

  useEffect(() => {
    try {
      localStorage.setItem('portico_initiative_suggestions_v3', JSON.stringify(suggestions));
    } catch {
      // Ignore
    }
  }, [suggestions]);

  const isElderOrPastor = role === 'elder' || role === 'pastor';
  const isLeaderOrDeacon = role === 'leader' || role === 'deacon';
  const pendingSuggestions = suggestions.filter((s) => s.status === 'pending');

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

    setSuccessMsg(`Gracias ${volunteerName}. Te has sumado a la actividad exitosamente.`);
    setShowPledgeModal(null);
    setVolunteerName('');
    setVolunteerPhone('');
    setPledgeItem('');
    setPledgeQty(1);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  // Elder / Pastor: create direct official activity
  const handleCreateOfficialActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate.trim() || !newLocation.trim()) return;

    const created: CommunityInitiative = {
      id: `init-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      date: newDate.trim(),
      meeting_point: newLocation.trim(),
      coordinator_name: newCoordName.trim() || 'Coordinación Pastoral',
      coordinator_phone: newCoordPhone.trim() || '+52 618 100 0000',
      pledges: [],
      volunteers: [],
    };

    setInitiatives((prev) => [created, ...prev]);
    setShowNewActivityModal(false);
    setNewTitle('');
    setNewDate('');
    setNewLocation('');
    setNewCoordName('');
    setNewCoordPhone('');
    setSuccessMsg('Actividad comunitaria oficial publicada directamente en el sistema.');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  // Elder / Pastor: 1-touch transform suggestion into official event
  const handleTransformSuggestion = (sug: InitiativeSuggestion) => {
    const created: CommunityInitiative = {
      id: `init-${Date.now()}`,
      title: sug.title,
      category: sug.category,
      date: sug.proposed_date,
      meeting_point: sug.proposed_location,
      coordinator_name: sug.suggested_by_name,
      coordinator_phone: '+52 618 100 0000',
      pledges: [],
      volunteers: [{ name: sug.suggested_by_name, phone: '+52 618 100 0000' }],
    };

    setInitiatives((prev) => [created, ...prev]);
    setSuggestions((prev) =>
      prev.map((s) => (s.id === sug.id ? { ...s, status: 'converted' } : s))
    );
    setSuccessMsg(`Sugerencia convertida inmediatamente en Actividad Oficial: ${sug.title}`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  // Elder / Pastor: Clone suggestion to form
  const handleCloneSuggestion = (sug: InitiativeSuggestion) => {
    setNewTitle(sug.title);
    setNewCategory(sug.category);
    setNewDate(sug.proposed_date);
    setNewLocation(sug.proposed_location);
    setNewCoordName(sug.suggested_by_name);
    setNewCoordPhone('+52 618 100 0000');
    setShowSuggestionsDrawer(false);
    setShowNewActivityModal(true);
  };

  // Elder / Pastor: Discard suggestion
  const handleDiscardSuggestion = (sugId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === sugId ? { ...s, status: 'discarded' } : s))
    );
  };

  // Leader / Deacon: Submit proposal to elders
  const handleProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle.trim() || !propDate.trim() || !propLocation.trim()) return;

    const proposal: InitiativeSuggestion = {
      id: `sug-${Date.now()}`,
      title: propTitle.trim(),
      category: propCategory,
      proposed_date: propDate.trim(),
      proposed_location: propLocation.trim(),
      suggested_by_name: propAuthorName.trim() || 'Líder / Diácono de Hogar',
      suggested_by_role: role === 'deacon' ? 'deacon' : 'leader',
      notes: propNotes.trim(),
      status: 'pending',
    };

    setSuggestions((prev) => [proposal, ...prev]);
    setShowProposeModal(false);
    setPropTitle('');
    setPropDate('');
    setPropLocation('');
    setPropNotes('');
    setPropAuthorName('');
    setSuccessMsg('Sugerencia enviada al Presbiterio y Pastores para su rápida integración.');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="community-initiatives-hub" style={{ padding: '24px 0' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
          <span>Iniciativas Abiertas y Buenas Obras · Sin estructura celular de 12 semanas</span>
        </div>
        <h2 style={{ fontSize: '1.4rem', margin: '4px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
          Actividades Comunitarias y Servicio Abierto
        </h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '680px', lineHeight: 1.4 }}>
          Cualquier persona puede sumarse con su presencia o aportar insumos concretos para bendecir a la ciudad de Durango, compartir lecturas o estrechar lazos comunitarios.
        </p>
      </div>

      {/* Barra de Gestión Ágil para Ancianos y Pastores */}
      {isElderOrPastor && (
        <div
          id="elder-governance-hub-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--accent-indigo, #6366f1)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-indigo, #818cf8)' }}>
              Gobernanza Conciliar de Actividades y Eventos
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Ancianos y Pastores pueden autorizar, crear o transformar sugerencias en 1 toque
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              id="btn-elder-new-initiative"
              onClick={() => setShowNewActivityModal(true)}
              className="btn-primary"
              style={{
                backgroundColor: 'var(--accent-indigo, #4f46e5)',
                color: '#ffffff',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              + Nueva Actividad Oficial
            </button>

            <button
              type="button"
              id="btn-elder-suggestions-inbox"
              onClick={() => setShowSuggestionsDrawer(true)}
              className="btn-secondary"
              style={{
                borderColor: 'var(--accent-indigo, #818cf8)',
                color: 'var(--accent-indigo, #818cf8)',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Sugerencias de Líderes ({pendingSuggestions.length})
            </button>
          </div>
        </div>
      )}

      {/* Botón para Líderes y Diáconos para Proponer Actividades */}
      {isLeaderOrDeacon && (
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            id="btn-propose-initiative"
            onClick={() => setShowProposeModal(true)}
            className="btn-secondary"
            style={{
              borderColor: 'var(--accent-amber, #fbbf24)',
              color: 'var(--accent-amber, #fbbf24)',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            + Proponer Iniciativa Comunitaria a Ancianos
          </button>
        </div>
      )}

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
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Voluntarios: {init.volunteers.length}
                </span>
              </div>

              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {init.title}
              </h3>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Fecha y Horario:</span> {init.date}
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Punto de Encuentro:</span> {init.meeting_point}
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Coordinación:</span> {init.coordinator_name}{!publicShowcaseOnly ? ` (${init.coordinator_phone})` : ''}
                </div>
              </div>

              {/* Pledges List (Solo en Silo del Miembro / GOLD-320) */}
              {!publicShowcaseOnly ? (
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Insumos Comprometidos por la Comunidad:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {init.pledges.length === 0 ? (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Aun no se han registrado insumos para esta actividad.
                      </div>
                    ) : (
                      init.pledges.map((p, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-primary)' }}>
                            [Aporte] {p.item} ({p.quantity})
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.committed_by}</span>
                        </div>
                      ))
                    )}
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
                  Sumarme como Voluntario o Llevar Insumo
                </button>
              ) : (
                <div style={{ fontSize: '0.84rem', color: 'var(--accent-emerald)', fontWeight: 600, textAlign: 'center', padding: '8px' }}>
                  Actividad abierta a la comunidad de Durango
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

      {/* Modal: Ancianos/Pastores Creando Nueva Actividad Oficial */}
      {showNewActivityModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface-elevated, var(--bg-surface))',
              border: '1.5px solid var(--accent-indigo, #6366f1)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                Nueva Actividad Oficial de la Iglesia
              </h3>
              <button
                type="button"
                onClick={() => setShowNewActivityModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Cerrar
              </button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Creación directa sin burocracia. Se publica de inmediato en el catálogo comunitario y silo de miembros.
            </p>

            <form onSubmit={handleCreateOfficialActivity} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Título de la Actividad:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Encuentro de Varones y Asado Fraternal"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Categoría:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  >
                    <option value="servicio">Servicio Hospitalario</option>
                    <option value="convivencia">Convivencia / Asado</option>
                    <option value="lectura_cultura">Coloquio Cultural</option>
                    <option value="apoyo_vecinal">Apoyo Vecinal</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Fecha y Horario:
                  </label>
                  <input
                    type="text"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="Ej. Sábado 21 de Noviembre · 14:00 hrs"
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Punto de Encuentro / Sede:
                </label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Ej. Terraza Central / Kiosco de Parque Guadiana"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Responsable / Coordinador:
                  </label>
                  <input
                    type="text"
                    value={newCoordName}
                    onChange={(e) => setNewCoordName(e.target.value)}
                    placeholder="Ej. Anciano Bernabé Sandoval"
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Teléfono de Contacto:
                  </label>
                  <input
                    type="tel"
                    value={newCoordPhone}
                    onChange={(e) => setNewCoordPhone(e.target.value)}
                    placeholder="Ej. +52 618 100 0005"
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewActivityModal(false)}
                  style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', background: 'var(--accent-indigo, #4f46e5)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Publicar Actividad Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Modal: Buzón de Sugerencias de Líderes y Diáconos (Para Ancianos/Pastores) */}
      {showSuggestionsDrawer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface-elevated, var(--bg-surface))',
              border: '1.5px solid var(--accent-indigo, #6366f1)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  Buzón Ágil de Sugerencias de Líderes y Diáconos
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Transforma o clona sugerencias a eventos oficiales en 1 toque
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSuggestionsDrawer(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>

            {pendingSuggestions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-primary)', borderRadius: '10px' }}>
                No hay sugerencias pendientes en este momento. Todas han sido procesadas o integradas.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {sug.title}
                      </span>
                      <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontWeight: 700 }}>
                        {sug.suggested_by_role === 'leader' ? 'Líder de Célula' : 'Diácono de Sector'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                      <div><strong>Fecha propuesta:</strong> {sug.proposed_date}</div>
                      <div><strong>Lugar:</strong> {sug.proposed_location}</div>
                      <div><strong>Propuesto por:</strong> {sug.suggested_by_name}</div>
                      {sug.notes && <div><strong>Motivo:</strong> {sug.notes}</div>}
                    </div>

                    {/* Acciones en 1 toque */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                      <button
                        type="button"
                        id={`btn-transform-suggestion-${sug.id}`}
                        onClick={() => handleTransformSuggestion(sug)}
                        style={{
                          backgroundColor: 'var(--accent-emerald, #10b981)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Transformar en Evento Oficial
                      </button>

                      <button
                        type="button"
                        id={`btn-clone-suggestion-${sug.id}`}
                        onClick={() => handleCloneSuggestion(sug)}
                        style={{
                          backgroundColor: 'var(--accent-indigo, #4f46e5)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Clonar y Adaptar
                      </button>

                      <button
                        type="button"
                        id={`btn-discard-suggestion-${sug.id}`}
                        onClick={() => handleDiscardSuggestion(sug.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-subtle)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        Descartar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Líder / Diácono Proponiendo Actividad */}
      {showProposeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface-elevated, var(--bg-surface))',
              border: '1.5px solid var(--accent-amber, #fbbf24)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                Proponer Actividad Comunitaria o Convivio
              </h3>
              <button
                type="button"
                onClick={() => setShowProposeModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Tu propuesta llegará directamente al Presbiterio y Pastores. Ellos podrán transformarla en evento oficial o clonarla rápidamente.
            </p>

            <form onSubmit={handleProposeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Nombre de la Actividad:
                </label>
                <input
                  type="text"
                  required
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  placeholder="Ej. Carne Asada y Convivencia de Varones"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Categoría:
                  </label>
                  <select
                    value={propCategory}
                    onChange={(e: any) => setPropCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  >
                    <option value="convivencia">Convivencia / Asado</option>
                    <option value="servicio">Servicio Hospitalario</option>
                    <option value="lectura_cultura">Coloquio Cultural</option>
                    <option value="apoyo_vecinal">Apoyo Vecinal</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Fecha Tentativa:
                  </label>
                  <input
                    type="text"
                    required
                    value={propDate}
                    onChange={(e) => setPropDate(e.target.value)}
                    placeholder="Ej. Sábado 21 Nov · 14:00 hrs"
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Lugar o Punto de Encuentro:
                </label>
                <input
                  type="text"
                  required
                  value={propLocation}
                  onChange={(e) => setPropLocation(e.target.value)}
                  placeholder="Ej. Parque Guadiana / Terraza"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Tu Nombre:
                </label>
                <input
                  type="text"
                  required
                  value={propAuthorName}
                  onChange={(e) => setPropAuthorName(e.target.value)}
                  placeholder="Ej. Carlos Mendoza (Líder Célula Varones Poniente)"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Notas / Detalles de la Convivencia:
                </label>
                <textarea
                  rows={2}
                  value={propNotes}
                  onChange={(e) => setPropNotes(e.target.value)}
                  placeholder="Ej. Proponemos reunir a dos grupos para asado fraternal e integrar a vecinos de la zona..."
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', background: 'var(--accent-amber, #fbbf24)', border: 'none', borderRadius: '8px', color: '#161513', fontWeight: 700, cursor: 'pointer' }}
                >
                  Enviar Propuesta a Pastores
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
