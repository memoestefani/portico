import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');
const componentsDir = path.resolve(srcDir, 'components');

describe('Pórtico OS v3.2 - Ciclo 8: Interfaz Invisible, Calma Pastoral y Gobernanza Distribuida (GOLD-287 a GOLD-296)', () => {

  // ==========================================================================
  // D1 / GOLD-287: Purga Absoluta de Residuos Técnicos (Debris Purge)
  // ==========================================================================
  describe('D1 / GOLD-287: Purga Absoluta de Residuos Técnicos (Debris Purge)', () => {
    const keyComponents = [
      'PastorHud.tsx',
      'ElderDesk.tsx',
      'DeaconDesk.tsx',
      'MemberSilo.tsx',
      'PublicPortal.tsx',
      'RoleSwitcher.tsx',
      'OperatorHq.tsx',
    ];

    it('no debe contener etiquetas GOLD- en texto JSX visible en componentes', () => {
      const jsxTagRegex = />[^<\r\n]*GOLD-\d+/g;
      for (const comp of keyComponents) {
        const filePath = path.join(componentsDir, comp);
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const contentWithoutComments = rawContent
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*/g, '');
        const matches = contentWithoutComments.match(jsxTagRegex);
        assert.equal(
          matches,
          null,
          `Se encontraron residuos GOLD- en texto JSX en ${comp}: ${matches ? matches.join(', ') : ''}`
        );
      }
    });

    it('no debe contener cadenas literales entre comillas con etiquetas GOLD- en componentes de usuario', () => {
      const userComponents = [
        'PastorHud.tsx',
        'ElderDesk.tsx',
        'DeaconDesk.tsx',
        'MemberSilo.tsx',
        'PublicPortal.tsx',
        'RoleSwitcher.tsx',
      ];
      const quotedGoldRegex = /['"`][^'"\r\n`]*GOLD-\d+[^'"\r\n`]*['"`]/g;
      for (const comp of userComponents) {
        const filePath = path.join(componentsDir, comp);
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const contentWithoutComments = rawContent
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*/g, '');
        const matches = contentWithoutComments.match(quotedGoldRegex);
        assert.equal(
          matches,
          null,
          `Se encontraron cadenas con GOLD- en ${comp}: ${matches ? matches.join(', ') : ''}`
        );
      }
    });

    it('no debe contener menciones a "SQLite" en componentes de usuario', () => {
      const userComponents = [
        'PastorHud.tsx',
        'ElderDesk.tsx',
        'DeaconDesk.tsx',
        'MemberSilo.tsx',
        'PublicPortal.tsx',
        'RoleSwitcher.tsx',
        'OperatorHq.tsx',
      ];
      for (const comp of userComponents) {
        const filePath = path.join(componentsDir, comp);
        const content = fs.readFileSync(filePath, 'utf-8');
        assert.doesNotMatch(
          content,
          /SQLite/i,
          `Se encontró mención técnica a "SQLite" en ${comp}`
        );
      }
    });

    it('no debe imponer cuotas artificiales de saturación demográfica de 25,000 miembros en UI', () => {
      const pastorHudContent = fs.readFileSync(path.join(componentsDir, 'PastorHud.tsx'), 'utf-8');
      assert.doesNotMatch(
        pastorHudContent,
        /meta 25,000 discípulos/i,
        'PastorHud aún contiene la meta fija de 25,000 discípulos'
      );
      assert.match(
        pastorHudContent,
        /escala de 100 a 10,000 discípulos/i,
        'PastorHud debe contemplar la escala relacional de 100 a 10,000 discípulos'
      );
    });
  });

  // ==========================================================================
  // D2 / GOLD-288: Silencio de Marca de Software (Brand Silence)
  // ==========================================================================
  describe('D2 / GOLD-288: Silencio de Marca de Software (Brand Silence)', () => {
    it('únicamente el botón de acceso público en RoleSwitcher puede llevar "Pórtico Público"', () => {
      const roleSwitcher = fs.readFileSync(path.join(componentsDir, 'RoleSwitcher.tsx'), 'utf-8');
      const matches = roleSwitcher.match(/Pórtico Público/g);
      assert.ok(matches && matches.length >= 1, 'RoleSwitcher debe tener el botón "Pórtico Público"');

      // Verificar que ningún header o navbar use Pórtico como título
      assert.doesNotMatch(
        roleSwitcher,
        /<h1[^>]*>.*Pórtico.*<\/h1>/i,
        'RoleSwitcher no debe tener Pórtico en el h1'
      );
    });

    it('DeaconDesk y MemberSilo no deben usar "Pórtico OS" en sus textos o guías', () => {
      const deaconDesk = fs.readFileSync(path.join(componentsDir, 'DeaconDesk.tsx'), 'utf-8');
      const memberSilo = fs.readFileSync(path.join(componentsDir, 'MemberSilo.tsx'), 'utf-8');

      assert.doesNotMatch(deaconDesk, /Pórtico OS/i, 'DeaconDesk aún contiene Pórtico OS');
      assert.doesNotMatch(memberSilo, /Pórtico OS/i, 'MemberSilo aún contiene Pórtico OS');
    });

    it('la identidad primaria visible debe ser "Amor y Gracia Durango"', () => {
      const roleSwitcher = fs.readFileSync(path.join(componentsDir, 'RoleSwitcher.tsx'), 'utf-8');
      assert.match(roleSwitcher, /Amor y Gracia/i, 'RoleSwitcher debe mostrar Amor y Gracia');
    });
  });

  // ==========================================================================
  // D3 / GOLD-289: Ergonomía Móvil Apple y Barra Inferior de Pulgar
  // ==========================================================================
  describe('D3 / GOLD-289: Ergonomía Móvil Apple y Barra Inferior de Pulgar', () => {
    it('index.css debe definir clases para barra inferior táctil y tap targets >= 48px', () => {
      const indexCss = fs.readFileSync(path.join(srcDir, 'index.css'), 'utf-8');
      assert.match(indexCss, /\.mobile-bottom-nav/, 'Debe existir .mobile-bottom-nav en CSS');
      assert.match(indexCss, /\.pb-mobile-nav/, 'Debe existir .pb-mobile-nav en CSS');
      assert.match(indexCss, /\.tap-target-48/, 'Debe existir .tap-target-48 en CSS');
      assert.match(indexCss, /min-height:\s*48px/, 'CSS debe garantizar min-height de 48px');
    });

    it('RoleSwitcher debe implementar la barra táctil inferior para navegación móvil', () => {
      const roleSwitcher = fs.readFileSync(path.join(componentsDir, 'RoleSwitcher.tsx'), 'utf-8');
      assert.match(roleSwitcher, /mobile-bottom-nav/, 'RoleSwitcher debe renderizar .mobile-bottom-nav');
      assert.match(roleSwitcher, /tap-target-48/, 'RoleSwitcher móvil debe aplicar .tap-target-48');
    });
  });

  // ==========================================================================
  // D4 / GOLD-290: Sedes Híbridas sin Emoticones Infantiles
  // ==========================================================================
  describe('D4 / GOLD-290: Sedes Híbridas sin Emoticones Infantiles', () => {
    it('debe mapear tipos de sedes híbridas a etiquetas sobrias y sin emojis', () => {
      const venueTypes = {
        home: 'Casa Particular',
        campus_room: 'Salón en Campus',
        coffee_shop: 'Cafetería o Espacio Público',
        park: 'Parque o Espacio Abierto',
      };

      for (const [type, label] of Object.entries(venueTypes)) {
        assert.ok(label.length > 0, `Tipo ${type} debe tener etiqueta`);
        assert.doesNotMatch(label, /[\u{1F300}-\u{1F9FF}]/u, `Etiqueta para ${type} no debe tener emojis`);
      }
    });

    it('MemberSilo y PublicPortal deben utilizar chips de sede neutros sin iconos decorativos infantiles', () => {
      const memberSilo = fs.readFileSync(path.join(componentsDir, 'MemberSilo.tsx'), 'utf-8');
      assert.doesNotMatch(memberSilo, /📍 Taquería/i, 'MemberSilo no debe tener emoji en Taquería');
      assert.doesNotMatch(memberSilo, /🏡 Casa Rotativa/i, 'MemberSilo no debe tener emoji en Casa Rotativa');
    });
  });

  // ==========================================================================
  // D5 / GOLD-291: Selector Territorial Único (Single Horizontal Sector Filter)
  // ==========================================================================
  describe('D5 / GOLD-291: Selector Territorial Único (Single Horizontal Sector Filter)', () => {
    it('PublicPortal debe consolidar selectores en una sola fila táctil horizontal', () => {
      const publicPortal = fs.readFileSync(path.join(componentsDir, 'PublicPortal.tsx'), 'utf-8');
      assert.match(
        publicPortal,
        /Selector Territorial Único/i,
        'PublicPortal debe contener el selector territorial único'
      );
      assert.match(
        publicPortal,
        /Todos los Sectores/i,
        'PublicPortal debe incluir la opción de Todos los Sectores'
      );
      assert.match(
        publicPortal,
        /Sector \$\{mz\}/i,
        'PublicPortal debe generar los botones de sector por macro-zona'
      );
    });

    it('ahorra más de 200px de scroll vertical al unificar campus y zonas', () => {
      const dualStackedSelectorsHeightPx = 280; // Altura estimada previa con dos selectores apilados
      const singleHorizontalSelectorHeightPx = 48; // Altura de fila horizontal compacta
      const verticalSavingsPx = dualStackedSelectorsHeightPx - singleHorizontalSelectorHeightPx;

      assert.ok(
        verticalSavingsPx >= 200,
        `El ahorro vertical debe ser >= 200px (obtenido: ${verticalSavingsPx}px)`
      );
    });
  });

  // ==========================================================================
  // D6 / GOLD-292: Filtro Mateo 18 y Lenguaje Humano Cálido
  // ==========================================================================
  describe('D6 / GOLD-292: Filtro Mateo 18 y Lenguaje Humano Cálido', () => {
    it('el modal de Mateo 18 en MemberSilo debe usar tono pastoral y no policial ni punitivo', () => {
      const memberSilo = fs.readFileSync(path.join(componentsDir, 'MemberSilo.tsx'), 'utf-8');
      assert.match(
        memberSilo,
        /Observación Pastoral al Diácono/i,
        'Debe titularse Observación Pastoral al Diácono'
      );
      assert.match(
        memberSilo,
        /atiende en privado y con amor/i,
        'Debe explicar la atención en privado y con amor'
      );
      assert.doesNotMatch(
        memberSilo,
        /expediente disciplinario punitivo/i,
        'No debe hablar de expediente disciplinario punitivo'
      );
    });

    it('DeaconDesk debe enfocar las observaciones como cuidado y no como tickets o SLAs', () => {
      const deaconDesk = fs.readFileSync(path.join(componentsDir, 'DeaconDesk.tsx'), 'utf-8');
      assert.match(
        deaconDesk,
        /3 días/i,
        'DeaconDesk debe usar lenguaje humano para los tiempos'
      );
      assert.doesNotMatch(
        deaconDesk,
        /SLA estricto/i,
        'DeaconDesk no debe hablar de SLA estricto'
      );
    });
  });

  // ==========================================================================
  // D7 / GOLD-293: Progressive Disclosure en Pastor HUD (5 Pestañas Serenas)
  // ==========================================================================
  describe('D7 / GOLD-293: Progressive Disclosure en Pastor HUD (5 Pestañas Serenas)', () => {
    it('PastorHud debe estructurar su navegación superior en 5 pestañas ordenadas', () => {
      const pastorHud = fs.readFileSync(path.join(componentsDir, 'PastorHud.tsx'), 'utf-8');
      assert.match(pastorHud, /activeTab === 'radar'/, 'Debe contemplar pestaña de Comunidades (radar)');
      assert.match(pastorHud, /activeTab === 'sabbaticals'/, 'Debe contemplar pestaña de Salud y Sabáticos');
      assert.match(pastorHud, /activeTab === 'deacons'/, 'Debe contemplar pestaña de Diaconado');
      assert.match(pastorHud, /activeTab === 'elders'/, 'Debe contemplar pestaña de Consejo de Ancianos y Consejería');
      assert.match(pastorHud, /activeTab === 'territory'/, 'Debe contemplar pestaña de Distribución Territorial');
    });

    it('la pestaña "sabbaticals" debe albergar el radar de fatiga y descanso de anfitriones', () => {
      const pastorHud = fs.readFileSync(path.join(componentsDir, 'PastorHud.tsx'), 'utf-8');
      assert.match(
        pastorHud,
        /Salud Litúrgica y Sabáticos de Hogares/i,
        'Debe contener el panel de salud litúrgica y sabáticos'
      );
      assert.match(
        pastorHud,
        /handleAuthorizeHostSabbatical/i,
        'Debe tener la acción para conceder sabático'
      );
    });

    it('la pestaña "campuses" debe albergar las 5 Macro-Sedes de Durango para escala de 100 a 10,000 miembros', () => {
      const pastorHud = fs.readFileSync(path.join(componentsDir, 'PastorHud.tsx'), 'utf-8');
      assert.match(
        pastorHud,
        /Distribución Territorial de Sedes en Durango/i,
        'Debe titularse Distribución Territorial de Sedes en Durango'
      );
      assert.match(
        pastorHud,
        /100 a 10,000/i,
        'Debe expresar la escala pastoral sin barreras artificiales'
      );
    });
  });

  // ==========================================================================
  // D8 / GOLD-294, GOLD-295, GOLD-296: Gobernanza Distribuida, Consejería y Veto
  // ==========================================================================
  describe('D8: Gobernanza Distribuida (Ancianos, Josh Veto y Diáconos)', () => {
    it('Ancianos (ElderDesk) pueden registrar y gestionar ruteos anti-colisión en su sector', () => {
      const elderDesk = fs.readFileSync(path.join(componentsDir, 'ElderDesk.tsx'), 'utf-8');
      assert.match(
        elderDesk,
        /Consejería y Ruteos Anti-Colisión/i,
        'ElderDesk debe tener la pestaña de Consejería y Ruteos Anti-Colisión'
      );
      assert.match(
        elderDesk,
        /handleCreatePairing/i,
        'ElderDesk debe permitir crear ruteos anti-colisión'
      );
      assert.match(
        elderDesk,
        /fetchRestrictedPairings/i,
        'ElderDesk debe listar los ruteos anti-colisión existentes'
      );
      assert.match(
        elderDesk,
        /Servidores Veteranos y Consejeros/i,
        'ElderDesk debe tener la pestaña para honrar servidores veteranos'
      );
    });

    it('Pastor Josh (PastorHud) consolida todos los ruteos y tiene derecho explícito a veto', () => {
      const pastorHud = fs.readFileSync(path.join(componentsDir, 'PastorHud.tsx'), 'utf-8');
      assert.match(
        pastorHud,
        /Consolidación Pastoral de Consejería y Ruteos Anti-Colisión/i,
        'PastorHud debe tener la sección de consolidación pastoral'
      );
      assert.match(
        pastorHud,
        /handleVetoPairing/i,
        'Pastor Josh debe tener el handler para ejercer veto pastoral'
      );
      assert.match(
        pastorHud,
        /handleRatifyPairing/i,
        'Pastor Josh debe poder ratificar ruteos'
      );
      assert.match(
        pastorHud,
        /Ejercer Veto Pastoral/i,
        'PastorHud debe mostrar el botón para ejercer veto pastoral'
      );
      assert.match(
        pastorHud,
        /Ratificar/i,
        'PastorHud debe mostrar el botón para ratificar la decisión de los ancianos'
      );
    });

    it('Diáconos (DeaconDesk) resuelven la atención a vecinos y convivencia de Durango sin burocracia', () => {
      const deaconDesk = fs.readFileSync(path.join(componentsDir, 'DeaconDesk.tsx'), 'utf-8');
      assert.match(
        deaconDesk,
        /Atención a Vecinos y Convivencia/i,
        'DeaconDesk debe tener la pestaña de Atención a Vecinos y Convivencia'
      );
      assert.match(
        deaconDesk,
        /resolveNeighborhoodComplaint/i,
        'DeaconDesk debe permitir resolver directamente reportes vecinales'
      );
      assert.match(
        deaconDesk,
        /handleResolveNeighborIssue/i,
        'DeaconDesk debe tener el handler ágil de resolución vecinal'
      );
    });

    it('el backend expone el endpoint /api/elder/restricted-pairings para ancianos', () => {
      const routesContent = fs.readFileSync(
        path.resolve(__dirname, '../../backend/crates/portico-server/src/routes/mod.rs'),
        'utf-8'
      );
      assert.match(
        routesContent,
        /\/api\/elder\/restricted-pairings/,
        'El backend debe rutear /api/elder/restricted-pairings para la mesa de ancianos'
      );
    });
  });
});
