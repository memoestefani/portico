import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const memberSiloPath = path.resolve('src/components/MemberSilo.tsx');
const memberSiloCode = fs.readFileSync(memberSiloPath, 'utf8');

const typesPath = path.resolve('src/types.ts');
const typesCode = fs.readFileSync(typesPath, 'utf8');

describe('Pórtico OS - Ciclos 17 & 18: Búsqueda de Miembros, Asignación de Roles y Logística Agnóstica de Sedes', () => {

  describe('Ciclo 17: Búsqueda de Miembros y Asignación Fraterna de Roles (GOLD-349 a GOLD-351)', () => {
    it('1-C / GOLD-349: debe acotar el alcance de búsqueda a los miembros registrados en la célula', () => {
      assert.ok(memberSiloCode.includes('showMemberPicker'), 'Falta estado showMemberPicker');
      assert.ok(memberSiloCode.includes('memberPickerRole'), 'Falta estado memberPickerRole');
      assert.ok(memberSiloCode.includes('selectedGroupDetail.members'), 'Debe filtrar sobre los miembros del grupo seleccionado');
      assert.ok(memberSiloCode.includes('id="member-picker-modal"'), 'Falta modal/bottom sheet de selector de miembros');
    });

    it('2-B / GOLD-350: debe proveer sábana táctil con búsqueda en vivo insensible a tildes y mayúsculas', () => {
      assert.ok(memberSiloCode.includes('id="member-search-input"'), 'Falta input de búsqueda de miembros');
      assert.ok(memberSiloCode.includes('.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")'), 'Debe normalizar caracteres y acentos para búsqueda insensible');
      assert.ok(memberSiloCode.includes('id="member-picker-list"'), 'Falta contenedor de lista de miembros');
    });

    it('3-A / GOLD-351: debe realizar asignación directa optimista sin bloqueos burocráticos y permitir restablecimiento', () => {
      assert.ok(memberSiloCode.includes('handleSelectMember'), 'Falta función handleSelectMember');
      assert.ok(memberSiloCode.includes('handleResetMemberRole'), 'Falta función handleResetMemberRole');
      assert.ok(memberSiloCode.includes('id="btn-reset-member-role"'), 'Falta botón de restablecer asignación');
      assert.ok(memberSiloCode.includes('btn-pick-member-'), 'Faltan botones táctiles para seleccionar miembros');
    });

    it('Tríada Celular: los slots de Anfitrión y Aprendiz deben ser interactivos exclusivamente para el líder', () => {
      assert.ok(memberSiloCode.includes('id="btn-assign-host"'), 'Falta slot interactivo para anfitrión');
      assert.ok(memberSiloCode.includes('id="btn-assign-apprentice"'), 'Falta slot interactivo para aprendiz');
      assert.ok(memberSiloCode.includes("onClick={isLeader ? () => handleOpenMemberPicker('host') : undefined}"), 'Asignación de anfitrión debe estar confinada al líder');
      assert.ok(memberSiloCode.includes("onClick={isLeader ? () => handleOpenMemberPicker('apprentice') : undefined}"), 'Asignación de aprendiz debe estar confinada al líder');
    });
  });

  describe('Ciclo 18: Logística Celular Agnóstica y Gestión de Sedes Flexibles (GOLD-352 a GOLD-355)', () => {
    it('1-C / GOLD-352: Edición de doble puerta exclusiva del líder con pre-carga de semana', () => {
      assert.ok(memberSiloCode.includes('id="btn-quick-adjust-venue"'), 'Falta botón de ajuste rápido en Living Card');
      assert.ok(memberSiloCode.includes('id="btn-open-venue-editor-header"'), 'Falta botón de programar sede en cabecera');
      assert.ok(memberSiloCode.includes('btn-schedule-week-'), 'Falta identificador en tarjetas semanales');
      assert.ok(memberSiloCode.includes('handleOpenVenueEditor(weekNum)'), 'El clic en cada semana debe pre-cargar su número en el editor');
      assert.ok(memberSiloCode.includes('id="venue-target-week-select"'), 'Falta selector de semana en el editor');
    });

    it('Confinamiento Estricto al Líder: Miembro ordinario no tiene botones ni eventos de ajuste logístico', () => {
      assert.ok(memberSiloCode.includes('{isLeader && ('), 'Ajuste rápido de sede debe requerir isLeader');
      assert.ok(memberSiloCode.includes('onClick={isLeader ? () => handleOpenVenueEditor(weekNum) : undefined}'), 'Clic de tarjeta semanal debe requerir isLeader');
      assert.ok(memberSiloCode.includes("cursor: isLeader ? 'pointer' : 'default'"), 'Cursor de tarjeta semanal debe reflejar confinamiento');
    });

    it('2-B Agnóstica / GOLD-353: Tipología de 4 modalidades funcionales (Hogar, Público/Misión, Virtual, Foráneo/Cabañas)', () => {
      assert.ok(memberSiloCode.includes('btn-venue-mode-'), 'Falta selector para modalidades de sede');
      assert.ok(memberSiloCode.includes("'hogar'") && memberSiloCode.includes("'publico'") && memberSiloCode.includes("'virtual'") && memberSiloCode.includes("'foraneo'"), 'Faltan las 4 modalidades funcionales');
      assert.ok(memberSiloCode.includes('id="venue-arrival-hint-input"'), 'Falta campo de referencia de llegada agnóstica');
      assert.ok(memberSiloCode.includes('id="venue-time-override-input"'), 'Falta campo de sobreescritura de horario');
      assert.ok(memberSiloCode.includes('Sellado LFPDPPP'), 'Debe contener aviso de sellado de privacidad en hogares familiares');
    });

    it('3-B / GOLD-354: Coordinador de encuentros especiales y fusiones temporales entre células', () => {
      assert.ok(memberSiloCode.includes('id="chk-venue-special-event"'), 'Falta checkbox de encuentro especial');
      assert.ok(memberSiloCode.includes('id="venue-partner-group-input"'), 'Falta campo de grupo o célula aliada');
      assert.ok(memberSiloCode.includes('customVenue.is_joint_meeting'), 'Debe renderizar badge de encuentro conjunto');
      assert.ok(memberSiloCode.includes('customVenue.is_retreat'), 'Debe renderizar badge de retiro / cabañas');
    });

    it('4-B / GOLD-355: Metamorfosis ámbar en Living Card y Despacho Asistido en 1 toque por WhatsApp con enlace GPS', () => {
      assert.ok(memberSiloCode.includes('week1CustomVenue'), 'Debe detectar sedes personalizadas de semana 1 como excepción activa');
      assert.ok(memberSiloCode.includes("hasException ? 'is-exception' : ''"), 'Debe activar clase is-exception para metamorfosis ámbar');
      assert.ok(memberSiloCode.includes('id="whatsapp-dispatch-banner"'), 'Falta banner de despacho WhatsApp para el líder');
      assert.ok(memberSiloCode.includes('id="btn-send-whatsapp-dispatch"'), 'Falta enlace directo a WhatsApp');
      assert.ok(memberSiloCode.includes('lastDispatchedWaUrl'), 'Debe generar URL determinista para WhatsApp con ubicación en mapa');
    });
  });

  describe('Purga de Residuos Técnicos (Debris Purge) y Contratos de Datos', () => {
    it('no debe contener IDs sintéticos generados en inputs como apprentice-${...}', () => {
      assert.ok(!memberSiloCode.includes('apprentice-${name'), 'No debe haber generador de ID ficticio de aprendiz');
      assert.ok(memberSiloCode.includes('id="btn-pick-fission-leader"'), 'Dunbar Fission debe usar el selector de miembros reales');
    });

    it('no debe contener el modal arcaico showNomadicVenueModal ni textos de tickets caducos', () => {
      assert.ok(!memberSiloCode.includes('showNomadicVenueModal'), 'No debe quedar rastro del modal arcaico nomadic');
      assert.ok(!memberSiloCode.includes('Itinerario Nómada: Asignar Sede Semanal (GOLD-261)'), 'No debe quedar texto de ticket arcaico en JSX');
    });

    it('SessionVenueItem en types.ts debe contemplar los atributos enriquecidos del ciclo 18', () => {
      assert.ok(typesCode.includes('is_joint_meeting?: boolean;'), 'types.ts debe tener is_joint_meeting');
      assert.ok(typesCode.includes('partner_group_name?: string | null;'), 'types.ts debe tener partner_group_name');
      assert.ok(typesCode.includes('is_retreat?: boolean;'), 'types.ts debe tener is_retreat');
      assert.ok(typesCode.includes('retreat_date_range?: string | null;'), 'types.ts debe tener retreat_date_range');
      assert.ok(typesCode.includes('arrival_notes?: string | null;'), 'types.ts debe tener arrival_notes');
      assert.ok(typesCode.includes('time_override?: string | null;'), 'types.ts debe tener time_override');
    });
  });
});
