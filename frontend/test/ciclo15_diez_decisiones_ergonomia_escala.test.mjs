import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const frontendDir = path.join(rootDir, 'frontend');
const srcDir = path.join(frontendDir, 'src');
const componentsDir = path.join(srcDir, 'components');
const backendDir = path.join(rootDir, 'backend');

describe('Ciclo 15: 10 Decisiones Ratificadas de Ergonomía, Escala y Lenguaje Humano (GOLD-350 a GOLD-359)', () => {

  // ==========================================================================
  // Decisión 1 (GOLD-350): Box Guard Estricto y Cero Desbordamiento Horizontal
  // ==========================================================================
  describe('Decisión 1 (GOLD-350): Box Guard Estricto y Cero Desbordamiento Horizontal', () => {
    const cssContent = fs.readFileSync(path.join(srcDir, 'index.css'), 'utf-8');

    it('index.css debe forzar overflow-x clip y max-width 100vw en html, body y #root', () => {
      assert.match(cssContent, /overflow-x:\s*clip/i, 'Debe usar overflow-x: clip');
      assert.match(cssContent, /max-width:\s*100vw/i, 'Debe acotar el ancho a max-width: 100vw');
      assert.match(cssContent, /box-sizing:\s*border-box/i, 'Debe aplicar box-sizing: border-box');
    });

    it('los encabezados h1 a h6 deben tener word-break y overflow-wrap para evitar saltos móviles', () => {
      assert.match(cssContent, /h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6/i, 'Debe existir regla consolidada de encabezados');
      assert.match(cssContent, /word-break:\s*break-word/i, 'Debe incluir word-break: break-word');
      assert.match(cssContent, /overflow-wrap:\s*break-word/i, 'Debe incluir overflow-wrap: break-word');
    });

    it('MemberSilo y PublicPortal deben tener contenedores acotados sin desborde', () => {
      const publicPortal = fs.readFileSync(path.join(componentsDir, 'PublicPortal.tsx'), 'utf-8');
      const memberSilo = fs.readFileSync(path.join(componentsDir, 'MemberSilo.tsx'), 'utf-8');
      assert.match(publicPortal, /overflowX:\s*['"]clip['"]/i, 'PublicPortal debe contener overflowX: clip');
      assert.match(memberSilo, /overflowX:\s*['"]clip['"]/i, 'MemberSilo debe contener overflowX: clip');
    });
  });

  // ==========================================================================
  // Decisión 2 (GOLD-351): Dock Inferior Adaptativo de 3 Accesos y Personalización
  // ==========================================================================
  describe('Decisión 2 (GOLD-351): Dock Inferior Adaptativo de 3 Accesos y Personalización', () => {
    const roleSwitcher = fs.readFileSync(path.join(componentsDir, 'RoleSwitcher.tsx'), 'utf-8');

    it('RoleSwitcher debe implementar dock adaptativo con máximo de 3 a 4 accesos directos', () => {
      assert.match(roleSwitcher, /getActiveDockItems/, 'Debe calcular los items activos del dock');
      assert.match(roleSwitcher, /bottom-tab-bar|mobile-bottom-nav/, 'Debe renderizar la barra inferior móvil');
    });

    it('debe permitir personalizar los accesos y persistirlos en localStorage portico_custom_dock', () => {
      assert.match(roleSwitcher, /portico_custom_dock/, 'Debe persistir configuración en portico_custom_dock');
      assert.match(roleSwitcher, /CustomizeDockModal/, 'Debe incluir modal de personalización');
    });

    it('el selector de roles de desarrollo debe presentarse como píldora flotante para no saturar móviles', () => {
      assert.match(roleSwitcher, /isDevMode/, 'Debe condicionar modo desarrollo');
      assert.match(roleSwitcher, /btn-dev-role-pill/, 'Debe existir el botón píldora de desarrollo');
    });
  });

  // ==========================================================================
  // Decisión 3 (GOLD-352): Identidad Agnóstica de Ciudad y Selector Multi-Campus
  // ==========================================================================
  describe('Decisión 3 (GOLD-352): Identidad Agnóstica de Ciudad y Selector Multi-Campus', () => {
    const roleSwitcher = fs.readFileSync(path.join(componentsDir, 'RoleSwitcher.tsx'), 'utf-8');
    const publicPortal = fs.readFileSync(path.join(componentsDir, 'PublicPortal.tsx'), 'utf-8');

    it('RoleSwitcher debe presentar Amor y Gracia de forma limpia y agnóstica', () => {
      assert.match(roleSwitcher, /Amor y Gracia/, 'Debe titular Amor y Gracia');
      assert.doesNotMatch(roleSwitcher, /Amor y Gracia Durango/i, 'No debe forzar sufijo Durango en encabezado principal');
    });

    it('PublicPortal debe incluir selector multi-ciudad para viajeros (Durango, Torreón, Mazatlán, En Línea)', () => {
      assert.match(publicPortal, /id=\{`btn-city-/i, 'Debe tener botones de ciudad');
      assert.match(publicPortal, /Todas/, 'Debe tener opción Todas');
      assert.match(publicPortal, /Durango/, 'Debe tener opción Durango');
      assert.match(publicPortal, /Torreón/, 'Debe tener opción Torreón');
      assert.match(publicPortal, /Mazatlán/, 'Debe tener opción Mazatlán');
      assert.match(publicPortal, /En Línea/, 'Debe tener opción En Línea');
    });
  });

  // ==========================================================================
  // Decisión 4 (GOLD-353): Privacidad Pasiva y Cero Conmutador Debugger en Hero
  // ==========================================================================
  describe('Decisión 4 (GOLD-353): Privacidad Pasiva y Cero Conmutador Debugger en Hero', () => {
    const publicPortal = fs.readFileSync(path.join(componentsDir, 'PublicPortal.tsx'), 'utf-8');

    it('no debe mostrar el conmutador interactivo de depuración Modo Público vs Miembro en hero', () => {
      assert.doesNotMatch(publicPortal, /btn-toggle-account-view/i, 'No debe existir el conmutador de prueba en hero');
      assert.doesNotMatch(publicPortal, /Modo Público \(General\) \/ Con Cuenta/i, 'No debe contener texto de depuración en hero');
    });

    it('debe mantener la detección pasiva basada en token existente', () => {
      assert.match(publicPortal, /hasAccount/, 'Debe evaluar internamente hasAccount');
    });
  });

  // ==========================================================================
  // Decisión 5 (GOLD-354): Lenguaje Humano Comprensible (ISO 24495-1)
  // ==========================================================================
  describe('Decisión 5 (GOLD-354): Lenguaje Humano Comprensible (ISO 24495-1)', () => {
    const memberSilo = fs.readFileSync(path.join(componentsDir, 'MemberSilo.tsx'), 'utf-8');
    const publicPortal = fs.readFileSync(path.join(componentsDir, 'PublicPortal.tsx'), 'utf-8');

    it('no debe utilizar términos punitivos o canónicos como Mateo 18 o Inasistencias', () => {
      assert.doesNotMatch(memberSilo, /Observación Mateo 18/i, 'No debe usar lenguaje canónico de Mateo 18');
      assert.doesNotMatch(memberSilo, /Penalización de inasistencias/i, 'No debe usar términos punitivos');
    });

    it('los filtros públicos deben usar descripciones directas en lugar de jerga de ecosistema', () => {
      assert.match(publicPortal, /Todos los Grupos/i, 'Debe usar Todos los Grupos');
      assert.doesNotMatch(publicPortal, /Ver Todo el Ecosistema/i, 'No debe usar Ver Todo el Ecosistema');
    });
  });

  // ==========================================================================
  // Decisión 6 (GOLD-355): Erradicación del Bucle N+1 en Axum SQLite
  // ==========================================================================
  describe('Decisión 6 (GOLD-355): Erradicación del Bucle N+1 en Axum SQLite', () => {
    const pastorRs = fs.readFileSync(path.join(backendDir, 'crates/portico-server/src/routes/pastor.rs'), 'utf-8');

    it('pastor.rs debe usar una sola consulta agrupada con LEFT JOIN para métricas de grupos', () => {
      assert.match(pastorRs, /LEFT JOIN \(\s*SELECT edition_id, count\(\*\) as cnt\s*FROM membership/i, 'Debe incluir subconsulta agrupada de miembros');
      assert.match(pastorRs, /LEFT JOIN \(\s*SELECT edition_id, count\(\*\) as cnt\s*FROM join_request/i, 'Debe incluir subconsulta agrupada de solicitudes');
      assert.match(pastorRs, /LEFT JOIN \(\s*SELECT edition_id, AVG\(attendee_count\) as avg_headcount/i, 'Debe incluir subconsulta agrupada de promedios');
    });

    it('no debe ejecutar subconsultas SQLite dentro del bucle while row.next', () => {
      assert.doesNotMatch(pastorRs, /while let Some\(row\) = rows\.next\(\)\? \{\s*db\.query_row/i, 'No debe ejecutar query_row dentro del bucle');
    });
  });

  // ==========================================================================
  // Decisión 7 (GOLD-356): Paginación y Control de Memoria en Safari Móvil
  // ==========================================================================
  describe('Decisión 7 (GOLD-356): Paginación y Control de Memoria en Safari Móvil', () => {
    const publicPortal = fs.readFileSync(path.join(componentsDir, 'PublicPortal.tsx'), 'utf-8');

    it('PublicPortal debe limitar los grupos visibles inicialmente a un umbral liviano', () => {
      assert.match(publicPortal, /visibleLimit/, 'Debe manejar estado visibleLimit');
      assert.match(publicPortal, /setVisibleLimit/, 'Debe permitir paginar grupos');
    });

    it('debe contar con botón de carga progresiva', () => {
      assert.match(publicPortal, /btn-load-more/, 'Debe tener botón para cargar más comunidades');
    });
  });

  // ==========================================================================
  // Decisión 8 (GOLD-357): HUD Atómico de Reunión en Vivo para el Líder de Hogar
  // ==========================================================================
  describe('Decisión 8 (GOLD-357): HUD Atómico de Reunión en Vivo para el Líder de Hogar', () => {
    const memberSilo = fs.readFileSync(path.join(componentsDir, 'MemberSilo.tsx'), 'utf-8');

    it('MemberSilo debe renderizar el HUD de reunión en vivo para el líder', () => {
      assert.match(memberSilo, /id="leader-live-meeting-hud"/i, 'Debe existir el elemento leader-live-meeting-hud');
      assert.match(memberSilo, /Reunión de Esta Semana/i, 'Debe titularse Reunión de Esta Semana');
    });

    it('debe incluir acciones inmediatas para Maps/Waze y WhatsApp', () => {
      assert.match(memberSilo, /id="btn-hud-open-maps"/i, 'Debe incluir botón directo de Maps');
      assert.match(memberSilo, /id="btn-hud-remind-whatsapp"/i, 'Debe incluir botón directo de WhatsApp');
    });

    it('debe permitir registrar asistencia rápida en 2 toques', () => {
      assert.match(memberSilo, /id=\{`btn-hud-range-\$\{bin\.id\}`\}/i, 'Debe tener opción táctil de rango');
      assert.match(memberSilo, /id=\{`btn-hud-mood-\$\{mood\.id\}`\}/i, 'Debe tener opción táctil de ánimo');
      assert.match(memberSilo, /id="btn-hud-quick-save-headcount"/i, 'Debe tener botón de guardado rápido de asistencia');
    });
  });

  // ==========================================================================
  // Decisión 9 (GOLD-358): Confinamiento Estacional a Semanas 10-12
  // ==========================================================================
  describe('Decisión 9 (GOLD-358): Confinamiento Estacional a Semanas 10-12', () => {
    const memberSilo = fs.readFileSync(path.join(componentsDir, 'MemberSilo.tsx'), 'utf-8');

    it('MemberSilo debe condicionar la fisión celular y cierre por semana de temporada', () => {
      assert.match(memberSilo, /currentSeasonWeek >= 10 \|\| showSeasonClosureSection/, 'Debe verificar semana estacional');
      assert.match(memberSilo, /btn-show-seasonal-governance/, 'Debe permitir desplegar gobernanza a demanda');
    });

    it('el menú de herramientas deslizable debe permitir acceder al cierre de ciclo', () => {
      assert.match(memberSilo, /btn-drawer-season-closure/, 'Debe incluir botón en el cajón de herramientas');
    });
  });

  // ==========================================================================
  // Decisión 10 (GOLD-359): Relieve Sutil, Contraste AAA y Cero Óvalos Vacíos
  // ==========================================================================
  describe('Decisión 10 (GOLD-359): Relieve Sutil, Contraste AAA y Cero Óvalos Vacíos', () => {
    const cssContent = fs.readFileSync(path.join(srcDir, 'index.css'), 'utf-8');
    const publicPortal = fs.readFileSync(path.join(componentsDir, 'PublicPortal.tsx'), 'utf-8');

    it('index.css debe definir el relieve de luz superior de 1px en tarjetas', () => {
      assert.match(cssContent, /inset 0 1px 0 rgba\(255, 255, 255, 0\.06\)/, 'Debe aplicar relieve de luz de 1px');
    });

    it('el color de texto atenuado en modo oscuro debe cumplir contraste WCAG AAA (#8F8A80)', () => {
      assert.match(cssContent, /--text-dim:\s*#8F8A80/i, 'Debe fijar --text-dim a #8F8A80 para legibilidad AAA');
    });

    it('los botones de filtro en PublicPortal deben tener contraste sólido dorado y no quedar como óvalos blancos vacíos', () => {
      assert.match(publicPortal, /btn-track-all/, 'Debe existir el botón principal de filtro');
      assert.match(publicPortal, /color:\s*intentTrack === 'both' \? '#161513' : 'var\(--text-primary\)'/, 'Debe tener color de texto explícito');
    });
  });

  // ==========================================================================
  // Directivas Adicionales: Sedes Recursivas, Gobernanza Ágil y Armonizador de Líderes
  // ==========================================================================
  describe('Directivas Operativas: Sedes Recursivas, Gobernanza de Iniciativas y Armonizador de Líderes', () => {
    const publicPortal = fs.readFileSync(path.join(componentsDir, 'PublicPortal.tsx'), 'utf-8');
    const initiativesHub = fs.readFileSync(path.join(componentsDir, 'CommunityInitiativesHub.tsx'), 'utf-8');
    const cellHarmonizer = fs.readFileSync(path.join(componentsDir, 'CellHarmonizer.tsx'), 'utf-8');
    const memberSilo = fs.readFileSync(path.join(componentsDir, 'MemberSilo.tsx'), 'utf-8');
    const elderDesk = fs.readFileSync(path.join(componentsDir, 'ElderDesk.tsx'), 'utf-8');
    const pastorHud = fs.readFileSync(path.join(componentsDir, 'PastorHud.tsx'), 'utf-8');

    it('PublicPortal debe renderizar sedes dominicales recursivas con enlaces directos a Google Maps', () => {
      assert.match(publicPortal, /id=\{`btn-campus-maps-\$\{camp\.slug\}`\}/, 'Debe incluir botón dinámico a Google Maps por sede');
      assert.match(publicPortal, /maps\.google\.com\/\?q=/i, 'Debe dirigir a Google Maps con la dirección física');
      assert.match(publicPortal, /Domingos 10:00 y 12:30 hrs/, 'Debe mostrar horarios de reunión dominical');
      assert.doesNotMatch(publicPortal, /Punto de Conexión Dominical en el Atrio/i, 'No debe tener banner redundante de atrio');
    });

    it('CommunityInitiativesHub debe permitir a Ancianos y Pastores crear actividades oficiales y transformar sugerencias', () => {
      assert.match(initiativesHub, /btn-elder-new-initiative/, 'Debe existir botón de creación oficial de actividades');
      assert.match(initiativesHub, /btn-elder-suggestions-inbox/, 'Debe existir buzón de sugerencias de líderes');
      assert.match(initiativesHub, /btn-transform-suggestion-/, 'Debe permitir transformar sugerencia en 1 toque');
      assert.match(initiativesHub, /btn-clone-suggestion-/, 'Debe permitir clonar sugerencia para adaptación');
    });

    it('CommunityInitiativesHub debe permitir a Líderes y Diáconos proponer iniciativas comunitarias', () => {
      assert.match(initiativesHub, /btn-propose-initiative/, 'Líderes y diáconos deben poder proponer actividades');
      assert.match(initiativesHub, /Proponer Iniciativa Comunitaria a Ancianos/i, 'Debe incluir texto de propuesta a ancianos');
    });

    it('MemberSilo debe ofrecer en el HUD del líder el botón para decidir integración a eventos o carne asada', () => {
      assert.match(memberSilo, /id="btn-hud-harmonizer"/, 'HUD del líder debe tener botón directo btn-hud-harmonizer');
      assert.match(memberSilo, /Integración a Eventos \/ Convivio/i, 'HUD debe contener tarjeta de integración a eventos');
      assert.match(memberSilo, /leaderHarmonizedStatus/, 'Debe reflejar estado de integración en el HUD');
    });

    it('CellHarmonizer debe implementar la decisión de Carne Asada / Convivio fraternal entre células', () => {
      assert.match(cellHarmonizer, /section-joint-bbq-harmonizer/, 'Debe contener la sección de Carne Asada / Convivio fraternal');
      assert.match(cellHarmonizer, /toggle-harmonizer-joint-bbq/, 'Debe incluir toggle para unir grupo a carne asada');
      assert.match(cellHarmonizer, /select-harmonizer-sister-cell/, 'Debe incluir selector de célula hermana');
      assert.match(cellHarmonizer, /btn-confirm-joint-bbq/, 'Debe incluir botón de confirmación de integración a carne asada');
      assert.match(cellHarmonizer, /btn-cancel-joint-bbq/, 'Debe incluir botón para mantener reunión regular');
    });

    it('ElderDesk y PastorHud deben integrar la gobernanza de iniciativas comunitarias', () => {
      assert.match(elderDesk, /tab-elder-initiatives/, 'ElderDesk debe tener pestaña de iniciativas');
      assert.match(pastorHud, /tab-pastor-initiatives/, 'PastorHud debe tener pestaña de iniciativas');
    });

    it('MemberSilo debe confinar las decisiones personales y servicio comunitario a Mi Perfil fuera de la consola de Líder', () => {
      assert.match(memberSilo, /!isLeaderView\s*&&[\s\S]*?¿Quiénes vienen a cenar hoy\?/i, 'El micro-RSVP personal debe estar confinado a !isLeaderView');
      assert.match(memberSilo, /!isLeaderView\s*&&[\s\S]*?<CommunityInitiativesHub/i, 'Las iniciativas comunitarias no deben invadir la consola del líder');
    });

    it('RoleSwitcher debe titular Mi Perfil para distinguir el espacio personal del discípulo de la consola de Líder', () => {
      const roleSwitcher = fs.readFileSync(path.join(componentsDir, 'RoleSwitcher.tsx'), 'utf-8');
      assert.match(roleSwitcher, /Mi Perfil/, 'Debe utilizar Mi Perfil para el rol member');
      assert.doesNotMatch(roleSwitcher, /Mi Grupo<\/button>/i, 'No debe confundir el rol de miembro como Mi Grupo en la barra');
    });
  });
});
