import React, { useEffect, useState } from 'react';
import type { Campus, PublicConfig, PublicEdition } from '../types';
import { fetchCampuses, fetchPublicCatalog, fetchPublicConfig, submitJoinRequest, submitNeighborhoodComplaint } from '../api';
import { InstitutionalModal } from './InstitutionalModal';
import { MonogramAvatar } from './MonogramAvatar';
import { ConnectionPassCard } from './ConnectionPassCard';
import { CommunityInitiativesHub } from './CommunityInitiativesHub';
import { CellHarmonizer } from './CellHarmonizer';
import {
  MapPin,
  Clock,
  Calendar,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
  MessageCircle,
  Users,
  HeartHandshake,
  Building,
  Home,
  Sparkles,
} from 'lucide-react';
import { formatDayOfWeek } from '../utils';

export const PublicPortal: React.FC = () => {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [groups, setGroups] = useState<PublicEdition[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [intentTrack, setIntentTrack] = useState<'both' | 'temple' | 'home'>('both');
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [selectedAffinity, setSelectedAffinity] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedMacroZone, setSelectedMacroZone] = useState<string>('all');
  const [filterTransitOnly, setFilterTransitOnly] = useState<boolean>(false);
  const [selectedFocusType, setSelectedFocusType] = useState<string>('all');
  const [filterKids, setFilterKids] = useState<boolean | null>(null);
  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);

  // Modal Buena Vecindad (GOLD-278)
  const [showComplaintModal, setShowComplaintModal] = useState<boolean>(false);
  const [complaintColonia, setComplaintColonia] = useState<string>('');
  const [complaintCategory, setComplaintCategory] = useState<string>('estacionamiento');
  const [complaintComments, setComplaintComments] = useState<string>('');
  const [complaintContact, setComplaintContact] = useState<string>('');
  const [submittingComplaint, setSubmittingComplaint] = useState<boolean>(false);
  const [complaintSuccessMessage, setComplaintSuccessMessage] = useState<string | null>(null);

  // Join Request Modal state
  const [activeModalGroup, setActiveModalGroup] = useState<PublicEdition | null>(null);
  const [joinName, setJoinName] = useState<string>('');
  const [joinPhone, setJoinPhone] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Pase Comunitario Autónomo Modal state
  const [passModalGroup, setPassModalGroup] = useState<PublicEdition | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, data, cmps] = await Promise.all([
        fetchPublicConfig(),
        fetchPublicCatalog({
          campus_slug: selectedCampus || undefined,
          affinity_id: selectedAffinity || undefined,
          zone_id: selectedZone || undefined,
          kids_welcome: filterKids !== null ? filterKids : undefined,
          macro_zone: selectedMacroZone !== 'all' ? selectedMacroZone : undefined,
          transit_only: filterTransitOnly ? true : undefined,
        }),
        fetchCampuses().catch(() => []),
      ]);
      setConfig(cfg);
      setGroups(data);
      setCampuses(cmps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedCampus, selectedAffinity, selectedZone, filterKids, selectedMacroZone, filterTransitOnly]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalGroup) return;
    setSubmitting(true);
    try {
      await submitJoinRequest({
        edition_id: activeModalGroup.id,
        name: joinName,
        whatsapp: joinPhone,
      });
      setSubmitSuccess(true);
    } catch {
      alert('Error enviando la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setActiveModalGroup(null);
    setJoinName('');
    setJoinPhone('');
    setSubmitSuccess(false);
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintColonia.trim() || !complaintComments.trim()) {
      alert('Por favor indica tu colonia y los detalles de la situación.');
      return;
    }
    setSubmittingComplaint(true);
    try {
      await submitNeighborhoodComplaint({
        colonia_name: complaintColonia,
        category: complaintCategory,
        comments: complaintComments,
        reporter_contact: complaintContact || undefined,
      });
      setComplaintSuccessMessage('¡Gracias por tu mensaje! Tu reporte ha sido recibido por la Mesa Cívica de Amor y Gracia. Nos comunicaremos contigo y atenderemos la situación con respeto fraternal.');
      setComplaintColonia('');
      setComplaintComments('');
      setComplaintContact('');
    } catch {
      alert('Error enviando reporte vecinal');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const displayedGroups = groups.filter((g) => {
    if (selectedFocusType === 'all') return true;
    const focus = g.focus_type || '';
    const aff = (g.affinity_name || '').toLowerCase();
    const name = (g.nombre_publico || '').toLowerCase();
    if (selectedFocusType === 'common_interest') {
      return focus === 'common_interest' || aff.includes('viajer') || aff.includes('café') || aff.includes('taco') || aff.includes('interés') || name.includes('viajer') || name.includes('café');
    }
    if (selectedFocusType === 'foundational') {
      return focus === 'foundational' || aff.includes('alfa') || aff.includes('mayordom') || aff.includes('fundam') || aff.includes('nuevo') || name.includes('alfa') || name.includes('mayordom');
    }
    if (selectedFocusType === 'life_stage') {
      return focus === 'life_stage' || (!aff.includes('viajer') && !aff.includes('café') && !aff.includes('alfa') && !aff.includes('mayordom'));
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px 80px 20px' }}>
      {/* Hero Section con Tipografía Transitional (Charter / Georgia) y Lenguaje Sobrio */}
      <section style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--accent-amber-light)',
          border: '1px solid var(--accent-amber-border)',
          color: 'var(--accent-amber)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '16px',
        }}>
          <Users size={16} />
          <span>{config?.active_season?.nombre_publico || 'Temporada Activa'} • Comunidades en Hogares</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
          lineHeight: 1.15,
          marginBottom: '16px',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Grupos Pequeños en Durango
        </h1>
        <p style={{
          maxWidth: '680px',
          margin: '0 auto',
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          lineHeight: 1.5,
        }}>
          Reuniones semanales en hogares para conversar, estudiar la Biblia y apoyarse mutuamente. Explora los grupos en tu zona y asiste con libertad.
        </p>
      </section>

      {/* Compuerta de Intención Dual (Dual-Track Intent Gate - GOLD-283 / Decisión 4-B) */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '16px',
        }}>
          {/* Tarjeta Track 1: Domingo en Sede */}
          <div
            id="intent-track-temple"
            role="button"
            tabIndex={0}
            onClick={() => setIntentTrack(intentTrack === 'temple' ? 'both' : 'temple')}
            className={`intent-gate-card tap-target-44 ${intentTrack === 'temple' ? 'selected' : ''}`}
            style={{
              cursor: 'pointer',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: intentTrack === 'temple' ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              border: intentTrack === 'temple' ? '2px solid var(--accent-warm)' : '1px solid var(--border-subtle)',
              transition: 'all var(--transition-fast)',
              boxShadow: intentTrack === 'temple' ? '0 8px 24px rgba(212, 175, 55, 0.18)' : 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                color: 'var(--accent-warm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Building size={22} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-warm)', marginBottom: '4px' }}>
                  Ruta Dominical • Sedes Físicas
                </div>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  ¿Quieres visitarnos este domingo en una de nuestras sedes?
                </h3>
              </div>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Tenemos 5 sedes en la ciudad de Durango con reuniones alegres, música en vivo, enseñanza bíblica y espacio seguro para tus hijos.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                5 Sedes en Durango
              </span>
              <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                Área Infantil Segura
              </span>
              <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                Punto de Conexión en Atrio
              </span>
            </div>
          </div>

          {/* Tarjeta Track 2: Entre Semana en Casa */}
          <div
            id="intent-track-home"
            role="button"
            tabIndex={0}
            onClick={() => setIntentTrack(intentTrack === 'home' ? 'both' : 'home')}
            className={`intent-gate-card tap-target-44 ${intentTrack === 'home' ? 'selected' : ''}`}
            style={{
              cursor: 'pointer',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: intentTrack === 'home' ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              border: intentTrack === 'home' ? '2px solid var(--accent-olive)' : '1px solid var(--border-subtle)',
              transition: 'all var(--transition-fast)',
              boxShadow: intentTrack === 'home' ? '0 8px 24px rgba(107, 142, 35, 0.18)' : 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(107, 142, 35, 0.15)',
                color: 'var(--accent-olive)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Home size={22} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-olive)', marginBottom: '4px' }}>
                  Ruta Entre Semana • Grupos y Comunidades
                </div>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  ¿Buscas una familia cerca de tu casa entre semana?
                </h3>
              </div>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Grupos pequeños de 8 a 12 vecinos para cenar, platicar y orar juntos con tranquilidad en la sala de un hogar de tu colonia.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                Grupos en Toda la Ciudad
              </span>
              <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                Cena y Café Fraterno
              </span>
              <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                Ambiente Íntimo y Confiable
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Filtro de Intención */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          <button
            type="button"
            id="btn-track-all"
            onClick={() => setIntentTrack('both')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: intentTrack === 'both' ? 'var(--text-primary)' : 'var(--bg-surface)',
              color: intentTrack === 'both' ? 'var(--bg-canvas)' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} strokeWidth={1.5} />
            <span>Ver Todo el Ecosistema</span>
          </button>
          <button
            type="button"
            id="btn-track-temple"
            onClick={() => setIntentTrack('temple')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: intentTrack === 'temple' ? 'var(--accent-warm)' : 'var(--bg-surface)',
              color: intentTrack === 'temple' ? '#161513' : 'var(--text-secondary)',
              border: intentTrack === 'temple' ? '1px solid var(--accent-warm)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Building size={14} strokeWidth={1.5} />
            <span>Sedes Dominicales (5)</span>
          </button>
          <button
            type="button"
            id="btn-track-home"
            onClick={() => setIntentTrack('home')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: intentTrack === 'home' ? 'var(--accent-olive)' : 'var(--bg-surface)',
              color: intentTrack === 'home' ? '#FAF8F5' : 'var(--text-secondary)',
              border: intentTrack === 'home' ? '1px solid var(--accent-olive)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Home size={14} strokeWidth={1.5} />
            <span>Grupos en la Ciudad ({displayedGroups.length})</span>
          </button>
        </div>
      </section>

      {/* Punto de Conexión Dominical en el Atrio (GOLD-266 / Decisión 5-B / Visible en ruta domingo o todo) */}
      {(intentTrack === 'both' || intentTrack === 'temple') && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1.5px solid var(--accent-warm)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid var(--accent-warm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-warm)',
              flexShrink: 0,
            }}>
              <Building size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>
                Punto de Conexión Dominical en el Atrio (Primer Día de la Semana)
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4, maxWidth: '720px' }}>
                ¿Prefieres conocer a los anfitriones en persona antes de asistir a una casa? El domingo al terminar cada reunión general, acércate al <strong>Punto de Conexión en el Atrio</strong>. Nuestros diáconos y servidores te presentarán personalmente a las familias de tu zona.
              </p>
            </div>
          </div>
          <div style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(212, 175, 55, 0.12)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--accent-warm)',
            border: '1px solid var(--accent-warm)',
          }}>
            Domingos 10:00 y 12:30 hrs
          </div>
        </div>
      )}

      {/* Selector de Campus y Aviso Legal (GOLD-208 / GOLD-239) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Building size={16} style={{ color: 'var(--accent-amber)' }} />
              <span>Sede Macro-Campus:</span>
            </span>
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSelectedCampus('')}
                style={{
                  minHeight: '38px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  backgroundColor: selectedCampus === '' ? 'var(--text-primary)' : 'var(--bg-surface)',
                  color: selectedCampus === '' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                Todos los Macro-Campuses ({campuses.length > 0 ? campuses.length : (config?.campuses?.length || 5)})
              </button>
              {(campuses.length > 0 ? campuses : (config?.campuses || [])).map((c: any) => {
                const slug = c.slug || c.id;
                const label = c.name || c.nombre_publico;
                const isSel = selectedCampus === slug;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCampus(slug)}
                    style={{
                      minHeight: '38px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      backgroundColor: isSel ? 'var(--accent-emerald)' : 'var(--bg-surface)',
                      color: isSel ? '#FFFFFF' : 'var(--text-secondary)',
                      border: isSel ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    title={c.address ? `${label} - ${c.address} (Capacidad: ${c.capacity} personas)` : label}
                  >
                    <span>{label}</span>
                    {c.macro_zone && (
                      <span style={{ fontSize: '0.7rem', opacity: 0.85, textTransform: 'uppercase' }}>
                        ({c.macro_zone})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowLegalModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.84rem',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-warm)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Lock size={14} />
          <span>Protección de Datos & Confesión de Fe</span>
        </button>
      </div>

      {/* Toolbar Táctil Horizontal de Afinidades sin Emojis Infantiles (GOLD-218 / GOLD-235) */}
      <div className="surface-card" style={{ padding: '16px 20px', marginBottom: '32px' }}>
        {/* Selector de Enfoque de Grupo (No sólo por etapa de vida) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Enfoque:
          </span>
          <button
            type="button"
            onClick={() => setSelectedFocusType('all')}
            style={{
              minHeight: '34px',
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: selectedFocusType === 'all' ? 'var(--text-primary)' : 'var(--bg-primary)',
              color: selectedFocusType === 'all' ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}
          >
            Todos los Enfoques
          </button>
          <button
            type="button"
            onClick={() => setSelectedFocusType('life_stage')}
            style={{
              minHeight: '34px',
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: selectedFocusType === 'life_stage' ? 'var(--accent-indigo)' : 'var(--bg-primary)',
              color: selectedFocusType === 'life_stage' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}
          >
            Etapas de Vida
          </button>
          <button
            type="button"
            onClick={() => setSelectedFocusType('common_interest')}
            style={{
              minHeight: '34px',
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: selectedFocusType === 'common_interest' ? 'var(--accent-amber)' : 'var(--bg-primary)',
              color: selectedFocusType === 'common_interest' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}
          >
            Interés Común (Viajeros, Lectura, Charlas)
          </button>
          <button
            type="button"
            onClick={() => setSelectedFocusType('foundational')}
            style={{
              minHeight: '34px',
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: selectedFocusType === 'foundational' ? 'var(--accent-emerald)' : 'var(--bg-primary)',
              color: selectedFocusType === 'foundational' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
            }}
          >
            Discipulado y Fundamentos
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 700 }}>
          <Filter size={16} style={{ color: 'var(--accent-amber)' }} />
          <span>Filtro por Afinidad o Tema:</span>
        </div>

        {/* Fila Táctil Deslizable de 48px con Snap y role="toolbar" */}
        <div className="affinity-scroller hide-scrollbar" role="toolbar" aria-label="Filtro de grupos">
          <button
            type="button"
            className={`affinity-chip ${selectedAffinity === '' ? 'active' : ''}`}
            aria-pressed={selectedAffinity === ''}
            onClick={() => setSelectedAffinity('')}
          >
            <span>Todos los Grupos</span>
          </button>
          {config?.affinities.map((aff) => (
            <button
              key={aff.id}
              type="button"
              className={`affinity-chip ${selectedAffinity === aff.id ? 'active' : ''}`}
              aria-pressed={selectedAffinity === aff.id}
              onClick={() => setSelectedAffinity(aff.id)}
            >
              <span>{aff.label}</span>
            </button>
          ))}
        </div>

        {/* Selector Territorial Único (Decisión 5-B / GOLD-291) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Sector:
          </span>
          {['all', 'Norte', 'Sur', 'Centro', 'Oriente', 'Poniente'].map((mz) => (
            <button
              key={mz}
              type="button"
              onClick={() => {
                setSelectedMacroZone(mz);
                setSelectedZone('');
              }}
              style={{
                minHeight: '34px',
                padding: '4px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                backgroundColor: selectedMacroZone === mz ? 'var(--accent-amber)' : 'var(--bg-primary)',
                color: selectedMacroZone === mz ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              {mz === 'all' ? 'Todos los Sectores' : `Sector ${mz}`}
            </button>
          ))}

          {/* Filtro Espacio Infantil */}
          <button
            type="button"
            id="filter-kids-welcome"
            onClick={() => setFilterKids((prev) => (prev === true ? null : true))}
            style={{
              minHeight: '34px',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: filterKids === true ? 'var(--accent-emerald)' : 'var(--bg-surface)',
              color: filterKids === true ? '#FFFFFF' : 'var(--text-secondary)',
              border: filterKids === true ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: 'auto',
            }}
          >
            <span>Espacio Infantil / Niños</span>
            {filterKids === true && <CheckCircle2 size={12} />}
          </button>

          {/* Filtro Transporte Accesible / Carpool */}
          <button
            type="button"
            id="filter-transit-only"
            onClick={() => setFilterTransitOnly((prev) => !prev)}
            style={{
              minHeight: '34px',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: filterTransitOnly ? 'var(--accent-indigo)' : 'var(--bg-surface)',
              color: filterTransitOnly ? '#FFFFFF' : 'var(--text-secondary)',
              border: filterTransitOnly ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Transporte Accesible / Carpool</span>
            {filterTransitOnly && <CheckCircle2 size={12} />}
          </button>
        </div>
      </div>

      {/* Grid del Catálogo de Grupos Pequeños */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          Cargando catálogo de grupos...
        </div>
      ) : displayedGroups.length === 0 ? (
        <div className="surface-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <AlertCircle size={44} style={{ color: 'var(--accent-amber)', margin: '0 auto 12px auto' }} />
          <h3 style={{ marginBottom: '8px', fontSize: '1.3rem' }}>No hay grupos con los filtros seleccionados</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Prueba seleccionando otra opción o zona geográfica.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {displayedGroups.map((group) => {
            const isCommonInterest =
              group.focus_type === 'common_interest' ||
              group.affinity_name.toLowerCase().includes('viajer') ||
              group.affinity_name.toLowerCase().includes('café') ||
              group.nombre_publico.toLowerCase().includes('viajer');

            const isFoundational =
              group.focus_type === 'foundational' ||
              group.affinity_name.toLowerCase().includes('alfa') ||
              group.affinity_name.toLowerCase().includes('mayordom') ||
              group.affinity_name.toLowerCase().includes('fundam') ||
              group.nombre_publico.toLowerCase().includes('alfa');

            const isWomen =
              group.audience_orientation === 'women_oriented' ||
              group.affinity_name.toLowerCase().includes('mujer') ||
              group.nombre_publico.toLowerCase().includes('mujer');

            const isMen =
              group.audience_orientation === 'men_oriented' ||
              group.affinity_name.toLowerCase().includes('hombre') ||
              group.affinity_name.toLowerCase().includes('varon') ||
              group.nombre_publico.toLowerCase().includes('hombre');

            const isCouples =
              group.audience_orientation === 'couples_and_families' ||
              group.affinity_name.toLowerCase().includes('matrimonio') ||
              group.affinity_name.toLowerCase().includes('familia') ||
              group.nombre_publico.toLowerCase().includes('matrimonio');

            return (
              <article
                key={group.id}
                className="surface-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '24px',
                  position: 'relative',
                }}
              >
                {/* Badges de Afinidad, Zona, Enfoque y Adaptación Infantil (GOLD-249 & GOLD-250) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="badge badge-indigo">{group.zone_label}</span>
                    {group.macro_zone && (
                      <span className="badge badge-amber" style={{ fontWeight: 700 }}>
                        Sector {group.macro_zone}
                      </span>
                    )}
                    <span className="badge badge-emerald">{group.affinity_name}</span>
                    {group.transit_friendly && (
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        Transporte Accesible
                      </span>
                    )}

                    {/* Badge de Enfoque */}
                    {isCommonInterest && (
                      <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Interés Común
                      </span>
                    )}
                    {isFoundational && (
                      <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Discipulado
                      </span>
                    )}

                    {/* Badges de Orientación de Audiencia (Etiquetas orientativas) */}
                    {isWomen && (
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(236, 72, 153, 0.12)', color: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                        Orientado a Mujeres
                      </span>
                    )}
                    {isMen && (
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        Orientado a Hombres
                      </span>
                    )}
                    {isCouples && (
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        Parejas y Familias
                      </span>
                    )}

                    <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      Buena Vecindad
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      Ventana Abierta
                    </span>
                  </div>

                  {group.kids_welcome ? (
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--accent-emerald-light)',
                      color: 'var(--accent-emerald)',
                      border: '1px solid var(--accent-emerald-border)',
                    }}>
                      Niños Bienvenidos
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      Sólo Adultos
                    </span>
                  )}
                </div>

                {/* Título y Propósito */}
                <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {group.nombre_publico}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginBottom: '16px', flex: 1, lineHeight: 1.5 }}>
                  {group.proposito}
                </p>

                {/* Estructura Triádica (GOLD-248): Facilitador, Anfitrión y Aprendiz */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: '8px',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                  fontSize: '0.78rem',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>Facilitador</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{group.facilitator_name || group.leader_name || 'Designado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      {group.venue_type === 'institucional' ? 'Contacto / Enlace' : 'Anfitrión'}
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {group.venue_type === 'institucional' ? (group.liaison_name || group.host_reference || 'Enlace Institucional') : (group.host_reference || 'Hogar sede')}
                    </strong>
                  </div>
                  {group.apprentice_name && (
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>Aprendiz</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{group.apprentice_name}</strong>
                    </div>
                  )}
                </div>

                {/* Cuadro de Logística con Alto Contraste Solar y Ortografía Corregida (GOLD-233) */}
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '0.88rem',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <Calendar size={16} style={{ color: 'var(--accent-emerald)' }} />
                    <span style={{ fontWeight: 700 }}>Cada {formatDayOfWeek(group.dia_habitual)}</span>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <Clock size={16} style={{ color: 'var(--accent-emerald)' }} />
                    <span style={{ fontWeight: 600 }}>{group.hora_habitual} hrs</span>
                  </div>

                  {/* Sede y Privacidad */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={16} style={{ color: 'var(--accent-amber)', marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {group.venue_category}
                        </span>
                        {group.venue_category === 'Casa particular' && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.72rem',
                            color: 'var(--accent-emerald)',
                            backgroundColor: 'var(--accent-emerald-light)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                          }}>
                            <Lock size={10} /> Privacidad Sellada
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '2px' }}>
                        {group.location_summary}
                      </div>
                      {group.map_url && (
                        <a
                          href={group.map_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--accent-indigo)',
                            fontSize: '0.8rem',
                            marginTop: '6px',
                            textDecoration: 'none',
                            fontWeight: 700,
                          }}
                        >
                          <span>Abrir mapa Google</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Aviso o excepción de sede */}
                  {group.next_meeting_summary && (
                    <div style={{
                      marginTop: '4px',
                      padding: '6px 10px',
                      backgroundColor: 'var(--accent-amber-light)',
                      borderLeft: '3px solid var(--accent-amber)',
                      borderRadius: '4px',
                      color: 'var(--accent-amber)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                    }}>
                      {group.next_meeting_summary}
                    </div>
                  )}
                </div>

                {/* Pie de Tarjeta: Líder con MonogramAvatar y Botones Pase + Visita */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-subtle)',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}>
                  {group.leader_name ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MonogramAvatar name={group.leader_name} size="sm" />
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        Líder: <strong>{group.leader_name}</strong>
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setPassModalGroup(group)}
                      className="btn-secondary"
                      style={{
                        minHeight: '42px',
                        padding: '6px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                      title="Ver Pase Comunitario y sincronización de calendario"
                    >
                      <span>Pase / QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModalGroup(group)}
                      className="btn-primary"
                      style={{
                        minHeight: '42px',
                        padding: '8px 14px',
                        fontSize: '0.86rem',
                      }}
                    >
                      <MessageCircle size={15} />
                      <span>Quiero Visitar</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Sección: Iniciativas Comunitarias y Coloquios Abiertos (GOLD-303) */}
      <section style={{ marginTop: '48px', marginBottom: '36px' }}>
        <CommunityInitiativesHub />
      </section>

      {/* Sección: Sincronización Litúrgica y Armonización Celular (GOLD-297) */}
      <section style={{ marginBottom: '36px' }}>
        <CellHarmonizer
          cellName="Comunidades y Familias"
          cellDay="Jueves"
          cellTime="19:30"
          upcomingGeneralEvents={[
            {
              id: 'event-lit-1',
              title: 'Congreso de Jóvenes y Familias 2026',
              date: '2026-10-15',
              time: '19:00',
              location: 'Sede Central Durango (Auditorio)',
              category: 'magno',
            },
            {
              id: 'event-lit-2',
              title: 'Retiro Fraternal Femenino (Tito 2)',
              date: '2026-11-06',
              time: '18:00',
              location: 'Campamento El Saltito',
              category: 'segmentado_mujeres',
            },
          ]}
        />
      </section>

      {/* Modal de Solicitud de Visita con Dual-Channel WhatsApp Inmediato (GOLD-234) */}
      {activeModalGroup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 17, 21, 0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div className="surface-card animate-fade-in" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            position: 'relative',
          }}>
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                color: 'var(--text-muted)',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={54} style={{ color: 'var(--accent-emerald)', margin: '0 auto 16px auto' }} />
                <h3 style={{ fontSize: '1.45rem', marginBottom: '8px', color: 'var(--text-primary)' }}>¡Solicitud enviada!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', marginBottom: '24px', lineHeight: 1.5 }}>
                  Tu solicitud ha sido guardada. El líder de <strong>{activeModalGroup.nombre_publico}</strong> se comunicará contigo. Si deseas escribirle tú mismo en este instante, pulsa el botón siguiente:
                </p>

                {/* Botón de Despacho Inmediato a WhatsApp con Protocolo de Banqueta (GOLD-247 / Decisión 8-C) */}
                <a
                  href={`https://wa.me/526181234567?text=${encodeURIComponent(
                    `Hola ${activeModalGroup.leader_name || 'Líder'}, soy ${joinName}. Vi el grupo '${activeModalGroup.nombre_publico}' en el directorio de la iglesia y me gustaría visitarlos este ${formatDayOfWeek(activeModalGroup.dia_habitual)} a las ${activeModalGroup.hora_habitual} hrs. ¿Podrías salir a recibirme a la banqueta al llegar para ubicar la casa? ¡Muchas gracias!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    backgroundColor: '#25D366',
                    color: '#FFFFFF',
                    marginBottom: '12px',
                    minHeight: '48px',
                    textDecoration: 'none',
                    fontWeight: 700,
                  }}
                >
                  <MessageCircle size={18} />
                  <span>Protocolo de Banqueta: WhatsApp Directo</span>
                </a>

                <button onClick={closeModal} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Volver al Catálogo
                </button>
              </div>
            ) : (
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: '12px' }}>
                  {activeModalGroup.affinity_name}
                </span>
                <h3 style={{ fontSize: '1.45rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Visitar {activeModalGroup.nombre_publico}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.4 }}>
                  Ingresa tus datos de contacto para coordinar tu primera reunión en Durango.
                </p>

                {/* Nota Orientativa de Convivencia y Hospitalidad Fraternal */}
                {(() => {
                  const orientation = activeModalGroup.audience_orientation;
                  const aff = (activeModalGroup.affinity_name || '').toLowerCase();
                  const name = (activeModalGroup.nombre_publico || '').toLowerCase();
                  const isWomen = orientation === 'women_oriented' || aff.includes('mujer') || name.includes('mujer');
                  const isMen = orientation === 'men_oriented' || aff.includes('hombre') || aff.includes('varon') || name.includes('hombre');
                  const isCouples = orientation === 'couples_and_families' || aff.includes('matrimonio') || aff.includes('familia') || name.includes('matrimonio');
                  const isFoundational = activeModalGroup.focus_type === 'foundational' || aff.includes('alfa') || aff.includes('mayordom') || name.includes('alfa');
                  const isCommonInterest = activeModalGroup.focus_type === 'common_interest' || aff.includes('viajer') || aff.includes('café') || name.includes('viajer');

                  return (
                    <div style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '3px solid var(--accent-indigo)',
                      marginBottom: '18px',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                    }}>
                      {isWomen && (
                        <div>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                            Orientado a Mujeres (Etiqueta Orientativa de Convivencia)
                          </strong>
                          Este grupo se reúne principalmente para el crecimiento y apoyo entre mujeres. No es un candado ni un veto estricto: toda persona puede solicitar información o pedir permiso de visita; la líder conversará cordialmente contigo sobre la dinámica de las sesiones.
                        </div>
                      )}
                      {isMen && (
                        <div>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                            Orientado a Hombres (Etiqueta Orientativa de Convivencia)
                          </strong>
                          Este grupo enfoca sus conversaciones en la vida y edificación masculina. Las puertas están abiertas con cordialidad: el líder platicará contigo sobre las reuniones para acompañarte fraternalmente.
                        </div>
                      )}
                      {isCouples && (
                        <div>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                            Enfoque Familiar y Sin Exclusión
                          </strong>
                          Este grupo acoge a parejas y familias. En Amor y Gracia desalentamos cualquier exclusión de personas no casadas, solteras, viudas o en distintas circunstancias: ¡toda persona que busque edificación en Cristo es bienvenida con amor!
                        </div>
                      )}
                      {isFoundational && (
                        <div>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                            Grupo de Formación / Discipulado
                          </strong>
                          Espacio formativo (Curso Alfa para nuevos, Mayordomía Cristiana, Fundamentos de la Fe) enfocado en aprender y crecer juntos, sin estatus especial ni elitismo, abierto a todo buscador.
                        </div>
                      )}
                      {isCommonInterest && (
                        <div>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                            Grupo de Interés en Común
                          </strong>
                          Comunión y estudio bíblico en torno a una afición o interés compartido (viajes, lectura, café, deporte).
                        </div>
                      )}
                      {!isWomen && !isMen && !isCouples && !isFoundational && !isCommonInterest && (
                        <div>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                            Hospitalidad Fraternal en Comunidades
                          </strong>
                          Reunión en un ambiente familiar y seguro en Durango. Asistes libremente y sin compromiso alguno.
                        </div>
                      )}
                    </div>
                  );
                })()}

                <form onSubmit={handleJoinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Tu Nombre y Apellido
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Sofía Castro"
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Número de WhatsApp (con lada de México)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+52 618 123 4567"
                      value={joinPhone}
                      onChange={(e) => setJoinPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-emerald-light)',
                    border: '1px solid var(--accent-emerald-border)',
                    fontSize: '0.82rem',
                    color: 'var(--accent-emerald)',
                    lineHeight: 1.4,
                  }}>
                    <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    <strong>Privacidad de Datos:</strong> Tu número sólo será visible para el líder del grupo para saludarte y coordinar la logística.
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                  >
                    {submitting ? 'Enviando...' : 'Confirmar Petición'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Pase Comunitario Autónomo (GOLD-251) */}
      {passModalGroup && (
        <ConnectionPassCard
          groupId={passModalGroup.id}
          groupName={passModalGroup.nombre_publico}
          facilitatorName={passModalGroup.facilitator_name || passModalGroup.leader_name || 'Facilitador'}
          dayOfWeek={passModalGroup.dia_habitual}
          timeStr={passModalGroup.hora_habitual}
          venueName={passModalGroup.venue_category || 'Sede Célula'}
          address={passModalGroup.location_summary || 'Ubicación orientativa'}
          hostName={passModalGroup.host_reference || null}
          mapsUrl={passModalGroup.map_url || null}
          kidsWelcome={passModalGroup.kids_welcome}
          kidsSpaceType={passModalGroup.kids_space_type}
          focusType={passModalGroup.focus_type}
          audienceOrientation={passModalGroup.audience_orientation}
          isMember={false}
          cellAccent="navy"
          onClose={() => setPassModalGroup(null)}
        />
      )}

      {/* SECCIÓN DE ATENCIÓN A VECINOS Y CONVIVENCIA EN DURANGO */}
      <footer style={{ marginTop: '54px', paddingTop: '28px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          className="surface-card"
          style={{
            padding: '24px 28px',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--accent-emerald-border)',
            backgroundColor: 'rgba(16, 185, 129, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-emerald-light)',
                border: '1px solid var(--accent-emerald-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
                flexShrink: 0,
              }}
            >
              <HeartHandshake size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                Atención a Vecinos y Convivencia en Durango
              </h4>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.45 }}>
                ¿Vives en una colonia donde opera uno de nuestros grupos y tienes alguna inquietud sobre estacionamiento, ruido o libre tránsito? 
                En Amor y Gracia nos comprometemos a ser los vecinos más respetuosos y pacíficos de Durango. Escríbenos y con gusto dialogaremos en menos de 3 días para resolverlo juntos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowComplaintModal(true);
              setComplaintSuccessMessage(null);
            }}
            className="btn-secondary"
            style={{
              borderColor: 'var(--accent-emerald)',
              color: 'var(--accent-emerald)',
              fontWeight: 700,
              fontSize: '0.88rem',
              padding: '12px 20px',
            }}
          >
            Reportar Inquietud Vecinal
          </button>
        </div>
      </footer>

      {/* Modal Institucional (Qué Sostenemos • Qué No • LFPDPPP) */}
      <InstitutionalModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        churchName={config?.church_name}
      />

      {/* MODAL: REGISTRAR REPORTE DE ATENCIÓN A VECINOS */}
      {showComplaintModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px',
          }}
        >
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '520px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowComplaintModal(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: 'var(--accent-emerald)' }}>
              <HeartHandshake size={24} />
              <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>Atención a Vecinos y Convivencia</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '18px', lineHeight: 1.4 }}>
              Atendemos con prontitud y cariño cualquier situación en tu colonia (&lt; 3 días). Nuestro deseo es honrar a Dios conviviendo en armonía con nuestros vecinos en Durango.
            </p>

            {complaintSuccessMessage ? (
              <div style={{ padding: '16px', backgroundColor: 'var(--accent-emerald-light)', border: '1px solid var(--accent-emerald-border)', borderRadius: 'var(--radius-md)', color: 'var(--accent-emerald)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                <CheckCircle2 size={18} style={{ display: 'inline', marginRight: '6px' }} />
                <span>{complaintSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleComplaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Colonia o Fraccionamiento en Durango
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Fracc. Las Rosas, Col. Silvestre Dorador..."
                    value={complaintColonia}
                    onChange={(e) => setComplaintColonia(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Tipo de Situación
                  </label>
                  <select
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  >
                    <option value="estacionamiento">Estacionamiento / Bloqueo de Cochera</option>
                    <option value="volumen">Volumen / Decibeles en Horario Nocturno</option>
                    <option value="limpieza">Limpieza de Acera / Frente</option>
                    <option value="convivencia">Convivencia General / Dudas</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Descripción de la Situación
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Cuéntanos brevemente qué sucedió y qué día ocurrió..."
                    value={complaintComments}
                    onChange={(e) => setComplaintComments(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Teléfono o WhatsApp de Contacto (Opcional, para darte respuesta)
                  </label>
                  <input
                    type="text"
                    placeholder="ej. +52 618 123 4567"
                    value={complaintContact}
                    onChange={(e) => setComplaintContact(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingComplaint}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
                >
                  {submittingComplaint ? 'Enviando...' : 'Enviar Mensaje a Diáconos'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
