import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');
const componentsDir = path.resolve(srcDir, 'components');

describe('Pórtico OS v3.3 - Ciclo 9: Simbiosis de Vida Real, Casos de Estrés y Protección Comunitaria (GOLD-297 a GOLD-306)', () => {

  // ==========================================================================
  // GOLD-297 (1-B): Feed Litúrgico WebCal/ICS y Armonizador Celular
  // ==========================================================================
  describe('GOLD-297: Feed Litúrgico WebCal/ICS y Armonizador de Pulso Celular', () => {
    const harmonizerPath = path.join(componentsDir, 'CellHarmonizer.tsx');
    const portalPath = path.join(componentsDir, 'PublicPortal.tsx');
    const siloPath = path.join(componentsDir, 'MemberSilo.tsx');

    it('CellHarmonizer.tsx debe existir e implementar las 3 opciones armónicas ante colisiones', () => {
      assert.ok(fs.existsSync(harmonizerPath), 'CellHarmonizer.tsx no existe');
      const content = fs.readFileSync(harmonizerPath, 'utf-8');

      // Las 3 opciones canónicas ratificadas
      assert.match(content, /Sumarnos en cuerpo al evento/i, 'Falta opción Sumarnos');
      assert.match(content, /Mover reunión 24h antes\/después/i, 'Falta opción Mover reunión');
      assert.match(content, /Mantener reunión regular/i, 'Falta opción Mantener reunión');

      // Botón de sincronización WebCal RFC 5545
      assert.match(content, /btn-webcal-sync/i, 'Falta identificador btn-webcal-sync');
      assert.match(content, /webcal:\/\/|liturgical\.ics/i, 'Falta protocolo webcal o feed ics');
    });

    it('MemberSilo.tsx debe integrar el Armonizador y PublicPortal.tsx debe estar libre de herramientas de liderazgo (GOLD-332)', () => {
      const portalContent = fs.readFileSync(portalPath, 'utf-8');
      assert.ok(!portalContent.includes('<CellHarmonizer'), 'PublicPortal no debe exponer herramientas de liderazgo internas como CellHarmonizer');

      const siloContent = fs.readFileSync(siloPath, 'utf-8');
      assert.match(siloContent, /<CellHarmonizer/i, 'MemberSilo no renderiza CellHarmonizer');
      assert.match(siloContent, /showHarmonizerModal/i, 'MemberSilo no gestiona modal del armonizador');
    });
  });

  // ==========================================================================
  // GOLD-298 (2-B): Caracterización Binaria Sobria (hombre | mujer)
  // ==========================================================================
  describe('GOLD-298: Caracterización Binaria Sobria de Creación para Segmentación Fraternal', () => {
    const typesPath = path.resolve(srcDir, 'types.ts');
    const portalPath = path.join(componentsDir, 'PublicPortal.tsx');

    it('types.ts debe definir BiologicalSex estrictamente como hombre | mujer sin campos ideológicos', () => {
      const content = fs.readFileSync(typesPath, 'utf-8');
      assert.match(content, /export type BiologicalSex = 'hombre' \| 'mujer';/, 'BiologicalSex no es hombre | mujer');
    });

    it('PublicPortal.tsx no debe exponer badges estridentes ni discriminatorios de sexo en el catálogo público', () => {
      const content = fs.readFileSync(portalPath, 'utf-8');
      assert.doesNotMatch(content, /badge-sexo/i, 'Se encontró badge ruidoso de sexo');
      assert.match(content, /Orientado a Mujeres/i, 'Debe preservar etiqueta orientativa fraterna');
      assert.match(content, /Orientado a Hombres/i, 'Debe preservar etiqueta orientativa fraterna');
    });
  });

  // ==========================================================================
  // GOLD-299 (3-B): Bandeja Diaconal Mancomunada y Pase Fraternal
  // ==========================================================================
  describe('GOLD-299: Bandeja Diaconal Mancomunada con Selector de Colonia y Pase Fraternal', () => {
    const deaconPath = path.join(componentsDir, 'DeaconDesk.tsx');

    it('DeaconDesk.tsx debe implementar el selector de Colonia/Sector de Durango', () => {
      const content = fs.readFileSync(deaconPath, 'utf-8');
      assert.match(content, /filter-colonia-all/i, 'Falta botón de filtro de colonias');
      assert.match(content, /selectedColoniaFilter/i, 'Falta estado selectedColoniaFilter');
      assert.match(content, /Bandeja diaconal mancomunada/i, 'Falta texto de bandeja mancomunada');
    });

    it('DeaconDesk.tsx debe permitir pasar la posta fraternal en 1-clic sin rastreo invasivo por IP', () => {
      const content = fs.readFileSync(deaconPath, 'utf-8');
      assert.match(content, /Pasar la posta fraternal/i, 'Falta botón Pasar la posta fraternal');
      assert.match(content, /transferringComplaint/i, 'Falta modal de transferencia fraternal');
      assert.match(content, /sin rastreo invasivo de IP/i, 'Debe rechazar explícitamente el rastreo por IP');
      assert.doesNotMatch(content, /navigator\.geolocation/i, 'No debe usar geolocalización de navegador');
    });
  });

  // ==========================================================================
  // GOLD-300 (4-B): Ficha de Célula en PastorHud con Tríada y Cadena Pastoral
  // ==========================================================================
  describe('GOLD-300: Ficha de Célula con Tríada Celular y Cobertura Pastoral Visible', () => {
    const cardPath = path.join(componentsDir, 'GroupPastoralCard.tsx');
    const hudPath = path.join(componentsDir, 'PastorHud.tsx');

    it('GroupPastoralCard.tsx debe estructurar la Tríada Celular y la Cadena Pastoral', () => {
      assert.ok(fs.existsSync(cardPath), 'GroupPastoralCard.tsx no existe');
      const content = fs.readFileSync(cardPath, 'utf-8');

      // Tríada Celular Operativa
      assert.match(content, /Tríada Relacional|Tríada Celular/i, 'Falta sección Tríada Celular');
      assert.match(content, /Facilitador/i, 'Falta Facilitador');
      assert.match(content, /Anfitrión de Hogar|Contacto \/ Enlace/i, 'Falta Anfitrión o Enlace');
      assert.match(content, /Aprendiz/i, 'Falta Aprendiz');

      // Cadena Pastoral de Supervisión
      assert.match(content, /Cadena de Acompañamiento y Supervisión Pastoral|Cadena Pastoral/i, 'Falta sección Cadena Pastoral');
      assert.match(content, /Diácono de Apoyo/i, 'Falta Diácono de Apoyo');
      assert.match(content, /Anciano de Sector/i, 'Falta Anciano de Sector');
      assert.match(content, /Última Visita/i, 'Falta fecha de última visita diaconal');
    });

    it('PastorHud.tsx debe renderizar GroupPastoralCard en el detalle de grupo', () => {
      const hudContent = fs.readFileSync(hudPath, 'utf-8');
      assert.match(hudContent, /<GroupPastoralCard/i, 'PastorHud no renderiza GroupPastoralCard');
    });
  });

  // ==========================================================================
  // GOLD-301 (5-B): Desanonimización Contextual y Veto Pastoral Anti-Colisión
  // ==========================================================================
  describe('GOLD-301: Desanonimización Contextual y Veto Pastoral en Ruteo Anti-Colisión', () => {
    const antiCollisionPath = path.join(componentsDir, 'PastorAntiCollisionDesk.tsx');
    const hudPath = path.join(componentsDir, 'PastorHud.tsx');

    it('PastorAntiCollisionDesk.tsx debe desanonimizar nombres reales y motivos para Josh', () => {
      assert.ok(fs.existsSync(antiCollisionPath), 'PastorAntiCollisionDesk.tsx no existe');
      const content = fs.readFileSync(antiCollisionPath, 'utf-8');

      assert.match(content, /Desanonimización Contextual/i, 'Falta encabezado de desanonimización');
      assert.match(content, /Ratificar Transición/i, 'Falta botón Ratificar Transición');
      assert.match(content, /Veto Pastoral con Diálogo/i, 'Falta botón Veto Pastoral');
      assert.match(content, /Anciano Responsable/i, 'Falta Anciano Responsable');
    });

    it('PastorHud.tsx debe contener el panel de ruteo anti-colisión', () => {
      const hudContent = fs.readFileSync(hudPath, 'utf-8');
      assert.match(hudContent, /<PastorAntiCollisionDesk/i, 'PastorHud no incluye PastorAntiCollisionDesk');
    });
  });

  // ==========================================================================
  // GOLD-302 (6-B): Pausas Litúrgicas Oficiales y Cerrojo Dominical
  // ==========================================================================
  describe('GOLD-302: Pausas Litúrgicas Oficiales de Temporada y Cerrojo Dominical', () => {
    const pausePath = path.join(componentsDir, 'LiturgicalPauseManager.tsx');
    const hudPath = path.join(componentsDir, 'PastorHud.tsx');

    it('LiturgicalPauseManager.tsx debe gestionar asuetos litúrgicos sin deuda técnica de asistencia', () => {
      assert.ok(fs.existsSync(pausePath), 'LiturgicalPauseManager.tsx no existe');
      const content = fs.readFileSync(pausePath, 'utf-8');

      assert.match(content, /Pausas Litúrgicas Oficiales/i, 'Falta título de Pausas Litúrgicas');
      assert.match(content, /Semana Santa/i, 'Falta ejemplo de Semana Santa');
      assert.match(content, /congelan el contador de semanas|cómputo de semanas se congela/i, 'Falta indicación de congelamiento');
      assert.match(content, /Cerrojo Litúrgico Dominical/i, 'Falta confirmación del Cerrojo Dominical');
    });

    it('PastorHud.tsx debe integrar LiturgicalPauseManager en la pestaña de temporadas', () => {
      const hudContent = fs.readFileSync(hudPath, 'utf-8');
      assert.match(hudContent, /<LiturgicalPauseManager/i, 'PastorHud no incluye LiturgicalPauseManager');
    });
  });

  // ==========================================================================
  // GOLD-303 (7-B): Iniciativas Comunitarias Agnósticas (Hospital 450, Narnia)
  // ==========================================================================
  describe('GOLD-303: Convocatorias de Actividades Comunitarias Agnósticas', () => {
    const hubPath = path.join(componentsDir, 'CommunityInitiativesHub.tsx');
    const portalPath = path.join(componentsDir, 'PublicPortal.tsx');

    it('CommunityInitiativesHub.tsx debe incluir iniciativas abiertas y compromiso de insumos', () => {
      assert.ok(fs.existsSync(hubPath), 'CommunityInitiativesHub.tsx no existe');
      const content = fs.readFileSync(hubPath, 'utf-8');

      // Casos canónicos específicos
      assert.match(content, /Hospital General 450/i, 'Falta iniciativa de Hospital General 450');
      assert.match(content, /Las Crónicas de Narnia/i, 'Falta coloquio de Las Crónicas de Narnia');
      assert.match(content, /btn-volunteer/i, 'Falta botón de voluntariado');
      assert.match(content, /Insumos Comprometidos/i, 'Falta lista de insumos comprometidos');
    });

    it('PublicPortal.tsx debe albergar la sección de Iniciativas Comunitarias', () => {
      const portalContent = fs.readFileSync(portalPath, 'utf-8');
      assert.match(portalContent, /<CommunityInitiativesHub/i, 'PublicPortal no renderiza CommunityInitiativesHub');
    });
  });

  // ==========================================================================
  // GOLD-304 (8-B): Convivio Fraternal Inter-Celular con Asistencia Mancomunada
  // ==========================================================================
  describe('GOLD-304: Convivio Fraternal Inter-Celular y Deduplicación en Registro', () => {
    const siloPath = path.join(componentsDir, 'MemberSilo.tsx');

    it('MemberSilo.tsx debe ofrecer el toggle de Convivio con Célula Hermana en el reporte de asistencia', () => {
      const content = fs.readFileSync(siloPath, 'utf-8');

      assert.match(content, /toggle-joint-meeting/i, 'Falta toggle toggle-joint-meeting');
      assert.match(content, /¿Fue un Convivio con Célula Hermana\?/i, 'Falta pregunta de convivio');
      assert.match(content, /jointPartnerGroupId/i, 'Falta selector de célula hermana');
      assert.match(content, /deduplicación automática de asistentes/i, 'Falta nota de deduplicación');
    });
  });

  // ==========================================================================
  // GOLD-305 (9-B): Sede Institucional sin Verborrea Religiosa
  // ==========================================================================
  describe('GOLD-305: Sede Institucional o Especial sin Verborrea Religiosa', () => {
    const portalPath = path.join(componentsDir, 'PublicPortal.tsx');
    const typesPath = path.resolve(srcDir, 'types.ts');

    it('types.ts debe contemplar campos institucionales en PublicEdition', () => {
      const content = fs.readFileSync(typesPath, 'utf-8');
      assert.match(content, /liaison_name\?:/i, 'Falta liaison_name');
      assert.match(content, /liaison_role\?:/i, 'Falta liaison_role');
      assert.match(content, /access_protocol\?:/i, 'Falta access_protocol');
    });

    it('PublicPortal.tsx debe transmutar Anfitrión a Contacto / Enlace en sedes institucionales', () => {
      const content = fs.readFileSync(portalPath, 'utf-8');
      assert.match(content, /group\.venue_type === 'institucional' \? 'Contacto \/ Enlace' : 'Anfitrión'/i, 'No transmuta Anfitrión a Contacto / Enlace');
    });
  });

  // ==========================================================================
  // GOLD-306 (10-B): Sabático Directo por Diácono y Protección Infranqueable de Menores
  // ==========================================================================
  describe('GOLD-306: Sabático Directo por Diácono y Protección Infranqueable de Menores', () => {
    const deaconPath = path.join(componentsDir, 'DeaconDesk.tsx');
    const siloPath = path.join(componentsDir, 'MemberSilo.tsx');
    const typesPath = path.resolve(srcDir, 'types.ts');

    it('types.ts debe clasificar categorías de edad y estructura de concesión de sabático', () => {
      const content = fs.readFileSync(typesPath, 'utf-8');
      assert.match(content, /export type AgeCategory = 'adulto' \| 'adolescente' \| 'nino';/, 'Falta AgeCategory');
      assert.match(content, /export interface DeaconSabbaticalGrant/i, 'Falta DeaconSabbaticalGrant');
    });

    it('DeaconDesk.tsx debe permitir conceder sabático in situ con botón dedicado', () => {
      const content = fs.readFileSync(deaconPath, 'utf-8');
      assert.match(content, /btn-direct-sabbatical/i, 'Falta botón btn-direct-sabbatical');
      assert.match(content, /showDirectSabbaticalModal/i, 'Falta estado de modal de sabático directo');
      assert.match(content, /Concesión In Situ de Sabático de Hogar/i, 'Falta encabezado de concesión');
    });

    it('MemberSilo.tsx debe bloquear por diseño el chat privado 1:1 entre adultos y menores', () => {
      const content = fs.readFileSync(siloPath, 'utf-8');
      assert.match(content, /Canal Supervisado \(Tutor\)/i, 'Falta indicativo de canal supervisado');
      assert.match(content, /bloqueados por diseño/i, 'Falta bloqueo por diseño');
      assert.match(content, /Dependiente tutelado/i, 'Falta clasificación de niño como tutelado');
    });
  });
});
