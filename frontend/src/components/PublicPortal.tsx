import React, { useEffect, useState } from 'react';
import type { PublicConfig, PublicEdition } from '../types';
import { fetchPublicCatalog, fetchPublicConfig, submitJoinRequest, submitNeighborhoodComplaint } from '../api';
import { InstitutionalModal } from './InstitutionalModal';
import { MonogramAvatar } from './MonogramAvatar';
import { ConnectionPassCard } from './ConnectionPassCard';
import { CommunityInitiativesHub } from './CommunityInitiativesHub';
import { ChurchBrandLogo } from './ChurchBrandLogo';
import {
  MapPin,
  Clock,
  Calendar,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  MessageCircle,
  HeartHandshake,
  Building,
  Home,
  SlidersHorizontal,
} from 'lucide-react';
import { formatDayOfWeek } from '../utils';

export const DURANGO_COLONIAS = [
  'Centro',
  'Lomas del Parque',
  'Las Rosas',
  'Fidel Velázquez',
  'Valle del Sur',
  'Jardines de Durango',
  'Huizache',
  'Ciénega',
  'Domingo Arrieta',
];

export const PublicPortal: React.FC = () => {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [groups, setGroups] = useState<PublicEdition[]>([]);
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

  // Proximidad Primero, Escala Masiva y Descongestión de Filtros (GOLD-324, GOLD-335)
  const [selectedColonia, setSelectedColonia] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [visibleLimit, setVisibleLimit] = useState<number>(6);
  const [showAdvancedFiltersModal, setShowAdvancedFiltersModal] = useState<boolean>(false);

  // Triple blindaje de rendimiento: debounce 150ms para 60fps en Android de $1,800 MXN (GOLD-338)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // Privacidad Escalonada: Público General vs Usuario con Cuenta vs Miembro Admitido (Solicitud de Usuario)
  const [hasAccount] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('portico_session_token') || localStorage.getItem('portico_token');
      const urlHasAccount = new URLSearchParams(window.location.search).get('has_account');
      return !!token || urlHasAccount === 'true';
    }
    return false;
  });

  /**
   * Formatea un nombre según el nivel de privacidad:
   * - Público general (sin cuenta): ÚNICAMENTE el primer nombre (ej. "Mariana", "Roberto", "Carlos")
   * - Con cuenta (miembro): Nombre completo (ej. "Mariana Torres", "Roberto Gómez")
   */
  const formatVisibleName = React.useCallback((fullName?: string | null): string => {
    if (!fullName) return '';
    const clean = fullName.trim();
    if (hasAccount) return clean;
    // Solo primer nombre para público general
    return clean.split(/\s+/)[0];
  }, [hasAccount]);

  /**
   * Sanitiza el resumen de ubicación eliminando cualquier nota privada:
   * - Notas como (Estacionamiento disponible...) o (Timbre blanco...) son EXCLUSIVAS
   *   para miembros ya admitidos en el grupo (visibles en MemberSilo.tsx).
   * - Quien tiene cuenta puede ver la dirección, pero NO las notas.
   * - El público general ve únicamente la zona / colonia general.
   */
  const sanitizeLocationSummary = React.useCallback((rawLocation: string): string => {
    if (!rawLocation) return '';
    let clean = rawLocation.replace(/\s*\([^)]*(estacionamiento|timbre|portón|puerta|privad|nota|parque infantil)[^)]*\)/gi, '').trim();
    clean = clean.replace(/\s*\(\s*\)/g, '').trim();
    return clean;
  }, []);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = hasAccount
        ? (localStorage.getItem('portico_session_token') || localStorage.getItem('portico_token') || undefined)
        : undefined;

      const [cfg, data] = await Promise.all([
        fetchPublicConfig(),
        fetchPublicCatalog({
          campus_slug: selectedCampus || undefined,
          affinity_id: selectedAffinity || undefined,
          zone_id: selectedZone || undefined,
          kids_welcome: filterKids !== null ? filterKids : undefined,
          macro_zone: selectedMacroZone !== 'all' ? selectedMacroZone : undefined,
          transit_only: filterTransitOnly ? true : undefined,
          token,
        }),
      ]);
      setConfig(cfg);
      setGroups(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedCampus, selectedAffinity, selectedZone, filterKids, selectedMacroZone, filterTransitOnly, hasAccount]);

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
    // 1. Proximidad Primero en Durango (GOLD-324)
    if (selectedColonia !== 'all') {
      const loc = (g.location_summary || '').toLowerCase();
      const zone = (g.zone_label || '').toLowerCase();
      const macro = (g.macro_zone || '').toLowerCase();
      const target = selectedColonia.toLowerCase();
      if (!loc.includes(target) && !zone.includes(target) && !macro.includes(target)) {
        return false;
      }
    }

    // 2. Buscador Instantáneo con Blindaje de Rendimiento Debounced (<10ms / GOLD-338)
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase().trim();
      const matchName = (g.nombre_publico || '').toLowerCase().includes(q);
      const matchLoc = (g.location_summary || '').toLowerCase().includes(q);
      const matchLeader = (g.leader_name || '').toLowerCase().includes(q);
      const matchDay = formatDayOfWeek(g.dia_habitual).toLowerCase().includes(q);
      const matchAff = (g.affinity_name || '').toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchLeader && !matchDay && !matchAff) {
        return false;
      }
    }

    // 3. Enfoque / Afinidad
    if (selectedFocusType !== 'all') {
      const focus = g.focus_type || '';
      const aff = (g.affinity_name || '').toLowerCase();
      const name = (g.nombre_publico || '').toLowerCase();
      if (selectedFocusType === 'common_interest') {
        if (!(focus === 'common_interest' || aff.includes('viajer') || aff.includes('café') || aff.includes('taco') || aff.includes('interés') || name.includes('viajer') || name.includes('café'))) return false;
      } else if (selectedFocusType === 'foundational') {
        if (!(focus === 'foundational' || aff.includes('alfa') || aff.includes('mayordom') || aff.includes('fundam') || aff.includes('nuevo') || name.includes('alfa') || name.includes('mayordom'))) return false;
      } else if (selectedFocusType === 'life_stage') {
        if (!(focus === 'life_stage' || (!aff.includes('viajer') && !aff.includes('café') && !aff.includes('alfa') && !aff.includes('mayordom')))) return false;
      }
    }

    return true;
  });

  return (
    <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 80px 16px', boxSizing: 'border-box', overflowX: 'clip' }}>
      {/* Hero Section con Tipografía Transitional (Charter / Georgia) y Lenguaje Sobrio (D3, D4, D5) */}
      <section style={{ marginBottom: '28px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <ChurchBrandLogo size={36} variant="icon" color="var(--accent-amber)" />
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--accent-amber-light)',
          border: '1px solid var(--accent-amber-border)',
          color: 'var(--accent-amber)',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '14px',
        }}>
          <span>{config?.active_season?.nombre_publico || 'Temporada Activa'} · Comunidades y Grupos</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)',
          lineHeight: 1.18,
          marginBottom: '14px',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}>
          Comunidades y Grupos de Hogar
        </h1>
        <p style={{
          maxWidth: '680px',
          margin: '0 auto 20px auto',
          color: 'var(--text-secondary)',
          fontSize: '1.02rem',
          lineHeight: 1.5,
        }}>
          Reuniones semanales para conocer a Dios, y apoyarse mutuamente en tu ciudad o en línea.
        </p>

        {/* Selector de Ciudad o Región (D3 / Multi-Sede) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          marginBottom: '8px',
        }}>
          {['Todas', 'Durango', 'Torreón', 'Mazatlán', 'En Línea'].map((city) => {
            const isSelected = (selectedCampus === '' && city === 'Todas') ||
              (city !== 'Todas' && (selectedCampus.toLowerCase().includes(city.toLowerCase()) || selectedMacroZone.toLowerCase().includes(city.toLowerCase())));
            return (
              <button
                key={city}
                type="button"
                id={`btn-city-${city.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                onClick={() => {
                  if (city === 'Todas') {
                    setSelectedCampus('');
                    setSelectedMacroZone('all');
                  } else if (city === 'En Línea') {
                    setSelectedFocusType('online');
                  } else {
                    const matchingCampus = config?.campuses.find((c) =>
                      c.ciudad.toLowerCase().includes(city.toLowerCase()) ||
                      c.nombre_publico.toLowerCase().includes(city.toLowerCase())
                    );
                    if (matchingCampus) {
                      setSelectedCampus(matchingCampus.slug);
                    } else {
                      setSelectedMacroZone(city);
                    }
                  }
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected ? '1px solid var(--accent-terracotta)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--accent-rose-light)' : 'var(--bg-surface)',
                  color: isSelected ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <span>{city}</span>
              </button>
            );
          })}
        </div>
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
              {config?.campuses && config.campuses.length === 1
                ? 'Contamos con 1 sede de reunión dominical con alabanza, música en vivo, enseñanza bíblica y espacio seguro para tus hijos.'
                : `Contamos con ${config?.campuses?.length || 1} sedes de reunión dominical con alabanza, música en vivo, enseñanza bíblica y espacio seguro para tus hijos.`}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                {config?.campuses && config.campuses.length === 1 ? '1 Sede Dominical' : `${config?.campuses?.length || 1} Sedes Dominicales`}
              </span>
              <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                Área Infantil Segura
              </span>
              <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                Música en Vivo
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
              <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                Grupos en Toda la Ciudad
              </span>
              <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                Cena y Café Fraterno
              </span>
              <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                Ambiente Íntimo y Confiable
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Filtro de Intención (D5, D10) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          <button
            type="button"
            id="btn-track-all"
            onClick={() => setIntentTrack('both')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.84rem',
              fontWeight: 700,
              backgroundColor: intentTrack === 'both' ? 'var(--accent-amber)' : 'var(--bg-surface)',
              color: intentTrack === 'both' ? '#161513' : 'var(--text-primary)',
              border: intentTrack === 'both' ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <span>Todos los Grupos</span>
          </button>
          <button
            type="button"
            id="btn-track-temple"
            onClick={() => setIntentTrack('temple')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.84rem',
              fontWeight: 700,
              backgroundColor: intentTrack === 'temple' ? 'var(--accent-amber)' : 'var(--bg-surface)',
              color: intentTrack === 'temple' ? '#161513' : 'var(--text-primary)',
              border: intentTrack === 'temple' ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <span>Sedes Dominicales ({config?.campuses?.length || 1})</span>
          </button>
          <button
            type="button"
            id="btn-track-home"
            onClick={() => setIntentTrack('home')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.84rem',
              fontWeight: 700,
              backgroundColor: intentTrack === 'home' ? 'var(--accent-olive)' : 'var(--bg-surface)',
              color: intentTrack === 'home' ? '#FFFFFF' : 'var(--text-primary)',
              border: intentTrack === 'home' ? '1px solid var(--accent-olive)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <span>Grupos en Casas ({displayedGroups.length})</span>
          </button>
        </div>
      </section>

      {/* Sedes Físicas Dominicales Recursivas a la Realidad (Decisión Dominical y Dinámica) */}
      {(intentTrack === 'both' || intentTrack === 'temple') && (
        <section
          id="sunday-campuses-section"
          aria-label="Sedes de reunión dominical"
          style={{
            marginBottom: '28px',
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--accent-amber)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backgroundColor: 'var(--accent-amber-light)',
                color: 'var(--accent-amber)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-block',
                marginBottom: '4px',
              }}>
                Ruta Dominical · Sedes Físicas ({config?.campuses?.length || 1})
              </span>
              <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
                Nuestras Sedes de Reunión Dominical
              </h3>
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Horarios habituales: Domingos 10:00 y 12:30 hrs
            </div>
          </div>

          <p style={{ margin: '0 0 18px 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {config?.campuses && config.campuses.length === 1
              ? 'Reunión dominical general con alabanza, predicación bíblica y atención para niños en nuestra sede.'
              : `Contamos con ${config?.campuses?.length || 1} sedes en la región. Toca en cualquier ubicación para abrir la dirección directamente en Google Maps o Waze.`}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {(config?.campuses && config.campuses.length > 0 ? config.campuses : [
              {
                id: 'campus-central',
                slug: 'durango-central',
                nombre_publico: 'Campus Central',
                ciudad: 'Durango',
                address: 'Blvd. Dolores del Río 105, Zona Centro, Durango',
                macro_zone: 'Centro',
                pastor_name: 'Pastor Samuel Gómez',
                atrium_welcome_lead: 'Mateo Valenzuela',
              }
            ]).map((camp) => (
              <div
                key={camp.id}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {camp.nombre_publico}
                    </strong>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                    }}>
                      {camp.macro_zone || camp.ciudad}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                    {camp.address || `Sede oficial en ${camp.ciudad}`}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 600, marginBottom: '4px' }}>
                    Reuniones: Domingos 10:00 y 12:30 hrs
                  </div>

                  {camp.pastor_name && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Atención: {camp.pastor_name}
                    </div>
                  )}
                </div>

                <a
                  id={`btn-campus-maps-${camp.slug}`}
                  href={camp.address ? `https://maps.google.com/?q=${encodeURIComponent(camp.address)}` : `https://maps.google.com/?q=${encodeURIComponent(camp.nombre_publico + ' ' + camp.ciudad)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary tap-target-44"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-sm)',
                    width: '100%',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  }}
                >
                  Abrir en Google Maps
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Proximidad Primero en 2 Pasos y Descongestión del Acantilado Móvil (GOLD-324 / GOLD-335) */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: '28px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              Proximidad en Durango: Encuentra una familia cerca de ti
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Selecciona tu colonia en 1 toque o escribe tu colonia, anfitrión o día.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 300px', justifyContent: 'flex-end' }}>
            <div style={{ flex: '1 1 200px', maxWidth: '340px' }}>
              <input
                type="text"
                id="input-quick-search-colonia"
                data-testid="input-proximity-search"
                placeholder="Buscar colonia, anfitrión o día..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleLimit(6);
                }}
                className="tap-target-48"
                style={{
                  width: '100%',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                }}
              />
            </div>

            {/* Botón de Filtros Específicos (Drawer Deslizable) */}
            <button
              type="button"
              id="btn-open-advanced-filters"
              onClick={() => setShowAdvancedFiltersModal(true)}
              className="btn-secondary tap-target-48"
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
              title="Abrir filtros específicos de sede, etapa y afinidad"
            >
              <SlidersHorizontal size={15} style={{ color: 'var(--accent-terracotta)' }} />
              <span>Filtros Específicos</span>
              {([
                selectedCampus !== '',
                selectedAffinity !== '',
                selectedFocusType !== 'all',
                filterKids !== null,
                filterTransitOnly === true,
              ].filter(Boolean).length > 0) && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    backgroundColor: 'var(--accent-terracotta)',
                    color: '#FFFFFF',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    {[
                      selectedCampus !== '',
                      selectedAffinity !== '',
                      selectedFocusType !== 'all',
                      filterKids !== null,
                      filterTransitOnly === true,
                    ].filter(Boolean).length}
                  </span>
                )}
            </button>

            <button
              type="button"
              onClick={() => setShowLegalModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
              }}
              title="Protección de Datos & Confesión de Fe"
            >
              <Lock size={13} />
              <span>Privacidad & Fe</span>
            </button>
          </div>
        </div>

        {/* Franja Horizontal de Colonias en 1 Toque */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            type="button"
            id="colonia-pill-all"
            onClick={() => {
              setSelectedColonia('all');
              setVisibleLimit(6);
            }}
            className="tap-target-48"
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.84rem',
              fontWeight: 700,
              backgroundColor: selectedColonia === 'all' ? 'var(--text-primary)' : 'var(--bg-primary)',
              color: selectedColonia === 'all' ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Todas las Colonias
          </button>
          {DURANGO_COLONIAS.map((colonia) => {
            const isSel = selectedColonia === colonia;
            return (
              <button
                key={colonia}
                type="button"
                id={`colonia-pill-${colonia.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  setSelectedColonia(colonia);
                  setVisibleLimit(6);
                }}
                className="tap-target-48"
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  backgroundColor: isSel ? 'var(--accent-terracotta)' : 'var(--bg-primary)',
                  color: isSel ? '#FFFFFF' : 'var(--text-secondary)',
                  border: isSel ? '1px solid var(--accent-terracotta)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {colonia}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal de Filtros Avanzados (GOLD-335: Descongestión del Acantilado Móvil) */}
      {showAdvancedFiltersModal && (
        <div
          id="modal-advanced-filters"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 17, 21, 0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 0,
          }}
          onClick={() => setShowAdvancedFiltersModal(false)}
        >
          <div
            className="surface-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '85vh',
              overflowY: 'auto',
              borderTopLeftRadius: 'var(--radius-xl, 24px)',
              borderTopRightRadius: 'var(--radius-xl, 24px)',
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              padding: '24px 20px',
              backgroundColor: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={20} style={{ color: 'var(--accent-terracotta)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Filtros Avanzados
                </h3>
              </div>
              <button
                type="button"
                id="btn-close-advanced-filters"
                onClick={() => setShowAdvancedFiltersModal(false)}
                className="tap-target-48"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Cerrar filtros"
              >
                <X size={22} />
              </button>
            </div>

            {/* Selector de Campus Eclesial (si aplica) */}
            {config?.campuses && config.campuses.length > 1 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Campus Eclesial:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => { setSelectedCampus(''); setVisibleLimit(6); }}
                    style={{
                      minHeight: '38px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      backgroundColor: selectedCampus === '' ? 'var(--text-primary)' : 'var(--bg-primary)',
                      color: selectedCampus === '' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    Todos los Campus
                  </button>
                  {config.campuses.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setSelectedCampus(c.slug); setVisibleLimit(6); }}
                      style={{
                        minHeight: '38px',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        backgroundColor: selectedCampus === c.slug ? 'var(--accent-terracotta)' : 'var(--bg-primary)',
                        color: selectedCampus === c.slug ? '#FFFFFF' : 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      {c.nombre_publico}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de Enfoque */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Enfoque de Comunidad:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => { setSelectedFocusType('all'); setVisibleLimit(6); }}
                  style={{
                    minHeight: '38px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
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
                  onClick={() => { setSelectedFocusType('life_stage'); setVisibleLimit(6); }}
                  style={{
                    minHeight: '38px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
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
                  onClick={() => { setSelectedFocusType('common_interest'); setVisibleLimit(6); }}
                  style={{
                    minHeight: '38px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    backgroundColor: selectedFocusType === 'common_interest' ? 'var(--accent-amber)' : 'var(--bg-primary)',
                    color: selectedFocusType === 'common_interest' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  Interés Común
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedFocusType('foundational'); setVisibleLimit(6); }}
                  style={{
                    minHeight: '38px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
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
            </div>

            {/* Selector de Afinidad / Tema */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Afinidad o Tema:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`affinity-chip ${selectedAffinity === '' ? 'active' : ''}`}
                  onClick={() => { setSelectedAffinity(''); setVisibleLimit(6); }}
                  style={{
                    minHeight: '38px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    backgroundColor: selectedAffinity === '' ? 'var(--text-primary)' : 'var(--bg-primary)',
                    color: selectedAffinity === '' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  Todos los Temas
                </button>
                {config?.affinities.map((aff) => (
                  <button
                    key={aff.id}
                    type="button"
                    className={`affinity-chip ${selectedAffinity === aff.id ? 'active' : ''}`}
                    onClick={() => { setSelectedAffinity(aff.id); setVisibleLimit(6); }}
                    style={{
                      minHeight: '38px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      backgroundColor: selectedAffinity === aff.id ? 'var(--accent-terracotta)' : 'var(--bg-primary)',
                      color: selectedAffinity === aff.id ? '#FFFFFF' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    {aff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector Territorial Único (GOLD-291) */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Selector Territorial Único (Sector de la Ciudad):
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'Norte', 'Sur', 'Centro', 'Oriente', 'Poniente'].map((mz) => (
                  <button
                    key={mz}
                    type="button"
                    onClick={() => {
                      setSelectedMacroZone(mz);
                      setSelectedZone('');
                      setVisibleLimit(6);
                    }}
                    style={{
                      minHeight: '38px',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.84rem',
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
              </div>
            </div>

            {/* Opciones Especiales: Espacio infantil & Transporte */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button
                type="button"
                id="filter-kids-welcome"
                onClick={() => setFilterKids((prev) => (prev === true ? null : true))}
                style={{
                  minHeight: '40px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  backgroundColor: filterKids === true ? 'var(--accent-emerald)' : 'var(--bg-primary)',
                  color: filterKids === true ? '#FFFFFF' : 'var(--text-secondary)',
                  border: filterKids === true ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Espacio Infantil / Niños</span>
                {filterKids === true && <CheckCircle2 size={14} />}
              </button>

              <button
                type="button"
                id="filter-transit-only"
                onClick={() => setFilterTransitOnly((prev) => !prev)}
                style={{
                  minHeight: '40px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  backgroundColor: filterTransitOnly ? 'var(--accent-indigo)' : 'var(--bg-primary)',
                  color: filterTransitOnly ? '#FFFFFF' : 'var(--text-secondary)',
                  border: filterTransitOnly ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Transporte Accesible / Carpool</span>
                {filterTransitOnly && <CheckCircle2 size={14} />}
              </button>
            </div>

            {/* Botones de Acción del Modal */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                id="btn-reset-filters"
                onClick={() => {
                  setSelectedCampus('');
                  setSelectedFocusType('all');
                  setSelectedAffinity('');
                  setSelectedMacroZone('all');
                  setFilterKids(null);
                  setFilterTransitOnly(false);
                  setVisibleLimit(6);
                }}
                className="tap-target-48"
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Restablecer
              </button>
              <button
                type="button"
                id="btn-apply-filters"
                onClick={() => setShowAdvancedFiltersModal(false)}
                className="tap-target-48"
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-terracotta)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Aplicar y Ver Grupos
              </button>
            </div>
          </div>
        </div>
      )}

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
          {displayedGroups.slice(0, visibleLimit).map((group) => {
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
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {formatVisibleName(group.facilitator_name || group.leader_name) || 'Designado'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      {group.venue_type === 'institucional' ? 'Contacto / Enlace' : 'Anfitrión'}
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {group.venue_type === 'institucional'
                        ? (group.liaison_name || group.host_reference || 'Enlace Institucional')
                        : (group.host_reference && group.host_reference !== 'Hogar sede'
                          ? formatVisibleName(group.host_reference)
                          : (group.host_reference || 'Hogar sede'))}
                    </strong>
                  </div>
                  {group.apprentice_name && (
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>Aprendiz</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatVisibleName(group.apprentice_name)}</strong>
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
                            <Lock size={10} /> La dirección de este hogar está cuidada
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '2px' }}>
                        {sanitizeLocationSummary(group.location_summary)}
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

                {/* Pie de Tarjeta: Líder con MonogramAvatar y Botón de Puerta Única (GOLD-321 & GOLD-325) */}
                {(() => {
                  const visibleLeaderName = formatVisibleName(group.leader_name);
                  return (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-subtle)',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}>
                      {visibleLeaderName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MonogramAvatar name={visibleLeaderName} size="sm" />
                          <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                            {group.venue_type === 'institucional' ? 'Contacto / Enlace' : 'Anfitrión'}: <strong>{visibleLeaderName}</strong>
                          </span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {visibleLeaderName && (
                          <a
                            href={`https://wa.me/526181000001?text=${encodeURIComponent(`Hola ${visibleLeaderName}, vi tu grupo pequeño '${group.nombre_publico}' en el portal de Amor y Gracia Durango y me gustaría conocerlos.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary tap-target-48 btn-wa-safe"
                            style={{
                              minHeight: '44px',
                              padding: '6px 14px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              borderRadius: 'var(--radius-full)',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                            title={`Saludar a ${visibleLeaderName} por WhatsApp`}
                          >
                            <MessageCircle size={15} style={{ color: 'var(--accent-emerald)' }} />
                            <span>Saludar por WhatsApp</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setActiveModalGroup(group)}
                          className="btn-primary tap-target-48"
                          style={{
                            minHeight: '44px',
                            padding: '8px 18px',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <MessageCircle size={15} />
                          <span>Quiero Conocer Este Grupo</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </article>
            );
          })}
        </div>
      )}

      {/* Botón de Carga Progresiva / Revelación Suave para 15k Miembros (GOLD-324) */}
      {!loading && displayedGroups.length > visibleLimit && (
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <button
            type="button"
            id="btn-load-more-groups"
            onClick={() => setVisibleLimit((prev) => prev + 6)}
            className="btn-secondary tap-target-48"
            style={{
              padding: '12px 28px',
              fontSize: '0.92rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--accent-terracotta)',
              color: 'var(--accent-terracotta)',
              backgroundColor: 'var(--bg-surface)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Ver más grupos en esta zona ({displayedGroups.length - visibleLimit} restantes)
          </button>
        </div>
      )}

      {/* Sección: Iniciativas Comunitarias y Coloquios Abiertos (Vitrina Inspiracional Pública / GOLD-320) */}
      <section style={{ marginTop: '48px', marginBottom: '36px' }}>
        <CommunityInitiativesHub publicShowcaseOnly={true} />
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
                    `Hola ${formatVisibleName(activeModalGroup.leader_name) || 'Líder'}, soy ${joinName}. Vi el grupo '${activeModalGroup.nombre_publico}' en el directorio de la iglesia y me gustaría visitarlos este ${formatDayOfWeek(activeModalGroup.dia_habitual)} a las ${activeModalGroup.hora_habitual} hrs. ¿Podrías salir a recibirme a la banqueta al llegar para ubicar la casa? ¡Muchas gracias!`
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
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-emerald-light)',
                    border: '1px solid var(--accent-emerald-border)',
                    fontSize: '0.84rem',
                    color: 'var(--accent-emerald)',
                    lineHeight: 1.45,
                  }}>
                    <Lock size={13} style={{ display: 'inline', marginRight: '6px' }} />
                    <strong>Un espacio seguro:</strong> Tu número solo lo recibe el anfitrión para darte la bienvenida personal. Jamás compartiremos tus datos con nadie más ni te enviaremos publicidad.
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

      {/* Enlace de Cortesía Cívica Vecinal en Pie de Página Institucional (GOLD-322) */}
      <footer style={{ marginTop: '54px', paddingTop: '28px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          ¿Eres vecino de alguna de nuestras reuniones en casa? Queremos ser una bendición y los vecinos más respetuosos para tu colonia.{' '}
          <button
            type="button"
            id="btn-open-civic-care"
            onClick={() => {
              setShowComplaintModal(true);
              setComplaintSuccessMessage(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-emerald)',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '0 4px',
              fontSize: '0.88rem',
            }}
          >
            Escríbenos con confianza aquí
          </button>
        </p>
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
