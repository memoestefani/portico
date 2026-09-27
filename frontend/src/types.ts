export type RoleMode = 'public' | 'member' | 'leader' | 'pastor' | 'operator' | 'deacon' | 'elder';

export interface NamingScheme {
  singular: string;
  plural: string;
}

export interface CampusSummary {
  id: string;
  slug: string;
  nombre_publico: string;
  ciudad: string;
  address?: string | null;
  macro_zone?: string | null;
  capacity_per_service?: number | null;
  pastor_name?: string | null;
  atrium_welcome_lead?: string | null;
}

export interface Campus {
  id: string;
  organization_id: string;
  nombre_publico: string;
  ciudad: string;
  slug: string;
  sort_order: number;
  timezone: string;
  status: string;
  address?: string | null;
  macro_zone?: string | null;
  capacity_per_service?: number | null;
  pastor_name?: string | null;
  atrium_welcome_lead?: string | null;
}

export interface ItemSummary {
  id: string;
  label: string;
}

export interface SeasonSummary {
  id: string;
  nombre_publico: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface PublicConfig {
  church_name: string;
  slug: string;
  naming_scheme: NamingScheme;
  campuses: CampusSummary[];
  affinities: ItemSummary[];
  zones: ItemSummary[];
  active_season: SeasonSummary | null;
}

export interface PublicEdition {
  id: string;
  nombre_publico: string;
  proposito: string;
  affinity_name: string;
  zone_label: string;
  dia_habitual: number;
  hora_habitual: string;
  venue_category: string;
  location_summary: string;
  map_url: string | null;
  leader_name: string | null;
  facilitator_name?: string | null;
  host_reference?: string | null;
  apprentice_name?: string | null;
  is_full: boolean;
  aviso_breve: string | null;
  next_meeting_summary: string | null;
  kids_welcome: boolean;
  kids_space_type: string;
  rsvp_cutoff_hours?: number;
  focus_type?: 'life_stage' | 'common_interest' | 'foundational' | string;
  audience_orientation?: 'all_welcome' | 'women_oriented' | 'men_oriented' | 'young_adults' | 'couples_and_families' | string;
  interest_tags?: string[];
  transit_friendly?: boolean;
  carpool_available?: boolean;
  macro_zone?: string;
  campus_id?: string | null;
  consecutive_seasons_hosted?: number;
  venue_nature?: 'home' | 'campus_room' | 'civic_cafe' | 'public_park' | 'institutional';
  good_neighbor_pledge?: boolean;
  child_safeguarding_certified?: boolean;
  parent_group_id?: string | null;
  liaison_name?: string | null;
  liaison_role?: string | null;
  access_protocol?: string | null;
  venue_type?: string;
}

export interface LeaderSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  campus_name: string;
  assigned_group_name: string | null;
  assigned_group_id: string | null;
  role: string;
  status: string;
}

export interface MemberGroupSummary {
  id: string;
  nombre_publico: string;
  rol: string;
  dia_habitual: number;
  hora_habitual: string;
  whatsapp_chat_url: string | null;
  venue_address: string | null;
}

export interface PastGroupSummary {
  id: string;
  season_name: string;
  group_name: string;
  status: string;
}

export interface MeResponse {
  member_id: string;
  nombre_visible: string;
  active_groups: MemberGroupSummary[];
  trajectory: PastGroupSummary[];
}

export interface ResolvedMeetingItem {
  date: string;
  time: string;
  venue_type: string;
  location_summary: string;
  is_cancelled: boolean;
  note: string | null;
}

export interface NoticeItem {
  id: string;
  titulo: string;
  contenido: string;
  created_at: string;
}

export interface ResourceLinkItem {
  id: string;
  title: string;
  url: string;
  link_type: string;
  sort_order: number;
  created_at: string;
}

export interface HeadcountItem {
  id: string;
  meeting_date: string;
  attendee_count: number;
  range_bin?: string | null;
  mood_pulse?: string | null;
  did_meet: boolean;
  notes: string | null;
  created_at: string;
}

export interface FellowMemberItem {
  id?: string;
  name: string;
  phone: string | null;
  is_responsible: boolean;
  role?: string;
  age_category?: AgeCategory | null;
  sexo?: BiologicalSex | null;
}

export interface PrayerItem {
  id: string;
  category: string;
  public_tag: string;
  author_name: string;
  is_answered: boolean;
  created_at: string;
}

export interface SessionVenueItem {
  week_number: number;
  venue_name: string;
  address: string;
  maps_url: string | null;
  notes: string | null;
  venue_type: string;
  host_name: string | null;
  host_phone: string | null;
  is_joint_meeting?: boolean;
  partner_group_name?: string | null;
  is_retreat?: boolean;
  retreat_date_range?: string | null;
  arrival_notes?: string | null;
  time_override?: string | null;
}

export interface SafeguardAlertItem {
  id: string;
  edition_id: string;
  reporter_id: string;
  reporter_name: string;
  urgency_level: string;
  status: string;
  created_at: string;
}

export interface RestrictedPairingItem {
  id: string;
  phone_a: string;
  phone_b: string;
  reason_category: string;
  created_at: string;
}

export interface GroupDetail {
  id: string;
  nombre_publico: string;
  proposito: string;
  dia_habitual: number;
  hora_habitual: string;
  whatsapp_chat_url: string | null;
  full_venue_address: string | null;
  venue_type: string;
  host_reference: string | null;
  host_phone: string | null;
  facilitator_name: string | null;
  apprentice_name: string | null;
  kids_welcome: boolean;
  kids_space_type: string;
  rsvp_cutoff_hours: number;
  catering_headcount_confirmed: number;
  cell_accent: string | null;
  focus_type?: 'life_stage' | 'common_interest' | 'foundational' | string;
  audience_orientation?: 'all_welcome' | 'women_oriented' | 'men_oriented' | 'young_adults' | 'couples_and_families' | string;
  interest_tags?: string[];
  calendar_subscription_url: string;
  venues: SessionVenueItem[];
  prayers: PrayerItem[];
  aviso_breve: string | null;
  schedule: ResolvedMeetingItem[];
  notices: NoticeItem[];
  members: FellowMemberItem[];
  resources: ResourceLinkItem[];
  recent_headcounts: HeadcountItem[];
  is_responsible: boolean;
  my_contact_visibility: string;
}

export interface HealthSummary {
  healthy_green: number;
  attention_yellow: number;
  critical_red: number;
}

export interface PastorOverview {
  church_name: string;
  campus_name: string;
  active_season: string | null;
  total_groups: number;
  total_members: number;
  pending_join_requests: number;
  health_summary: HealthSummary;
}

export interface PastorGroupRow {
  id: string;
  nombre_publico: string;
  leader_name: string;
  affinity: string;
  zone: string;
  dia_habitual: number;
  hora_habitual: string;
  venue_type: string;
  cupo_orientativo: number;
  enrolled_count: number;
  pending_requests: number;
  health_status: string;
  split_suggestion: boolean;
  average_headcount: number | null;
  meetings_reported: number;
  focus_type?: string;
  audience_orientation?: string;
  responsible_name?: string | null;
  members_count?: number;
  host_phone?: string;
  meeting_day?: string;
}

export interface TenantSummary {
  id: string;
  slug: string;
  domain: string | null;
  church_name: string;
  license_status: string;
  naming_scheme: NamingScheme;
  group_count: number;
  member_count: number;
}

export interface PastoralBroadcast {
  id: string;
  sender_id: string;
  sender_name: string;
  title: string;
  message: string;
  priority: string;
  is_active: boolean;
  created_at: string;
}

export interface ChurchNomenclature {
  campus_singular: string;
  campus_plural: string;
  group_singular: string;
  group_plural: string;
  leader_title: string;
  host_title: string;
  meeting_term: string;
}

export interface ChurchConfiguration {
  id: string;
  nomenclature: ChurchNomenclature;
  brand_palette_id: string;
  season_name: string;
  season_motto: string;
  season_start_date: string | null;
  season_end_date: string | null;
  season_duration_weeks?: number;
  enable_deacon_system?: boolean;
  enable_eldership_system?: boolean;
  growth_target_members?: number;
  updated_at: string;
}

export interface BoardAuditOverview {
  church_name: string;
  total_active_editions: number;
  total_active_members: number;
  total_headcount_reported: number;
  health_summary: HealthSummary;
  total_congregations?: number;
  total_active_small_groups?: number;
  estimated_weekly_attendance?: number;
  active_pastoral_safeguards?: number;
  redacted_pii?: boolean;
}

// ---------------- Modelos de Dominio Ciclo 5 (GOLD-262 a GOLD-272) ----------------

export type DiscipleshipStage = 'observer' | 'co_facilitator' | 'ready_for_launch';

export interface DiscipleshipTrack {
  id: string;
  group_id: string;
  disciple_name: string;
  stage: DiscipleshipStage;
  seasons_completed: number;
  endorsed_for_launch: boolean;
  endorsed_at: string | null;
  updated_at: string;
}

export interface DeaconAssignment {
  id: string;
  deacon_id: string;
  deacon_name: string;
  group_id: string;
  created_at: string;
}

export interface DeaconContactLog {
  id: string;
  deacon_id: string;
  group_id: string;
  contact_type: 'call' | 'in_person' | 'whatsapp_message' | string;
  notes: string;
  created_at: string;
}

export interface DeaconGroupSummary {
  id: string;
  nombre_publico: string;
  proposito: string;
  dia_habitual: number;
  hora_habitual: string;
  responsible_member_id: string;
  cupo_orientativo: number;
  macro_zone?: string;
  venue_type: string;
  public_location_name?: string;
  host_reference?: string;
  host_phone?: string;
}

export interface PastoralDeviation {
  id: string;
  group_id: string;
  reporter_member_id: string;
  category: 'doctrinal_drift' | 'unhealthy_atmosphere' | 'inappropriate_conduct' | 'other' | string;
  comments: string;
  status: 'pending' | 'reviewed_by_deacon' | 'resolved' | string;
  sla_deadline?: string | null;
  assigned_elder_id?: string | null;
  created_at: string;
}

export type SeasonClosureDecision = 'continue_same' | 'multiply_with_disciple' | 'sabbatical_rest';

export interface SeasonClosure {
  id: string;
  group_id: string;
  season_name: string;
  closure_decision: SeasonClosureDecision;
  disciple_new_group_name?: string | null;
  notes: string;
  created_at: string;
}

export interface ServiceMinistry {
  id: string;
  name: string;
  description: string;
  category: 'welcome_atrium' | 'intercession' | 'host_coaching' | 'logistics' | string;
  leader_name: string;
  active: boolean;
}

export interface MinistryEnrollment {
  id: string;
  ministry_id: string;
  member_name: string;
  member_phone: string;
  notes?: string | null;
  created_at: string;
}

// ---------------- Modelos de Dominio Ciclo 6 (GOLD-273 a GOLD-279: Escala 25,000 y Multi-Campus) ----------------

export interface EldershipCouncil {
  id: string;
  macro_zone: string;
  name: string;
  leader_name: string;
  active_deacon_count: number;
  created_at: string;
}

export interface ElderAssignment {
  id: string;
  council_id: string;
  elder_id: string;
  elder_name: string;
  deacon_id: string;
  deacon_name?: string;
  created_at: string;
}

export interface DeaconCareRoundtable {
  id: string;
  council_id: string;
  elder_id: string;
  attended_deacon_count: number;
  notes: string;
  created_at: string;
}

export interface HostSabbatical {
  id: string;
  group_id: string;
  host_name: string;
  consecutive_seasons: number;
  is_on_sabbatical: boolean;
  sabbatical_reason?: string | null;
  next_eligible_season?: string | null;
  created_at: string;
}

export interface EmeritusGuardian {
  id: string;
  member_id: string;
  member_name: string;
  original_join_year: number;
  ministry_role: string;
  commissioned_by: string;
  commissioned_at: string;
}

export interface CuratedCurriculum {
  id: string;
  season_name: string;
  week_number: number;
  title: string;
  scripture_passage: string;
  video_prompt_url: string;
  pair_share_question: string;
  pastoral_notes: string;
  created_at: string;
}

export interface DiaconalVisit {
  id: string;
  deacon_id: string;
  deacon_name: string;
  group_id: string;
  visited_at: string;
  atmosphere_pulse: string;
  notes: string;
}

export interface NeighborhoodComplaint {
  id: string;
  group_id?: string | null;
  colonia_name: string;
  reporter_contact?: string | null;
  category: string;
  comments: string;
  status: 'pending' | 'in_progress' | 'resolved' | string;
  sla_deadline: string;
  resolution_notes?: string | null;
  created_at: string;
}

export interface PlantingSeedNucleus {
  parent_group_id: string;
  apprentice_id: string;
  apprentice_name: string;
  seed_member_ids: string[];
  seed_member_names: string[];
  new_group_name: string;
  new_macro_zone: string;
  new_dia_habitual: number;
  new_hora_habitual: string;
}

export interface DunbarFissionResult {
  parent_group_id: string;
  parent_remaining_count: number;
  child_group_id: string;
  child_initial_count: number;
  fission_date: string;
}

export type BiologicalSex = 'hombre' | 'mujer';
export type AgeCategory = 'adulto' | 'adolescente' | 'nino';

export interface LiturgicalPause {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  congregation_id: string;
}

export interface CommunityInitiative {
  id: string;
  title: string;
  category: 'servicio' | 'lectura_cultura' | 'convivencia' | 'apoyo_vecinal';
  date: string;
  meeting_point: string;
  coordinator_name: string;
  coordinator_phone: string;
  pledges: Array<{ item: string; committed_by: string; quantity: number }>;
  volunteers: Array<{ name: string; phone: string }>;
}

export interface InitiativeSuggestion {
  id: string;
  title: string;
  category: 'servicio' | 'lectura_cultura' | 'convivencia' | 'apoyo_vecinal';
  proposed_date: string;
  proposed_location: string;
  suggested_by_name: string;
  suggested_by_role: 'leader' | 'deacon';
  notes: string;
  status: 'pending' | 'converted' | 'discarded';
}

export interface JointMeetingLog {
  id: string;
  host_group_id: string;
  guest_group_id: string;
  date: string;
  notes?: string | null;
  attendee_ids: string[];
}

export interface DeaconSabbaticalGrant {
  id: string;
  group_id: string;
  deacon_id: string;
  deacon_name: string;
  weeks: number;
  reason: string;
  granted_at: string;
}

export interface PastorCollisionDispute {
  id: string;
  member_id: string;
  member_name: string;
  member_phone: string;
  source_group_id: string;
  source_group_name: string;
  target_group_id: string;
  target_group_name: string;
  elder_id: string;
  elder_name: string;
  elder_sector: string;
  reason: string;
  status: 'pending' | 'ratified' | 'vetoed';
}

export type WeeklyLogisticsMode =
  | 'habitual_home'
  | 'alternate_home'
  | 'outreach_hospital_creso'
  | 'fellowship_outing';

export interface WeeklyLogisticsUpdate {
  mode: WeeklyLogisticsMode;
  venue_label?: string;
  notes?: string;
  extraordinary_time?: string;
  updated_at: string;
}
