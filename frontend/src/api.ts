import type {
  BoardAuditOverview,
  Campus,
  ChurchConfiguration,
  CuratedCurriculum,
  DeaconCareRoundtable,
  DeaconContactLog,
  DeaconGroupSummary,
  DiaconalVisit,
  DiscipleshipTrack,
  DunbarFissionResult,
  ElderAssignment,
  EldershipCouncil,
  EmeritusGuardian,
  GroupDetail,
  HostSabbatical,
  LeaderSummary,
  MeResponse,
  MinistryEnrollment,
  NeighborhoodComplaint,
  PastoralBroadcast,
  PastoralDeviation,
  PastorGroupRow,
  PastorOverview,
  PlantingSeedNucleus,
  PublicConfig,
  PublicEdition,
  RestrictedPairingItem,
  SafeguardAlertItem,
  SeasonClosure,
  SeasonClosureDecision,
  ServiceMinistry,
  SessionVenueItem,
  TenantSummary,
} from './types';

const BASE_URL = '/api';

export async function fetchPublicConfig(): Promise<PublicConfig> {
  const res = await fetch(`${BASE_URL}/config`);
  if (!res.ok) throw new Error('Error al cargar configuración pública');
  return res.json();
}

export async function fetchPublicCatalog(params?: {
  campus_slug?: string;
  affinity_id?: string;
  zone_id?: string;
  kids_welcome?: boolean;
  macro_zone?: string;
  transit_only?: boolean;
  token?: string;
}): Promise<PublicEdition[]> {
  const query = new URLSearchParams();
  if (params?.campus_slug) query.set('campus_slug', params.campus_slug);
  if (params?.affinity_id) query.set('affinity_id', params.affinity_id);
  if (params?.zone_id) query.set('zone_id', params.zone_id);
  if (params?.kids_welcome !== undefined) query.set('kids_welcome', String(params.kids_welcome));
  if (params?.macro_zone) query.set('macro_zone', params.macro_zone);
  if (params?.transit_only !== undefined) query.set('transit_only', String(params.transit_only));

  const headers: Record<string, string> = {};
  if (params?.token) {
    headers['Authorization'] = `Bearer ${params.token}`;
  }

  const res = await fetch(`${BASE_URL}/catalog?${query.toString()}`, { headers });
  if (!res.ok) throw new Error('Error al cargar catálogo de grupos');
  return res.json();
}

export async function submitJoinRequest(payload: {
  edition_id: string;
  name: string;
  whatsapp: string;
}): Promise<{ message: string; request_id: string }> {
  const res = await fetch(`${BASE_URL}/join-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al enviar solicitud de ingreso');
  return res.json();
}

export async function requestMagicLink(contact: string): Promise<{ token: string; message: string }> {
  const res = await fetch(`${BASE_URL}/auth/magic-link/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contact }),
  });
  if (!res.ok) throw new Error('Usuario o contacto no encontrado');
  return res.json();
}

export async function verifyMagicLink(token: string): Promise<{
  session_token: string;
  member_id: string;
  nombre_visible: string;
}> {
  const res = await fetch(`${BASE_URL}/auth/magic-link/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error('Enlace mágico inválido o expirado');
  return res.json();
}

export async function fetchMe(sessionToken: string): Promise<MeResponse> {
  const res = await fetch(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  if (!res.ok) throw new Error('Sesión inválida');
  return res.json();
}

export async function fetchGroupDetail(
  groupId: string,
  sessionToken: string
): Promise<GroupDetail> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  if (!res.ok) throw new Error('Error al cargar detalle del grupo');
  return res.json();
}

export async function createNotice(
  groupId: string,
  payload: { titulo: string; contenido: string },
  sessionToken: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/notices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al publicar aviso');
  return res.json();
}

export async function createMeetingException(
  groupId: string,
  payload: {
    date: string;
    venue_type: string;
    public_location_name?: string;
    private_address?: string;
    note?: string;
  },
  sessionToken: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/exceptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al registrar excepción de reunión');
  return res.json();
}

export async function uploadGroupPhoto(
  groupId: string,
  imageFile: File,
  sessionToken: string
): Promise<{ asset_id: string; message: string; bytes_clean: number }> {
  const arrayBuffer = await imageFile.arrayBuffer();
  const res = await fetch(`${BASE_URL}/groups/${groupId}/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: arrayBuffer,
  });
  if (!res.ok) throw new Error('Error al subir o sanitizar imagen');
  return res.json();
}

export async function fetchPastorOverview(): Promise<PastorOverview> {
  const res = await fetch(`${BASE_URL}/pastor/overview`);
  if (!res.ok) throw new Error('Error al cargar HUD pastoral');
  return res.json();
}

export async function fetchPastorGroups(): Promise<PastorGroupRow[]> {
  const res = await fetch(`${BASE_URL}/pastor/groups`);
  if (!res.ok) throw new Error('Error al cargar lista pastoral de grupos');
  return res.json();
}

export async function fetchPlatformTenants(): Promise<TenantSummary[]> {
  const res = await fetch(`${BASE_URL}/platform/tenants`);
  if (!res.ok) throw new Error('Error al cargar tenants del Control Plane');
  return res.json();
}

export async function suspendTenant(slug: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/platform/tenants/${slug}/suspend`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Error al suspender tenant');
}

export async function activateTenant(slug: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/platform/tenants/${slug}/activate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Error al activar tenant');
}

export async function createTenant(payload: {
  slug: string;
  church_name: string;
  domain?: string;
  naming?: string;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/platform/tenants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al crear tenant');
  return res.json();
}

export async function addResourceLink(
  groupId: string,
  payload: { title: string; url: string; link_type?: string; sort_order?: number },
  sessionToken: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/resources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al añadir enlace de recurso');
  }
  return res.json();
}

export async function deleteResourceLink(
  groupId: string,
  linkId: string,
  sessionToken: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/resources/${linkId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
  if (!res.ok) throw new Error('Error al eliminar enlace de recurso');
  return res.json();
}

export async function recordMeetingHeadcount(
  groupId: string,
  payload: {
    meeting_date: string;
    attendee_count: number;
    range_bin?: string;
    mood_pulse?: string;
    did_meet?: boolean;
    notes?: string;
  },
  sessionToken: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/headcount`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al registrar asistencia');
  }
  return res.json();
}

export async function updateContactVisibility(
  groupId: string,
  contactVisibility: 'hidden' | 'edition_members',
  sessionToken: string
): Promise<{ contact_visibility: string; message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/privacy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ contact_visibility: contactVisibility }),
  });
  if (!res.ok) throw new Error('Error al actualizar privacidad de contacto');
  return res.json();
}

export async function cloneEditionDraft(
  groupId: string,
  payload: { target_season_id?: string; cloned_by?: string; lineage_type?: string },
  sessionToken: string
): Promise<{ new_edition_id: string; status: string; message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/clone-draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al clonar edición a borrador');
  return res.json();
}

export async function createPrayerNeed(
  groupId: string,
  category: string,
  publicTag: string,
  sessionToken: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/prayers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ category, public_tag: publicTag }),
  });
  if (!res.ok) throw new Error('Error al registrar motivo de oración');
  return res.json();
}

export async function createSafeguardAlert(
  groupId: string,
  urgencyLevel: string,
  sessionToken: string
): Promise<{ alert_id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/safeguard-alert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ urgency_level: urgencyLevel }),
  });
  if (!res.ok) throw new Error('Error al reportar alerta pastoral de salvaguarda');
  return res.json();
}

export async function submitRsvp(
  groupId: string,
  meetingDate: string,
  status: 'attending' | 'not_attending',
  sessionToken: string
): Promise<{ message: string; catering_headcount_confirmed: number }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/rsvp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ meeting_date: meetingDate, status }),
  });
  if (!res.ok) throw new Error('Error al actualizar confirmación de asistencia');
  return res.json();
}

export async function exportGroupContacts(
  groupId: string,
  sessionToken: string
): Promise<any> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/export-contacts`, {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'La descarga masiva de directorio está restringida a HQ.');
  }
  return res.json();
}

export async function fetchSafeguardAlerts(): Promise<SafeguardAlertItem[]> {
  const res = await fetch(`${BASE_URL}/pastor/safeguards`);
  if (!res.ok) throw new Error('Error al listar alertas de salvaguarda');
  return res.json();
}

export async function triageSafeguardAlert(
  alertId: string,
  status: 'attended' | 'pending'
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/pastor/safeguards/${alertId}/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Error al atender alerta de salvaguarda');
  return res.json();
}

export async function fetchRestrictedPairings(): Promise<RestrictedPairingItem[]> {
  const res = await fetch(`${BASE_URL}/pastor/restricted-pairings`);
  if (!res.ok) throw new Error('Error al listar restricciones de pares');
  return res.json();
}

export async function createRestrictedPairing(payload: {
  phone_a: string;
  phone_b: string;
  reason_category: string;
}): Promise<RestrictedPairingItem> {
  const res = await fetch(`${BASE_URL}/pastor/restricted-pairings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al registrar restricción anti-colisión');
  return res.json();
}

// 🏛️ Gobernanza Teocéntrica (GOLD-254)
export async function vetoEdition(
  editionId: string,
  reason: string,
  sessionToken?: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/pastor/veto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify({ edition_id: editionId, reason }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al ejecutar veto pastoral');
  }
  return res.json();
}

export async function disciplineMember(
  memberId: string,
  action: string,
  reason: string,
  sessionToken?: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/pastor/discipline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify({ member_id: memberId, action, reason }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al aplicar disciplina pastoral');
  }
  return res.json();
}

// 📢 Transmisión Pastoral Masiva Unidireccional (GOLD-256)
export async function createPastoralBroadcast(
  payload: { title: string; message: string; priority?: string },
  sessionToken?: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/pastor/broadcasts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al emitir comunicado pastoral');
  return res.json();
}

export async function fetchActivePastoralBroadcasts(): Promise<PastoralBroadcast[]> {
  const res = await fetch(`${BASE_URL}/broadcasts`);
  if (!res.ok) return [];
  return res.json();
}

// 🏷️ Configuración de Iglesia y White-Labeling Noble (GOLD-255 & GOLD-257)
export async function fetchChurchConfig(): Promise<ChurchConfiguration> {
  const res = await fetch(`${BASE_URL}/church/config`);
  if (!res.ok) throw new Error('Error al cargar configuración de la iglesia');
  return res.json();
}

export async function updateChurchConfig(
  config: Partial<ChurchConfiguration>,
  sessionToken?: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/church/config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Error al actualizar configuración de la iglesia');
  return res.json();
}

// 🛡️ Rol Auditor del Consejo de Ancianos (GOLD-256 - Zero PII)
export async function fetchBoardAuditOverview(): Promise<BoardAuditOverview> {
  const res = await fetch(`${BASE_URL}/pastor/audit-overview`);
  if (!res.ok) throw new Error('Error al cargar auditoría del Consejo');
  return res.json();
}

// 📍 Itinerarios Nómadas y Sedes Rotativas (GOLD-261)
export async function fetchSessionVenues(
  groupId: string,
  sessionToken?: string
): Promise<SessionVenueItem[]> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/venues`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return [];
  return res.json();
}

export async function createSessionVenue(
  groupId: string,
  payload: {
    week_number: number;
    venue_name: string;
    address: string;
    maps_url?: string;
    notes?: string;
    venue_type?: string;
    host_name?: string;
    host_phone?: string;
  },
  sessionToken?: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/venues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al programar sede semanal');
  return res.json();
}

// 🤝 Administración de Líderes por el Pastor General (Pastoral Care & Management)
export async function fetchLeadersList(campusId?: string): Promise<LeaderSummary[]> {
  // Consulta a lista pastoral de grupos para derivar y administrar facilitadores
  const groups = await fetchPastorGroups().catch(() => []);
  const leaders: LeaderSummary[] = groups.map((g) => ({
    id: `ldr-${g.id}`,
    name: g.leader_name || 'Líder asignado',
    email: `${g.leader_name?.toLowerCase().replace(/\s+/g, '.') || 'lider'}@amorygracia.mx`,
    phone: '+52 618 100 2000',
    campus_name: g.zone || 'Campus Principal',
    assigned_group_name: g.nombre_publico,
    assigned_group_id: g.id,
    role: 'Facilitador de Célula',
    status: g.health_status === 'healthy' ? 'Activo / Acompañado' : 'Requiere Acompañamiento',
  }));

  if (campusId) {
    return leaders.filter((l) => l.campus_name.toLowerCase().includes(campusId.toLowerCase()));
  }
  return leaders;
}

// ---------------- Ciclo 5: Escala a 5,000 Miembros y Diaconado (GOLD-262 a GOLD-272) ----------------

// 🌱 Discipulado Intencional (GOLD-262)
export async function fetchDiscipleshipTrack(
  groupId: string,
  sessionToken?: string
): Promise<DiscipleshipTrack | null> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/discipleship`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return null;
  return res.json();
}

export async function upsertDiscipleshipTrack(
  groupId: string,
  payload: {
    disciple_member_id: string;
    disciple_name: string;
    stage?: string;
    notes?: string;
  },
  sessionToken?: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/discipleship`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al actualizar registro de discipulado');
  return res.json();
}

export async function endorseDisciple(
  groupId: string,
  notes?: string,
  sessionToken?: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/discipleship/endorse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error('Error al emitir endoso pastoral de envío');
  return res.json();
}

// 🛡️ Observaciones Doctrinales y Desviaciones Pastorales (GOLD-268 & GOLD-270)
export async function reportPastoralDeviation(
  groupId: string,
  payload: {
    category: string;
    description: string;
  },
  sessionToken?: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/deviations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al notificar observación pastoral');
  return res.json();
}

export async function fetchPastoralDeviations(
  status?: string,
  sessionToken?: string
): Promise<PastoralDeviation[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${BASE_URL}/deacon/deviations${query}`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return [];
  return res.json();
}

export async function resolvePastoralDeviation(
  deviationId: string,
  payload: {
    resolution_notes: string;
    conciliar_action_taken: boolean;
  },
  sessionToken?: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/deacon/deviations/${deviationId}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al resolver observación conciliar');
  return res.json();
}

// 🤝 Cierre Fraterno de Temporada (GOLD-264)
export async function fetchSeasonClosure(
  groupId: string,
  seasonNumber?: number,
  sessionToken?: string
): Promise<SeasonClosure | null> {
  const query = seasonNumber ? `?season_number=${seasonNumber}` : '';
  const res = await fetch(`${BASE_URL}/groups/${groupId}/season-closure${query}`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return null;
  return res.json();
}

export async function recordSeasonClosure(
  groupId: string,
  payload: {
    decision: SeasonClosureDecision;
    notes?: string;
    new_disciple_edition_id?: string;
    disciple_member_id?: string;
  },
  sessionToken?: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/season-closure`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al asentar pacto de cierre de temporada');
  return res.json();
}

// 🏛️ Diaconado y Acompañamiento Servidor (GOLD-263)
export async function assignDeaconToGroup(
  payload: {
    deacon_id: string;
    group_id: string;
    notes?: string;
  },
  sessionToken?: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/pastor/deacon-assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al asignar diácono a grupo');
  return res.json();
}

export async function fetchDeaconGroups(
  deaconId?: string,
  sessionToken?: string
): Promise<DeaconGroupSummary[]> {
  const query = deaconId ? `?deacon_id=${encodeURIComponent(deaconId)}` : '';
  const res = await fetch(`${BASE_URL}/deacon/groups${query}`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return [];
  return res.json();
}

export async function recordDeaconContactLog(
  payload: {
    deacon_id: string;
    group_id: string;
    contact_type: string;
    spiritual_temperature: string;
    notes?: string;
  },
  sessionToken?: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/deacon/contact-log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al asentar contacto diaconal');
  return res.json();
}

export async function fetchDeaconContactLogs(
  groupId?: string,
  deaconId?: string,
  sessionToken?: string
): Promise<DeaconContactLog[]> {
  const query = new URLSearchParams();
  if (groupId) query.set('group_id', groupId);
  if (deaconId) query.set('deacon_id', deaconId);
  const qStr = query.toString();
  const res = await fetch(`${BASE_URL}/deacon/contact-log${qStr ? `?${qStr}` : ''}`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return [];
  return res.json();
}

// 🏛️ Ministerios de Servicio Convocante (GOLD-265)
export async function fetchServiceMinistries(): Promise<ServiceMinistry[]> {
  const res = await fetch(`${BASE_URL}/ministries`);
  if (!res.ok) return [];
  return res.json();
}

export async function createServiceMinistry(
  payload: {
    name: string;
    description: string;
    leader_name?: string;
    category?: string;
  },
  sessionToken?: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/ministries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al registrar ministerio de servicio');
  return res.json();
}

export async function enrollServiceMinistry(
  ministryId: string,
  memberId: string,
  memberName: string,
  notes?: string
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${BASE_URL}/ministries/${ministryId}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_id: memberId, member_name: memberName, notes }),
  });
  if (!res.ok) throw new Error('Error al inscribirse en ministerio de servicio');
  return res.json();
}

export async function fetchMinistryEnrollments(
  ministryId?: string
): Promise<MinistryEnrollment[]> {
  const endpoint = ministryId ? `${BASE_URL}/ministries/${ministryId}/enrollments` : `${BASE_URL}/ministries/all/enrollments`;
  const res = await fetch(endpoint);
  if (!res.ok) return [];
  return res.json();
}

// ---------------- Multi-Campus, Presbiterio, Sabáticos y Escala 25,000 (Ciclo 6) ----------------

export async function fetchCampuses(): Promise<Campus[]> {
  const res = await fetch(`${BASE_URL}/campuses`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchCampus(id: string): Promise<Campus | null> {
  const res = await fetch(`${BASE_URL}/campuses/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchActiveCurriculum(week?: number): Promise<CuratedCurriculum | null> {
  const url = week ? `${BASE_URL}/curriculum/active?week=${week}` : `${BASE_URL}/curriculum/active`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export async function createCurriculum(
  payload: {
    season_name: string;
    week_number: number;
    title: string;
    scripture_passage: string;
    video_prompt_url: string;
    pair_share_question: string;
    pastoral_notes: string;
  },
  sessionToken?: string
): Promise<{ id: string }> {
  const res = await fetch(`${BASE_URL}/pastor/curriculum`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al registrar currículo litúrgico');
  return res.json();
}

export async function submitNeighborhoodComplaint(payload: {
  group_id?: string;
  colonia_name: string;
  reporter_contact?: string;
  category: string;
  comments: string;
}): Promise<{ message: string; complaint: NeighborhoodComplaint }> {
  const res = await fetch(`${BASE_URL}/neighborhood/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al enviar reporte de buena vecindad');
  return res.json();
}

export async function fetchNeighborhoodComplaints(
  status?: string,
  sessionToken?: string
): Promise<NeighborhoodComplaint[]> {
  const url = status ? `${BASE_URL}/pastor/neighborhood-complaints?status=${status}` : `${BASE_URL}/pastor/neighborhood-complaints`;
  const res = await fetch(url, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return [];
  return res.json();
}

export async function resolveNeighborhoodComplaint(
  id: string,
  resolution_notes: string,
  sessionToken?: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/pastor/neighborhood-complaints/${id}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify({ resolution_notes }),
  });
  if (!res.ok) throw new Error('Error al resolver reporte de buena vecindad');
  return res.json();
}

export async function fetchHostSabbatical(groupId: string): Promise<HostSabbatical | null> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/host-sabbatical`);
  if (!res.ok) return null;
  return res.json();
}

export async function recordHostSabbatical(
  groupId: string,
  payload: {
    host_name: string;
    consecutive_seasons: number;
    is_on_sabbatical: boolean;
    sabbatical_reason?: string;
    next_eligible_season?: string;
  },
  sessionToken?: string
): Promise<{ message: string; sabbatical: HostSabbatical }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/host-sabbatical`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al registrar descanso sabático del hogar');
  return res.json();
}

export async function executeDunbarFission(
  groupId: string,
  payload: PlantingSeedNucleus,
  sessionToken?: string
): Promise<{ message: string; result: DunbarFissionResult }> {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/dunbar-fission`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al ejecutar fisión celular por umbral de Dunbar');
  return res.json();
}

export async function fetchEldershipCouncils(sessionToken?: string): Promise<EldershipCouncil[]> {
  const res = await fetch(`${BASE_URL}/pastor/eldership-councils`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return [];
  return res.json();
}

export async function createEldershipCouncil(
  payload: {
    macro_zone: string;
    name: string;
    leader_name: string;
    active_deacon_count: number;
  },
  sessionToken?: string
): Promise<EldershipCouncil> {
  const res = await fetch(`${BASE_URL}/pastor/eldership-councils`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al fundar consejo presbiteral');
  return res.json();
}

export async function fetchElderDeacons(elderId: string, sessionToken?: string): Promise<ElderAssignment[]> {
  const res = await fetch(`${BASE_URL}/pastor/elders/${elderId}/deacons`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return [];
  return res.json();
}

export async function assignElderDeacon(
  payload: {
    council_id: string;
    elder_id: string;
    elder_name: string;
    deacon_id: string;
  },
  sessionToken?: string
): Promise<ElderAssignment> {
  const res = await fetch(`${BASE_URL}/pastor/elders/assign-deacon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al asignar diácono a anciano');
  return res.json();
}

export async function fetchDeaconRoundtables(
  councilId?: string,
  sessionToken?: string
): Promise<DeaconCareRoundtable[]> {
  const url = councilId ? `${BASE_URL}/pastor/deacon-roundtables?council_id=${councilId}` : `${BASE_URL}/pastor/deacon-roundtables`;
  const res = await fetch(url, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return [];
  return res.json();
}

export async function recordDeaconRoundtable(
  payload: {
    council_id: string;
    elder_id: string;
    attended_deacon_count: number;
    notes: string;
  },
  sessionToken?: string
): Promise<DeaconCareRoundtable> {
  const res = await fetch(`${BASE_URL}/pastor/deacon-roundtables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al registrar mesa redonda diaconal');
  return res.json();
}

export async function fetchFatigueRadar(sessionToken?: string): Promise<HostSabbatical[]> {
  const res = await fetch(`${BASE_URL}/pastor/fatigue-radar`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchEmeritusGuardians(sessionToken?: string): Promise<EmeritusGuardian[]> {
  const res = await fetch(`${BASE_URL}/pastor/emeritus-guardians`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return [];
  return res.json();
}

export async function enrollEmeritusGuardian(
  payload: {
    member_id: string;
    member_name: string;
    original_join_year: number;
    ministry_role: string;
    commissioned_by: string;
  },
  sessionToken?: string
): Promise<EmeritusGuardian> {
  const res = await fetch(`${BASE_URL}/pastor/emeritus-guardians`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al comisionar servidor emérito');
  return res.json();
}

export async function fetchDiaconalVisits(
  groupId?: string,
  sessionToken?: string
): Promise<DiaconalVisit[]> {
  const url = groupId ? `${BASE_URL}/deacon/visits?group_id=${groupId}` : `${BASE_URL}/deacon/visits`;
  const res = await fetch(url, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
  });
  if (!res.ok) return [];
  return res.json();
}

export async function recordDiaconalVisit(
  payload: {
    deacon_id: string;
    deacon_name: string;
    group_id: string;
    atmosphere_pulse: string;
    notes: string;
  },
  sessionToken?: string
): Promise<DiaconalVisit> {
  const res = await fetch(`${BASE_URL}/deacon/visits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al asentar visita diaconal');
  return res.json();
}

export async function escalatePastoralDeviation(
  id: string,
  payload: { elder_id: string; hours_until_deadline?: number },
  sessionToken?: string
): Promise<{ message: string; assigned_elder_id: string; sla_deadline: string }> {
  const res = await fetch(`${BASE_URL}/deacon/deviations/${id}/escalate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al escalar desviación pastoral');
  return res.json();
}
