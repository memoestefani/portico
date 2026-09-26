import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');
const componentsDir = path.resolve(srcDir, 'components');

describe('Pórtico OS v3.6 - Ciclo 13: Identidad Amor y Gracia Durango, Filtro Elena Ramos y Blindaje Humano (GOLD-330 a GOLD-339)', () => {
  const brandLogoPath = path.join(componentsDir, 'ChurchBrandLogo.tsx');
  const publicPortalPath = path.join(componentsDir, 'PublicPortal.tsx');
  const memberSiloPath = path.join(componentsDir, 'MemberSilo.tsx');
  const elderDeskPath = path.join(componentsDir, 'ElderDesk.tsx');
  const initiativesHubPath = path.join(componentsDir, 'CommunityInitiativesHub.tsx');
  const indexCssPath = path.join(srcDir, 'index.css');

  // ==========================================================================
  // GOLD-330: Isotipo Vectorial SVG de Amor y Gracia Durango (ChurchBrandLogo)
  // ==========================================================================
  describe('GOLD-330: Isotipo Vectorial SVG de Amor y Gracia Durango', () => {
    it('ChurchBrandLogo.tsx debe existir y exportar el componente vectorial SVG de Amor y Gracia', () => {
      assert.ok(fs.existsSync(brandLogoPath), 'ChurchBrandLogo.tsx no existe');
      const content = fs.readFileSync(brandLogoPath, 'utf-8');
      assert.match(content, /export const ChurchBrandLogo/i, 'No exporta ChurchBrandLogo');
      assert.match(content, /<svg/i, 'No define un elemento SVG');
      assert.match(content, /currentColor/i, 'El SVG debe soportar currentColor');
      assert.match(content, /Amor y Gracia/i, 'No contiene el nombre canónico de la iglesia');
      assert.match(content, /variant = 'icon'/i, 'Debe admitir variantes icon y full');
    });

    it('PublicPortal.tsx y MemberSilo.tsx deben incorporar ChurchBrandLogo', () => {
      const portalContent = fs.readFileSync(publicPortalPath, 'utf-8');
      assert.match(portalContent, /import.*ChurchBrandLogo/i, 'PublicPortal no importa ChurchBrandLogo');
      assert.match(portalContent, /<ChurchBrandLogo/i, 'PublicPortal no renderiza ChurchBrandLogo');

      const siloContent = fs.readFileSync(memberSiloPath, 'utf-8');
      assert.match(siloContent, /import.*ChurchBrandLogo/i, 'MemberSilo no importa ChurchBrandLogo');
      assert.match(siloContent, /<ChurchBrandLogo/i, 'MemberSilo no renderiza ChurchBrandLogo');
    });
  });

  // ==========================================================================
  // GOLD-331: Conmutador Multi-Grupo para Elena Ramos en MemberSilo
  // ==========================================================================
  describe('GOLD-331: Conmutador Multi-Grupo para Elena Ramos en MemberSilo', () => {
    it('MemberSilo.tsx debe ofrecer control segmentado táctil para alternar entre comunidades activas', () => {
      const siloContent = fs.readFileSync(memberSiloPath, 'utf-8');
      assert.match(siloContent, /activeGroupsList/i, 'MemberSilo no implementa activeGroupsList');
      assert.match(siloContent, /handleSwitchGroup/i, 'MemberSilo no implementa handleSwitchGroup');
      assert.match(siloContent, /btn-switch-group-/i, 'MemberSilo no define selectores de grupo btn-switch-group-');
      assert.match(siloContent, /minHeight:\s*'(44|48)px'/i, 'Los botones del conmutador deben cumplir ergonomía táctil >= 44px');
    });
  });

  // ==========================================================================
  // GOLD-332: Erradicación Total de CellHarmonizer de la Web Pública
  // ==========================================================================
  describe('GOLD-332: Erradicación Total de CellHarmonizer de la Web Pública', () => {
    it('PublicPortal.tsx NO debe renderizar CellHarmonizer bajo ninguna circunstancia', () => {
      const portalContent = fs.readFileSync(publicPortalPath, 'utf-8');
      assert.ok(!portalContent.includes('<CellHarmonizer'), 'PublicPortal no debe contener <CellHarmonizer');
      assert.ok(!portalContent.includes('import { CellHarmonizer }'), 'PublicPortal no debe importar CellHarmonizer');
    });

    it('MemberSilo.tsx confina el CellHarmonizer exclusivamente a líderes (isLeader)', () => {
      const siloContent = fs.readFileSync(memberSiloPath, 'utf-8');
      assert.match(siloContent, /isLeader\s*&&[\s\S]*?<CellHarmonizer/i, 'CellHarmonizer debe estar condicionado a isLeader en MemberSilo');
    });
  });

  // ==========================================================================
  // GOLD-333: Paleta Earthen Noble WCAG AAA y Purga de Variables Huérfanas
  // ==========================================================================
  describe('GOLD-333: Paleta Earthen Noble WCAG AAA y Purga de Variables Huérfanas', () => {
    it('index.css debe definir tokens de respaldo para evitar contrastes inválidos', () => {
      const cssContent = fs.readFileSync(indexCssPath, 'utf-8');
      assert.match(cssContent, /--bg-canvas:\s*var\(--bg-primary\);/i, 'index.css no define fallback para --bg-canvas');
      assert.match(cssContent, /--card-bg:\s*var\(--bg-surface\);/i, 'index.css no define fallback para --card-bg');
    });

    it('CommunityInitiativesHub.tsx debe estar purgado de colores quemados y usar variables semánticas', () => {
      const hubContent = fs.readFileSync(initiativesHubPath, 'utf-8');
      assert.ok(!hubContent.includes('#1e293b'), 'Hub contiene color hardcodeado #1e293b');
      assert.ok(!hubContent.includes('#334155'), 'Hub contiene color hardcodeado #334155');
      assert.ok(!hubContent.includes('#0f172a'), 'Hub contiene color hardcodeado #0f172a');
      assert.match(hubContent, /var\(--bg-surface\)/i, 'Hub debe usar var(--bg-surface)');
      assert.match(hubContent, /var\(--border-subtle\)/i, 'Hub debe usar var(--border-subtle)');
    });
  });

  // ==========================================================================
  // GOLD-334: Poda de Herramientas de Liderazgo del Feed de Miembros y Export Conciliar
  // ==========================================================================
  describe('GOLD-334: Poda de Herramientas de Liderazgo y Exportación Conciliar en ElderDesk', () => {
    it('MemberSilo.tsx no debe exponer el botón de exportar CSV de contactos a miembros ordinarios', () => {
      const siloContent = fs.readFileSync(memberSiloPath, 'utf-8');
      assert.ok(!siloContent.includes('id="btn-export-csv"'), 'MemberSilo expone btn-export-csv a miembros ordinarios');
    });

    it('ElderDesk.tsx debe disponer de exportación CSV congregacional para ancianos y pastores', () => {
      const elderContent = fs.readFileSync(elderDeskPath, 'utf-8');
      assert.match(elderContent, /handleExportCongregationCsv/i, 'ElderDesk no define handleExportCongregationCsv');
      assert.match(elderContent, /id="btn-export-congregation-csv"/i, 'ElderDesk no tiene el botón btn-export-congregation-csv');
    });

    it('Herramientas avanzadas (Discipulado, Radar de Sabático, Fisión Dunbar) deben estar confinadas a líderes', () => {
      const siloContent = fs.readFileSync(memberSiloPath, 'utf-8');
      assert.match(siloContent, /isLeader\s*&&[\s\S]*?Camino de Discipulado/i, 'Camino de Discipulado debe estar protegido con isLeader');
      assert.match(siloContent, /isLeader\s*&&[\s\S]*?Radar de Fatiga del Anfitrión/i, 'Radar de Sabático debe estar protegido con isLeader');
      assert.match(siloContent, /isLeader\s*&&[\s\S]*?Fisión Celular Dunbar/i, 'Fisión Dunbar debe estar protegida con isLeader');
    });
  });

  // ==========================================================================
  // GOLD-335: Descongestión del Acantilado de Filtros Móvil: Proximidad en 2 Pasos
  // ==========================================================================
  describe('GOLD-335: Descongestión de Filtros: Proximidad en 2 Pasos y Drawer Modal', () => {
    it('PublicPortal.tsx debe exportar DURANGO_COLONIAS y ofrecer pastillas táctiles en 1 toque', () => {
      const portalContent = fs.readFileSync(publicPortalPath, 'utf-8');
      assert.match(portalContent, /export const DURANGO_COLONIAS =/i, 'No exporta DURANGO_COLONIAS');
      assert.match(portalContent, /colonia-pill-/i, 'No genera pastillas táctiles colonia-pill-');
    });

    it('PublicPortal.tsx debe incluir input de búsqueda y modal de filtros avanzados', () => {
      const portalContent = fs.readFileSync(publicPortalPath, 'utf-8');
      assert.match(portalContent, /id="input-quick-search-colonia"/i, 'No incluye input de búsqueda de proximidad');
      assert.match(portalContent, /id="btn-open-advanced-filters"/i, 'No incluye botón para abrir filtros avanzados');
      assert.match(portalContent, /id="modal-advanced-filters"/i, 'No define modal-advanced-filters');
    });
  });

  // ==========================================================================
  // GOLD-336: Re-expresión Humana Total al Español Cotidiano bajo el Filtro Elena Ramos
  // ==========================================================================
  describe('GOLD-336: Re-expresión Humana al Español Cotidiano (Filtro Elena Ramos)', () => {
    it('MemberSilo.tsx debe erradicar jerga fría de base de datos y sustituirla por lenguaje cálido', () => {
      const siloContent = fs.readFileSync(memberSiloPath, 'utf-8');
      assert.match(siloContent, /Tu información se queda en tu iglesia y está cuidada con respeto/i, 'Falta frase de confianza de datos');
      assert.match(siloContent, /Mis Grupos Anteriores/i, 'Falta Mis Grupos Anteriores');
      assert.match(siloContent, /Ciclo Concluido con Gratitud/i, 'Falta Ciclo Concluido con Gratitud');
      assert.match(siloContent, /Al acercarse el final del ciclo platicaremos juntos los siguientes pasos/i, 'Falta frase cálida de cierre');
      assert.ok(!siloContent.includes('Cifrado Local Asimétrico'), 'Contiene jerga técnica Cifrado Local Asimétrico');
      assert.ok(!siloContent.includes('Historial de Sedes'), 'Contiene jerga técnica Historial de Sedes');
    });
  });

  // ==========================================================================
  // GOLD-337: Micro-Cápsula Editorial Plegable para Comunicados Pastorales
  // ==========================================================================
  describe('GOLD-337: Micro-Cápsula Editorial Plegable para Comunicados Pastorales', () => {
    it('MemberSilo.tsx debe implementar micro-cápsula de 44px con modal de lectura y descarte persistente', () => {
      const siloContent = fs.readFileSync(memberSiloPath, 'utf-8');
      assert.match(siloContent, /id="pastoral-broadcast-capsule"/i, 'Falta el id pastoral-broadcast-capsule');
      assert.match(siloContent, /id="btn-read-broadcast"/i, 'Falta botón btn-read-broadcast');
      assert.match(siloContent, /id="btn-dismiss-broadcast"/i, 'Falta botón btn-dismiss-broadcast');
      assert.match(siloContent, /id="modal-broadcast-read"/i, 'Falta modal de lectura modal-broadcast-read');
      assert.match(siloContent, /localStorage\.setItem\('(portico_)?dismissed_broadcasts'/i, 'Falta persistencia en localStorage');
    });
  });

  // ==========================================================================
  // GOLD-338: Triple Blindaje de Rendimiento Móvil
  // ==========================================================================
  describe('GOLD-338: Triple Blindaje de Rendimiento Móvil', () => {
    it('PublicPortal.tsx debe contar con debounce de 150ms en búsqueda y paginación por lotes de 6', () => {
      const portalContent = fs.readFileSync(publicPortalPath, 'utf-8');
      assert.match(portalContent, /debouncedSearchQuery/i, 'Falta debouncedSearchQuery');
      assert.match(portalContent, /150/i, 'Falta debounce de 150ms');
      assert.match(portalContent, /id="btn-load-more-groups"/i, 'Falta botón de carga progresiva');
      assert.match(portalContent, /setVisibleLimit\(\(prev\)\s*=>\s*prev\s*\+\s*6\)/i, 'Falta incremento por lotes de 6');
    });
  });

  // ==========================================================================
  // GOLD-339: Silencio Comercial Absoluto y Santuario de Fe
  // ==========================================================================
  describe('GOLD-339: Silencio Comercial Absoluto y Santuario de Fe', () => {
    it('PublicPortal.tsx y MemberSilo.tsx no deben contener tablas de precios, planes de pago ni pasarelas', () => {
      const portalContent = fs.readFileSync(publicPortalPath, 'utf-8');
      const siloContent = fs.readFileSync(memberSiloPath, 'utf-8');

      assert.ok(!portalContent.includes('precio'), 'PublicPortal contiene menciones a precio');
      assert.ok(!portalContent.includes('suscripción'), 'PublicPortal contiene menciones a suscripción');
      assert.ok(!portalContent.includes('Stripe') && !portalContent.includes('PayPal'), 'PublicPortal contiene pasarelas');

      assert.ok(!siloContent.includes('planes de pago'), 'MemberSilo contiene planes de pago');
      assert.ok(!siloContent.includes('SaaS'), 'MemberSilo contiene SaaS');
    });
  });

  // ==========================================================================
  // Requerimientos Canónicos de Privacidad y Sanitización de Domicilios y Nombres
  // ==========================================================================
  describe('Privacidad Estricta de Domicilios y Nombres (Público vs Con Cuenta vs Admitido)', () => {
    it('PublicPortal.tsx debe implementar formatVisibleName mostrando sólo el primer nombre para visitantes públicos', () => {
      const portalContent = fs.readFileSync(publicPortalPath, 'utf-8');
      assert.match(portalContent, /const formatVisibleName =/i, 'PublicPortal no implementa formatVisibleName');
      assert.match(portalContent, /formatVisibleName\(group\.facilitator_name/i, 'No aplica formatVisibleName en facilitador');
      assert.match(portalContent, /formatVisibleName\(group\.leader_name\)/i, 'No aplica formatVisibleName en líder');
      assert.match(portalContent, /formatVisibleName\(group\.apprentice_name\)/i, 'No aplica formatVisibleName en aprendiz');
    });

    it('PublicPortal.tsx debe implementar sanitizeLocationSummary ocultando notas de timbres/estacionamiento y ocultando calles exactas para visitantes públicos', () => {
      const portalContent = fs.readFileSync(publicPortalPath, 'utf-8');
      assert.match(portalContent, /const sanitizeLocationSummary =/i, 'PublicPortal no implementa sanitizeLocationSummary');
      assert.match(portalContent, /sanitizeLocationSummary\(group\.location_summary\)/i, 'No aplica sanitizeLocationSummary en el renderizado de la tarjeta');
      assert.match(portalContent, /hasAccount/i, 'sanitizeLocationSummary debe distinguir si el usuario tiene cuenta activa');
    });

    it('MemberSilo.tsx debe preservar notas operativas privadas únicamente para miembros admitidos', () => {
      const siloContent = fs.readFileSync(memberSiloPath, 'utf-8');
      assert.match(siloContent, /full_venue_address/i, 'MemberSilo debe gestionar el domicilio privado');
      assert.match(siloContent, /selectedGroupDetail\.full_venue_address/i, 'MemberSilo muestra el domicilio al miembro activo');
    });
  });
});
