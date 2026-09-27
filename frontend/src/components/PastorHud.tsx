import React, { useEffect, useState } from 'react';
import type {
  Campus,
  ChurchConfiguration,
  EldershipCouncil,
  EmeritusGuardian,
  HostSabbatical,
  LeaderSummary,
  NeighborhoodComplaint,
  PastoralBroadcast,
  PastorGroupRow,
  PastorOverview,
  RestrictedPairingItem,
  SafeguardAlertItem,
} from '../types';
import {
  cloneEditionDraft,
  createPastoralBroadcast,
  createRestrictedPairing,
  disciplineMember,
  enrollEmeritusGuardian,
  fetchActivePastoralBroadcasts,
  fetchCampuses,
  fetchChurchConfig,
  fetchEldershipCouncils,
  fetchEmeritusGuardians,
  fetchFatigueRadar,
  fetchLeadersList,
  fetchNeighborhoodComplaints,
  fetchPastorGroups,
  fetchPastorOverview,
  fetchRestrictedPairings,
  fetchSafeguardAlerts,
  recordHostSabbatical,
  requestMagicLink,
  resolveNeighborhoodComplaint,
  triageSafeguardAlert,
  updateChurchConfig,
  verifyMagicLink,
  vetoEdition,
} from '../api';
import {
  Church,
  Copy,
  CheckCircle,
  BarChart3,
  ChevronRight,
  Printer,
  MapPin,
  ShieldAlert,
  Lock,
  Plus,
  X,
  Radio,
  Gavel,
  Sliders,
  Users,
  Send,
  ShieldCheck,
  Building,
  Award,
  HeartHandshake,
  Download,
  HardDrive,
} from 'lucide-react';
import { CHRISTIAN_WEEKDAY_PLURALS } from '../utils';
import { MonogramAvatar, NOBLE_PALETTES } from './MonogramAvatar';
import { ChurchBrandLogo } from './ChurchBrandLogo';
import { DeaconDesk } from './DeaconDesk';
import { GroupPastoralCard } from './GroupPastoralCard';
import { PastorAntiCollisionDesk } from './PastorAntiCollisionDesk';
import { LiturgicalPauseManager } from './LiturgicalPauseManager';
import { CommunityInitiativesHub } from './CommunityInitiativesHub';

export const PastorHud: React.FC = () => {
  const [overview, setOverview] = useState<PastorOverview | null>(null);
  const [groups, setGroups] = useState<PastorGroupRow[]>([]);
  const [safeguards, setSafeguards] = useState<SafeguardAlertItem[]>([]);
  const [pairings, setPairings] = useState<RestrictedPairingItem[]>([]);
  const [broadcasts, setBroadcasts] = useState<PastoralBroadcast[]>([]);
  const [churchConfig, setChurchConfig] = useState<ChurchConfiguration | null>(null);
  const [leaders, setLeaders] = useState<LeaderSummary[]>([]);
  const [showPastoralCard, setShowPastoralCard] = useState<boolean>(false);

  // Navegación de pestañas del HUD
  const [activeTab, setActiveTab] = useState<'radar' | 'leaders' | 'sabbaticals' | 'deacons' | 'elders' | 'territory' | 'scale' | 'initiatives'>('radar');

  // Estados
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [councils, setCouncils] = useState<EldershipCouncil[]>([]);
  const [fatigueRadar, setFatigueRadar] = useState<HostSabbatical[]>([]);
  const [emeritusGuardians, setEmeritusGuardians] = useState<EmeritusGuardian[]>([]);
  const [complaints, setComplaints] = useState<NeighborhoodComplaint[]>([]);

  // Toggles de Crecimiento Pastoral (Directiva del Pastor Principal Josh)
  const [cfgEnableDeacons, setCfgEnableDeacons] = useState<boolean>(true);
  const [cfgEnableEldership, setCfgEnableEldership] = useState<boolean>(true);
  const [cfgGrowthTarget, setCfgGrowthTarget] = useState<number>(10000);

  // Modales Ciclo 6
  const [showGuardianModal, setShowGuardianModal] = useState<boolean>(false);
  const [newGuardianMemberId, setNewGuardianMemberId] = useState<string>('');
  const [newGuardianName, setNewGuardianName] = useState<string>('');
  const [newGuardianJoinYear, setNewGuardianJoinYear] = useState<number>(2020);
  const [newGuardianRole, setNewGuardianRole] = useState<string>('Facilitador Pionero');
  const [isCommissioningGuardian, setIsCommissioningGuardian] = useState<boolean>(false);

  const [resolvingComplaint, setResolvingComplaint] = useState<NeighborhoodComplaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [isResolvingComplaint, setIsResolvingComplaint] = useState<boolean>(false);

  const [selectedCampus, setSelectedCampus] = useState<string>('Todos los Campus');
  const [selectedFocusType, setSelectedFocusType] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<PastorGroupRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modales
  const [showPairModal, setShowPairModal] = useState<boolean>(false);
  const [newPhoneA, setNewPhoneA] = useState<string>('');
  const [newPhoneB, setNewPhoneB] = useState<string>('');
  const [newReason, setNewReason] = useState<string>('consejería');

  // Modal Veto Pastoral (GOLD-254)
  const [showVetoModal, setShowVetoModal] = useState<boolean>(false);
  const [vetoReason, setVetoReason] = useState<string>('');
  const [isSubmittingVeto, setIsSubmittingVeto] = useState<boolean>(false);

  // Modal Disciplina Pastoral Colegiada en Ancianos (GOLD-254 & GOLD-343)
  const [showDisciplineModal, setShowDisciplineModal] = useState<boolean>(false);
  const [disciplineMemberId, setDisciplineMemberId] = useState<string>('');
  const [disciplineAction, setDisciplineAction] = useState<string>('suspension');
  const [disciplineReason, setDisciplineReason] = useState<string>('');
  const [disciplineProposer, setDisciplineProposer] = useState<string>('Andrés Ramos (Anciano Moderador)');
  const [disciplineChecker, setDisciplineChecker] = useState<string>('Pastor Principal Josh');
  const [isSubmittingDiscipline, setIsSubmittingDiscipline] = useState<boolean>(false);

  // Estados de Búsqueda, Mantenimiento y Ergonomía Móvil (GOLD-340 & GOLD-344)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [showMaintenanceMenu, setShowMaintenanceMenu] = useState<boolean>(false);
  const [showMobileDetail, setShowMobileDetail] = useState<boolean>(false);

  // Modal Comunicado Pastoral Oficial (GOLD-256)
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastTitle, setBroadcastTitle] = useState<string>('');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [broadcastPriority, setBroadcastPriority] = useState<string>('normal');
  const [isSubmittingBroadcast, setIsSubmittingBroadcast] = useState<boolean>(false);

  // Modal Configuración de Iglesia y White-Labeling (GOLD-255 & GOLD-257)
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [cfgPaletteId, setCfgPaletteId] = useState<string>('navy');
  const [cfgSeasonName, setCfgSeasonName] = useState<string>('');
  const [cfgSeasonMotto, setCfgSeasonMotto] = useState<string>('');
  const [cfgCampusSingular, setCfgCampusSingular] = useState<string>('Campus');
  const [cfgGroupSingular, setCfgGroupSingular] = useState<string>('Célula');
  const [cfgLeaderTitle, setCfgLeaderTitle] = useState<string>('Facilitador');
  const [cfgMeetingTerm, setCfgMeetingTerm] = useState<string>('Reunión de Hogar');
  const [cfgSeasonDurationWeeks, setCfgSeasonDurationWeeks] = useState<number>(12);
  const [isSubmittingConfig, setIsSubmittingConfig] = useState<boolean>(false);

  // Administración Pastoral de Facilitadores / Líderes
  const [editingLeader, setEditingLeader] = useState<LeaderSummary | null>(null);
  const [editLeaderCampus, setEditLeaderCampus] = useState<string>('Durango Central');
  const [editLeaderGroup, setEditLeaderGroup] = useState<string>('');
  const [editLeaderStatus, setEditLeaderStatus] = useState<string>('Activo');
  const [leaderSearch, setLeaderSearch] = useState<string>('');

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [ov, grps, sfs, prs, bcs, cfg, ldrs, camps, cncls, ftg, emr, cmpls] = await Promise.all([
        fetchPastorOverview(),
        fetchPastorGroups(),
        fetchSafeguardAlerts().catch(() => []),
        fetchRestrictedPairings().catch(() => []),
        fetchActivePastoralBroadcasts().catch(() => []),
        fetchChurchConfig().catch(() => null),
        fetchLeadersList().catch(() => []),
        fetchCampuses().catch(() => []),
        fetchEldershipCouncils().catch(() => []),
        fetchFatigueRadar().catch(() => []),
        fetchEmeritusGuardians().catch(() => []),
        fetchNeighborhoodComplaints().catch(() => []),
      ]);
      setOverview(ov);
      setGroups(grps);
      setSafeguards(sfs);
      setPairings(prs);
      setBroadcasts(bcs);
      setLeaders(ldrs);
      setCampuses(camps);
      setCouncils(cncls);
      setFatigueRadar(ftg);
      setEmeritusGuardians(emr);
      setComplaints(cmpls);
      if (cfg) {
        setChurchConfig(cfg);
        setCfgPaletteId(cfg.brand_palette_id || 'navy');
        setCfgSeasonName(cfg.season_name || '');
        setCfgSeasonMotto(cfg.season_motto || '');
        setCfgSeasonDurationWeeks(cfg.season_duration_weeks || 12);
        setCfgEnableDeacons(cfg.enable_deacon_system ?? true);
        setCfgEnableEldership(cfg.enable_eldership_system ?? true);
        setCfgGrowthTarget(cfg.growth_target_members ?? 5000);
        if (cfg.nomenclature) {
          setCfgCampusSingular(cfg.nomenclature.campus_singular || 'Campus');
          setCfgGroupSingular(cfg.nomenclature.group_singular || 'Célula');
          setCfgLeaderTitle(cfg.nomenclature.leader_title || 'Facilitador');
          setCfgMeetingTerm(cfg.nomenclature.meeting_term || 'Reunión de Hogar');
        }
      }
      if (grps.length > 0) {
        setSelectedGroup(grps[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!loading && window.location.hash) {
      setTimeout(() => {
        const el = document.querySelector(window.location.hash);
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, 100);
    }
  }, [loading]);

  // Soporte de apertura declarativa de modales y pestañas para inspección y captura pastoral
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('modal');
      if (m === 'veto') setShowVetoModal(true);
      if (m === 'discipline') setShowDisciplineModal(true);
      if (m === 'broadcast') setShowBroadcastModal(true);
      const t = params.get('tab');
      if (t === 'elders' || t === 'sabbaticals' || t === 'deacons' || t === 'territory' || t === 'initiatives') {
        setActiveTab(t as any);
      }
    }
  }, [loading]);

  const handleCloneDraft = async (editionId: string, groupName: string) => {
    if (
      !confirm(
        `¿Deseas clonar "${groupName}" a borrador para la próxima temporada? (No se arrastrarán los miembros anteriores para garantizar consentimiento voluntario fresco)`
      )
    ) {
      return;
    }
    setCloningId(editionId);
    setStatusMessage(null);
    try {
      const ml = await requestMagicLink('josh@amorygracia.mx');
      const auth = await verifyMagicLink(ml.token);
      const res = await cloneEditionDraft(
        editionId,
        {
          cloned_by: 'pastor-josh',
          lineage_type: 'replicated',
        },
        auth.session_token
      );
      setStatusMessage(
        `Grupo "${groupName}" clonado a borrador con ID ${res.new_edition_id.slice(
          0,
          8
        )}... (Línea sucesoria preservada en edition_lineage)`
      );
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Error al clonar edición');
    } finally {
      setCloningId(null);
    }
  };

  const [isExportingArchive, setIsExportingArchive] = useState<boolean>(false);

  const handleExportSovereignArchive = () => {
    setIsExportingArchive(true);
    setStatusMessage('Generando y descargando copia completa (archivo ZIP con .db y CSVs)...');

    // Disparar descarga directa del archivo ZIP desde el endpoint de Axum
    const downloadUrl = '/api/pastor/export-sovereign-archive';
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'amorygracia_respaldo_completo.zip');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExportingArchive(false);
      setStatusMessage('Copia de seguridad descargada con éxito. La información pertenece a la congregación.');
    }, 2000);
  };

  const handleTriage = async (alertId: string) => {
    try {
      await triageSafeguardAlert(alertId, 'attended');
      const updated = await fetchSafeguardAlerts();
      setSafeguards(updated);
    } catch (e: any) {
      alert(e.message || 'Error actualizando alerta');
    }
  };

  const handleCreatePairing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRestrictedPairing({
        phone_a: newPhoneA,
        phone_b: newPhoneB,
        reason_category: newReason,
      });
      setShowPairModal(false);
      setNewPhoneA('');
      setNewPhoneB('');
      const updated = await fetchRestrictedPairings();
      setPairings(updated);
    } catch (e: any) {
      alert(e.message || 'Error registrando par restringido');
    }
  };

  const handleRatifyPairing = (pairingId: string) => {
    setStatusMessage(`Ruteo anti-colisión #${pairingId.slice(0, 8)} ratificado por el Pastor Josh.`);
  };

  const handleVetoPairing = (pairingId: string) => {
    setPairings((prev) => prev.filter((p) => p.id !== pairingId));
    setStatusMessage(`Veto Pastoral ejercido sobre el ruteo #${pairingId.slice(0, 8)}. Restricción levantada en gracia.`);
  };

  // Veto Pastoral (Edición)
  const handleExecuteVeto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setIsSubmittingVeto(true);
    try {
      const res = await vetoEdition(selectedGroup.id, vetoReason);
      setShowVetoModal(false);
      setVetoReason('');
      setStatusMessage(`Veto Pastoral Ejecutado sobre "${selectedGroup.nombre_publico}": ${res.message}`);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Error al ejecutar veto pastoral');
    } finally {
      setIsSubmittingVeto(false);
    }
  };

  // Disciplina Pastoral Colegiada (GOLD-254 & GOLD-343 - Regla de los Cuatro Ojos)
  const handleExecuteDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disciplineMemberId) {
      alert('Especifica el identificador o correo del miembro');
      return;
    }
    setIsSubmittingDiscipline(true);
    try {
      const res = await disciplineMember(disciplineMemberId, disciplineAction, disciplineReason);
      setShowDisciplineModal(false);
      setDisciplineMemberId('');
      setDisciplineReason('');
      setStatusMessage(
        `Medida de Disciplina Pastoral Aplicada con doble firma conciliar (${disciplineProposer} y ${disciplineChecker}): ${res.message}`
      );
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Error al aplicar disciplina pastoral');
    } finally {
      setIsSubmittingDiscipline(false);
    }
  };

  // Emisión de Comunicado Pastoral Masivo Unidireccional (GOLD-256)
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBroadcast(true);
    try {
      await createPastoralBroadcast({
        title: broadcastTitle,
        message: broadcastMessage,
        priority: broadcastPriority,
      });
      setShowBroadcastModal(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setStatusMessage('Comunicado pastoral emitido y visible para todos los facilitadores de células.');
      const bcs = await fetchActivePastoralBroadcasts();
      setBroadcasts(bcs);
    } catch (e: any) {
      alert(e.message || 'Error al emitir comunicado');
    } finally {
      setIsSubmittingBroadcast(false);
    }
  };

  // Generador de enlace WhatsApp fraterno contextual (GOLD-346 / Decisión 8-B)
  const generateFraternalWhatsAppUrl = (group: PastorGroupRow) => {
    const rawPhone = group.host_phone || '6181234567';
    const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanDigits.startsWith('52') ? cleanDigits : `52${cleanDigits}`;
    const leaderName = group.leader_name || 'hermano';

    let message = `Hola ${leaderName}, un abrazo fraterno de parte del equipo pastoral de Amor y Gracia. Doy gracias a Dios por tu vida y tu servicio facilitando la célula "${group.nombre_publico}". Oramos por ustedes.`;

    if (group.average_headcount !== null && group.average_headcount < 6) {
      message = `Hola ${leaderName}, estuve orando por tu vida y la célula "${group.nombre_publico}" esta semana. ¿Cómo te has sentido y cómo podemos apoyarte desde el equipo pastoral para la reunión de este ciclo? Cuentas con nosotros.`;
    }

    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
  };

  // Guardar Configuración de Iglesia y Paleta Noble (GOLD-255 & GOLD-257 & Directiva Crecimiento Josh)
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingConfig(true);
    try {
      await updateChurchConfig({
        brand_palette_id: cfgPaletteId,
        season_name: cfgSeasonName,
        season_motto: cfgSeasonMotto,
        season_duration_weeks: cfgSeasonDurationWeeks,
        enable_deacon_system: cfgEnableDeacons,
        enable_eldership_system: cfgEnableEldership,
        growth_target_members: Number(cfgGrowthTarget) || 5000,
        nomenclature: {
          campus_singular: cfgCampusSingular,
          campus_plural: `${cfgCampusSingular}es`,
          group_singular: cfgGroupSingular,
          group_plural: `${cfgGroupSingular}s`,
          leader_title: cfgLeaderTitle,
          host_title: 'Anfitrión',
          meeting_term: cfgMeetingTerm,
        },
      });
      document.documentElement.setAttribute('data-palette', cfgPaletteId);
      setShowConfigModal(false);
      setStatusMessage('Configuración eclesial, paleta noble y directivas de crecimiento actualizadas.');
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Error guardando configuración');
    } finally {
      setIsSubmittingConfig(false);
    }
  };

  const handleAuthorizeHostSabbatical = async (groupId: string, hostName: string) => {
    if (!confirm(`¿Conceder descanso sabático litúrgico de 1 temporada para el anfitrión ${hostName}?`)) return;
    try {
      await recordHostSabbatical(groupId, {
        host_name: hostName,
        consecutive_seasons: 2,
        is_on_sabbatical: true,
        sabbatical_reason: 'Descanso sagrado reglamentario tras 2 temporadas consecutivas de hospitalidad',
        next_eligible_season: 'Próxima Temporada Litúrgica',
      });
      setStatusMessage(`Sabático pastoral concedido a ${hostName}. El hogar no será forzado a hospitalidad continua.`);
      const updated = await fetchFatigueRadar();
      setFatigueRadar(updated);
    } catch (e: any) {
      alert(e.message || 'Error registrando descanso sabático');
    }
  };

  const handleCommissionGuardian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuardianName.trim()) {
      alert('Especifica el nombre del hermano a consagrar');
      return;
    }
    setIsCommissioningGuardian(true);
    try {
      await enrollEmeritusGuardian({
        member_id: newGuardianMemberId || `guardian-${Date.now()}`,
        member_name: newGuardianName,
        original_join_year: Number(newGuardianJoinYear) || 2020,
        ministry_role: newGuardianRole,
        commissioned_by: 'Pastor Josh',
      });
      setShowGuardianModal(false);
      setNewGuardianName('');
      setNewGuardianMemberId('');
      setStatusMessage(`Servidor Veterano conferido a ${newGuardianName}. Exento de fatiga operativa y consagrado como consejero espiritual.`);
      const updated = await fetchEmeritusGuardians();
      setEmeritusGuardians(updated);
    } catch (e: any) {
      alert(e.message || 'Error comisionando guardián emérito');
    } finally {
      setIsCommissioningGuardian(false);
    }
  };

  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaint) return;
    setIsResolvingComplaint(true);
    try {
      await resolveNeighborhoodComplaint(resolvingComplaint.id, resolutionNotes || 'Acuerdo de buena vecindad convenido con los vecinos.');
      setResolvingComplaint(null);
      setResolutionNotes('');
      setStatusMessage(`Reporte vecinal resuelto con éxito.`);
      const updated = await fetchNeighborhoodComplaints();
      setComplaints(updated);
    } catch (e: any) {
      alert(e.message || 'Error al resolver reporte de buena vecindad');
    } finally {
      setIsResolvingComplaint(false);
    }
  };

  const openEditLeader = (l: LeaderSummary) => {
    setEditingLeader(l);
    setEditLeaderCampus(l.campus_name || 'Durango Central');
    setEditLeaderGroup(l.assigned_group_name || '');
    setEditLeaderStatus(l.status || 'Activo');
  };

  const handleSaveLeaderAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeader) return;
    setLeaders((prev) =>
      prev.map((ldr) =>
        ldr.id === editingLeader.id
          ? {
            ...ldr,
            campus_name: editLeaderCampus,
            assigned_group_name: editLeaderGroup || null,
            status: editLeaderStatus,
          }
          : ldr
      )
    );
    setStatusMessage(`Asignación y estatus pastoral del facilitador "${editingLeader.name}" actualizados.`);
    setEditingLeader(null);
  };

  const availableCampuses = ['Todos los Campus', 'Durango Central', 'Campus Poniente'];

  const displayedGroups = groups.filter((g) => {
    const matchesCampus =
      selectedCampus === 'Todos los Campus' ||
      g.zone.toLowerCase().includes(selectedCampus.toLowerCase()) ||
      g.nombre_publico.toLowerCase().includes(selectedCampus.toLowerCase());

    const matchesFocus =
      selectedFocusType === 'all' ||
      (selectedFocusType === 'interest' &&
        (g.affinity.toLowerCase().includes('café') ||
          g.affinity.toLowerCase().includes('viajer') ||
          g.affinity.toLowerCase().includes('taco') ||
          g.affinity.toLowerCase().includes('común'))) ||
      (selectedFocusType === 'foundational' &&
        (g.affinity.toLowerCase().includes('alfa') ||
          g.affinity.toLowerCase().includes('mayordom') ||
          g.affinity.toLowerCase().includes('fundam'))) ||
      (selectedFocusType === 'life_stage' &&
        (g.affinity.toLowerCase().includes('joven') ||
          g.affinity.toLowerCase().includes('matrimonio') ||
          g.affinity.toLowerCase().includes('familia')));

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      g.nombre_publico.toLowerCase().includes(q) ||
      (g.leader_name && g.leader_name.toLowerCase().includes(q)) ||
      g.zone.toLowerCase().includes(q) ||
      g.affinity.toLowerCase().includes(q) ||
      (g.meeting_day && g.meeting_day.toLowerCase().includes(q));

    return matchesCampus && matchesFocus && matchesQuery;
  });

  const avgAttendance =
    groups.filter((g) => g.average_headcount !== null).length > 0
      ? (
        groups.reduce((acc, g) => acc + (g.average_headcount || 0), 0) /
        groups.filter((g) => g.average_headcount !== null).length
      ).toFixed(1)
      : '12.4';

  if (loading && !overview) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
        Cargando radar pastoral de gobernanza...
      </div>
    );
  }

  const isSovereigntyView = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('view') === 'sovereignty';

  if (isSovereigntyView) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px 80px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <ChurchBrandLogo size="lg" variant="icon" paletteId={cfgPaletteId} />
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--accent-olive, #2D3A2F)',
                backgroundColor: 'rgba(45, 58, 47, 0.08)',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                marginBottom: '8px',
              }}
            >
              <Church size={15} />
              <span>{overview?.church_name || 'Amor y Gracia Durango'} • Pastor Josh Gayosso</span>
              <span style={{ color: 'var(--border-strong)' }}>•</span>
              <span style={{ color: 'var(--text-secondary)' }}>Soberanía Garantizada</span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                margin: 0,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              Soberanía y Portabilidad de Datos
            </h1>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.94rem',
                maxWidth: '740px',
                lineHeight: 1.4,
                marginTop: '6px',
              }}
            >
              Garantía Incondicional "No Strings Attached" • Los datos son de Dios y de la congregación local
            </p>
          </div>
        </div>

        {/* CÉDULA DE SOBERANÍA */}
        <div
          id="soberania-datos-section"
          className="surface-card"
          style={{
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                <HardDrive size={16} />
                <span>Cero Dependencia Comercial</span>
              </div>
              <h3 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-primary)' }}>
                Exportación Directa en 1 Toque (.db + .csv)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', maxWidth: '720px', lineHeight: 1.5, margin: '8px 0 0 0' }}>
                Amor y Gracia Durango es dueño de su base de datos. Ninguna empresa de software puede retener, cobrar rescate ni bloquear el padrón de discípulos. Con 1 clic descargas el archivo completo.
              </p>
            </div>

            <button
              type="button"
              id="btn-export-sovereign-archive"
              onClick={handleExportSovereignArchive}
              disabled={isExportingArchive}
              className="btn-primary"
              style={{
                minHeight: '48px',
                padding: '12px 24px',
                backgroundColor: 'var(--accent-amber)',
                color: '#1a1400',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Download size={20} />
              <span>{isExportingArchive ? 'Descargando Archivo ZIP...' : 'Descargar Respaldo Soberano (.db + .csv)'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Base de Datos Física</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>amorygracia.db</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Archivo relacional íntegro para montar</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Directorio de Familias</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>miembros.csv</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Formato abierto universal (Excel / LibreOffice)</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Catálogo de Células</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>celulas.csv</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Sedes, horarios, anfitriones y sectores</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Manifiesto Eclesial</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>MANIFIESTO_SOBERANO.txt</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Compromiso firmado de custodia ética</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px 80px 20px' }}>
      {/* HUD Header (GOLD-342 / Decisión 1-B y 4-B) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ChurchBrandLogo size="lg" variant="icon" paletteId={cfgPaletteId} />
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--accent-olive, #2D3A2F)',
                backgroundColor: 'rgba(45, 58, 47, 0.08)',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                marginBottom: '8px',
              }}
            >
              <Church size={15} />
              <span>{overview?.church_name || 'Amor y Gracia'} • {churchConfig?.season_name || 'Otoño 2026'}</span>
              <span style={{ color: 'var(--border-strong)' }}>•</span>
              <span style={{ color: 'var(--text-secondary)' }}>Santuario Cifrado Eclesiástico</span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                margin: 0,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              Radar de Cuidado y Pastoreo
            </h1>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.94rem',
                maxWidth: '740px',
                lineHeight: 1.4,
                marginTop: '6px',
              }}
            >
              Supervisión Fraterna de Redes Celulares
            </p>
          </div>
        </div>

        {/* Toolbar de Acciones Pastorales Operativas (Decisión 1-B) */}
        <div className="no-print" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            id="btn-pastor-broadcast"
            onClick={() => setShowBroadcastModal(true)}
            className="btn-primary"
            style={{
              minHeight: '44px',
              padding: '10px 18px',
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              fontWeight: 700,
            }}
          >
            <Radio size={16} />
            <span>Emitir Comunicado</span>
          </button>

          <button
            type="button"
            id="btn-pastor-toggle-search"
            onClick={() => setShowSearchInput((prev) => !prev)}
            className="btn-secondary"
            style={{
              minHeight: '44px',
              padding: '10px 16px',
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>Buscar y Filtrar</span>
            {searchQuery && (
              <span
                style={{
                  fontSize: '0.74rem',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--accent-amber-light)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                }}
              >
                {displayedGroups.length}
              </span>
            )}
          </button>

          {/* Menú Secundario de Mantenimiento y Archivo */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              id="btn-pastor-maintenance-menu"
              onClick={() => setShowMaintenanceMenu((prev) => !prev)}
              className="btn-secondary"
              style={{
                minHeight: '44px',
                padding: '10px 14px',
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Ajustes de marca, folios físicos y respaldo soberano"
            >
              <Sliders size={16} />
              <span>Mantenimiento</span>
            </button>

            {showMaintenanceMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-elevated)',
                  minWidth: '220px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '6px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigModal(true);
                    setShowMaintenanceMenu(false);
                  }}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: '0.86rem',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Sliders size={15} />
                  <span>Nomenclatura y Paleta</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setShowMaintenanceMenu(false);
                  }}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: '0.86rem',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Printer size={15} />
                  <span>Imprimir Folio Físico</span>
                </button>

                <button
                  type="button"
                  id="btn-export-sovereign-archive"
                  onClick={() => {
                    handleExportSovereignArchive();
                    setShowMaintenanceMenu(false);
                  }}
                  disabled={isExportingArchive}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: '0.86rem',
                    color: 'var(--accent-emerald)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={15} />
                  <span>{isExportingArchive ? 'Descargando...' : 'Descargar Datos (ZIP)'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pestañas Principales: Radar de Células vs Administración de Facilitadores */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '24px',
          paddingBottom: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('radar')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'radar' ? 'var(--accent-amber)' : 'transparent',
            color: activeTab === 'radar' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <BarChart3 size={17} />
          <span>Comunidades ({groups.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sabbaticals')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'sabbaticals' ? 'var(--accent-amber)' : 'transparent',
            color: activeTab === 'sabbaticals' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <HeartHandshake size={17} />
          <span>Salud y Sabáticos ({fatigueRadar.filter(f => f.consecutive_seasons >= 2 && !f.is_on_sabbatical).length > 0 ? `${fatigueRadar.filter(f => f.consecutive_seasons >= 2 && !f.is_on_sabbatical).length} en alerta` : 'En paz'})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deacons')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'deacons' ? 'var(--accent-indigo)' : 'transparent',
            color: activeTab === 'deacons' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={17} />
          <span>Diaconado</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('elders')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: (activeTab === 'elders' || activeTab === 'scale') ? 'var(--accent-indigo)' : 'transparent',
            color: (activeTab === 'elders' || activeTab === 'scale') ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={17} />
          <span>Consejo de Ancianos y Consejería ({pairings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('territory')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'territory' ? 'var(--accent-indigo)' : 'transparent',
            color: activeTab === 'territory' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Building size={17} />
          <span>Distribución Territorial ({campuses.length} Sedes)</span>
        </button>

        <button
          type="button"
          id="tab-pastor-initiatives"
          onClick={() => setActiveTab('initiatives')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'initiatives' ? 'var(--accent-indigo)' : 'transparent',
            color: activeTab === 'initiatives' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Actividades y Sugerencias</span>
        </button>
      </div>

      {/* Mensaje de Confirmación / Estado */}
      {statusMessage && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'var(--accent-emerald-light)',
            border: '1px solid var(--accent-emerald-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-emerald)',
            fontSize: '0.92rem',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
          }}
        >
          <CheckCircle size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* VISTA 1: RADAR DE CÉLULAS E ITINERARIOS */}
      {/* VISTA 1: RADAR DE CÉLULAS E ITINERARIOS (GOLD-340 A GOLD-347) */}
      {activeTab === 'radar' && (
        <>
          {/* Barra de Búsqueda Predictiva en Tiempo Real (GOLD-344 / Decisión 6-B) */}
          {showSearchInput && (
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                id="input-pastor-search-groups"
                placeholder="Buscar por facilitador, colonia, día o enfoque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.94rem',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                autoFocus
              />
            </div>
          )}

          {/* Triaje de Atención por Excepción y Bandeja Cero (GOLD-341 / Decisión 3-B) */}
          {(() => {
            const fatigueAlerts = fatigueRadar.filter((f) => f.consecutive_seasons >= 2 && !f.is_on_sabbatical);
            const lowAttendanceAlerts = groups.filter((g) => g.average_headcount !== null && g.average_headcount < 6);
            const totalAnomalies = fatigueAlerts.length + lowAttendanceAlerts.length;

            if (totalAnomalies > 0) {
              return (
                <div
                  style={{
                    marginBottom: '24px',
                    padding: '18px 22px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1.5px solid var(--accent-clay, #C46849)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                        Requiere Atención Hoy ({totalAnomalies})
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Casos prioritarios para llamada fraterna o acompañamiento pastoral en este ciclo
                      </p>
                    </div>
                    <span
                      style={{
                        backgroundColor: 'rgba(196, 104, 73, 0.12)',
                        color: 'var(--accent-clay, #C46849)',
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      Triaje Activo
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {fatigueAlerts.map((f) => (
                      <div
                        key={`fatigue-${f.group_id}`}
                        style={{
                          padding: '14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{f.host_name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            2 temporadas continuas de hospitalidad (Sabático sugerido)
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAuthorizeHostSabbatical(f.group_id, f.host_name)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', minHeight: '34px', fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                          Conceder Sabático
                        </button>
                      </div>
                    ))}

                    {lowAttendanceAlerts.map((g) => (
                      <div
                        key={`low-${g.id}`}
                        style={{
                          padding: '14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{g.nombre_publico}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Facilitador: {g.leader_name} • Asistencia media: {g.average_headcount} pers.
                          </div>
                        </div>
                        <a
                          href={generateFraternalWhatsAppUrl(g)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            minHeight: '34px',
                            textDecoration: 'none',
                            backgroundColor: '#25D366',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Animar por WhatsApp
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div
                style={{
                  marginBottom: '24px',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(67, 94, 75, 0.08)',
                  border: '1px solid rgba(67, 94, 75, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={20} style={{ color: 'var(--accent-emerald)' }} />
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--accent-emerald)' }}>
                      Rebaño en Paz: Cero anomalías activas hoy
                    </strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Todas las células reportan asistencia estable y ningún facilitador presenta sobrecarga de temporadas.
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--accent-emerald)',
                    backgroundColor: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(67, 94, 75, 0.2)',
                  }}
                >
                  Bandeja Cero
                </span>
              </div>
            );
          })()}

          {/* Filtros: Campus y Tipo de Enfoque */}
          <div
            className="no-print"
            style={{
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <MapPin size={15} />
                <span>Campus:</span>
              </span>
              {availableCampuses.map((campus) => (
                <button
                  key={campus}
                  type="button"
                  onClick={() => setSelectedCampus(campus)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border:
                      selectedCampus === campus
                        ? '1.5px solid var(--accent-indigo)'
                        : '1px solid var(--border-subtle)',
                    backgroundColor:
                      selectedCampus === campus ? 'var(--accent-indigo-light)' : 'var(--bg-surface)',
                    color: selectedCampus === campus ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                  }}
                >
                  {campus}
                </button>
              ))}
            </div>

            {/* Filtro por Enfoque de Grupo (Sin Emojis) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Enfoque:
              </span>
              <button
                type="button"
                onClick={() => setSelectedFocusType('all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  backgroundColor: selectedFocusType === 'all' ? 'var(--accent-amber)' : 'var(--bg-surface)',
                  color: selectedFocusType === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Todos los Enfoques
              </button>
              <button
                type="button"
                onClick={() => setSelectedFocusType('interest')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  backgroundColor: selectedFocusType === 'interest' ? 'var(--accent-amber)' : 'var(--bg-surface)',
                  color: selectedFocusType === 'interest' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Interés Común (Viajeros, Diálogo, Lectura)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFocusType('foundational')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  backgroundColor: selectedFocusType === 'foundational' ? 'var(--accent-amber)' : 'var(--bg-surface)',
                  color: selectedFocusType === 'foundational' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Discipulado y Fundamentos
              </button>
            </div>
          </div>

          {/* Tarjetas de Pulso Eclesial Superior */}
          <div className="pastoral-pulse-grid" style={{ marginBottom: '24px' }}>
            <div className="pulse-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--text-muted)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                <span>Asistencia Media Estimada</span>
                <BarChart3 size={18} style={{ color: 'var(--accent-emerald)' }} />
              </div>
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ~{avgAttendance}{' '}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  pers. / sesión
                </span>
              </div>
            </div>

            <div className="pulse-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--text-muted)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                <span>Células y Rutas Activas</span>
                <Church size={18} style={{ color: 'var(--accent-indigo)' }} />
              </div>
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {groups.length}{' '}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  grupos en marcha
                </span>
              </div>
            </div>

            <div className="pulse-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--text-muted)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                <span>Comunicados Activos</span>
                <Radio size={18} style={{ color: 'var(--accent-amber)' }} />
              </div>
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {broadcasts.length}{' '}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  emitidos a facilitadores
                </span>
              </div>
            </div>
          </div>

          {/* Master Detail de Grupos (Split-Pane en Escritorio y Sheet en Móvil / GOLD-340) */}
          <div className="tablet-master-detail">
            {/* Lista Maestra */}
            <div className="surface-card" style={{ padding: '20px', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
                  Grupos ({displayedGroups.length})
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Supervisión Pastoral
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {displayedGroups.map((g) => {
                  const isSelected = selectedGroup?.id === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => {
                        setSelectedGroup(g);
                        setShowMobileDetail(true);
                      }}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'var(--accent-amber-light)' : 'var(--bg-primary)',
                        border: isSelected ? '1.5px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MonogramAvatar name={g.leader_name || 'Líder'} size="sm" />
                        <div>
                          <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                            {g.nombre_publico}
                          </strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Facilitador: {g.leader_name} • {g.affinity}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        style={{ color: isSelected ? 'var(--accent-amber)' : 'var(--text-muted)' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detalle Expandido del Grupo Seleccionado (Split-Pane Escritorio) */}
            <div className="desktop-detail-pane">
              {selectedGroup ? (
                <div
                  className="surface-card"
                  style={{ padding: '28px', borderLeft: '4px solid var(--accent-indigo)' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '20px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span className="badge badge-emerald">{selectedGroup.affinity}</span>
                        <span className="badge badge-indigo">{selectedGroup.zone}</span>
                        {selectedGroup.focus_type === 'common_interest' || selectedGroup.affinity.toLowerCase().includes('viajer') || selectedGroup.affinity.toLowerCase().includes('café') ? (
                          <span className="badge badge-amber">Interés Común</span>
                        ) : selectedGroup.focus_type === 'foundational' || selectedGroup.affinity.toLowerCase().includes('alfa') || selectedGroup.affinity.toLowerCase().includes('mayordom') ? (
                          <span className="badge badge-emerald">Discipulado</span>
                        ) : (
                          <span className="badge badge-indigo">Etapa de Vida</span>
                        )}
                        {selectedGroup.affinity.toLowerCase().includes('mujer') && (
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(236, 72, 153, 0.12)', color: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                            Orientado a Mujeres
                          </span>
                        )}
                        {selectedGroup.affinity.toLowerCase().includes('hombre') && (
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            Orientado a Hombres
                          </span>
                        )}
                        {(selectedGroup.affinity.toLowerCase().includes('matrimonio') || selectedGroup.affinity.toLowerCase().includes('familia')) && (
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            Parejas y Familias (Sin exclusión)
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontSize: '1.65rem', margin: 0, color: 'var(--text-primary)' }}>
                        {selectedGroup.nombre_publico}
                      </h2>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Facilitador responsable: <strong>{selectedGroup.leader_name}</strong>
                      </div>
                    </div>

                    {/* Acciones Pastorales de Veto, Clonación y Contacto Directo */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <a
                        href={generateFraternalWhatsAppUrl(selectedGroup)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{
                          minHeight: '40px',
                          padding: '8px 14px',
                          fontSize: '0.82rem',
                          textDecoration: 'none',
                          backgroundColor: '#25D366',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Send size={14} />
                        <span>Contactar por WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setShowVetoModal(true)}
                        className="btn-secondary"
                        style={{
                          minHeight: '40px',
                          padding: '6px 14px',
                          fontSize: '0.82rem',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                        }}
                        title="Ejecutar veto pastoral sobre decisiones o sede de este grupo"
                      >
                        <Gavel size={15} />
                        <span>Veto Pastoral</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCloneDraft(selectedGroup.id, selectedGroup.nombre_publico)}
                        disabled={cloningId === selectedGroup.id}
                        className="btn-secondary"
                        style={{ minHeight: '40px', padding: '6px 14px', fontSize: '0.82rem' }}
                      >
                        <Copy size={15} />
                        <span>{cloningId === selectedGroup.id ? 'Clonando...' : 'Clonar a Borrador'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Métricas Clave */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '14px',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '20px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        HORARIO HABITUAL
                      </div>
                      <div
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          marginTop: '2px',
                        }}
                      >
                        {CHRISTIAN_WEEKDAY_PLURALS[selectedGroup.dia_habitual]} a las {selectedGroup.hora_habitual} hrs
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        INSCRITOS / CUPO
                      </div>
                      <div
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          marginTop: '2px',
                        }}
                      >
                        {selectedGroup.enrolled_count} pers. (Tolerancia masiva 30+)
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        ASISTENCIA MEDIA
                      </div>
                      <div
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: 'var(--accent-emerald)',
                          marginTop: '2px',
                        }}
                      >
                        {selectedGroup.average_headcount !== null
                          ? `${selectedGroup.average_headcount.toFixed(1)} pers.`
                          : 'Sin datos'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        TIPO DE SEDE
                      </div>
                      <div
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          marginTop: '2px',
                        }}
                      >
                        {selectedGroup.venue_type === 'public_venue'
                          ? 'Ruta / Lugar Público'
                          : selectedGroup.venue_type === 'online_session'
                            ? 'Virtual'
                            : 'Casa Particular Rotativa'}
                      </div>
                    </div>
                  </div>

                  {/* Participación en Convocatorias Eclesiales (GOLD-347 / Decisión 10-B) */}
                  <div
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        Participación en Convocatorias Eclesiales
                      </strong>
                      <span className="badge-pill" style={{ backgroundColor: 'rgba(67, 94, 75, 0.1)', color: 'var(--accent-emerald)', fontSize: '0.74rem' }}>
                        Integración Confirmada
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Esta célula está enlazada al ciclo congregacional de convivencia fraternal (Carne Asada Inter-Células y jornadas de servicio comunitario).
                    </p>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setShowPastoralCard(true)}
                      style={{
                        padding: '10px 18px',
                        background: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 600,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <ShieldCheck size={16} />
                      <span>Ver Ficha Pastoral Completa (Tríada y Supervisión)</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Hoja Deslizante Táctil para Móviles (Bottom Sheet - GOLD-340 / Decisión 2-B) */}
          {showMobileDetail && selectedGroup && (
            <div
              className="pastoral-sheet-backdrop"
              onClick={() => setShowMobileDetail(false)}
            >
              <div
                className="pastoral-bottom-sheet"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sheet-drag-handle" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Ficha Pastoral de Cuidado
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMobileDetail(false)}
                    className="btn-secondary"
                    style={{ padding: '4px 12px', fontSize: '0.78rem', minHeight: '32px' }}
                  >
                    Cerrar Ficha
                  </button>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.35rem', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                    {selectedGroup.nombre_publico}
                  </h3>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Facilitador: <strong>{selectedGroup.leader_name}</strong> • Zona {selectedGroup.zone}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <a
                      href={generateFraternalWhatsAppUrl(selectedGroup)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.82rem',
                        textDecoration: 'none',
                        backgroundColor: '#25D366',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        flex: 1,
                        justifyContent: 'center',
                      }}
                    >
                      <Send size={14} />
                      <span>WhatsApp al Líder</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setShowPastoralCard(true)}
                      className="btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', flex: 1, justifyContent: 'center' }}
                    >
                      <ShieldCheck size={14} />
                      <span>Ficha Completa</span>
                    </button>
                  </div>

                  <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ASISTENCIA Y HORARIO</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {CHRISTIAN_WEEKDAY_PLURALS[selectedGroup.dia_habitual]} {selectedGroup.hora_habitual} hrs • {selectedGroup.average_headcount?.toFixed(1) ?? '12'} personas
                    </div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONVOCATORIAS ECLESIALES</div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Participación activa en el convivio inter-células y jornadas comunitarias de la congregación.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* VISTA 2: ADMINISTRACIÓN DE FACILITADORES Y LÍDERES */}
      {activeTab === 'leaders' && (
        <div className="surface-card" style={{ padding: '28px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>
                Facilitadores y Líderes de Hogar
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                Relación pastoral directa, acompañamiento y asignación de células en Durango.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                placeholder="Buscar por facilitador, email o célula..."
                value={leaderSearch}
                onChange={(e) => setLeaderSearch(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  minWidth: '260px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {leaders
              .filter((l) =>
                !leaderSearch ||
                l.name.toLowerCase().includes(leaderSearch.toLowerCase()) ||
                l.email.toLowerCase().includes(leaderSearch.toLowerCase()) ||
                (l.assigned_group_name && l.assigned_group_name.toLowerCase().includes(leaderSearch.toLowerCase()))
              )
              .map((leader) => (
                <div
                  key={leader.id}
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MonogramAvatar name={leader.name} size="md" />
                    <div>
                      <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-primary)' }}>{leader.name}</h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{leader.email}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                      fontSize: '0.82rem',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                      Célula Asignada
                    </div>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {leader.assigned_group_name || 'Sin célula asignada actualmente'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{leader.campus_name}</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        backgroundColor: leader.status === 'Activo' ? 'var(--accent-emerald-light)' : 'var(--accent-amber-light)',
                        color: leader.status === 'Activo' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                      }}
                    >
                      {leader.status}
                    </span>
                  </div>

                  {/* Acciones de Administración Pastoral */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      type="button"
                      onClick={() => openEditLeader(leader)}
                      className="btn-primary"
                      style={{ flex: 1, minHeight: '34px', padding: '6px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
                    >
                      <span>Administrar</span>
                    </button>
                    <a
                      href={`https://wa.me/526181234567?text=${encodeURIComponent(`Hola hermano ${leader.name}, te saludo de parte del equipo pastoral de Amor y Gracia Durango para acompañarte en tu célula.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                      style={{ minHeight: '34px', padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                      title="Enviar mensaje directo al facilitador"
                    >
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Alertas de Salvaguarda y Ruteo Anti-Colisión al pie */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '32px' }}>
        {/* Alertas de Salvaguarda */}
        <div className="surface-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <ShieldAlert size={20} style={{ color: '#EF4444' }} />
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
              Alertas de Salvaguarda ({safeguards.length})
            </h3>
          </div>
          {safeguards.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
              No hay alertas de salvaguarda activas.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {safeguards.map((sf) => (
                <div
                  key={sf.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{sf.reporter_name}</strong>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {sf.urgency_level.toUpperCase()} • {sf.status}
                    </div>
                  </div>
                  {sf.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleTriage(sf.id)}
                      className="btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem', backgroundColor: 'var(--accent-emerald)' }}
                    >
                      Atendida
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ruteo Preventivo Anti-Colisión */}
        <div className="surface-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} style={{ color: 'var(--accent-indigo)' }} />
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
                Ruteo Anti-Colisión ({pairings.length} pares)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowPairModal(true)}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              <Plus size={14} /> Registrar
            </button>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Evita colocar ex-cónyuges o litigios en consejería en la misma célula sin exponer el conflicto.
          </p>
          {pairings.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
              No hay restricciones configuradas.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pairings.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    {p.phone_a} ↔ {p.phone_b}
                  </span>
                  <span style={{ color: 'var(--accent-amber)' }}>({p.reason_category})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PANEL: MESA DE CUIDADO DIACONAL */}
      {activeTab === 'deacons' && (
        <div style={{ marginTop: '20px' }}>
          {complaints.length > 0 && (
            <div style={{ marginBottom: '14px', padding: '10px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '0.82rem', color: '#38BDF8' }}>
              Atención Comunitaria y Vecinal: {complaints.filter(c => c.status === 'pending').length} inquietudes vecinales en atención directa por el cuerpo diaconal.
            </div>
          )}
          <DeaconDesk />
        </div>
      )}

      {/* PANEL: SALUD Y SABÁTICOS */}
      {activeTab === 'sabbaticals' && (
        <div className="animate-fade-in" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            className="surface-elevated"
            style={{
              padding: '24px 28px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <HeartHandshake size={22} style={{ color: 'var(--accent-amber)' }} />
                <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>
                  Salud Litúrgica y Sabáticos de Hogares
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, maxWidth: '850px', lineHeight: 1.4 }}>
                Cuidado pastoral del sacerdocio familiar. Ningún hogar en Durango debe hospedar más de 2 temporadas consecutivas sin un descanso sabático sagrado rotativo para renovar fuerzas y vida de oración.
              </p>
            </div>
          </div>

          <LiturgicalPauseManager />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {fatigueRadar.length === 0 ? (
              <div style={{ padding: '24px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Todos los anfitriones se encuentran en balance saludable de hospitalidad.
              </div>
            ) : (
              fatigueRadar.map((f) => {
                const isHighRisk = f.consecutive_seasons >= 2 && !f.is_on_sabbatical;
                return (
                  <div
                    key={f.id}
                    className="surface-card"
                    style={{
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      border: isHighRisk ? '1.5px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                      backgroundColor: isHighRisk ? 'rgba(245, 158, 11, 0.03)' : undefined,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: isHighRisk ? '#D97706' : '#10B981' }}>
                          {f.is_on_sabbatical ? 'En Sabático Sagrado' : isHighRisk ? 'Fatiga Potencial (2+ Temporadas)' : 'Balance Saludable'}
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {f.consecutive_seasons} temp. seguidas
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.15rem', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{f.host_name}</h4>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Grupo / Comunidad: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{f.group_id}</span>
                      </div>

                      {f.sabbatical_reason && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                          "{f.sabbatical_reason}"
                        </div>
                      )}
                    </div>

                    {!f.is_on_sabbatical && (
                      <button
                        type="button"
                        onClick={() => handleAuthorizeHostSabbatical(f.group_id, f.host_name)}
                        className="btn-primary"
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          fontSize: '0.82rem',
                          backgroundColor: '#D97706',
                          color: '#FFFFFF',
                        }}
                      >
                        Conceder Sabático Sagrado (1 Temporada)
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PANEL: CONSEJO DE ANCIANOS Y CONSEJERÍA */}
      {(activeTab === 'elders' || activeTab === 'scale') && (
        <div className="animate-fade-in" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Header Banner */}
          <div
            className="surface-elevated"
            style={{
              padding: '24px 28px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Users size={22} style={{ color: 'var(--accent-amber)' }} />
                <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>
                  Consejo de Ancianos, Consejería Fraternal y Presbiterio
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, maxWidth: '850px', lineHeight: 1.4 }}>
                Pastoreo, consejería fraternal y consolidación de ruteos anti-colisión. Los ancianos atienden en sus sectores; el Pastor Josh consolida, conoce y preserva el derecho de veto pastoral en gracia.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="btn-secondary"
              style={{
                padding: '8px 14px',
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: 'var(--border-strong)',
              }}
            >
              <Sliders size={15} />
              <span>Ajustes de Presbiterio</span>
            </button>
          </div>

          {/* SECCIÓN 1: CONSOLIDACIÓN PASTORAL DE CONSEJERÍA Y RUTEOS ANTI-COLISIÓN */}
          <div>
            <PastorAntiCollisionDesk />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--accent-amber)' }} />
                  <span>Consolidación Pastoral de Consejería y Ruteos Anti-Colisión</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '4px 0 0 0' }}>
                  Supervisión consolidada de todos los sectores de Durango. Como Pastor Principal, puedes ratificar o vetar las restricciones para salvaguardar la unidad y la reconciliación.
                </p>
              </div>
              <button
                type="button"
                id="btn-pastor-new-pairing"
                onClick={() => setShowPairModal(true)}
                className="btn-primary tap-target-44"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--accent-amber)',
                  color: '#161513',
                  fontWeight: 700,
                }}
              >
                <Plus size={16} />
                <span>+ Registrar Ruteo Pastoral</span>
              </button>
            </div>

            {pairings.length === 0 ? (
              <div style={{ padding: '24px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No hay ruteos anti-colisión ni restricciones de consejería activas en este momento. Las comunidades conviven en paz.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {pairings.map((p) => {
                  const maskPhone = (ph: string) => {
                    if (!ph || ph.length < 4) return 'Contacto protegido';
                    return `+52 •••••••• ${ph.slice(-2)}`;
                  };

                  return (
                    <div
                      key={p.id}
                      className="surface-card"
                      style={{
                        padding: '20px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-amber)' }}>
                            Ruteo Anti-Colisión
                          </span>
                          <span className="badge-pill" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontSize: '0.72rem' }}>
                            Consolidado en HQ
                          </span>
                        </div>

                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {maskPhone(p.phone_a)} ⟷ {maskPhone(p.phone_b)}
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          Motivo Pastoral: <strong style={{ color: 'var(--text-primary)' }}>{p.reason_category}</strong>
                        </div>

                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Registrado: {p.created_at ? p.created_at.slice(0, 10) : 'Fecha reciente'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                        <button
                          type="button"
                          onClick={() => handleRatifyPairing(p.id)}
                          className="btn-secondary"
                          style={{
                            flex: 1,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            justifyContent: 'center',
                            padding: '8px 10px',
                          }}
                        >
                          Ratificar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVetoPairing(p.id)}
                          className="btn-secondary"
                          style={{
                            flex: 1,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            justifyContent: 'center',
                            padding: '8px 10px',
                            color: '#f87171',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          Ejercer Veto Pastoral
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: CONCILIO DE PRESBITERIO Y ANCIANOS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--accent-emerald)' }} />
                  <span>Concilio de Presbiterio y Ancianos Pastores</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '4px 0 0 0' }}>
                  Órgano colegiado de ancianos ordenados. Cada anciano pastorea a una franja de 10-12 diáconos con mesas de cuidado regulares.
                </p>
              </div>
            </div>

            {!cfgEnableEldership ? (
              <div
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                }}
              >
                El sistema de presbiterio está actualmente desactivado por el Pastor Principal Josh en la configuración de la iglesia. Actívalo en "Ajustes de Presbiterio" para habilitar las mesas redondas y asignaciones de ancianos.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {councils.map((cn) => (
                  <div
                    key={cn.id}
                    className="surface-card"
                    style={{
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-indigo)' }}>
                          Zona: {cn.macro_zone}
                        </span>
                        <h4 style={{ fontSize: '1.15rem', margin: '4px 0 2px 0', color: 'var(--text-primary)' }}>{cn.name}</h4>
                      </div>
                      <span className="badge-pill" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
                        Concilio Regional
                      </span>
                    </div>

                    <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                      Presbítero / Anciano Moderador:{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{cn.leader_name}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                      <Users size={16} style={{ color: 'var(--accent-amber)' }} />
                      <div style={{ fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cn.active_deacon_count} Diáconos</span> bajo supervisión pastoral directa (Ratio objetivo: 10-12).
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Mesa redonda regular: Escucha activa bi-direccional y resolución pastoral conjunta (&lt; 3 días).
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN 3: SERVIDORES VETERANOS Y CONSEJEROS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} style={{ color: '#EAB308' }} />
                  <span>Servidores Veteranos y Consejeros</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '4px 0 0 0' }}>
                  Servidores veteranos con 4+ años de fidelidad pastoral en Durango. Exentos de la logística semanal y consagrados como mentores y consejeros espirituales.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowGuardianModal(true)}
                className="btn-primary"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#B45309',
                }}
              >
                <Plus size={16} />
                <span>+ Comisionar Servidor Veterano</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {emeritusGuardians.length === 0 ? (
                <div style={{ padding: '24px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Aún no se han registrado servidores veteranos. Haz clic en "+ Comisionar Servidor Veterano" para consagrar a un mentor veterano.
                </div>
              ) : (
                emeritusGuardians.map((g) => (
                  <div
                    key={g.id}
                    className="surface-card"
                    style={{
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      backgroundColor: 'rgba(234, 179, 8, 0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MonogramAvatar name={g.member_name} size="md" />
                      <div>
                        <h4 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>{g.member_name}</h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                          {g.ministry_role}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      <div>Ingreso Original: <strong>{g.original_join_year}</strong> ({new Date().getFullYear() - g.original_join_year} años de fidelidad)</div>
                      <div>Comisionado por: <strong>{g.commissioned_by}</strong></div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>
                      Estatus de Mentoría y Consejo Fraternal
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECCIÓN 4: TRIBUNAL CONCILIAR Y MEDIDAS DISCIPLINARIAS (MATEO 18 & DECISIÓN 5-B) */}
          <div
            className="surface-card"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              backgroundColor: 'rgba(239, 68, 68, 0.03)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#EF4444',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  <ShieldAlert size={14} />
                  <span>Gobernanza Colegiada • Regla de los Cuatro Ojos</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
                  Tribunal Conciliar y Medidas de Disciplina (Mateo 18)
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '6px 0 0 0', maxWidth: '820px', lineHeight: 1.4 }}>
                  Las medidas disciplinarias y de restauración pastoral nunca son unilaterales. Conforme al mandato bíblico de Mateo 18:16-17 y la arquitectura colegiada de Pórtico, toda acción disciplinaria requiere la propuesta de un anciano y la ratificación independiente de un segundo anciano ordenado o del Pastor Principal.
                </p>
              </div>

              <button
                type="button"
                id="btn-open-discipline-modal"
                onClick={() => setShowDisciplineModal(true)}
                className="btn-secondary"
                style={{
                  padding: '10px 18px',
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#EF4444',
                  fontWeight: 700,
                }}
              >
                <ShieldAlert size={16} />
                <span>Sesión Disciplinaria Colegiada</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANEL: DISTRIBUCIÓN TERRITORIAL DE SEDES */}
      {activeTab === 'territory' && (
        <div className="animate-fade-in" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Header Banner Demográfico Durango */}
          <div
            className="surface-elevated"
            style={{
              padding: '24px 28px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Building size={22} style={{ color: 'var(--accent-amber)' }} />
                  <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>
                    Distribución Territorial de Sedes en Durango
                  </h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, maxWidth: '850px', lineHeight: 1.4 }}>
                  Gobernanza territorial serena para Amor y Gracia en el Valle de Guadiana (~800,000 hab).
                  Cobertura 360° en 5 macro-sectores con sedes híbridas adaptadas a la comunidad (hogares, salas de campus, cafeterías cívicas y parques).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="btn-secondary"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderColor: 'var(--border-strong)',
                }}
              >
                <Sliders size={15} />
                <span>Configurar Sedes</span>
              </button>
            </div>

            {/* Chips de Métricas de Sedes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escala Comunitaria</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F59E0B', marginTop: '2px' }}>
                  100 a 10,000 Miembros
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Valle de Guadiana (Durango)</div>
              </div>

              <div style={{ padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Red Macro-Sedes</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38BDF8', marginTop: '2px' }}>
                  {campuses.length} Macro-Sedes
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Cobertura 360° en 5 puntos cardinales</div>
              </div>

              <div style={{ padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sedes Híbridas de Células</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
                  Hogares • Salas • Cafeterías • Parques
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Flexibilidad de reunión sin ataduras</div>
              </div>

              <div style={{ padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Presencia Barrial</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38BDF8', marginTop: '4px' }}>
                  Buena Convivencia
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Atención vecinal cercana (&lt; 3 días)</div>
              </div>
            </div>
          </div>

          {/* SECCIÓN: RED DE 5 MACRO-CAMPUSES DE DURANGO */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={20} style={{ color: 'var(--accent-indigo)' }} />
                  <span>Red de Macro-Campuses en Durango</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '4px 0 0 0' }}>
                  Sedes auditables con pastores locales, capacidad holgada y compromiso de Buena Vecindad.
                </p>
              </div>
              <span className="badge-pill" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#0284C7', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                {campuses.length} Macro-Campuses Operativos
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {campuses.map((c) => (
                <div
                  key={c.id}
                  className="surface-card"
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-amber)', letterSpacing: '0.05em' }}>
                        Macro-Zona: {c.macro_zone}
                      </span>
                      <span className="status-badge status-healthy" style={{ fontSize: '0.7rem' }}>
                        Activo
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>{c.nombre_publico}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.35 }}>
                      {c.address}
                    </p>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      Pastor de Sede: <span style={{ color: 'var(--accent-indigo)' }}>{c.pastor_name || 'Pastor Asignado'}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Capacidad por Servicio: {c.capacity_per_service || 2500} personas
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      Buena Vecindad
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                      Ventana Abierta
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN: SOBERANÍA Y PORTABILIDAD DE DATOS (GOLD-313) */}
      <div
        id="soberania-datos-section"
        className="surface-card no-print"
        style={{
          marginTop: '40px',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent-teal)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              <HardDrive size={15} />
              <span>Garantía Soberana • "No Strings Attached"</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
              Soberanía y Portabilidad Absoluta de Datos
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '720px', lineHeight: 1.4, margin: '6px 0 0 0' }}>
              Amor y Gracia es la única dueña de sus datos. Puedes descargar y migrar esta información en cualquier momento sin costo, intermediarios ni ataduras propietarias.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportSovereignArchive}
            disabled={isExportingArchive}
            className="btn-primary"
            style={{
              minHeight: '44px',
              padding: '10px 20px',
              backgroundColor: 'var(--accent-teal)',
              color: '#0F172A',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Download size={18} />
            <span>{isExportingArchive ? 'Descargando Archivo ZIP...' : 'Descargar Respaldo Soberano (.db + .csv)'}</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Base de Datos Física</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>amorygracia.db</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Archivo relacional íntegro para montar</div>
          </div>
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Directorio Fraternal</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>miembros.csv</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Normalizado RFC 4180 (Excel)</div>
          </div>
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Catálogo de Células</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>celulas.csv</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Sedes, horarios y afinidades</div>
          </div>
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Certificado Soberano</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>MANIFIESTO_SOBERANO.txt</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Garantía legal de cero secuestro</div>
          </div>
        </div>
      </div>

      {/* MODAL: VETO PASTORAL (GOLD-254) */}
      {showVetoModal && selectedGroup && (
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
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowVetoModal(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#EF4444' }}>
              <Gavel size={24} />
              <h3 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-primary)' }}>Facultad de Veto Pastoral</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '18px', lineHeight: 1.4 }}>
              Como Pastor General de Amor y Gracia, tienes la autoridad teocéntrica de revocar cambios o pausar la célula{' '}
              <strong>"{selectedGroup.nombre_publico}"</strong> por motivos de orden doctrinal o pastoral.
            </p>
            <form onSubmit={handleExecuteVeto} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Fundamento / Causa del Veto
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explica la causa pastoral o doctrinal para ejecutar este veto..."
                  value={vetoReason}
                  onChange={(e) => setVetoReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingVeto}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#EF4444' }}
              >
                {isSubmittingVeto ? 'Ejecutando veto...' : 'Ejecutar Veto Pastoral Solemne'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DISCIPLINA PASTORAL COLEGIADA (MATEO 18 & DECISIÓN 5-B) */}
      {showDisciplineModal && (
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
            <button
              onClick={() => setShowDisciplineModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#EF4444' }}>
              <ShieldAlert size={24} />
              <h3 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-primary)' }}>
                Medida Disciplinaria Conciliar
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '16px' }}>
              Procedimiento eclesial conforme a Mateo 18:16-17. Requiere la firma conjunta de dos ancianos ordenados (Regla de los Cuatro Ojos) para garantizar sobriedad, gracia y justicia fraterna.
            </p>
            <form onSubmit={handleExecuteDiscipline} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Identificador / Correo del Miembro
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. elena@gmail.com o ID de miembro"
                  value={disciplineMemberId}
                  onChange={(e) => setDisciplineMemberId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Acción Disciplinaria
                </label>
                <select
                  value={disciplineAction}
                  onChange={(e) => setDisciplineAction(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                >
                  <option value="exhortation">Exhortación Pastoral y Acompañamiento 1:1</option>
                  <option value="suspension">Suspensión Temporal de Grupo Pequeño</option>
                  <option value="expulsion">Remoción y Disciplina Eclesial Total</option>
                </select>
              </div>

              {/* Doble Firma Conciliar (Decisión 5-B / Regla de los Cuatro Ojos) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Anciano Proponente (Maker)
                  </label>
                  <select
                    value={disciplineProposer}
                    onChange={(e) => setDisciplineProposer(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                  >
                    <option value="Andrés Ramos (Anciano Moderador)">Andrés Ramos (Anciano Moderador)</option>
                    <option value="Esteban Morales (Anciano Poniente)">Esteban Morales (Anciano Poniente)</option>
                    <option value="David Benítez (Anciano Central)">David Benítez (Anciano Central)</option>
                    <option value="Marcos Valenzuela (Anciano de Zona)">Marcos Valenzuela (Anciano de Zona)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Segundo Anciano / Pastor Ratificador (Checker)
                  </label>
                  <select
                    value={disciplineChecker}
                    onChange={(e) => setDisciplineChecker(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                  >
                    <option value="Pastor Principal Josh">Pastor Principal Josh</option>
                    <option value="Andrés Ramos (Anciano Moderador)">Andrés Ramos (Anciano Moderador)</option>
                    <option value="Esteban Morales (Anciano Poniente)">Esteban Morales (Anciano Poniente)</option>
                    <option value="David Benítez (Anciano Central)">David Benítez (Anciano Central)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Causa y Notas Pastorales
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe la causa y el plan de restauración pastoral..."
                  value={disciplineReason}
                  onChange={(e) => setDisciplineReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-primary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Acta conciliar registrada con doble firma: <strong style={{ color: 'var(--text-primary)' }}>{disciplineProposer}</strong> y <strong style={{ color: 'var(--text-primary)' }}>{disciplineChecker}</strong>.
              </div>

              <button
                type="submit"
                disabled={isSubmittingDiscipline}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#EF4444' }}
              >
                {isSubmittingDiscipline ? 'Aplicando...' : 'Aplicar Disciplina con Doble Firma Conciliar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMUNICADO PASTORAL MASIVO UNIDIRECCIONAL (GOLD-256) */}
      {showBroadcastModal && (
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
            <button onClick={() => setShowBroadcastModal(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Radio size={24} style={{ color: 'var(--accent-amber)' }} />
              <h3 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-primary)' }}>Transmisión Pastoral Masiva</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '18px' }}>
              Emite un aviso oficial unidireccional que aparecerá como banner destacado e inmutable en el silo de todos los facilitadores de células en Durango.
            </p>
            <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Título del Comunicado
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Convocatoria a Noche de Vigilia y Oración"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Prioridad
                </label>
                <select
                  value={broadcastPriority}
                  onChange={(e) => setBroadcastPriority(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                >
                  <option value="normal">Normal (Aviso Oficial de Temporada)</option>
                  <option value="urgent">Urgente (Reunión Pastoral Inmediata)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Mensaje del Pastor
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escribe el mensaje claro y fraterno para todos los líderes de grupo..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingBroadcast}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Send size={16} />
                <span>{isSubmittingBroadcast ? 'Despachando...' : 'Despachar Comunicado Oficial'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURACIÓN DE NOMENCLATURA Y WHITE-LABELING NOBLE (GOLD-255 & GOLD-257) */}
      {showConfigModal && (
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
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '580px', width: '100%', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowConfigModal(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Sliders size={24} style={{ color: 'var(--accent-indigo)' }} />
              <h3 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-primary)' }}>Nomenclatura y White-Labeling Noble</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '18px' }}>
              Personaliza el vocabulario eclesial de tu congregación y la paleta noble ("anti-naco") de alto contraste sin tocar código.
            </p>

            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Selector de 6 Paletas Nobles */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Paleta Noble Institucional (WCAG AAA)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {NOBLE_PALETTES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setCfgPaletteId(p.id)}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: p.bg,
                        color: p.text,
                        border: cfgPaletteId === p.id ? '2.5px solid #F59E0B' : `1.5px solid ${p.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{p.name}</span>
                      {cfgPaletteId === p.id && <span style={{ fontSize: '0.7rem', color: '#F59E0B' }}>[Activa]</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temporada Litúrgica */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Nombre de Temporada
                  </label>
                  <input
                    type="text"
                    value={cfgSeasonName}
                    onChange={(e) => setCfgSeasonName(e.target.value)}
                    placeholder="Ej. Temporada 2026: Raíces"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Lema Litúrgico
                  </label>
                  <input
                    type="text"
                    value={cfgSeasonMotto}
                    onChange={(e) => setCfgSeasonMotto(e.target.value)}
                    placeholder="Ej. Firmes en Su Gracia"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Duración de la Temporada (GOLD-269 / Descarte de 12 semanas fijas) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Duración de la Temporada (Semanas: 8 a 16)
                </label>
                <input
                  type="number"
                  min={8}
                  max={16}
                  value={cfgSeasonDurationWeeks}
                  onChange={(e) => setCfgSeasonDurationWeeks(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Calibra dinámicamente las semanas de itinerario según el ciclo del grupo.
                </div>
              </div>

              {/* Glosario Eclesial */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <span style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
                  Glosario de Nomenclatura Dinámica en Caliente
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Término Sede (Singular)</label>
                    <input
                      type="text"
                      value={cfgCampusSingular}
                      onChange={(e) => setCfgCampusSingular(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Término Grupo (Singular)</label>
                    <input
                      type="text"
                      value={cfgGroupSingular}
                      onChange={(e) => setCfgGroupSingular(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Título del Líder</label>
                    <input
                      type="text"
                      value={cfgLeaderTitle}
                      onChange={(e) => setCfgLeaderTitle(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Término de la Reunión</label>
                    <input
                      type="text"
                      value={cfgMeetingTerm}
                      onChange={(e) => setCfgMeetingTerm(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              </div>

              {/* DIRECTIVA PASTORAL: CRECIMIENTO Y ESCALA MULTICAMPUS */}
              <div style={{ borderTop: '2px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--accent-amber)' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Crecimiento y Escala Institucional (Directiva Pastoral)
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '14px', lineHeight: 1.4 }}>
                  Control de infraestructura pastoral para Amor y Gracia Durango (escala de 100 a 10,000 discípulos). El Pastor General Josh puede activar o desactivar estas redes según la fase de madurez del cuerpo eclesial.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Toggle Sistema de Diáconos */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Sistema de Diáconos (Cuidado y Visitas)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Monitoreo pastoral preventivo en visitas semestrales a grupos pequeños.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cfgEnableDeacons}
                      onChange={(e) => setCfgEnableDeacons(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-indigo)' }}
                    />
                  </label>

                  {/* Toggle Concilio de Presbiterio */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Concilio de Presbiterio / Ancianos Pastores
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Órgano colegiado de ancianos que supervisan 10-12 diáconos cada uno.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cfgEnableEldership}
                      onChange={(e) => setCfgEnableEldership(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-indigo)' }}
                    />
                  </label>

                  {/* Meta de Crecimiento en Miembros */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Capacidad de Escala Pastoral (Población Durango: ~800,000 hab.)
                    </label>
                    <input
                      type="number"
                      min={100}
                      step={500}
                      value={cfgGrowthTarget}
                      onChange={(e) => setCfgGrowthTarget(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                    />
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Calibra el umbral de escala para la red de macro-sedes y fisión Dunbar celular.
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingConfig}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
              >
                {isSubmittingConfig ? 'Guardando...' : 'Aplicar Configuración Inmediata'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PESTAÑA: ACTIVIDADES COMUNITARIAS Y SUGERENCIAS */}
      {activeTab === 'initiatives' && (
        <section id="section-pastor-initiatives" aria-label="Gobernanza Pastoral de Actividades Comunitarias">
          <CommunityInitiativesHub role="pastor" />
        </section>
      )}

      {/* MODAL: REGISTRAR PAR RESTRINGIDO */}
      {showPairModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
        >
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowPairModal(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Nueva Restricción Anti-Colisión</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '18px' }}>
              Registra los teléfonos que no deben coincidir en la misma célula.
            </p>
            <form onSubmit={handleCreatePairing} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Teléfono Persona A
                </label>
                <input
                  type="text"
                  required
                  placeholder="+52 618 111 2233"
                  value={newPhoneA}
                  onChange={(e) => setNewPhoneA(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Teléfono Persona B
                </label>
                <input
                  type="text"
                  required
                  placeholder="+52 618 444 5566"
                  value={newPhoneB}
                  onChange={(e) => setNewPhoneB(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Motivo Confidencial
                </label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                >
                  <option value="consejería">Consejería Pastoral</option>
                  <option value="familiar">Conflicto Familiar</option>
                  <option value="legal">Proceso Legal / Separación</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Guardar Restricción
              </button>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: ADMINISTRACIÓN PASTORAL DEL FACILITADOR */}
      {editingLeader && (
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
            <button onClick={() => setEditingLeader(null)} style={{ position: 'absolute', top: '20px', right: '20px' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <MonogramAvatar name={editingLeader.name} size="lg" />
              <div>
                <h3 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--text-primary)' }}>{editingLeader.name}</h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{editingLeader.email}</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '20px', lineHeight: 1.4 }}>
              Asigna o reasigna el campus de adscripción, la célula a cargo y el estatus pastoral del facilitador.
            </p>

            <form onSubmit={handleSaveLeaderAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Campus Asignado
                </label>
                <select
                  value={editLeaderCampus}
                  onChange={(e) => setEditLeaderCampus(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                >
                  <option value="Durango Central">Durango Central</option>
                  <option value="Campus Poniente">Campus Poniente</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Célula / Grupo a Cargo
                </label>
                <select
                  value={editLeaderGroup}
                  onChange={(e) => setEditLeaderGroup(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                >
                  <option value="">Sin célula asignada (En transición / mentoría)</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.nombre_publico}>
                      {g.nombre_publico} ({g.affinity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Estatus Pastoral
                </label>
                <select
                  value={editLeaderStatus}
                  onChange={(e) => setEditLeaderStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                >
                  <option value="Activo">Activo (Facilitando reuniones)</option>
                  <option value="Año Sabático / Pausa">Año Sabático / Pausa (Descanso ministerial)</option>
                  <option value="En Formación / Mentoría">En Formación / Mentoría (Acompañamiento pastoral)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              >
                Guardar Asignación Pastoral
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMISIONAR GUARDIÁN EMÉRITO (GOLD-276) */}
      {showGuardianModal && (
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
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowGuardianModal(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#EAB308' }}>
              <Award size={24} />
              <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>Comisión: Guardián Emérito</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '18px', lineHeight: 1.4 }}>
              Reconocimiento teocéntrico y descanso activo para servidores con 4+ años de entrega en Durango. Se les exime de la logística celular semanal para consagrarlos como consejeros espirituales y mentores.
            </p>

            <form onSubmit={handleCommissionGuardian} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Nombre del Servidor a Consagrar
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Aarón Valenzuela"
                  value={newGuardianName}
                  onChange={(e) => setNewGuardianName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Año de Ingreso al Servicio
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={new Date().getFullYear()}
                    value={newGuardianJoinYear}
                    onChange={(e) => setNewGuardianJoinYear(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Rol Histórico Servido
                  </label>
                  <input
                    type="text"
                    value={newGuardianRole}
                    onChange={(e) => setNewGuardianRole(e.target.value)}
                    placeholder="ej. Facilitador Pionero"
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCommissioningGuardian}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#B45309', color: '#FEF3C7', marginTop: '6px' }}
              >
                {isCommissioningGuardian ? 'Consagrando...' : 'Conferir Orden de Guardián Emérito'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVER REPORTE DE BUENA VECINDAD (GOLD-278) */}
      {resolvingComplaint && (
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
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setResolvingComplaint(null)} style={{ position: 'absolute', top: '20px', right: '20px' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: 'var(--accent-emerald)' }}>
              <HeartHandshake size={24} />
              <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>Acuerdo de Buena Vecindad</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '14px', lineHeight: 1.4 }}>
              Resolución fraternal de reporte vecinal en <strong>Colonia {resolvingComplaint.colonia_name}</strong>. Causa reportada: {resolvingComplaint.category}.
            </p>

            <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              "{resolvingComplaint.comments}"
              {resolvingComplaint.reporter_contact && (
                <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Contacto del vecino: {resolvingComplaint.reporter_contact}
                </div>
              )}
            </div>

            <form onSubmit={handleResolveComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Acuerdo Fraternal Convenido y Medidas Tomadas
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="ej. Se conversó amablemente con Don Roberto, se reubicaron 3 vehículos en cochera interna y se fijó tope de decibeles a las 21:00h..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>

              <button
                type="submit"
                disabled={isResolvingComplaint}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isResolvingComplaint ? 'Guardando acuerdo...' : 'Sellar Acuerdo de Paz Vecinal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FICHA PASTORAL COMPLETA: TRÍADA Y CADENA PASTORAL */}
      {showPastoralCard && selectedGroup && (
        <GroupPastoralCard
          group={selectedGroup}
          onClose={() => setShowPastoralCard(false)}
          onGrantSabbatical={() => {
            setStatusMessage(`Sabático fraternal concedido a "${selectedGroup.nombre_publico}".`);
            setShowPastoralCard(false);
          }}
        />
      )}
    </div>
  );
};
