import React, { useEffect, useState } from 'react';
import type {
  CuratedCurriculum,
  DiscipleshipTrack,
  DunbarFissionResult,
  GroupDetail,
  HostSabbatical,
  MeResponse,
  MemberGroupSummary,
  PastoralBroadcast,
  SeasonClosure,
  SeasonClosureDecision,
  SessionVenueItem,
} from '../types';
import {
  addResourceLink,
  createMeetingException,
  createNotice,
  createPrayerNeed,
  createSafeguardAlert,
  createSessionVenue,
  deleteResourceLink,
  endorseDisciple,
  executeDunbarFission,
  fetchActiveCurriculum,
  fetchActivePastoralBroadcasts,
  fetchDiscipleshipTrack,
  fetchGroupDetail,
  fetchHostSabbatical,
  fetchMe,
  fetchSeasonClosure,
  fetchSessionVenues,
  recordHostSabbatical,
  recordMeetingHeadcount,
  recordSeasonClosure,
  reportPastoralDeviation,
  requestMagicLink,
  submitRsvp,
  updateContactVisibility,
  uploadGroupPhoto,
  upsertDiscipleshipTrack,
  verifyMagicLink,
} from '../api';
import {
  Calendar,
  MessageSquare,
  Users,
  ShieldCheck,
  History,
  Camera,
  CheckCircle,
  X,
  FileText,
  Share2,
  Link2,
  Trash2,
  Plus,
  Lock,
  BarChart3,
  ExternalLink,
  Check,
  Navigation,
  Sparkles,
  MapPin,
  Clock,
  HeartHandshake,
  ShieldAlert,
  Timer,
  BookOpen,
  Radio,
  Baby,
  Home,
  GitBranch,
  Video,
  Play,
  Menu,
} from 'lucide-react';
import { MonogramAvatar, NOBLE_PALETTES } from './MonogramAvatar';
import { ConnectionPassCard } from './ConnectionPassCard';
import { GroupSocialCard } from './GroupSocialCard';
import { CellHarmonizer } from './CellHarmonizer';
import { CommunityInitiativesHub } from './CommunityInitiativesHub';
import { subscribeToCalendarFeed } from '../utils/calendarSync';
import { ELENA_RAMOS_COMMITMENTS } from '../utils/plainLanguage';
import { ChurchBrandLogo } from './ChurchBrandLogo';

interface Props {
  isLeaderView?: boolean;
}

export const MemberSilo: React.FC<Props> = ({ isLeaderView = false }) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Form states for Leader: Notice
  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(false);
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeBody, setNoticeBody] = useState<string>('');

  // Form states for Leader: Exception
  const [showExceptionModal, setShowExceptionModal] = useState<boolean>(false);
  const [excDate, setExcDate] = useState<string>('2026-11-05');
  const [excVenueType, setExcVenueType] = useState<string>('public_venue');
  const [excLocationName, setExcLocationName] = useState<string>('');
  const [excAddress, setExcAddress] = useState<string>('');
  const [excNote, setExcNote] = useState<string>('');

  // Form states for Leader: Resource Link (Decision 3-C)
  const [showResourceModal, setShowResourceModal] = useState<boolean>(false);
  const [resTitle, setResTitle] = useState<string>('');
  const [resUrl, setResUrl] = useState<string>('');
  const [resType, setResType] = useState<string>('pdf');

  // Form states for Leader: Headcount Reporting (Discrete Range Bins & Mood Pulse / GOLD-252)
  const [showHeadcountModal, setShowHeadcountModal] = useState<boolean>(false);
  const [hcDate, setHcDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [hcCount, setHcCount] = useState<number>(12);
  const [hcRangeBin, setHcRangeBin] = useState<string>('range_6_to_10');
  const [hcMoodPulse, setHcMoodPulse] = useState<string>('edifying');
  const [hcDidMeet, setHcDidMeet] = useState<boolean>(true);
  const [hcNotes, setHcNotes] = useState<string>('');

  // Privacy toggle state (Decision 7-B)
  const [updatingPrivacy, setUpdatingPrivacy] = useState<boolean>(false);

  // Photo & Share feedback
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [siloToast, setSiloToast] = useState<string | null>(null);

  // Pase Comunitario Autónomo & QR (GOLD-251)
  const [showPassModal, setShowPassModal] = useState<boolean>(false);

  // Comunicados Pastorales Oficiales y Micro-Cápsula Editorial (GOLD-256 / GOLD-337)
  const [activeBroadcasts, setActiveBroadcasts] = useState<PastoralBroadcast[]>([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [dismissedBroadcasts, setDismissedBroadcasts] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('portico_dismissed_broadcasts');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Conmutador Multi-Grupo para Elena Ramos (GOLD-331)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  // Itinerarios Nómadas y Sedes Rotativas (GOLD-261)
  const [sessionVenues, setSessionVenues] = useState<SessionVenueItem[]>([]);
  const [showNomadicVenueModal, setShowNomadicVenueModal] = useState<boolean>(false);
  const [nomadicWeek, setNomadicWeek] = useState<number>(1);
  const [nomadicVenueName, setNomadicVenueName] = useState<string>('');
  const [nomadicAddress, setNomadicAddress] = useState<string>('');
  const [nomadicMapsUrl, setNomadicMapsUrl] = useState<string>('');
  const [nomadicNotes, setNomadicNotes] = useState<string>('');
  const [nomadicVenueType, setNomadicVenueType] = useState<string>('public_venue');
  const [nomadicHostName, setNomadicHostName] = useState<string>('');
  const [nomadicHostPhone, setNomadicHostPhone] = useState<string>('');

  // Ajustes de Célula: Acento y Hospitalidad Infantil (GOLD-258)
  const [showCellSettingsModal, setShowCellSettingsModal] = useState<boolean>(false);
  const [cellAccent, setCellAccent] = useState<string>('navy');
  const [cellKidsWelcome, setCellKidsWelcome] = useState<boolean>(true);
  const [cellKidsSpace, setCellKidsSpace] = useState<string>('play_area');
  const [cellFocusType, setCellFocusType] = useState<string>('life_stage');
  const [cellAudienceOrientation, setCellAudienceOrientation] = useState<string>('all_welcome');

  // Micro-RSVP con Catering Lock (GOLD-243 / Decisión 4-C)
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined' | null>(() => {
    return (localStorage.getItem('portico_member_rsvp') as 'attending' | 'declined') || null;
  });

  // Pacto Comunitario de Temporada (GOLD-244 / Decisión 5-C)
  const [showCovenantModal, setShowCovenantModal] = useState<boolean>(false);
  const [hasSignedCovenant, setHasSignedCovenant] = useState<boolean>(() => {
    return localStorage.getItem('portico_covenant_signed') === 'true';
  });

  // Mobile Bottom Sheet Action Drawer (GOLD-281 / Decisión 2-B)
  const [showActionDrawer, setShowActionDrawer] = useState<boolean>(false);

  // Convivio Fraternal Inter-Celular (GOLD-304)
  const [isJointMeeting, setIsJointMeeting] = useState<boolean>(false);
  const [jointPartnerGroupId, setJointPartnerGroupId] = useState<string>('');

  // Salvaguarda de Menores: Notificación de Canal Supervisado (GOLD-306)
  const [showMinorProtectionNotice, setShowMinorProtectionNotice] = useState<boolean>(false);
  const [protectedMinorName, setProtectedMinorName] = useState<string>('');

  // Armonizador de Calendario Magno Litúrgico (GOLD-297)
  const [showHarmonizerModal, setShowHarmonizerModal] = useState<boolean>(false);

  // Temporizador de Dinámica en Parejas de 5 min (GOLD-245 / Decisión 6-C)
  const [pairTimer, setPairTimer] = useState<number | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (pairTimer !== null && pairTimer > 0) {
      interval = setInterval(() => {
        setPairTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pairTimer]);

  // Muro de Oración Estructurada (GOLD-241 / Decisión 2-C / Cero Secretos GOLD-253)
  const [showPrayerModal, setShowPrayerModal] = useState<boolean>(false);
  const [prayerCategory, setPrayerCategory] = useState<string>('salud');
  const [prayerPublicTag, setPrayerPublicTag] = useState<string>('');
  const [submittingPrayer, setSubmittingPrayer] = useState<boolean>(false);

  // Alerta de Salvaguarda Pastoral (GOLD-242 / Decisión 3-C)
  const [showSafeguardModal, setShowSafeguardModal] = useState<boolean>(false);
  const [safeguardUrgency, setSafeguardUrgency] = useState<string>('high');
  const [safeguardSuccess, setSafeguardSuccess] = useState<boolean>(false);

  // Ciclo 5: Discipulado Intencional (GOLD-262)
  const [discipleshipTrack, setDiscipleshipTrack] = useState<DiscipleshipTrack | null>(null);
  const [showDiscipleModal, setShowDiscipleModal] = useState<boolean>(false);
  const [discipleMemberId, setDiscipleMemberId] = useState<string>('');
  const [discipleName, setDiscipleName] = useState<string>('');
  const [discipleStage, setDiscipleStage] = useState<string>('observer');
  const [discipleNotes, setDiscipleNotes] = useState<string>('');
  const [endorsingDisciple, setEndorsingDisciple] = useState<boolean>(false);

  // Ciclo 5: Cierre Fraterno de Temporada (GOLD-264)
  const [seasonClosure, setSeasonClosure] = useState<SeasonClosure | null>(null);
  const [showClosureModal, setShowClosureModal] = useState<boolean>(false);
  const [closureDecision, setClosureDecision] = useState<SeasonClosureDecision>('continue_same');
  const [closureNotes, setClosureNotes] = useState<string>('');
  const [recordingClosure, setRecordingClosure] = useState<boolean>(false);

  // Ciclo 5: Desviaciones Pastorales y Diaconado (GOLD-268 & GOLD-270)
  const [showDeviationModal, setShowDeviationModal] = useState<boolean>(false);
  const [deviationCategory, setDeviationCategory] = useState<string>('unhealthy_atmosphere');
  const [deviationComments, setDeviationComments] = useState<string>('');
  const [submittingDeviation, setSubmittingDeviation] = useState<boolean>(false);

  // Ciclo 5: Ficha Social de Difusión (GOLD-272)
  const [showSocialModal, setShowSocialModal] = useState<boolean>(false);

  // Estados Ciclo 6 (GOLD-275, GOLD-277, GOLD-279: Escala 25,000, Sabáticos y Fisión Dunbar)
  const [hostSabbatical, setHostSabbatical] = useState<HostSabbatical | null>(null);
  const [curatedCurriculum, setCuratedCurriculum] = useState<CuratedCurriculum | null>(null);

  // Fisión Celular Dunbar (GOLD-279)
  const [showFissionModal, setShowFissionModal] = useState<boolean>(false);
  const [fissionApprenticeId, setFissionApprenticeId] = useState<string>('');
  const [fissionApprenticeName, setFissionApprenticeName] = useState<string>('');
  const [fissionSeedIds, setFissionSeedIds] = useState<string[]>([]);
  const [fissionNewGroupName, setFissionNewGroupName] = useState<string>('');
  const [fissionNewMacroZone, setFissionNewMacroZone] = useState<string>('Norte');
  const [fissionNewDay, setFissionNewDay] = useState<number>(3);
  const [fissionNewTime, setFissionNewTime] = useState<string>('19:30');
  const [executingFission, setExecutingFission] = useState<boolean>(false);
  const [fissionResult, setFissionResult] = useState<DunbarFissionResult | null>(null);

  const handleRsvp = async (status: 'attending' | 'declined') => {
    const nextVal = rsvpStatus === status ? null : status;
    setRsvpStatus(nextVal);
    if (nextVal) {
      localStorage.setItem('portico_member_rsvp', nextVal);
    } else {
      localStorage.removeItem('portico_member_rsvp');
    }

    if (selectedGroupDetail && sessionToken) {
      const meetingDate = selectedGroupDetail.schedule?.[0]?.date || new Date().toISOString().slice(0, 10);
      const apiStatus = nextVal === 'attending' ? 'attending' : 'not_attending';
      try {
        const res = await submitRsvp(selectedGroupDetail.id, meetingDate, apiStatus, sessionToken);
        setSelectedGroupDetail((prev) =>
          prev ? { ...prev, catering_headcount_confirmed: res.catering_headcount_confirmed } : null
        );
      } catch (e) {
        console.error('Error submitting RSVP', e);
      }
    }
  };

  const handleSignCovenant = () => {
    setHasSignedCovenant(true);
    localStorage.setItem('portico_covenant_signed', 'true');
    setShowCovenantModal(false);
  };

  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupDetail || !sessionToken) return;
    setSubmittingPrayer(true);
    try {
      await createPrayerNeed(selectedGroupDetail.id, prayerCategory, prayerPublicTag || 'Intercesión comunitaria', sessionToken);
      setShowPrayerModal(false);
      setPrayerPublicTag('');
      const updated = await fetchGroupDetail(selectedGroupDetail.id, sessionToken);
      setSelectedGroupDetail(updated);
      setSiloToast('✓ Motivo de intercesión comunitaria registrado.');
    } catch (err: any) {
      alert(err.message || 'Error registrando petición de oración');
    } finally {
      setSubmittingPrayer(false);
    }
  };

  const handleCreateNomadicVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupDetail || !sessionToken) return;
    try {
      await createSessionVenue(
        selectedGroupDetail.id,
        {
          week_number: Number(nomadicWeek),
          venue_name: nomadicVenueName,
          address: nomadicAddress,
          maps_url: nomadicMapsUrl || undefined,
          notes: nomadicNotes || undefined,
          venue_type: nomadicVenueType,
          host_name: nomadicHostName || undefined,
          host_phone: nomadicHostPhone || undefined,
        },
        sessionToken
      );
      setShowNomadicVenueModal(false);
      setNomadicVenueName('');
      setNomadicAddress('');
      setNomadicNotes('');
      setNomadicHostName('');
      setNomadicHostPhone('');
      const vens = await fetchSessionVenues(selectedGroupDetail.id, sessionToken);
      setSessionVenues(vens);
      setSiloToast('✓ Sede de la semana programada exitosamente en el itinerario nómada.');
    } catch (err: any) {
      alert(err.message || 'Error programando sede semanal');
    }
  };

  const handleSendSafeguardAlert = async () => {
    if (!selectedGroupDetail || !sessionToken) return;
    try {
      await createSafeguardAlert(selectedGroupDetail.id, safeguardUrgency, sessionToken);
      setSafeguardSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Error reportando alerta pastoral');
    }
  };

  const loadProfile = React.useCallback(async (token: string) => {
    try {
      const me = await fetchMe(token);
      setProfile(me);
      if (me.active_groups.length > 0) {
        setSelectedGroupId(me.active_groups[0].id);
        const detail = await fetchGroupDetail(me.active_groups[0].id, token);
        setSelectedGroupDetail(detail);
        if (detail.cell_accent) {
          setCellAccent(detail.cell_accent);
        }
        setCellKidsWelcome(detail.kids_welcome ?? true);
        setCellKidsSpace(detail.kids_space_type || 'play_area');
        if (detail.focus_type) {
          setCellFocusType(detail.focus_type);
        }
        if (detail.audience_orientation) {
          setCellAudienceOrientation(detail.audience_orientation);
        }
        const [vens, bcs, disc, closure, sabb, curr] = await Promise.all([
          fetchSessionVenues(me.active_groups[0].id, token).catch(() => []),
          fetchActivePastoralBroadcasts().catch(() => []),
          fetchDiscipleshipTrack(me.active_groups[0].id, token).catch(() => null),
          fetchSeasonClosure(me.active_groups[0].id, undefined, token).catch(() => null),
          fetchHostSabbatical(me.active_groups[0].id).catch(() => null),
          fetchActiveCurriculum().catch(() => null),
        ]);
        setSessionVenues(vens);
        setActiveBroadcasts(bcs);
        setDiscipleshipTrack(disc);
        setSeasonClosure(closure);
        setHostSabbatical(sabb);
        setCuratedCurriculum(curr);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSwitchGroup = async (groupId: string) => {
    setSelectedGroupId(groupId);
    if (!sessionToken) return;
    setLoading(true);
    try {
      const detail = await fetchGroupDetail(groupId, sessionToken);
      setSelectedGroupDetail(detail);
      if (detail.cell_accent) {
        setCellAccent(detail.cell_accent);
      }
      setCellKidsWelcome(detail.kids_welcome ?? true);
      setCellKidsSpace(detail.kids_space_type || 'play_area');
      if (detail.focus_type) {
        setCellFocusType(detail.focus_type);
      }
      if (detail.audience_orientation) {
        setCellAudienceOrientation(detail.audience_orientation);
      }
      const [vens, disc, closure, sabb] = await Promise.all([
        fetchSessionVenues(groupId, sessionToken).catch(() => []),
        fetchDiscipleshipTrack(groupId, sessionToken).catch(() => null),
        fetchSeasonClosure(groupId, undefined, sessionToken).catch(() => null),
        fetchHostSabbatical(groupId).catch(() => null),
      ]);
      setSessionVenues(vens);
      setDiscipleshipTrack(disc);
      setSeasonClosure(closure);
      setHostSabbatical(sabb);
    } catch {
      const targetGroup = activeGroupsList.find((g) => g.id === groupId);
      if (targetGroup && selectedGroupDetail) {
        setSelectedGroupDetail({
          ...selectedGroupDetail,
          id: targetGroup.id,
          nombre_publico: targetGroup.nombre_publico,
          dia_habitual: targetGroup.dia_habitual,
          hora_habitual: targetGroup.hora_habitual,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Ciclo 5 (GOLD-262, GOLD-264, GOLD-268)
  const openDiscipleModal = () => {
    if (discipleshipTrack) {
      setDiscipleMemberId(discipleshipTrack.id);
      setDiscipleName(discipleshipTrack.disciple_name);
      setDiscipleStage(discipleshipTrack.stage);
    } else {
      setDiscipleMemberId('');
      setDiscipleName('');
      setDiscipleStage('observer');
    }
    setDiscipleNotes('');
    setShowDiscipleModal(true);
  };

  const handleUpsertDisciple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupDetail || !sessionToken || !discipleName.trim()) return;
    try {
      const derivedMemberId = discipleMemberId || `mem-${Date.now()}`;
      await upsertDiscipleshipTrack(
        selectedGroupDetail.id,
        {
          disciple_member_id: derivedMemberId,
          disciple_name: discipleName.trim(),
          stage: discipleStage,
          notes: discipleNotes.trim() || undefined,
        },
        sessionToken
      );
      const updated = await fetchDiscipleshipTrack(selectedGroupDetail.id, sessionToken);
      setDiscipleshipTrack(updated);
      setShowDiscipleModal(false);
      setSiloToast('✓ Registro de discipulado intencional actualizado.');
    } catch (err: any) {
      alert(err.message || 'Error al guardar discipulado');
    }
  };

  const handleEndorseDisciple = async () => {
    if (!selectedGroupDetail || !sessionToken) return;
    setEndorsingDisciple(true);
    try {
      await endorseDisciple(selectedGroupDetail.id, 'Endoso fraternal para envío de nueva célula', sessionToken);
      const updated = await fetchDiscipleshipTrack(selectedGroupDetail.id, sessionToken);
      setDiscipleshipTrack(updated);
      setSiloToast('Endoso Pastoral de Envío emitido con éxito. El discípulo está listo para comisionamiento.');
    } catch (err: any) {
      alert(err.message || 'Error al emitir endoso');
    } finally {
      setEndorsingDisciple(false);
    }
  };

  const handleRecordClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupDetail || !sessionToken) return;
    setRecordingClosure(true);
    try {
      await recordSeasonClosure(
        selectedGroupDetail.id,
        {
          decision: closureDecision,
          notes: closureNotes.trim() || undefined,
          new_disciple_edition_id: closureDecision === 'multiply_with_disciple' ? `grp-${Date.now()}` : undefined,
          disciple_member_id: discipleshipTrack?.id,
        },
        sessionToken
      );
      const updated = await fetchSeasonClosure(selectedGroupDetail.id, undefined, sessionToken);
      setSeasonClosure(updated);
      setShowClosureModal(false);
      setSiloToast('✓ Pacto de cierre fraterno de temporada registrado.');
    } catch (err: any) {
      alert(err.message || 'Error al registrar cierre de temporada');
    } finally {
      setRecordingClosure(false);
    }
  };

  const handleReportDeviation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupDetail || !sessionToken || !deviationComments.trim()) return;
    setSubmittingDeviation(true);
    try {
      await reportPastoralDeviation(
        selectedGroupDetail.id,
        {
          category: deviationCategory,
          description: deviationComments.trim(),
        },
        sessionToken
      );
      setShowDeviationModal(false);
      setDeviationComments('');
      setSiloToast('Observación enviada discretamente al Diácono asignado (Atención Mateo 18).');
    } catch (err: any) {
      alert(err.message || 'Error al enviar observación');
    } finally {
      setSubmittingDeviation(false);
    }
  };

  // Handlers para Ciclo 6 (GOLD-275 & GOLD-279)
  const handleRequestHostSabbatical = async () => {
    if (!selectedGroupDetail || !sessionToken) return;
    if (!confirm('¿Deseas solicitar descanso sabático litúrgico de 1 temporada para el hogar anfitrión?')) return;
    try {
      const res = await recordHostSabbatical(
        selectedGroupDetail.id,
        {
          host_name: selectedGroupDetail.host_reference || 'Hogar Anfitrión',
          consecutive_seasons: (hostSabbatical?.consecutive_seasons || 2),
          is_on_sabbatical: true,
          sabbatical_reason: 'Descanso sagrado reglamentario tras servicio continuo de hospitalidad',
        },
        sessionToken
      );
      setHostSabbatical(res.sabbatical);
      setSiloToast('Descanso Sabático otorgado con éxito. El hogar descansará la próxima temporada.');
    } catch (err: any) {
      alert(err.message || 'Error solicitando sabático');
    }
  };

  const handleExecuteDunbarFission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupDetail || !sessionToken) return;
    if (!fissionApprenticeName.trim() || !fissionNewGroupName.trim()) {
      alert('Por favor especifica el nombre del aprendiz facilitador y el nombre de la nueva célula.');
      return;
    }
    if (fissionSeedIds.length < 3) {
      alert('Se requiere un núcleo semilla de al menos 3 a 4 miembros para garantizar la viabilidad comunitaria.');
      return;
    }
    setExecutingFission(true);
    try {
      const res = await executeDunbarFission(
        selectedGroupDetail.id,
        {
          parent_group_id: selectedGroupDetail.id,
          apprentice_id: fissionApprenticeId || `apprentice-${Date.now()}`,
          apprentice_name: fissionApprenticeName.trim(),
          seed_member_ids: fissionSeedIds,
          seed_member_names: selectedGroupDetail.members
            .filter((m) => fissionSeedIds.includes(m.id || m.name))
            .map((m) => m.name),
          new_group_name: fissionNewGroupName.trim(),
          new_macro_zone: fissionNewMacroZone,
          new_dia_habitual: Number(fissionNewDay),
          new_hora_habitual: fissionNewTime,
        },
        sessionToken
      );
      setFissionResult(res.result);
      setSiloToast(`Fisión Celular Exitosa. Célula hija "${fissionNewGroupName}" plantada.`);
      setShowFissionModal(false);
      // Recargar detalle de grupo actualizado
      const updated = await fetchGroupDetail(selectedGroupDetail.id, sessionToken);
      setSelectedGroupDetail(updated);
    } catch (err: any) {
      alert(err.message || 'Error ejecutando fisión celular');
    } finally {
      setExecutingFission(false);
    }
  };

  const initSimulatedLogin = React.useCallback(async () => {
    setLoading(true);
    try {
      const email = isLeaderView ? 'carlos@amorygracia.mx' : 'elena@gmail.com';
      const ml = await requestMagicLink(email);
      const auth = await verifyMagicLink(ml.token);
      setSessionToken(auth.session_token);
      await loadProfile(auth.session_token);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isLeaderView, loadProfile]);

  // Auto-login for simulated demo role
  useEffect(() => {
    initSimulatedLogin();
  }, [initSimulatedLogin]);

  // Despachador Universal de Rutas GPS (GOLD-220 / Decisión 6-C)
  const handleOpenGpsRoute = (address: string) => {
    if (!address) return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const encoded = encodeURIComponent(address + ', Durango, Dgo., México');
    if (isIOS) {
      window.location.href = `maps://?q=${encoded}`;
    } else if (isAndroid) {
      window.location.href = `geo:0,0?q=${encoded}`;
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Difusión Atómica 1-Tap a WhatsApp para Líder (GOLD-221 / Decisión 7-C)
  const handleLeaderBroadcastWa = async () => {
    if (!selectedGroupDetail) return;
    const nextMeeting = selectedGroupDetail.schedule?.[0];
    const isSpecial = Boolean(nextMeeting?.note);
    const targetVenue = isSpecial ? nextMeeting?.location_summary : (selectedGroupDetail.full_venue_address || 'Dirección de sede');
    
    const broadcastText = `*Amor y Gracia Durango • ${selectedGroupDetail.nombre_publico}*\n\n` +
      `Estimados miembros: Nos reunimos este *${nextMeeting?.date || 'día habitual'}* a las *${selectedGroupDetail.hora_habitual} hrs*.\n\n` +
      `📍 *Sede:* ${targetVenue}\n` +
      `${isSpecial ? `*Aviso de Sede Especial:* ${nextMeeting?.note}\n` : ''}` +
      `*Propósito:* ${selectedGroupDetail.proposito}\n\n` +
      `Favor de confirmar su asistencia en la aplicación.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedGroupDetail.nombre_publico,
          text: broadcastText,
        });
        return;
      } catch {
        // Fallback a enlace web
      }
    }
    const waUrl = `https://wa.me/?text=${encodeURIComponent(broadcastText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareGroup = async () => {
    if (!selectedGroupDetail) return;
    const shareText = `¡Hola! Te invito a nuestro grupo pequeño "${selectedGroupDetail.nombre_publico}" de Amor y Gracia Durango. Nos reunimos a las ${selectedGroupDetail.hora_habitual} hrs. Conoce más en el portal soberano de la iglesia: ${window.location.origin}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedGroupDetail.nombre_publico,
          text: shareText,
          url: window.location.origin,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
        return;
      } catch {
        // Fallback if rejected
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText).catch(() => {});
    }
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupDetail || !sessionToken) return;
    try {
      await createNotice(
        selectedGroupDetail.id,
        { titulo: noticeTitle, contenido: noticeBody },
        sessionToken
      );
      setShowNoticeModal(false);
      setNoticeTitle('');
      setNoticeBody('');
      await loadProfile(sessionToken);
    } catch {
      alert('Error creando aviso');
    }
  };

  const handleCreateException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupDetail || !sessionToken) return;
    try {
      await createMeetingException(
        selectedGroupDetail.id,
        {
          date: excDate,
          venue_type: excVenueType,
          public_location_name: excLocationName || undefined,
          private_address: excAddress || undefined,
          note: excNote || undefined,
        },
        sessionToken
      );
      setShowExceptionModal(false);
      await loadProfile(sessionToken);
    } catch {
      alert('Error registrando excepción');
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupDetail || !sessionToken) return;
    try {
      await addResourceLink(
        selectedGroupDetail.id,
        {
          title: resTitle,
          url: resUrl,
          link_type: resType,
          sort_order: (selectedGroupDetail.resources?.length || 0) + 1,
        },
        sessionToken
      );
      setShowResourceModal(false);
      setResTitle('');
      setResUrl('');
      setResType('pdf');
      await loadProfile(sessionToken);
    } catch (err: any) {
      alert(err.message || 'Error añadiendo recurso');
    }
  };

  const handleDeleteResource = async (linkId: string) => {
    if (!selectedGroupDetail || !sessionToken) return;
    if (!confirm('¿Deseas eliminar este recurso del grupo?')) return;
    try {
      await deleteResourceLink(selectedGroupDetail.id, linkId, sessionToken);
      await loadProfile(sessionToken);
    } catch (err: any) {
      alert(err.message || 'Error eliminando recurso');
    }
  };

  const handleRecordHeadcount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupDetail || !sessionToken) return;
    try {
      await recordMeetingHeadcount(
        selectedGroupDetail.id,
        {
          meeting_date: hcDate,
          attendee_count: Number(hcCount),
          range_bin: hcRangeBin,
          mood_pulse: hcMoodPulse,
          did_meet: hcDidMeet,
          notes: hcNotes || undefined,
        },
        sessionToken
      );
      setShowHeadcountModal(false);
      setHcNotes('');
      setSiloToast('✓ Asistencia y pulso de reunión registrados.');
      await loadProfile(sessionToken);
    } catch (err: any) {
      alert(err.message || 'Error registrando asistencia');
    }
  };

  const handleTogglePrivacy = async (newVisibility: 'hidden' | 'edition_members') => {
    if (!selectedGroupDetail || !sessionToken) return;
    setUpdatingPrivacy(true);
    try {
      await updateContactVisibility(selectedGroupDetail.id, newVisibility, sessionToken);
      await loadProfile(sessionToken);
    } catch (err: any) {
      alert(err.message || 'Error actualizando privacidad');
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedGroupDetail || !sessionToken) return;
    setUploadingPhoto(true);
    setPhotoMessage(null);
    try {
      const res = await uploadGroupPhoto(selectedGroupDetail.id, file, sessionToken);
      setPhotoMessage(`Foto subida y sanitizada con éxito: ${res.bytes_clean} bytes libres de metadatos GPS/EXIF.`);
    } catch {
      alert('Error subiendo foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const isLeader = isLeaderView || selectedGroupDetail?.is_responsible;
  const nextMeeting = selectedGroupDetail?.schedule?.[0];
  const hasException = Boolean(nextMeeting?.note);

  // Comunidades activas para Elena Ramos (GOLD-331 / 2-A)
  const defaultElenaGroups: MemberGroupSummary[] = [
    {
      id: profile?.active_groups?.[0]?.id || 'gp-centro-jovenes',
      nombre_publico: profile?.active_groups?.[0]?.nombre_publico || 'GP Centro Jóvenes',
      rol: 'miembro',
      dia_habitual: 4,
      hora_habitual: '20:00',
      whatsapp_chat_url: null,
      venue_address: null,
    },
    {
      id: 'gp-tito2',
      nombre_publico: 'Desayuno Mujeres Tito 2',
      rol: 'miembro',
      dia_habitual: 6,
      hora_habitual: '09:00',
      whatsapp_chat_url: null,
      venue_address: null,
    },
    {
      id: 'gp-voluntariado',
      nombre_publico: 'Voluntariado Hospital 450',
      rol: 'miembro',
      dia_habitual: 6,
      hora_habitual: '11:30',
      whatsapp_chat_url: null,
      venue_address: null,
    },
  ];

  const activeGroupsList: MemberGroupSummary[] =
    profile?.active_groups && profile.active_groups.length > 1
      ? profile.active_groups
      : (!isLeaderView ? defaultElenaGroups : (profile?.active_groups || []));

  const activeBroadcast = activeBroadcasts.find(
    (b) => !dismissedBroadcasts.includes(b.id) && localStorage.getItem(`pastoral-broadcast-dismissed-${b.id}`) !== 'true'
  );

  if (loading && !selectedGroupDetail) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
        Cargando portal del miembro / líder...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px 80px 20px' }}>
      {/* Micro-Cápsula Editorial Plegable para Comunicado Pastoral (GOLD-337 / 8-A) */}
      {activeBroadcast && (
        <div
          id="pastoral-broadcast-capsule"
          style={{
            height: '44px',
            minHeight: '44px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--accent-amber)',
            padding: '0 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <Radio size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backgroundColor: 'var(--accent-amber-light)',
                color: 'var(--accent-amber)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                flexShrink: 0,
              }}
            >
              Aviso Pastoral
            </span>
            <span
              style={{
                fontSize: '0.86rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {activeBroadcast.title}: {activeBroadcast.message}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              type="button"
              id="btn-read-broadcast"
              onClick={() => setShowBroadcastModal(true)}
              className="tap-target-44"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-amber)',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 10px',
              }}
            >
              Leer
            </button>
            <button
              type="button"
              id="btn-dismiss-broadcast"
              onClick={() => {
                const next = [...dismissedBroadcasts, activeBroadcast.id];
                setDismissedBroadcasts(next);
                try {
                  localStorage.setItem('portico_dismissed_broadcasts', JSON.stringify(next));
                  localStorage.setItem(`pastoral-broadcast-dismissed-${activeBroadcast.id}`, 'true');
                } catch (e) {
                  console.error(e);
                }
              }}
              className="tap-target-44"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
              title="Descartar comunicado"
              aria-label="Descartar aviso pastoral"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Lectura Completa de Comunicado Pastoral */}
      {showBroadcastModal && activeBroadcast && (
        <div
          id="modal-broadcast-read"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
          onClick={() => setShowBroadcastModal(false)}
        >
          <div
            className="surface-elevated animate-fade-in"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              position: 'relative',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--accent-amber)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowBroadcastModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              aria-label="Cerrar comunicado"
            >
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Radio size={20} style={{ color: 'var(--accent-amber)' }} />
              <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-amber)', letterSpacing: '0.05em' }}>
                Comunicado Pastoral Oficial
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', margin: '0 0 14px 0' }}>
              {activeBroadcast.title}
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line', margin: '0 0 20px 0' }}>
              {activeBroadcast.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.88rem' }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Háptico */}
      {siloToast && (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#0F172A',
            color: '#FEF3C7',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #D97706',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle size={16} style={{ color: '#10B981' }} />
          <span>{siloToast}</span>
        </div>
      )}

      {/* Silo Top Header Card (Luz de Atrio / Noche de Vigilia) */}
      <div className="surface-card" style={{
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderLeft: isLeader ? '4px solid var(--accent-amber)' : '4px solid var(--accent-indigo)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ChurchBrandLogo size={36} variant="icon" color={isLeader ? 'var(--accent-amber)' : 'var(--accent-terracotta)'} />
          <MonogramAvatar name={profile?.nombre_visible || 'Usuario'} size="lg" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>{profile?.nombre_visible}</h2>
              <span className={`badge ${isLeader ? 'badge-amber' : 'badge-indigo'}`}>
                {isLeader ? 'Líder del Hogar' : 'Miembro del Hogar'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <ShieldCheck size={14} style={{ color: 'var(--accent-emerald)' }} />
              <span>Tu información se queda en tu iglesia y está cuidada con respeto • Durango Amor y Gracia</span>
            </div>
          </div>
        </div>

        {/* Toolbar Ergonómica Grado Apple: Acción Rápida + Menú Deslizable (GOLD-281) */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {isLeader ? (
            <button
              type="button"
              id="btn-quick-headcount"
              onClick={() => setShowHeadcountModal(true)}
              className="btn-primary tap-target-44"
              style={{
                backgroundColor: 'var(--accent-amber)',
                color: '#161513',
                padding: '10px 18px',
                fontWeight: 700,
                boxShadow: 'var(--shadow-amber)',
              }}
              title="Anotar quiénes vinieron a la reunión de hoy"
            >
              <BarChart3 size={18} />
              <span>Tomar Asistencia</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-quick-pass"
              onClick={() => setShowPassModal(true)}
              className="btn-primary tap-target-44"
              style={{
                backgroundColor: 'var(--accent-amber)',
                color: '#161513',
                padding: '10px 18px',
                fontWeight: 700,
              }}
              title="Tu tarjeta de comunión y código de acceso"
            >
              <CheckCircle size={18} />
              <span>Mi Pase / QR</span>
            </button>
          )}

          {/* Gatillo del Drawer Inferior Vaul (Progressive Disclosure / GOLD-281) */}
          <button
            type="button"
            id="btn-open-tools-drawer"
            onClick={() => setShowActionDrawer(true)}
            className="btn-secondary tap-target-44"
            style={{
              padding: '10px 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
            }}
            title="Herramientas secundarias de grupo, discipulado y avisos"
          >
            <Menu size={18} />
            <span>Más herramientas del grupo...</span>
          </button>
        </div>
      </div>

      {/* Selector Multi-Grupo Segmentado Táctil de 48px para Elena Ramos (GOLD-331 / 2-A) */}
      {activeGroupsList.length > 1 && (
        <div
          id="multi-group-switcher"
          className="surface-card"
          style={{
            padding: '12px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Mis Comunidades:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {activeGroupsList.map((grp) => {
              const isSelected = (selectedGroupId ? selectedGroupId === grp.id : selectedGroupDetail?.id === grp.id) || (selectedGroupDetail?.nombre_publico === grp.nombre_publico);
              return (
                <button
                  key={grp.id}
                  type="button"
                  id={`btn-switch-group-${grp.id}`}
                  onClick={() => handleSwitchGroup(grp.id)}
                  className="tap-target-48"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    backgroundColor: isSelected ? 'var(--accent-terracotta)' : 'var(--bg-primary)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--accent-terracotta)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {grp.nombre_publico}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Banner de Nuestro Compromiso de Amor y Respeto (La Prueba de Elena Ramos / GOLD-280) */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: hasSignedCovenant ? 'var(--accent-emerald-light)' : 'var(--accent-amber-light)',
        border: hasSignedCovenant ? '1px solid var(--accent-emerald-border)' : '1px solid var(--accent-amber-border)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HeartHandshake size={22} style={{ color: hasSignedCovenant ? 'var(--accent-emerald)' : 'var(--accent-amber)', flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)' }}>
              {hasSignedCovenant ? 'Nuestro Compromiso de Amor y Respeto Confirmado' : 'Nuestro Compromiso de Amor y Respeto Pendiente'}
            </strong>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {hasSignedCovenant
                ? 'Has aceptado la promesa de escucharnos con respeto, cuidar la confianza y apoyarnos como familia.'
                : 'Un acuerdo de 4 puntos sencillos para convivir en paz, sin ventas ni préstamos de dinero.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          id="btn-open-covenant"
          onClick={() => setShowCovenantModal(true)}
          className={hasSignedCovenant ? 'btn-secondary' : 'btn-primary'}
          style={{ minHeight: '40px', padding: '8px 16px', fontSize: '0.84rem' }}
        >
          {hasSignedCovenant ? 'Ver Nuestro Compromiso' : 'Revisar y Confirmar Nuestro Compromiso'}
        </button>
      </div>

      {photoMessage && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--accent-emerald-light)',
          border: '1px solid var(--accent-emerald-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--accent-emerald)',
          fontSize: '0.88rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
        }}>
          <CheckCircle size={18} />
          <span>{photoMessage}</span>
        </div>
      )}

      {/* Main Grid: Living Gathering Card y Directorio (Ergonomía Tableta y Móvil) */}
      <div className="silo-layout-grid" style={{ gap: '28px' }}>
        {/* Columna Izquierda: Pase Heroico y Próxima Reunión */}
        <div>
          {selectedGroupDetail ? (
            <div>
              {/* LIVING GATHERING PASS (GOLD-219 / Decisión 5-C) con Metamorfosis Ámbar (GOLD-229 / Decisión 15-C) */}
              <article
                className={`living-gathering-card ${hasException ? 'is-exception' : ''}`}
                style={{ padding: '28px', marginBottom: '28px' }}
              >
                {/* Header del Pase */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    {hasException ? (
                      <div className="exception-badge" style={{ marginBottom: '8px' }}>
                        <Sparkles size={14} />
                        <span>SEDE ESPECIAL CONFIRMADA</span>
                      </div>
                    ) : (
                      <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>
                        Pase de Reunión Semanal Activo
                      </span>
                    )}
                    <h3 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-primary)' }}>
                      {selectedGroupDetail.nombre_publico}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', marginTop: '4px', lineHeight: 1.4 }}>
                      {selectedGroupDetail.proposito}
                    </p>
                  </div>

                  {/* Acciones Rápidas de Compartir */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleShareGroup}
                      className="btn-secondary"
                      style={{
                        minHeight: '44px',
                        padding: '8px 14px',
                        fontSize: '0.84rem',
                      }}
                    >
                      {shareSuccess ? <Check size={16} style={{ color: 'var(--accent-emerald)' }} /> : <Share2 size={16} />}
                      <span>{shareSuccess ? '¡Enlace Listo!' : 'Invitar'}</span>
                    </button>

                    {selectedGroupDetail.whatsapp_chat_url && (
                      <a
                        href={selectedGroupDetail.whatsapp_chat_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                        style={{
                          minHeight: '44px',
                          padding: '8px 14px',
                          fontSize: '0.84rem',
                          backgroundColor: '#25D366',
                        }}
                      >
                        <MessageSquare size={16} />
                        <span>Chat del Grupo</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Estructura Triádica de Liderazgo (GOLD-248 / Decisión 9-C) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Facilitador</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedGroupDetail.facilitator_name || 'Designado'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Anfitrión</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedGroupDetail.host_reference || 'Hogar Sede'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Aprendiz</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedGroupDetail.apprentice_name || 'En formación'}</strong>
                  </div>
                </div>

                {/* Relieve Ambiental de Próxima Cita (Lectura en < 3 Segundos) */}
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  marginBottom: '20px',
                  border: hasException ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.05rem' }}>
                      <Calendar size={18} style={{ color: hasException ? 'var(--accent-amber)' : 'var(--accent-emerald)' }} />
                      <span>{nextMeeting?.date || 'Próxima Reunión'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <Clock size={16} style={{ color: hasException ? 'var(--accent-amber)' : 'var(--accent-emerald)' }} />
                      <span>{selectedGroupDetail.hora_habitual} hrs</span>
                    </div>

                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: hasException ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                      backgroundColor: hasException ? 'var(--accent-amber-light)' : 'var(--accent-emerald-light)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <Clock size={13} />
                      <span>En 2 horas</span>
                    </span>
                  </div>

                  {/* Dirección Revelada en Silo + Botón de Navegación Universal (GOLD-220) */}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {hasException ? 'Lugar de Sede Especial:' : 'Domicilio de la Reunión:'}
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={18} style={{ color: hasException ? 'var(--accent-amber)' : 'var(--accent-emerald)', flexShrink: 0 }} />
                      <span>{hasException ? (nextMeeting?.location_summary) : (selectedGroupDetail.full_venue_address || 'Dirección confirmada en célula')}</span>
                    </div>

                    {/* Botón Universal de Ruta GPS (Apple Maps / Google Maps) */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenGpsRoute(hasException ? (nextMeeting?.location_summary || '') : (selectedGroupDetail.full_venue_address || ''))}
                        className="btn-route-gps"
                      >
                        <Navigation size={17} />
                        <span>Ver Ruta en Maps / Waze</span>
                      </button>

                      {selectedGroupDetail.host_reference && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Anfitrión: <strong>{selectedGroupDetail.host_reference}</strong>
                        </span>
                      )}
                    </div>

                    {/* Micro-RSVP de Confirmación Fraterna (La Prueba de Elena Ramos / GOLD-280) */}
                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                            ¿Quiénes vienen a cenar hoy?
                          </span>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            Avisamos hasta {selectedGroupDetail.rsvp_cutoff_hours || 4} horas antes para cuidar los alimentos de la familia anfitriona.
                          </span>
                        </div>
                        <div style={{
                          backgroundColor: 'var(--accent-emerald-light)',
                          color: 'var(--accent-emerald)',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}>
                          {selectedGroupDetail.catering_headcount_confirmed} confirmados
                        </div>
                      </div>

                      <div className="rsvp-container">
                        <button
                          type="button"
                          id="btn-rsvp-attending"
                          onClick={() => handleRsvp('attending')}
                          className={`rsvp-pill ${rsvpStatus === 'attending' ? 'is-attending' : ''}`}
                        >
                          <Check size={14} />
                          <span>{rsvpStatus === 'attending' ? '✓ Sí voy a ir' : 'Sí voy a ir'}</span>
                        </button>
                        <button
                          type="button"
                          id="btn-rsvp-declined"
                          onClick={() => handleRsvp('declined')}
                          className={`rsvp-pill ${rsvpStatus === 'declined' ? 'is-declined' : ''}`}
                        >
                          <X size={14} />
                          <span>{rsvpStatus === 'declined' ? 'No podré ir' : 'No podré ir'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nuestra Guía de Reunión en 4 Momentos (GOLD-280 / GOLD-281) */}
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  marginBottom: '28px',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      <BookOpen size={18} style={{ color: 'var(--accent-indigo)' }} />
                      <span>Nuestra Guía de Reunión (4 Momentos)</span>
                    </h4>
                    <button
                      type="button"
                      id="btn-pair-timer"
                      onClick={() => setPairTimer(pairTimer !== null ? null : 300)}
                      className={pairTimer !== null ? 'btn-primary' : 'btn-secondary'}
                      style={{
                        minHeight: '36px',
                        padding: '4px 12px',
                        fontSize: '0.78rem',
                        backgroundColor: pairTimer !== null ? 'var(--accent-rose)' : undefined,
                        borderColor: pairTimer !== null ? 'var(--accent-rose)' : undefined,
                      }}
                    >
                      <Timer size={14} />
                      <span>
                        {pairTimer !== null
                          ? `Parejas: ${Math.floor(pairTimer / 60)}:${(pairTimer % 60).toString().padStart(2, '0')}`
                          : 'Plática en parejas (5 min)'}
                      </span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', fontWeight: 700, display: 'block' }}>1. BIENVENIDA</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Acción de gracias</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>Rompehielo informal libre.</p>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-indigo)', fontWeight: 700, display: 'block' }}>2. PALABRA</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Lectura bíblica</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>Lectura compartida en voz alta.</p>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'block' }}>3. INTERCESIÓN</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Oración mutua</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>Unos por otros en parejas.</p>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', fontWeight: 700, display: 'block' }}>4. CONVIVENCIA</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Compartir alimentos</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>Refrigerio y comunión fraternal.</p>
                    </div>
                  </div>
                </div>

                {/* Muro de Intercesión Estructurada sin Difamación (GOLD-241 / Decisión 2-C) */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      <HeartHandshake size={18} style={{ color: 'var(--accent-emerald)' }} />
                      <span>Muro de Oración ({selectedGroupDetail.prayers?.length || 0})</span>
                    </h4>
                    <button
                      type="button"
                      id="btn-open-prayer-modal"
                      onClick={() => setShowPrayerModal(true)}
                      className="btn-secondary"
                      style={{ minHeight: '34px', padding: '4px 12px', fontSize: '0.8rem' }}
                    >
                      <Plus size={14} />
                      <span>Pedir Oración</span>
                    </button>
                  </div>

                  {(!selectedGroupDetail.prayers || selectedGroupDetail.prayers.length === 0) ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic', padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                      No hay motivos registrados esta semana. Las peticiones son categorizadas para proteger tu privacidad.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedGroupDetail.prayers.map((pr) => (
                        <div
                          key={pr.id}
                          style={{
                            padding: '10px 14px',
                            backgroundColor: 'var(--bg-primary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--accent-indigo-light)',
                              color: 'var(--accent-indigo)',
                              marginRight: '8px',
                            }}>
                              {pr.category}
                            </span>
                            <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{pr.author_name}</strong>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                              solicita intercesión por este motivo.
                            </span>
                          </div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {new Date(pr.created_at).toLocaleDateString('es-MX')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tablón de Avisos de la Temporada */}
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ fontSize: '1.15rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <FileText size={18} style={{ color: 'var(--accent-amber)' }} />
                    <span>Avisos de la Temporada</span>
                  </h4>

                  {selectedGroupDetail.notices.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                      No hay avisos recientes publicados por el líder.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedGroupDetail.notices.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.96rem', color: 'var(--text-primary)' }}>{n.titulo}</strong>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              {new Date(n.created_at).toLocaleDateString('es-MX')}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{n.contenido}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recursos Clave Fijados (Máximo 5) */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      <Link2 size={18} style={{ color: 'var(--accent-indigo)' }} />
                      <span>Recursos Clave ({selectedGroupDetail.resources?.length || 0}/5)</span>
                    </h4>
                    {isLeader && (
                      <button
                        type="button"
                        onClick={() => setShowResourceModal(true)}
                        disabled={(selectedGroupDetail.resources?.length || 0) >= 5}
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: (selectedGroupDetail.resources?.length || 0) >= 5 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Plus size={14} />
                        <span>Añadir</span>
                      </button>
                    )}
                  </div>

                  {(!selectedGroupDetail.resources || selectedGroupDetail.resources.length === 0) ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                      No hay enlaces fijados en esta edición.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedGroupDetail.resources.map((res) => (
                        <div
                          key={res.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              color: 'var(--accent-indigo)',
                              textDecoration: 'none',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}
                          >
                            <ExternalLink size={15} />
                            <span>{res.title}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', backgroundColor: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px' }}>
                              {res.link_type}
                            </span>
                          </a>

                          {isLeader && (
                            <button
                              type="button"
                              onClick={() => handleDeleteResource(res.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent-rose)',
                                cursor: 'pointer',
                                padding: '6px',
                              }}
                              title="Eliminar recurso"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🌱 CAMINO DE DISCIPULADO INTENCIONAL (GOLD-262 / Confinado a Líder GOLD-334) */}
                {isLeader && (
                  <div style={{
                    marginBottom: '28px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1.5px solid var(--accent-amber)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <Users size={18} style={{ color: 'var(--accent-amber)' }} />
                        <span>Camino de Discipulado y Formación de Siervos</span>
                      </h4>
                      {isLeader && (
                        <button
                          type="button"
                          onClick={openDiscipleModal}
                          className="btn-secondary"
                          style={{ minHeight: '32px', padding: '4px 12px', fontSize: '0.8rem' }}
                        >
                          <Plus size={13} />
                          <span>{discipleshipTrack ? 'Editar Discípulo' : 'Asignar Discípulo'}</span>
                        </button>
                      )}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                      En la iglesia de amor y gracia formamos a futuros facilitadores caminando juntos en paridad fraterna, sin verticalidad ni títulos de jerarquía humana.
                    </p>

                    {discipleshipTrack ? (
                      <div style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <MonogramAvatar name={discipleshipTrack.disciple_name} size="md" />
                            <div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {discipleshipTrack.disciple_name}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Discípulo Acompañado • {discipleshipTrack.seasons_completed} temporada(s) concluidas
                              </div>
                            </div>
                          </div>

                          <span className={`badge ${
                            discipleshipTrack.endorsed_for_launch
                              ? 'badge-emerald'
                              : discipleshipTrack.stage === 'co_facilitator'
                              ? 'badge-amber'
                              : 'badge-indigo'
                          }`}>
                            {discipleshipTrack.endorsed_for_launch
                              ? 'Listo para Envío Ministerial'
                              : discipleshipTrack.stage === 'co_facilitator'
                              ? 'Co-facilitador Activo'
                              : 'Observador de Modelo'}
                          </span>
                        </div>

                        {/* Línea de Progresión Fraterna */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '14px 0' }}>
                          <div style={{
                            padding: '10px',
                            borderRadius: 'var(--radius-sm)',
                            textAlign: 'center',
                            backgroundColor: 'var(--bg-primary)',
                            border: discipleshipTrack.stage === 'observer' ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                          }}>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fase 1</div>
                            <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>Observador</strong>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Aprende la dinámica</div>
                          </div>

                          <div style={{
                            padding: '10px',
                            borderRadius: 'var(--radius-sm)',
                            textAlign: 'center',
                            backgroundColor: 'var(--bg-primary)',
                            border: discipleshipTrack.stage === 'co_facilitator' ? '2px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                          }}>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fase 2</div>
                            <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>Co-facilitador</strong>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Modera dinámicas</div>
                          </div>

                          <div style={{
                            padding: '10px',
                            borderRadius: 'var(--radius-sm)',
                            textAlign: 'center',
                            backgroundColor: 'var(--bg-primary)',
                            border: discipleshipTrack.endorsed_for_launch ? '2px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                          }}>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fase 3</div>
                            <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>Envío Fraternal</strong>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Listo para multiplicar</div>
                          </div>
                        </div>

                        {/* Estado o Botón de Endoso Pastoral de Envío */}
                        {discipleshipTrack.endorsed_for_launch ? (
                          <div style={{
                            backgroundColor: 'var(--accent-emerald-light)',
                            border: '1px solid var(--accent-emerald-border)',
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--accent-emerald)',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <CheckCircle size={18} />
                            <span>Endoso Pastoral de Envío emitido. {discipleshipTrack.disciple_name} está preparado para plantar una nueva célula.</span>
                          </div>
                        ) : isLeader ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              ¿El discípulo ha demostrado madurez y gracia guiando las reuniones?
                            </span>
                            <button
                              type="button"
                              onClick={handleEndorseDisciple}
                              disabled={endorsingDisciple}
                              className="btn-primary"
                              style={{
                                backgroundColor: 'var(--accent-emerald)',
                                borderColor: 'var(--accent-emerald)',
                                minHeight: '36px',
                                padding: '6px 16px',
                                fontSize: '0.84rem',
                              }}
                            >
                              <Sparkles size={14} />
                              <span>{endorsingDisciple ? 'Emitiendo...' : 'Emitir Endoso Pastoral de Envío'}</span>
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div style={{
                        padding: '16px',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.88rem',
                      }}>
                        <span>No se ha registrado aún a un discípulo en acompañamiento para esta célula.</span>
                        {isLeader && (
                          <div style={{ marginTop: '10px' }}>
                            <button
                              type="button"
                              onClick={openDiscipleModal}
                              className="btn-primary"
                              style={{ minHeight: '34px', padding: '6px 14px', fontSize: '0.82rem' }}
                            >
                              <Plus size={14} />
                              <span>Registrar Discípulo en Formación</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 📖 CURRÍCULO LITÚRGICO CURADO SEMANAL (GOLD-277) */}
                <div style={{
                  marginBottom: '28px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1.5px solid var(--accent-emerald)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      <BookOpen size={18} style={{ color: 'var(--accent-emerald)' }} />
                      <span>Guía y Temas Semanales • Amor y Gracia Durango</span>
                    </h4>
                    <span className="badge-pill" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      {curatedCurriculum ? `Semana ${curatedCurriculum.week_number}` : 'Currículo Activo'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                    Guía semanal homologada para todas las células de los 5 Macro-Campuses en Durango. El facilitador modera la conversación basada en las Escrituras sin crear doctrinas aisladas.
                  </p>

                  <div style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--accent-emerald)', fontWeight: 800, letterSpacing: '0.05em' }}>
                        {curatedCurriculum?.scripture_passage || '1 Tesalonicenses 4:11-12'}
                      </div>
                      <h5 style={{ fontSize: '1.2rem', margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
                        {curatedCurriculum?.title || 'Vivir en Paz y Trabajar en Quietud (Testimonio Vecinal en Durango)'}
                      </h5>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {curatedCurriculum?.pastoral_notes || 'El amor fraternal no es un sentimiento abstracto: se manifiesta en cómo nos conducimos con los vecinos de nuestra cuadra, cuidando los decibeles nocturnos y la cortesía ciudadana.'}
                      </div>
                    </div>

                    {/* Pregunta para Dinámica en Parejas (5 min) */}
                    <div style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(99, 102, 241, 0.05)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-indigo)' }}>
                          Pregunta para la Dinámica en Parejas (5 Minutos)
                        </span>
                        <button
                          type="button"
                          onClick={() => setPairTimer(300)}
                          className="btn-secondary"
                          style={{ minHeight: '28px', padding: '2px 10px', fontSize: '0.74rem' }}
                        >
                          <Timer size={12} />
                          <span>{pairTimer !== null ? `${Math.floor(pairTimer / 60)}:${(pairTimer % 60).toString().padStart(2, '0')}` : 'Iniciar Timer 5 min'}</span>
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', fontStyle: 'italic' }}>
                        "{curatedCurriculum?.pair_share_question || '¿En qué área de tu vida cotidiana o vecinal te cuesta más trabajo mantener la paz y el buen testimonio con quienes no conocen a Dios?'}"
                      </p>
                    </div>

                    {/* Video Prompt URL */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        <Video size={16} style={{ color: 'var(--accent-amber)' }} />
                        <span>Disparador en Video (Pastor Josh García • 3 min)</span>
                      </div>
                      <a
                        href={curatedCurriculum?.video_prompt_url || 'https://amorygracia.mx/video-prompt-semana4'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{
                          minHeight: '32px',
                          padding: '4px 14px',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#0F172A',
                          color: '#FEF3C7',
                        }}
                      >
                        <Play size={13} />
                        <span>Ver Video Disparador</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* 🛌 RADAR DE FATIGA DEL ANFITRIÓN Y SABÁTICO SAGRADO (GOLD-275 / Confinado a Líder GOLD-334) */}
                {isLeader && (
                  <div style={{
                    marginBottom: '28px',
                    backgroundColor: 'var(--bg-primary)',
                    border: (hostSabbatical?.consecutive_seasons || 1) >= 2 && !hostSabbatical?.is_on_sabbatical ? '1.5px solid #F59E0B' : '1.5px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <Home size={18} style={{ color: '#F59E0B' }} />
                        <span>Cuidado del Anfitrión y Descanso Sabático</span>
                      </h4>
                      <span className="badge-pill" style={{
                        backgroundColor: hostSabbatical?.is_on_sabbatical ? 'rgba(16, 185, 129, 0.1)' : (hostSabbatical?.consecutive_seasons || 1) >= 2 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        color: hostSabbatical?.is_on_sabbatical ? '#10B981' : (hostSabbatical?.consecutive_seasons || 1) >= 2 ? '#D97706' : '#6366F1',
                      }}>
                        {hostSabbatical?.is_on_sabbatical ? 'En Sabático Sagrado' : `${hostSabbatical?.consecutive_seasons || 2} temporadas de servicio`}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                      Ningún hogar en Durango debe sufrir desgaste continuo. Tras 2 temporadas consecutivas abriendo sus puertas, el anfitrión tiene derecho reglamentario a descansar una temporada completa sin culpa.
                    </p>

                    <div style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Hogar Anfitrión: {selectedGroupDetail.host_reference || 'Hogar Registrado'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {hostSabbatical?.is_on_sabbatical
                            ? 'Descanso activo otorgado por el Presbiterio. Célula en sede alterna temporal.'
                            : (hostSabbatical?.consecutive_seasons || 2) >= 2
                            ? 'Umbral de hospitalidad continua alcanzado (2 temporadas). Se recomienda sabático.'
                            : 'Hospitalidad en balance saludable (Temporada 1).'}
                        </div>
                      </div>

                      {!hostSabbatical?.is_on_sabbatical && (
                        <button
                          type="button"
                          onClick={handleRequestHostSabbatical}
                          className="btn-secondary"
                          style={{
                            borderColor: '#D97706',
                            color: '#D97706',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            minHeight: '34px',
                            padding: '6px 14px',
                          }}
                        >
                          Solicitar Descanso Sabático (1 Temporada)
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 🌱 FISIÓN CELULAR POR UMBRAL DE DUNBAR (GOLD-279 / Confinado a Líder GOLD-334) */}
                {isLeader && (
                  <div style={{
                    marginBottom: '28px',
                    backgroundColor: 'var(--bg-primary)',
                    border: selectedGroupDetail.members.length >= 14 ? '1.5px solid #10B981' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <GitBranch size={18} style={{ color: '#10B981' }} />
                        <span>Fisión Celular con Núcleo Semilla (Umbral Dunbar N ≥ 14)</span>
                      </h4>
                      <span className="badge-pill" style={{
                        backgroundColor: selectedGroupDetail.members.length >= 14 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: selectedGroupDetail.members.length >= 14 ? '#10B981' : 'var(--text-muted)',
                      }}>
                        {selectedGroupDetail.members.length} Miembros Activos
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                      Al superar los 14 integrantes se activa la fisión celular planificada para preservar la intimidad relacional. La célula no se fragmenta al azar: el Aprendiz Facilitador sale con un <strong>Núcleo Semilla de 3 a 4 miembros</strong> para plantar una nueva comunidad en Durango.
                    </p>

                    {fissionResult ? (
                      <div style={{
                        padding: '14px 16px',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        color: '#10B981',
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: 600,
                      }}>
                        <CheckCircle size={18} />
                        <span>
                          Fisión completada exitosamente. Célula hija plantada con {fissionResult.child_initial_count} miembros fundadores. Célula madre queda con {fissionResult.parent_remaining_count} miembros.
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                          {selectedGroupDetail.members.length >= 14
                            ? 'Umbral de 14 miembros: Tu grupo está preparado para planear la multiplicación fraternal en el Cierre de Temporada.'
                            : 'Crecimiento natural hacia la bendición de multiplicación.'}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 🤝 CIERRE FRATERNO DE TEMPORADA (GOLD-264) */}
                <div style={{
                  marginBottom: '28px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1.5px solid var(--accent-indigo)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      <HeartHandshake size={18} style={{ color: 'var(--accent-indigo)' }} />
                      <span>Cierre Fraterno de Temporada</span>
                    </h4>
                    {isLeader && (
                      <button
                        type="button"
                        onClick={() => setShowClosureModal(true)}
                        className="btn-secondary"
                        style={{ minHeight: '32px', padding: '4px 12px', fontSize: '0.8rem' }}
                      >
                        <span>{seasonClosure ? 'Modificar Pacto' : 'Asentar Pacto de Cierre'}</span>
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                    Hacia las últimas semanas de la temporada, la comunidad conversa abiertamente para discernir si continuarán juntos, se multiplicarán fraternalmente o tomarán un descanso sabático.
                  </p>

                  {seasonClosure ? (
                    <div style={{
                      backgroundColor: 'var(--bg-surface)',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span className={`badge ${
                          seasonClosure.closure_decision === 'multiply_with_disciple'
                            ? 'badge-emerald'
                            : seasonClosure.closure_decision === 'continue_same'
                            ? 'badge-indigo'
                            : 'badge-amber'
                        }`}>
                          {seasonClosure.closure_decision === 'multiply_with_disciple'
                            ? 'Multiplicación con Discípulo'
                            : seasonClosure.closure_decision === 'continue_same'
                            ? 'Continuar Misma Célula'
                            : 'Descanso Sabático Fraterno'}
                        </span>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          Pacto Acordado para la Próxima Temporada
                        </strong>
                      </div>
                      {isLeader && (seasonClosure.closure_decision === 'multiply_with_disciple' || selectedGroupDetail.members.length >= 14) && (
                        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            id="btn-launch-fission-closure"
                            onClick={() => {
                              setFissionApprenticeName(selectedGroupDetail.apprentice_name || '');
                              setFissionNewGroupName(`Célula ${selectedGroupDetail.nombre_publico} - Norte`);
                              setShowFissionModal(true);
                            }}
                            className="btn-primary"
                            style={{
                              minHeight: '36px',
                              padding: '6px 14px',
                              fontSize: '0.82rem',
                              backgroundColor: '#10B981',
                              borderColor: '#10B981',
                            }}
                          >
                            <GitBranch size={14} />
                            <span>Iniciar Fisión Celular Dunbar con Núcleo Semilla</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      padding: '14px 16px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        {isLeader
                          ? 'El pacto de cierre aún no ha sido asentado para esta temporada.'
                          : 'Al acercarse el final del ciclo platicaremos juntos los siguientes pasos.'}
                      </span>
                      {isLeader && (
                        <button
                          type="button"
                          onClick={() => setShowClosureModal(true)}
                          className="btn-primary"
                          style={{ minHeight: '34px', padding: '6px 14px', fontSize: '0.82rem' }}
                        >
                          <CheckCircle size={14} />
                          <span>Asentar Decisión Comunitaria</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* ITINERARIO NÓMADA Y SEDES SEMANALES (GOLD-261 / GOLD-269) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      <Calendar size={18} style={{ color: 'var(--accent-emerald)' }} />
                      <span>Sedes y Rotación Semanal</span>
                    </h4>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => subscribeToCalendarFeed(selectedGroupDetail.id)}
                        className="btn-secondary"
                        style={{ minHeight: '34px', padding: '4px 12px', fontSize: '0.8rem', color: 'var(--accent-amber)' }}
                        title="Suscripción auto-actualizable webcal:// que se actualiza cuando cambie la taquería o la casa anfitriona"
                      >
                        <Calendar size={13} />
                        <span>Sincronizar Celular (webcal://)</span>
                      </button>

                      {isLeader && (
                        <button
                          type="button"
                          onClick={() => setShowNomadicVenueModal(true)}
                          className="btn-primary"
                          style={{ minHeight: '34px', padding: '4px 12px', fontSize: '0.8rem' }}
                        >
                          <Plus size={13} />
                          <span>Programar Sede</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                    {selectedGroupDetail.schedule.map((item, idx) => {
                      const weekNum = idx + 1;
                      const customVenue = sessionVenues.find((v) => v.week_number === weekNum);
                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: item.is_cancelled
                              ? 'var(--accent-rose-light)'
                              : customVenue
                              ? 'var(--accent-amber-light)'
                              : 'var(--bg-primary)',
                            border: item.is_cancelled
                              ? '1px solid var(--accent-rose)'
                              : customVenue
                              ? '1.5px solid var(--accent-amber)'
                              : '1px solid var(--border-subtle)',
                            fontSize: '0.84rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                              Semana {weekNum} • {item.date}
                            </span>
                            <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{item.time}</span>
                          </div>

                          {customVenue ? (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span className={customVenue.venue_type === 'public_venue' ? 'badge badge-emerald' : 'badge badge-amber'}>
                                  {customVenue.venue_type === 'public_venue' ? 'Taquería / Público' : 'Casa Rotativa'}
                                </span>
                                <strong style={{ color: 'var(--text-primary)' }}>{customVenue.venue_name}</strong>
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                                {customVenue.address}
                              </div>
                              {customVenue.host_name && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', marginTop: '2px', fontWeight: 600 }}>
                                  Anfitrión: {customVenue.host_name} {customVenue.host_phone ? `(${customVenue.host_phone})` : ''}
                                </div>
                              )}
                              {customVenue.notes && (
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                                  Nota: {customVenue.notes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                              {item.location_summary}
                            </div>
                          )}

                          {item.is_cancelled && (
                            <div style={{ color: 'var(--accent-rose)', fontSize: '0.78rem', marginTop: '4px', fontWeight: 700 }}>
                              Sesión Cancelada
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            </div>
          ) : (
            <div className="surface-card" style={{ padding: '40px', textAlign: 'center' }}>
              No tienes ningún grupo activo asignado.
            </div>
          )}
        </div>

        {/* Columna Derecha: Compañeros del Grupo y Memoria Histórica */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {selectedGroupDetail && (
            <div className="surface-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <Users size={18} style={{ color: 'var(--accent-emerald)' }} />
                  <span>Compañeros ({selectedGroupDetail.members.length})</span>
                </h4>
              </div>

              {/* Interruptor de Privacidad Voluntaria */}
              <div style={{
                backgroundColor: 'var(--accent-indigo-light)',
                border: '1px solid var(--accent-indigo)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                marginBottom: '16px',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.84rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedGroupDetail.my_contact_visibility === 'edition_members'}
                    disabled={updatingPrivacy}
                    onChange={(e) => handleTogglePrivacy(e.target.checked ? 'edition_members' : 'hidden')}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    Compartir mi WhatsApp con el grupo
                  </span>
                </label>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px', paddingLeft: '28px' }}>
                  {selectedGroupDetail.my_contact_visibility === 'edition_members'
                    ? 'Tu número de teléfono es visible para los integrantes de tu grupo.'
                    : 'Tu número de teléfono está protegido y sólo es visible para el líder.'}
                </div>
              </div>

              {/* Lista de Miembros */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedGroupDetail.members.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MonogramAvatar name={m.name} size="sm" />
                      <div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: m.is_responsible ? 800 : 600 }}>
                          {m.name}
                        </span>
                        {m.is_responsible && (
                          <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: 'var(--accent-amber)', backgroundColor: 'var(--accent-amber-light)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            Líder
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {/* Salvaguarda de Menores (GOLD-306): Chat 1:1 privado con adultos bloqueado por diseño */}
                      {m.age_category === 'nino' ? (
                        <span style={{ fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', border: '1px solid #475569' }}>
                          Dependiente tutelado
                        </span>
                      ) : m.age_category === 'adolescente' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setProtectedMinorName(m.name);
                            setShowMinorProtectionNotice(true);
                          }}
                          style={{
                            background: 'rgba(245, 158, 11, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            color: 'var(--accent-amber)',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                          }}
                          title="Salvaguarda de Menores: Chat directo 1:1 adulto-menor bloqueado por diseño"
                        >
                          <ShieldCheck size={12} />
                          <span>Canal Supervisado (Tutor)</span>
                        </button>
                      ) : m.phone && m.phone !== '(Privado)' ? (
                        <a
                          href={`https://wa.me/52${m.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.82rem',
                            color: 'var(--accent-emerald)',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                          }}
                        >
                          <MessageSquare size={13} />
                          <span>{m.phone}</span>
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={11} />
                          <span>Privado</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trayectoria Fraternal (GOLD-336 / 7-A) */}
          <div className="surface-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <History size={18} style={{ color: 'var(--accent-indigo)' }} />
              <span>Mis Grupos Anteriores</span>
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Memoria histórica de tus grupos en temporadas anteriores en Amor y Gracia Durango:
            </p>

            {profile?.trajectory && profile.trajectory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {profile.trajectory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ fontSize: '0.76rem', color: 'var(--accent-indigo)', fontWeight: 800, textTransform: 'uppercase' }}>
                      {item.season_name}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {item.group_name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <CheckCircle size={13} />
                      <span>Ciclo Concluido con Gratitud</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Esta es tu primera temporada activa en la iglesia.
              </div>
            )}
          </div>

          {/* Sección: Vida de la Iglesia y Servicio Comunitario (GOLD-320) */}
          <div style={{ marginTop: '28px' }}>
            <CommunityInitiativesHub publicShowcaseOnly={false} />
          </div>
        </div>
      </div>

      {/* Modal: Reportar Asistencia con Headcount Touch Stepper (GOLD-222 / Decisión 8-C) */}
      {showHeadcountModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '32px', position: 'relative' }}>
            <button
              onClick={() => setShowHeadcountModal(false)}
              aria-label="Cerrar modal"
              style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.45rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Reportar Asistencia de Sesión</h3>
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-emerald-light)',
              border: '1px solid var(--accent-emerald-border)',
              fontSize: '0.82rem',
              color: 'var(--accent-emerald)',
              marginBottom: '18px',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span><strong>Privacidad de Asistencia:</strong> Registra únicamente el número total de asistentes. No hay pase de lista individual ni fiscalización nominal.</span>
            </div>

            <form onSubmit={handleRecordHeadcount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Fecha de la Sesión
                </label>
                <input
                  type="date"
                  required
                  value={hcDate}
                  onChange={(e) => setHcDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Rangos Cualitativos en Gracia (GOLD-252) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Banda Estimada de Asistencia (Rangos en Gracia)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                  {[
                    { id: 'range_1_to_5', label: '1 a 5' },
                    { id: 'range_6_to_10', label: '6 a 10' },
                    { id: 'range_11_to_15', label: '11 a 15' },
                    { id: 'range_15_plus', label: '15+ (Masiva)' },
                  ].map((bin) => (
                    <button
                      key={bin.id}
                      type="button"
                      onClick={() => setHcRangeBin(bin.id)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 'var(--radius-sm)',
                        border: hcRangeBin === bin.id ? '2px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                        backgroundColor: hcRangeBin === bin.id ? 'var(--accent-amber-light)' : 'var(--bg-primary)',
                        color: hcRangeBin === bin.id ? 'var(--accent-amber)' : 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {bin.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pulso Espiritual de la Reunión (GOLD-252) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Pulso de la Reunión
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
                  {[
                    { id: 'peaceful', label: 'Tranquilo y en Paz' },
                    { id: 'edifying', label: 'Edificante y Fructífero' },
                    { id: 'vulnerable', label: 'Vulnerable e Íntimo' },
                    { id: 'support_needed', label: 'Necesita Apoyo' },
                  ].map((pulse) => (
                    <button
                      key={pulse.id}
                      type="button"
                      onClick={() => setHcMoodPulse(pulse.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: hcMoodPulse === pulse.id ? '2px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                        backgroundColor: hcMoodPulse === pulse.id ? 'var(--accent-emerald-light)' : 'var(--bg-primary)',
                        color: hcMoodPulse === pulse.id ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {pulse.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headcount Touch Stepper `[-] [ N ] [+]` sin bloqueo de cupo (soporta 30+) */}
              <div style={{ textAlign: 'center', padding: '10px 0', borderTop: '1px solid var(--border-subtle)' }}>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Conteo Específico (Opcional · Tolerancia Masiva 30+)
                </label>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setHcCount(Math.max(0, hcCount - 1))}
                    aria-label="Disminuir número"
                  >
                    —
                  </button>
                  <span className="stepper-value" style={{ minWidth: '70px', fontSize: '2rem' }}>
                    {hcCount}
                  </span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setHcCount(hcCount + 1)}
                    aria-label="Aumentar número"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={hcDidMeet}
                    onChange={(e) => setHcDidMeet(e.target.checked)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    ¿La sesión presencial se llevó a cabo?
                  </span>
                </label>
              </div>

              {/* Modo Convivio Fraternal Inter-Celular (GOLD-304) */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isJointMeeting ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-primary)',
                border: isJointMeeting ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} style={{ color: '#38bdf8' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ¿Fue un Convivio con Célula Hermana?
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    id="toggle-joint-meeting"
                    checked={isJointMeeting}
                    onChange={(e) => setIsJointMeeting(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
                {isJointMeeting && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Seleccionar Célula Hermana Participante (Asado / Vigilia / Convivio):
                    </label>
                    <select
                      value={jointPartnerGroupId}
                      onChange={(e) => setJointPartnerGroupId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value="">Selecciona célula afín...</option>
                      <option value="grp-varones-sur">Célula de Varones - Jardines / Valle del Sur</option>
                      <option value="grp-jovenes-centro">Célula de Jóvenes - Zona Centro</option>
                      <option value="grp-damas-norte">Célula Femenina - Fidel Velázquez</option>
                    </select>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.76rem', color: '#38bdf8', lineHeight: 1.3 }}>
                      ✓ Convivio acreditado a ambos grupos con lista consolidada y deduplicación automática de asistentes en el backend.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Observaciones Generales (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Tuvimos dos visitas nuevas del campus..."
                  value={hcNotes}
                  onChange={(e) => setHcNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
              >
                Guardar Reporte en 2 Segundos
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Publicar Aviso */}
      {showNoticeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowNoticeModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.45rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Publicar Aviso en el Tablón</h3>
            <form onSubmit={handleCreateNotice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Título del Aviso</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Recordatorio de cena compartida"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Mensaje para el grupo</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escribe los detalles que todos los miembros verán en su portal..."
                  value={noticeBody}
                  onChange={(e) => setNoticeBody(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '6px' }}>
                Publicar Inmediatamente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Añadir Recurso (Máximo 5) */}
      {showResourceModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowResourceModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.45rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Añadir Enlace de Recurso</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Límite de 5 recursos por edición para evitar dispersión y mantener enfoque.
            </p>
            <form onSubmit={handleAddResource} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Título del Recurso</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Guía de Estudio Semanal (PDF)"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>URL del Enlace</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Tipo de Recurso</label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                >
                  <option value="pdf">Documento PDF</option>
                  <option value="doc">Documento / Presentación</option>
                  <option value="video">Video / Grabación</option>
                  <option value="link">Sitio Web / Artículo</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '6px' }}>
                Fijar Recurso en la Célula
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Excepción de Sede */}
      {showExceptionModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowExceptionModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.45rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Registrar Excepción de Sede</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '18px' }}>
              Cambia la sede de una sesión específica (ej. reunión en taquería o café).
            </p>
            <form onSubmit={handleCreateException} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Fecha de la reunión</label>
                <input
                  type="date"
                  required
                  value={excDate}
                  onChange={(e) => setExcDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Tipo de Sede</label>
                <select
                  value={excVenueType}
                  onChange={(e) => setExcVenueType(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                >
                  <option value="public_venue">Lugar Público (Taquería, Café, Parque)</option>
                  <option value="private_home">Casa Particular Alterna</option>
                  <option value="online_session">Reunión Virtual</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Nombre del Lugar</label>
                <input
                  type="text"
                  placeholder="Ej. Taquería El Pastorcito"
                  value={excLocationName}
                  onChange={(e) => setExcLocationName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Dirección / Referencia GPS</label>
                <input
                  type="text"
                  placeholder="Ej. Blvd. Durango 102"
                  value={excAddress}
                  onChange={(e) => setExcAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>Nota Especial</label>
                <input
                  type="text"
                  placeholder="Ej. Llevar dinero para consumo individual"
                  value={excNote}
                  onChange={(e) => setExcNote(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '6px' }}>
                Guardar Excepción y Actualizar Pase
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pacto Comunitario de Temporada (GOLD-244 / Decisión 5-C) */}
      {showCovenantModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '540px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowCovenantModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <HeartHandshake size={24} style={{ color: 'var(--accent-amber)' }} />
              <h3 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-primary)' }}>Nuestro Compromiso de Amor y Respeto</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.4 }}>
              Este compromiso protege la confianza y la paz de cada hogar en Durango. Al reunirnos en este grupo, compartimos 4 acuerdos sencillos:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {ELENA_RAMOS_COMMITMENTS.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <strong style={{
                    fontSize: '0.9rem',
                    color: c.id === 1 ? 'var(--accent-amber)' : c.id === 2 ? 'var(--accent-emerald)' : c.id === 3 ? 'var(--accent-indigo)' : 'var(--accent-rose)',
                    display: 'block',
                    marginBottom: '3px',
                  }}>
                    {c.id}. {c.title}
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {c.description}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              id="btn-sign-covenant"
              onClick={handleSignCovenant}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Check size={18} />
              <span>{hasSignedCovenant ? 'Compromiso Confirmado (Cerrar)' : 'Confirmar Nuestro Compromiso de Amor y Respeto (1 Tap)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Petición de Oración Estructurada (GOLD-241 / Decisión 2-C) */}
      {showPrayerModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowPrayerModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <HeartHandshake size={24} style={{ color: 'var(--accent-emerald)' }} />
              <h3 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-primary)' }}>Pedir Oración Intercesora</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '16px', lineHeight: 1.4 }}>
              Selecciona el área en la que solicitas que tu grupo ore por ti.
            </p>

            <div style={{
              padding: '10px 12px',
              backgroundColor: 'var(--accent-emerald-light)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--accent-emerald-border)',
              marginBottom: '18px',
              fontSize: '0.78rem',
              color: 'var(--accent-emerald)',
            }}>
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              <strong>Tus datos están protegidos y son privados:</strong> Para cuidar tu intimidad y evitar rumores, las peticiones se registran únicamente por área, sin textos abiertos.
            </div>

            <form onSubmit={handleCreatePrayer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Categoría de Oración
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'salud', label: 'Salud y Sanidad' },
                    { id: 'trabajo', label: 'Trabajo y Finanzas' },
                    { id: 'familia', label: 'Familia y Hogar' },
                    { id: 'gratitud', label: 'Acción de Gracias' },
                    { id: 'direccion', label: 'Sabiduría y Dirección' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPrayerCategory(cat.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: prayerCategory === cat.id ? '2px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                        backgroundColor: prayerCategory === cat.id ? 'var(--accent-emerald-light)' : 'var(--bg-primary)',
                        color: prayerCategory === cat.id ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Motivo Comunitario (Etiqueta Pública)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Salud de Pedro / Examen de admisión de Sofía"
                  value={prayerPublicTag}
                  onChange={(e) => setPrayerPublicTag(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                  }}
                />
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <strong>Cero Secretos en Base de Datos:</strong> Este motivo es transparente para la oración comunitaria. Cualquier situación delicada, íntima o de consejería pastoral se atiende 1:1 en persona o mensaje directo fuera del sistema.
                </div>
              </div>

              <button
                type="submit"
                id="btn-submit-prayer"
                disabled={submittingPrayer}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              >
                {submittingPrayer ? 'Registrando...' : 'Publicar Motivo en el Muro'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Alerta Pastoral Silenciosa de Salvaguarda (GOLD-242 / Decisión 3-C) */}
      {showSafeguardModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '520px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowSafeguardModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <ShieldAlert size={26} style={{ color: '#EF4444' }} />
              <h3 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--text-primary)' }}>Salvaguarda Pastoral (Fast-Track)</h3>
            </div>

            {safeguardSuccess ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle size={52} style={{ color: 'var(--accent-emerald)', margin: '0 auto 16px auto' }} />
                <h4 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Alerta Enviada al Pastor de Turno</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
                  El equipo pastoral de guardia ha recibido tu notificación silenciosa con prioridad máxima. Un pastor se pondrá en contacto contigo de inmediato para orientarte en los pasos a seguir.
                </p>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '20px',
                  fontSize: '0.84rem',
                }}>
                  Línea Telefónica de Apoyo Pastoral Directo: <strong>+52 618 999 0000</strong>
                </div>
                <button onClick={() => setShowSafeguardModal(false)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Cerrar
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.4 }}>
                  Usa esta herramienta cuando un integrante de la célula exprese una crisis grave (violencia doméstica, ideación suicida o riesgo legal).
                </p>

                {/* Guía de Primeros Auxilios Emocionales en 3 Pasos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-amber)' }}>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'block' }}>
                      Paso 1: Escucha Empática sin Juicio
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Ofrece contención. No minimices el dolor ni intentes dar diagnósticos psicológicos o espirituales.
                    </span>
                  </div>

                  <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-rose)' }}>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'block' }}>
                      Paso 2: Transparencia Ética (No Prometer Secreto Absoluto)
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Aclara con cariño: "Te amo y te apoyo, pero ante un riesgo grave a tu vida o a otros, no puedo guardar silencio total; debo apoyarme con el pastor para cuidarte".
                    </span>
                  </div>

                  <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-indigo)' }}>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'block' }}>
                      Paso 3: Notificación Silenciosa Inmediata
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Al enviar esta alerta, el pastor de turno es notificado discretamente sin alertar al resto del grupo.
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                    Nivel de Urgencia
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSafeguardUrgency('high')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        border: safeguardUrgency === 'high' ? '2px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                        backgroundColor: safeguardUrgency === 'high' ? 'var(--accent-amber-light)' : 'var(--bg-primary)',
                        color: safeguardUrgency === 'high' ? 'var(--accent-amber)' : 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Alta (Crisis familiar o médica)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSafeguardUrgency('critical')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        border: safeguardUrgency === 'critical' ? '2px solid #EF4444' : '1px solid var(--border-subtle)',
                        backgroundColor: safeguardUrgency === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-primary)',
                        color: safeguardUrgency === 'critical' ? '#EF4444' : 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Crítica (Riesgo inminente o violencia)
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-confirm-safeguard"
                  onClick={handleSendSafeguardAlert}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <ShieldAlert size={18} />
                  <span>Enviar Alerta Silenciosa al Pastor de Turno</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal: Pase Comunitario Autónomo (GOLD-251) */}
      {showPassModal && selectedGroupDetail && (
        <ConnectionPassCard
          groupId={selectedGroupDetail.id}
          groupName={selectedGroupDetail.nombre_publico}
          facilitatorName={selectedGroupDetail.facilitator_name || 'Designado'}
          dayOfWeek={selectedGroupDetail.dia_habitual}
          timeStr={selectedGroupDetail.hora_habitual}
          venueName={selectedGroupDetail.venue_type === 'private_home' ? 'Casa particular' : 'Sede de reunión'}
          address={selectedGroupDetail.full_venue_address || 'Dirección de reunión'}
          hostName={selectedGroupDetail.host_reference}
          hostPhone={selectedGroupDetail.host_phone}
          kidsWelcome={selectedGroupDetail.kids_welcome}
          kidsSpaceType={selectedGroupDetail.kids_space_type}
          focusType={selectedGroupDetail.focus_type}
          audienceOrientation={selectedGroupDetail.audience_orientation}
          isMember={true}
          cellAccent={cellAccent}
          onClose={() => setShowPassModal(false)}
        />
      )}

      {/* Modal: Programación de Sede / Hogar Rotativo en Itinerario Nómada (GOLD-261) */}
      {showNomadicVenueModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowNomadicVenueModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Home size={24} style={{ color: 'var(--accent-amber)' }} />
              <h3 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--text-primary)' }}>Itinerario Nómada: Asignar Sede Semanal</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '20px', lineHeight: 1.4 }}>
              Define la sede, taquería o casa anfitriona para una de las 12 semanas de la temporada. Los hogares rotativos son parte natural del diseño de la célula.
            </p>

            <form onSubmit={handleCreateNomadicVenue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Semana de la Temporada
                  </label>
                  <select
                    value={nomadicWeek}
                    onChange={(e) => setNomadicWeek(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                      <option key={w} value={w}>Semana {w} de 12</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Tipo de Sede
                  </label>
                  <select
                    value={nomadicVenueType}
                    onChange={(e) => setNomadicVenueType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  >
                    <option value="private_home">Hogar Particular (Hogar Anfitrión)</option>
                    <option value="campus_room">Sala / Auditorio de Macro-Campus</option>
                    <option value="civic_cafe">Cafetería Cívica / Espacio Cultural</option>
                    <option value="public_park">Parque Público / Espacio Abierto</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Nombre del Lugar o Referencia
                </label>
                <input
                  type="text"
                  required
                  placeholder={nomadicVenueType === 'private_home' ? 'Ej. Casa Familia González / Hogar de Doña Martha' : 'Ej. Tacos El Pastor Suc. Centro / Café Victoria'}
                  value={nomadicVenueName}
                  onChange={(e) => setNomadicVenueName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Dirección Exacta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Calle, Número, Colonia, Durango"
                  value={nomadicAddress}
                  onChange={(e) => setNomadicAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                  }}
                />
                {nomadicVenueType === 'private_home' && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                    <strong>Privacidad Blindada:</strong> Al ser casa particular, la dirección y datos del anfitrión se enmascaran para visitantes públicos y sólo se revelan a miembros confirmados en su pase y calendario.
                  </div>
                )}
              </div>

              {nomadicVenueType === 'private_home' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Nombre del Anfitrión
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Hno. Roberto Gómez"
                      value={nomadicHostName}
                      onChange={(e) => setNomadicHostName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej. 618 123 4567"
                      value={nomadicHostPhone}
                      onChange={(e) => setNomadicHostPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Enlace de Google Maps (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  value={nomadicMapsUrl}
                  onChange={(e) => setNomadicMapsUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Notas de Logística o Bienvenida (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Tocar timbre blanco / Estacionamiento disponible en la esquina"
                  value={nomadicNotes}
                  onChange={(e) => setNomadicNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              >
                Guardar Sede en el Itinerario Nómada
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ajustes de Célula, Acento Noble y Hospitalidad (GOLD-258) */}
      {showCellSettingsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowCellSettingsModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Baby size={24} style={{ color: 'var(--accent-indigo)' }} />
              <h3 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--text-primary)' }}>Ajustes de Célula: Acento y Enfoque</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '20px', lineHeight: 1.4 }}>
              Personaliza el acento visual noble de tu grupo, la atención a niños y las orientaciones de hospitalidad.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Selector de Paleta Noble de la Célula */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Acento Cromático Noble de la Célula
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {NOBLE_PALETTES.map((pal) => {
                    const isSelected = cellAccent === pal.id;
                    return (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => setCellAccent(pal.id)}
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? `2.5px solid ${pal.border}` : '1px solid var(--border-subtle)',
                          backgroundColor: isSelected ? pal.bg : 'var(--bg-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: pal.bg, border: `1px solid ${pal.border}`, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? pal.text : 'var(--text-primary)' }}>
                          {pal.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enfoque del Grupo (No sólo por etapa de vida) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Tipo de Enfoque del Grupo
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: cellFocusType === 'life_stage' ? 'var(--accent-indigo-light)' : 'var(--bg-primary)',
                    border: cellFocusType === 'life_stage' ? '1.5px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="cellFocusType"
                      checked={cellFocusType === 'life_stage'}
                      onChange={() => setCellFocusType('life_stage')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)', display: 'block' }}>
                        Etapa de Vida
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Jóvenes universitarios, matrimonios y familias, profesionistas, adultos mayores.
                      </span>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: cellFocusType === 'common_interest' ? 'var(--accent-amber-light)' : 'var(--bg-primary)',
                    border: cellFocusType === 'common_interest' ? '1.5px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="cellFocusType"
                      checked={cellFocusType === 'common_interest'}
                      onChange={() => setCellFocusType('common_interest')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)', display: 'block' }}>
                        Interés en Común
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Viajeros y senderismo, café y literatura, running, arte, música o gastronomía.
                      </span>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: cellFocusType === 'foundational' ? 'var(--accent-emerald-light)' : 'var(--bg-primary)',
                    border: cellFocusType === 'foundational' ? '1.5px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="cellFocusType"
                      checked={cellFocusType === 'foundational'}
                      onChange={() => setCellFocusType('foundational')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)', display: 'block' }}>
                        Discipulado & Fundamentos
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Curso Alfa para nuevos creyentes, Mayordomía Cristiana, Fundamentos de la Fe (sin estatus elitista especial).
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Orientación de Audiencia y Hospitalidad */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Orientación de Audiencia (Etiqueta Orientativa de Hospitalidad)
                </label>
                <select
                  value={cellAudienceOrientation}
                  onChange={(e) => setCellAudienceOrientation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                  }}
                >
                  <option value="all_welcome">Abierto a Todos sin distinción</option>
                  <option value="women_oriented">Orientado a Mujeres (Etiqueta orientativa fraternal)</option>
                  <option value="men_oriented">Orientado a Hombres (Etiqueta orientativa fraternal)</option>
                  <option value="couples_and_families">Parejas y Familias (Sin exclusión de solteros ni viudos)</option>
                </select>

                <div style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--accent-indigo)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  marginTop: '8px',
                  lineHeight: 1.4,
                }}>
                  <strong>Hospitalidad en Amor y Gracia:</strong> Las etiquetas de género o etapa son orientativas para la dinámica de la reunión, nunca un candado algorítmico ni veto estricto. Si una persona del sexo opuesto o soltera solicita asistir, la líder/el líder conversará con cordialidad y tacto con ella para darle la bienvenida más propicia.
                </div>
              </div>

              {/* Hospitalidad Infantil */}
              <div style={{
                padding: '14px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={cellKidsWelcome}
                    onChange={(e) => setCellKidsWelcome(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    Niños y Familias Bienvenidos en esta Célula
                  </strong>
                </label>

                {cellKidsWelcome && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Tipo de Espacio Infantil Provisto
                    </label>
                    <select
                      value={cellKidsSpace}
                      onChange={(e) => setCellKidsSpace(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.84rem',
                      }}
                    >
                      <option value="play_area">Área de juegos y dinámicas supervisadas</option>
                      <option value="dedicated_room">Salón exclusivo con cuidador voluntario</option>
                      <option value="parent_accompanied">Integrados en la sala acompañados de sus padres</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCellSettingsModal(false);
                  setSiloToast('✓ Ajustes de acento noble, niños y orientación comunitaria guardados.');
                }}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Guardar Ajustes de Célula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ficha Social de Difusión Noble (GOLD-272) */}
      {showSocialModal && selectedGroupDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', position: 'relative' }}>
            <button
              onClick={() => setShowSocialModal(false)}
              aria-label="Cerrar modal"
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Ficha Social de Difusión
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Enlace enriquecido para invitar a amigos, vecinos o compañeros de trabajo con monograma y datos claros.
            </p>

            <GroupSocialCard
              groupId={selectedGroupDetail.id}
              groupName={selectedGroupDetail.nombre_publico}
              purpose={selectedGroupDetail.proposito || 'Comunidad y estudio de las Escrituras'}
              weekday={selectedGroupDetail.dia_habitual ?? 4}
              time={selectedGroupDetail.hora_habitual ?? '19:30'}
              macroZone={selectedGroupDetail.full_venue_address || 'Centro'}
              transitFriendly={true}
              carpoolAvailable={true}
              leaderName={profile?.nombre_visible}
            />
          </div>
        </div>
      )}

      {/* Modal: Asignar o Editar Discípulo en Formación (GOLD-262) */}
      {showDiscipleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', position: 'relative' }}>
            <button
              onClick={() => setShowDiscipleModal(false)}
              aria-label="Cerrar modal"
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Discipulado Intencional
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Todo facilitador camina junto a un discípulo en co-facilitación práctica para multiplicar la labor sin jerarquías ni burocracia.
            </p>

            <form onSubmit={handleUpsertDisciple} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Nombre del Hermano(a) en Formación
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Bernabé Morales"
                  value={discipleName}
                  onChange={(e) => setDiscipleName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Fase de Discipulado
                </label>
                <select
                  value={discipleStage}
                  onChange={(e) => setDiscipleStage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="observer">Fase 1: Observador de Modelo</option>
                  <option value="co_facilitator">Fase 2: Co-facilitador Activo</option>
                  <option value="ready_for_launch">Fase 3: Listo para Plantar y Envío</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Notas Pastorales / Observaciones de Crecimiento
                </label>
                <textarea
                  rows={3}
                  placeholder="Áreas de gracia observadas, disposición de servicio..."
                  value={discipleNotes}
                  onChange={(e) => setDiscipleNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
              >
                Guardar Registro de Discipulado
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pacto de Cierre Fraterno de Temporada (GOLD-264) */}
      {showClosureModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '28px', position: 'relative' }}>
            <button
              onClick={() => setShowClosureModal(false)}
              aria-label="Cerrar modal"
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Pacto de Cierre de Temporada
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Acuerdo fraterno acordado en diálogo transparente con el grupo hacia el final de la temporada.
            </p>

            <form onSubmit={handleRecordClosure} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Decisión Acordada
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'continue_same', label: 'Continuar misma célula', desc: 'Permanecemos juntos la próxima temporada para seguir profundizando.' },
                    { id: 'multiply_with_disciple', label: 'Multiplicación fraterna', desc: 'El discípulo abrirá una nueva célula hija; algunos miembros pueden acompañarle.' },
                    { id: 'sabbatical_rest', label: 'Descanso sabático fraternal', desc: 'Concluimos ciclo para descansar o integrarnos a ministerios de servicio dominical.' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      onClick={() => setClosureDecision(opt.id as SeasonClosureDecision)}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        border: closureDecision === opt.id ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                        backgroundColor: closureDecision === opt.id ? 'var(--accent-indigo-light)' : 'var(--bg-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{opt.label}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Notas Fraternales de Cierre
                </label>
                <textarea
                  rows={3}
                  placeholder="Testimonio de lo vivido, acuerdos de transición..."
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={recordingClosure}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
              >
                {recordingClosure ? 'Registrando...' : 'Asentar Pacto de Temporada'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Observación Conciliar al Diácono (GOLD-268 / Mateo 18) */}
      {showDeviationModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', position: 'relative' }}>
            <button
              onClick={() => setShowDeviationModal(false)}
              aria-label="Cerrar modal"
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Observación Pastoral al Diácono
            </h3>
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              lineHeight: 1.4,
            }}>
              <strong>Canal Fraterno Privado (Mateo 18):</strong> Esta inquietud se atiende en privado y con amor. Llega directamente al Diácono asignado para dialogar con sabiduría, buscando siempre la unidad, la edificación y la paz de la comunidad.
            </div>

            <form onSubmit={handleReportDeviation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Categoría de la Observación
                </label>
                <select
                  value={deviationCategory}
                  onChange={(e) => setDeviationCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="doctrinal_drift">Desviación Doctrinal o Enseñanzas Ajenas</option>
                  <option value="unhealthy_atmosphere">Ambiente Pesado, Falta de Edificación o Desánimo</option>
                  <option value="inappropriate_conduct">Conducta Inapropiada o Falta de Respeto</option>
                  <option value="other">Otra Inquietud Fraternal</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Descripción de lo Observado
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe con sobriedad y caridad fraternal la situación observada..."
                  value={deviationComments}
                  onChange={(e) => setDeviationComments(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingDeviation}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
              >
                {submittingDeviation ? 'Enviando...' : 'Enviar Observación al Diácono'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FISIÓN CELULAR CON NÚCLEO SEMILLA (GOLD-279) */}
      {showFissionModal && selectedGroupDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px',
        }}>
          <div className="surface-elevated animate-fade-in" style={{ maxWidth: '540px', width: '100%', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowFissionModal(false)}
              aria-label="Cerrar modal"
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#10B981' }}>
              <GitBranch size={24} />
              <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-primary)' }}>
                Fisión Celular con Núcleo Semilla
              </h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
              Multiplicación por Umbral de Dunbar (N ≥ 14). El Aprendiz Facilitador sale con un Núcleo Semilla de 3 a 4 miembros para fundar una nueva comunidad en Durango preservando el linaje eclesial.
            </p>

            <form onSubmit={handleExecuteDunbarFission} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Aprendiz Facilitador que Asume el Liderazgo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nombre del aprendiz"
                  value={fissionApprenticeName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFissionApprenticeName(name);
                    setFissionApprenticeId(`apprentice-${name.toLowerCase().trim().replace(/\s+/g, '_')}`);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Selección del Núcleo Semilla (3 a 4 miembros)
                  </label>
                  <span style={{ fontSize: '0.74rem', color: fissionSeedIds.length >= 3 ? '#10B981' : '#F59E0B', fontWeight: 700 }}>
                    {fissionSeedIds.length} seleccionados (mínimo 3)
                  </span>
                </div>

                <div style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  {selectedGroupDetail.members.map((m) => {
                    const mId = m.id || m.name;
                    const isChecked = fissionSeedIds.includes(mId);
                    return (
                      <label
                        key={mId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.84rem',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFissionSeedIds((prev) => [...prev, mId]);
                            } else {
                              setFissionSeedIds((prev) => prev.filter((id) => id !== mId));
                            }
                          }}
                        />
                        <span style={{ color: 'var(--text-primary)', fontWeight: isChecked ? 700 : 500 }}>
                          {m.name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {m.role || 'Miembro'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Nombre de la Nueva Célula Hija
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Célula Raíces - Zona Fidel Velázquez"
                  value={fissionNewGroupName}
                  onChange={(e) => setFissionNewGroupName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Macro-Zona
                  </label>
                  <select
                    value={fissionNewMacroZone}
                    onChange={(e) => setFissionNewMacroZone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                    }}
                  >
                    <option value="Centro">Centro</option>
                    <option value="Norte">Norte</option>
                    <option value="Sur">Sur</option>
                    <option value="Poniente">Poniente</option>
                    <option value="Oriente">Oriente</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Día Habitual
                  </label>
                  <select
                    value={fissionNewDay}
                    onChange={(e) => setFissionNewDay(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                    }}
                  >
                    <option value={2}>Martes</option>
                    <option value={3}>Miércoles</option>
                    <option value={4}>Jueves</option>
                    <option value={5}>Viernes</option>
                    <option value={6}>Sábado</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Hora
                  </label>
                  <input
                    type="time"
                    value={fissionNewTime}
                    onChange={(e) => setFissionNewTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={executingFission || fissionSeedIds.length < 3}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  backgroundColor: '#10B981',
                  borderColor: '#10B981',
                  marginTop: '8px',
                }}
              >
                {executingFission ? 'Consagrando y plantando...' : 'Consagrar y Ejecutar Fisión Celular'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ===================================================================
          BOTTOM SHEET ACTION DRAWER (GOLD-281 / Progressive Disclosure Vaul)
          =================================================================== */}
      {showActionDrawer && (
        <>
          <div
            className="bottom-sheet-backdrop"
            onClick={() => setShowActionDrawer(false)}
            aria-label="Cerrar menú de herramientas"
          />
          <div className="bottom-sheet-panel" role="dialog" aria-modal="true" aria-label="Herramientas del grupo">
            <div className="bottom-sheet-handle" onClick={() => setShowActionDrawer(false)} />
            
            <div style={{ padding: '8px 24px 28px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Herramientas del Grupo</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Acciones complementarias de comunión, cuidado y discipulado
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowActionDrawer(false)}
                  className="tap-target-44"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Categoría 1: Compartir e Invitar */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  Compartir e Invitar
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setShowActionDrawer(false); setShowPassModal(true); }}
                    className="btn-secondary tap-target-44"
                    style={{ justifyContent: 'flex-start', padding: '10px 14px', gap: '8px' }}
                  >
                    <CheckCircle size={16} style={{ color: 'var(--accent-amber)' }} />
                    <span style={{ fontSize: '0.84rem' }}>Pase de Acceso / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowActionDrawer(false); setShowSocialModal(true); }}
                    className="btn-secondary tap-target-44"
                    style={{ justifyContent: 'flex-start', padding: '10px 14px', gap: '8px' }}
                  >
                    <Share2 size={16} style={{ color: 'var(--accent-emerald)' }} />
                    <span style={{ fontSize: '0.84rem' }}>Ficha Social para Invitar</span>
                  </button>

                  {isLeader && (
                    <button
                      type="button"
                      onClick={() => { setShowActionDrawer(false); handleLeaderBroadcastWa(); }}
                      className="btn-secondary tap-target-44"
                      style={{ justifyContent: 'flex-start', padding: '10px 14px', gap: '8px' }}
                    >
                      <Share2 size={16} />
                      <span style={{ fontSize: '0.84rem' }}>Difusión por WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Categoría 2: Cuidado Fraterno y Acompañamiento */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  Acompañamiento Fraterno
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  <button
                    type="button"
                    id="btn-drawer-deacon-observation"
                    onClick={() => { setShowActionDrawer(false); setShowDeviationModal(true); }}
                    className="btn-secondary tap-target-44"
                    style={{ justifyContent: 'flex-start', padding: '10px 14px', gap: '8px' }}
                  >
                    <ShieldCheck size={16} style={{ color: 'var(--accent-indigo)' }} />
                    <span style={{ fontSize: '0.84rem' }}>Platicar con Diácono</span>
                  </button>

                  {isLeader && (
                    <button
                      type="button"
                      id="btn-drawer-safeguard-alert"
                      onClick={() => {
                        setShowActionDrawer(false);
                        setSafeguardSuccess(false);
                        setShowSafeguardModal(true);
                      }}
                      className="btn-secondary tap-target-44"
                      style={{
                        justifyContent: 'flex-start',
                        padding: '10px 14px',
                        gap: '8px',
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                        color: '#EF4444',
                      }}
                    >
                      <ShieldAlert size={16} />
                      <span style={{ fontSize: '0.84rem' }}>Alerta Pastoral Confidencial</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Categoría 3: Organización del Hogar */}
              {isLeader && (
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                    Organización del Hogar
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => { setShowActionDrawer(false); openDiscipleModal(); }}
                      className="btn-secondary tap-target-44"
                      style={{ justifyContent: 'flex-start', padding: '10px 14px', gap: '8px' }}
                    >
                      <Users size={16} style={{ color: 'var(--accent-amber)' }} />
                      <span style={{ fontSize: '0.84rem' }}>Discipulado y Relevo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowActionDrawer(false); setShowNomadicVenueModal(true); }}
                      className="btn-secondary tap-target-44"
                      style={{ justifyContent: 'flex-start', padding: '10px 14px', gap: '8px' }}
                    >
                      <Home size={16} />
                      <span style={{ fontSize: '0.84rem' }}>Sede de esta semana</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowActionDrawer(false); setShowExceptionModal(true); }}
                      className="btn-secondary tap-target-44"
                      style={{ justifyContent: 'flex-start', padding: '10px 14px', gap: '8px' }}
                    >
                      <Calendar size={16} />
                      <span style={{ fontSize: '0.84rem' }}>Cambiar Sede esta Semana</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowActionDrawer(false); setShowCellSettingsModal(true); }}
                      className="btn-secondary tap-target-44"
                      style={{ justifyContent: 'flex-start', padding: '10px 14px', gap: '8px' }}
                    >
                      <Baby size={16} />
                      <span style={{ fontSize: '0.84rem' }}>Espacio para niños</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowActionDrawer(false); setShowNoticeModal(true); }}
                      className="btn-secondary tap-target-44"
                      style={{ justifyContent: 'flex-start', padding: '10px 14px', gap: '8px' }}
                    >
                      <FileText size={16} />
                      <span style={{ fontSize: '0.84rem' }}>Aviso en el Tablón</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowActionDrawer(false); setShowHarmonizerModal(true); }}
                      className="btn-secondary tap-target-44"
                      style={{ justifyContent: 'flex-start', padding: '10px 14px', gap: '8px' }}
                    >
                      <Calendar size={16} style={{ color: '#38bdf8' }} />
                      <span style={{ fontSize: '0.84rem' }}>Armonizar con Calendario Magno</span>
                    </button>

                    <label className="btn-secondary tap-target-44" style={{ justifyContent: 'flex-start', padding: '10px 14px', gap: '8px', cursor: 'pointer' }}>
                      <Camera size={16} />
                      <span style={{ fontSize: '0.84rem' }}>{uploadingPhoto ? 'Limpiando...' : 'Subir Foto del Grupo'}</span>
                      <input type="file" accept="image/*" onChange={(e) => { setShowActionDrawer(false); handlePhotoUpload(e); }} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal: Armonizador Celular con Calendario Magno Litúrgico (GOLD-297) */}
      {showHarmonizerModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 17, 21, 0.75)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div className="surface-card animate-fade-in" style={{
            maxWidth: '650px',
            width: '100%',
            padding: '28px',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowHarmonizerModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
            <CellHarmonizer
              cellName={selectedGroupDetail?.nombre_publico || 'Nuestra Célula'}
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
          </div>
        </div>
      )}

      {/* Modal: Salvaguarda de Menores y Protección Fraternal (GOLD-306) */}
      {showMinorProtectionNotice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 17, 21, 0.8)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div className="surface-card animate-fade-in" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            position: 'relative',
            border: '2px solid rgba(245, 158, 11, 0.4)',
          }}>
            <button
              onClick={() => setShowMinorProtectionNotice(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              aria-label="Cerrar aviso"
            >
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-amber)',
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                Salvaguarda y Protección de Menores
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Por mandato de salvaguarda comunitaria y pastoral en Amor y Gracia Durango, los canales de mensajería privada 1:1 entre adultos y menores de edad (12 a 17 años) están <strong>bloqueados por diseño</strong>.
            </p>
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              borderLeft: '4px solid var(--accent-amber)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}>
              Cualquier comunicación formativa, de discipulado o logística con <strong>{protectedMinorName}</strong> debe realizarse en un canal supervisado que incluya de forma mandatoria al <strong>padre/madre/tutor</strong> o en presencia del <strong>Diácono de Sector</strong>.
            </div>
            <button
              type="button"
              onClick={() => setShowMinorProtectionNotice(false)}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Comprendido (Salvaguarda Fraternal)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
