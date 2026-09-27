import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const pastorHudPath = path.resolve('src/components/PastorHud.tsx');
const pastorHudCode = fs.readFileSync(pastorHudPath, 'utf8');

const groupPastoralCardPath = path.resolve('src/components/GroupPastoralCard.tsx');
const groupPastoralCardCode = fs.readFileSync(groupPastoralCardPath, 'utf8');

const pastorAntiCollisionPath = path.resolve('src/components/PastorAntiCollisionDesk.tsx');
const pastorAntiCollisionCode = fs.readFileSync(pastorAntiCollisionPath, 'utf8');

const indexCssPath = path.resolve('src/index.css');
const indexCssCode = fs.readFileSync(indexCssPath, 'utf8');

const memberSiloPath = path.resolve('src/components/MemberSilo.tsx');
const memberSiloCode = fs.readFileSync(memberSiloPath, 'utf8');

describe('Pórtico OS v3.8 - Ciclo 16: Radar de Cuidado y Pastoreo, Ergonomía y Calm Tech', () => {

  describe('Decisión 1-B: Barra de Herramientas Despejada y Jerarquía de 2 Botones', () => {
    it('debe tener exactamente 2 botones primarios operativos en el HUD: Emitir Comunicado y Buscar y Filtrar', () => {
      assert.ok(pastorHudCode.includes('id="btn-pastor-broadcast"'), 'Falta botón de emitir comunicado');
      assert.ok(pastorHudCode.includes('<span>Emitir Comunicado</span>'), 'Texto incorrecto en botón de comunicado');
      assert.ok(pastorHudCode.includes('id="btn-pastor-toggle-search"'), 'Falta botón de alternar búsqueda');
      assert.ok(pastorHudCode.includes('<span>Buscar y Filtrar</span>'), 'Texto incorrecto en botón de búsqueda');
    });

    it('debe relegar ajustes, impresión y exportación soberana al menú secundario de Mantenimiento', () => {
      assert.ok(pastorHudCode.includes('id="btn-pastor-maintenance-menu"'), 'Falta menú de mantenimiento');
      assert.ok(pastorHudCode.includes('<span>Mantenimiento</span>'), 'Falta texto Mantenimiento');
      assert.ok(pastorHudCode.includes('showMaintenanceMenu'), 'Falta estado showMaintenanceMenu');
      assert.ok(pastorHudCode.includes('Nomenclatura y Paleta'), 'Falta opción Nomenclatura y Paleta');
      assert.ok(pastorHudCode.includes('Imprimir Folio Físico'), 'Falta opción de impresión física');
      assert.ok(pastorHudCode.includes('Descargar Datos (ZIP)'), 'Falta opción de exportación ZIP soberana');
    });
  });

  describe('Decisión 2-B: Ergonomía Móvil (Bottom Sheet) y Split-Pane en Pantallas Amplias', () => {
    it('debe definir las clases CSS .pastoral-bottom-sheet y .pastoral-sheet-backdrop para móviles', () => {
      assert.ok(indexCssCode.includes('.pastoral-bottom-sheet'), 'Falta clase .pastoral-bottom-sheet en index.css');
      assert.ok(indexCssCode.includes('.pastoral-sheet-backdrop'), 'Falta clase .pastoral-sheet-backdrop en index.css');
    });

    it('debe habilitar split-pane en escritorio para pantallas >= 768px mediante .tablet-master-detail', () => {
      assert.ok(indexCssCode.includes('@media (min-width: 768px)'), 'Falta media query para desktop/tablet split-pane');
      assert.ok(indexCssCode.includes('.tablet-master-detail'), 'Falta clase .tablet-master-detail');
      assert.ok(indexCssCode.includes('grid-template-columns: 360px 1fr;'), 'Falta definición de columnas split-pane');
    });

    it('debe conectar el drawer móvil en PastorHud para apertura fluida al seleccionar grupo', () => {
      assert.ok(pastorHudCode.includes('showMobileDetail'), 'Falta estado showMobileDetail');
      assert.ok(pastorHudCode.includes('className="pastoral-bottom-sheet"'), 'Falta aplicación de clase pastoral-bottom-sheet');
      assert.ok(pastorHudCode.includes('className="pastoral-sheet-backdrop"'), 'Falta aplicación de clase pastoral-sheet-backdrop');
    });
  });

  describe('Decisión 3-B: Triaje por Excepción y Gestión Inbox Zero', () => {
    it('debe calcular grupos con anomalías críticas o fatiga de anfitrión', () => {
      assert.ok(pastorHudCode.includes('fatigueRadar.filter'), 'Falta filtro de fatiga');
      assert.ok(pastorHudCode.includes('average_headcount < 6'), 'Falta filtro de baja asistencia');
    });

    it('debe mostrar la sección "Requiere Atención Hoy" si hay excepciones activas', () => {
      assert.ok(pastorHudCode.includes('Requiere Atención Hoy'), 'Falta título Requiere Atención Hoy');
    });

    it('debe celebrar la paz pastoral con "Rebaño en Paz: Cero anomalías activas hoy" cuando no hay pendientes', () => {
      assert.ok(pastorHudCode.includes('Rebaño en Paz: Cero anomalías activas hoy'), 'Falta mensaje de Rebaño en Paz');
      assert.ok(pastorHudCode.includes('Todas las células reportan asistencia estable'), 'Falta explicación de asistencia estable');
    });
  });

  describe('Decisión 4-B: Tecnología Serena y Ausencia de Manifiestos Defensivos', () => {
    it('debe exhibir un badge sobrio de "Santuario Cifrado Eclesiástico" sin discursos defensivos', () => {
      assert.ok(pastorHudCode.includes('Santuario Cifrado Eclesiástico'), 'Falta badge de Santuario Cifrado Eclesiástico');
      assert.ok(pastorHudCode.includes('Supervisión Fraterna de Redes Celulares'), 'Falta subtítulo pastoral sobrio');
    });

    it('no debe exhibir manifiestos anti-SaaS ni jerga combativa en la interfaz pastoral', () => {
      assert.ok(!pastorHudCode.toLowerCase().includes('manifiesto soberano anti-saas'), 'No debe tener manifiesto anti-SaaS en UI');
      assert.ok(!pastorHudCode.toLowerCase().includes('búnker soberano'), 'No debe usar metáfora de búnker');
    });
  });

  describe('Decisión 5-B: Disciplina Eclesiástica en Presbiterio bajo Principio de los Cuatro Ojos (Maker-Checker)', () => {
    it('debe ubicar el Tribunal Conciliar y Medidas Disciplinarias en el Consejo de Ancianos', () => {
      assert.ok(pastorHudCode.includes('Tribunal Conciliar y Medidas de Disciplina (Mateo 18)'), 'Falta Tribunal Conciliar en Ancianos');
      assert.ok(pastorHudCode.includes('id="btn-open-discipline-modal"'), 'Falta botón para abrir sesión disciplinaria');
      assert.ok(pastorHudCode.includes('Gobernanza Colegiada • Regla de los Cuatro Ojos'), 'Falta mención a Regla de los Cuatro Ojos');
    });

    it('el modal de disciplina debe exigir doble firma de dos ancianos (Maker y Checker)', () => {
      assert.ok(pastorHudCode.includes('Anciano Proponente (Maker)'), 'Falta selector de Anciano Proponente');
      assert.ok(pastorHudCode.includes('Segundo Anciano / Pastor Ratificador (Checker)'), 'Falta selector de Anciano Ratificador');
      assert.ok(pastorHudCode.includes('disciplineProposer'), 'Falta estado disciplineProposer');
      assert.ok(pastorHudCode.includes('disciplineChecker'), 'Falta estado disciplineChecker');
      assert.ok(pastorHudCode.includes('Acta conciliar registrada con doble firma'), 'Falta aviso de acta con doble firma');
    });
  });

  describe('Decisión 6-B: Búsqueda Predictiva Multi-Factor en Memoria', () => {
    it('debe implementar estado searchQuery y toggle showSearchInput', () => {
      assert.ok(pastorHudCode.includes('const [searchQuery, setSearchQuery]'), 'Falta estado searchQuery');
      assert.ok(pastorHudCode.includes('const [showSearchInput, setShowSearchInput]'), 'Falta estado showSearchInput');
    });

    it('debe filtrar en tiempo real por nombre de grupo, facilitador, zona, afinidad y día', () => {
      assert.ok(pastorHudCode.includes('g.nombre_publico.toLowerCase().includes(q)'), 'Falta filtro por nombre');
      assert.ok(pastorHudCode.includes('g.leader_name.toLowerCase().includes(q)'), 'Falta filtro por líder');
      assert.ok(pastorHudCode.includes('g.zone.toLowerCase().includes(q)'), 'Falta filtro por zona');
      assert.ok(pastorHudCode.includes('g.affinity.toLowerCase().includes(q)'), 'Falta filtro por afinidad');
    });
  });

  describe('Decisión 7-B: Paleta Noble Santuario y Olivo', () => {
    it('debe incluir la paleta noble en las opciones de configuración de marca', () => {
      assert.ok(pastorHudCode.includes('Santuario Cifrado'), 'Falta paleta Santuario');
      assert.ok(indexCssCode.includes('--accent-olive') || pastorHudCode.includes('accent-olive'), 'Falta token de color olivo');
    });
  });

  describe('Decisión 8-B: Contacto Fraterno Directo a 1-Toque vía WhatsApp (wa.me)', () => {
    it('debe generar URLs de WhatsApp wa.me con plantillas fraternas y respetuosas', () => {
      assert.ok(pastorHudCode.includes('generateFraternalWhatsAppUrl'), 'Falta función generateFraternalWhatsAppUrl');
      assert.ok(pastorHudCode.includes('https://wa.me/'), 'Falta generación de enlace wa.me');
      assert.ok(pastorHudCode.includes('un abrazo fraterno de parte del equipo pastoral'), 'Falta plantilla fraterna estándar');
      assert.ok(pastorHudCode.includes('¿Cómo te has sentido y cómo podemos apoyarte'), 'Falta plantilla de acompañamiento pastoral');
    });

    it('debe incluir botón de WhatsApp tanto en el split-pane de escritorio como en el bottom sheet móvil', () => {
      const waMatches = pastorHudCode.match(/generateFraternalWhatsAppUrl/g);
      assert.ok(waMatches && waMatches.length >= 3, 'Debe invocar la acción de WhatsApp en desktop y móvil');
    });
  });

  describe('Decisión 9-C: Enfoque 100% Pastoral y Espiritual (Cero Métricas Financieras ni ROI)', () => {
    it('el HUD del pastor no debe tener métricas de ingresos, diezmos per cápita ni fórmulas comerciales', () => {
      assert.ok(!pastorHudCode.toLowerCase().includes('diezmo per cápita'), 'No debe haber diezmo per cápita');
      assert.ok(!pastorHudCode.toLowerCase().includes('ingreso bruto'), 'No debe haber métricas de ingreso bruto');
      assert.ok(!pastorHudCode.toLowerCase().includes('roi de célula'), 'No debe haber ROI');
    });
  });

  describe('Decisión 10-B: Convocatorias Eclesiales Integradas en Ficha Pastoral', () => {
    it('debe mostrar la sección de Convocatorias Eclesiales en el detalle pastoral', () => {
      assert.ok(pastorHudCode.includes('Participación en Convocatorias Eclesiales'), 'Falta sección de Convocatorias Eclesiales');
      assert.ok(pastorHudCode.includes('Carne Asada Inter-Células'), 'Falta convocatoria comunitaria de ejemplo');
      assert.ok(pastorHudCode.includes('jornadas de servicio comunitario'), 'Falta jornada de servicio comunitario');
    });
  });

  describe('GOLD-348: Descentralización Litúrgica y Primacía de los 4 Elementos del Santuario', () => {
    it('MemberSilo.tsx no debe contener currículo homogéneo obligatorio, temas semanales forzados ni videos disparadores', () => {
      assert.ok(!memberSiloCode.includes('Guía y Temas Semanales • Amor y Gracia Durango'), 'Aún contiene Guía y Temas Semanales');
      assert.ok(!memberSiloCode.includes('Disparador en Video'), 'Aún contiene video disparador central');
      assert.ok(!memberSiloCode.includes('Josh García'), 'Aún contiene referencia a Josh García');
    });

    it('MemberSilo.tsx debe estructurar el Ritmo del Encuentro con los 4 Elementos del Santuario y libertad relacional', () => {
      assert.ok(memberSiloCode.includes('Ritmo del Encuentro • Los 4 Elementos del Santuario'), 'Falta título de Los 4 Elementos del Santuario');
      assert.ok(memberSiloCode.includes('1. MESA Y BIENVENIDA'), 'Falta elemento 1');
      assert.ok(memberSiloCode.includes('2. LA PALABRA'), 'Falta elemento 2');
      assert.ok(memberSiloCode.includes('3. INTERCESIÓN'), 'Falta elemento 3');
      assert.ok(memberSiloCode.includes('4. BENDICIÓN'), 'Falta elemento 4');
      assert.ok(memberSiloCode.includes('En Amor y Gracia no imponemos temas semanales ni currículos homogéneos'), 'Falta declaración de libertad eclesial');
      assert.ok(memberSiloCode.includes('ej. Éxodo'), 'Falta referencia a estudio de libros bíblicos acordados informalmente');
    });
  });

  describe('Purga de Debris y Cero Emojis en Componentes Pastorales', () => {
    it('PastorHud.tsx no debe contener emojis ni caracteres unicode decorativos (✓, ✕, 📦, etc.)', () => {
      const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/g;
      const matches = pastorHudCode.match(emojiRegex);
      assert.equal(matches, null, `PastorHud contiene emojis no deseados: ${matches ? matches.join(' ') : ''}`);
    });

    it('GroupPastoralCard.tsx no debe contener emojis ni caracteres unicode decorativos', () => {
      const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/g;
      const matches = groupPastoralCardCode.match(emojiRegex);
      assert.equal(matches, null, `GroupPastoralCard contiene emojis no deseados: ${matches ? matches.join(' ') : ''}`);
    });

    it('PastorAntiCollisionDesk.tsx no debe contener emojis ni caracteres unicode decorativos', () => {
      const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/g;
      const matches = pastorAntiCollisionCode.match(emojiRegex);
      assert.equal(matches, null, `PastorAntiCollisionDesk contiene emojis no deseados: ${matches ? matches.join(' ') : ''}`);
    });

    it('no debe existir texto visible de tickets GOLD- en GroupPastoralCard ni PastorAntiCollisionDesk', () => {
      assert.ok(!groupPastoralCardCode.includes('(GOLD-300)'), 'GroupPastoralCard aún tiene (GOLD-300)');
      assert.ok(!pastorAntiCollisionCode.includes('(GOLD-301)'), 'PastorAntiCollisionDesk aún tiene (GOLD-301)');
    });
  });
});
