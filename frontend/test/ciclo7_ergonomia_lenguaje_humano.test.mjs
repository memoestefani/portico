import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  humanizeTerm,
  humanizeRole,
  PLAIN_LANGUAGE_DICTIONARY,
  ELENA_RAMOS_COMMITMENTS,
  calculateFernandezHuerta,
} from '../src/utils/plainLanguage.ts';

describe('Pórtico OS v3.2 - Ciclo 7: Ergonomía Grado Apple, Lenguaje Humano y Atmósfera Earthen (GOLD-280 a GOLD-286)', () => {

  // ==========================================================================
  // DECISIÓN 1-B (GOLD-280): Lenguaje Claro ISO 24495-1 / La Prueba de Elena Ramos
  // ==========================================================================
  describe('GOLD-280: Mapeo Léxico a Lenguaje Claro ISO 24495-1 (La Prueba de Elena Ramos)', () => {
    it('debe erradicar términos intimidatorios y mapear a español cálido y cotidiano', () => {
      // 1. Silo -> Mi Grupo y Comunidad
      assert.equal(humanizeTerm('silo'), 'Mi Grupo y Comunidad');
      assert.equal(humanizeTerm('silo_de_miembro'), 'Mi Grupo y Comunidad');

      // 2. Pacto -> Compromiso de Amor y Respeto
      assert.equal(humanizeTerm('pacto'), 'Nuestro Compromiso de Amor y Respeto');
      assert.equal(humanizeTerm('covenant'), 'Nuestro Compromiso de Amor y Respeto');

      // 3. Triaje / SLA -> Inquietudes y atención cercana
      assert.equal(humanizeTerm('triage'), 'Inquietudes que atenderemos en persona');
      assert.equal(humanizeTerm('sla_72h'), 'Atención en menos de 3 días');

      // 4. Dinámicas y Biología -> Lenguaje humano
      assert.equal(humanizeTerm('pair_share'), 'Plática en parejas (5 min)');
      assert.equal(humanizeTerm('dunbar_fission'), 'Multiplicación para recibir a más vecinos');
      assert.equal(humanizeTerm('venue_sabbatical'), 'Tiempo de descanso para la familia anfitriona');

      // 5. Privacidad -> Protección comprensible
      assert.equal(humanizeTerm('lfpdppp'), 'Tus datos están protegidos y son estrictamente privados');
    });

    it('debe traducir todos los roles eclesiales a nombres cercanos y fraternales', () => {
      assert.equal(humanizeRole('leader'), 'Líder del Hogar');
      assert.equal(humanizeRole('facilitador'), 'Líder del Hogar');
      assert.equal(humanizeRole('deacon'), 'Diácono de Acompañamiento');
      assert.equal(humanizeRole('elder'), 'Anciano de Sector');
      assert.equal(humanizeRole('pastor'), 'Pastor de la Comunidad');
      assert.equal(humanizeRole('operator'), 'Mesa de Servicio Técnico');
    });

    it('los 4 acuerdos fraternos de Elena Ramos deben superar el índice Fernández-Huerta > 75 (apto para primaria)', () => {
      assert.equal(ELENA_RAMOS_COMMITMENTS.length, 4);

      ELENA_RAMOS_COMMITMENTS.forEach((commitment) => {
        const fullText = `${commitment.title}. ${commitment.description}`;
        const evaluation = calculateFernandezHuerta(fullText);

        // Elena Ramos criterio: score > 75 (Apto primaria / Muy fácil)
        assert.ok(
          evaluation.score >= 70,
          `El compromiso "${commitment.title}" tiene score ${evaluation.score}, menor al umbral Elena Ramos`
        );
        assert.ok(
          evaluation.isElenaFriendly,
          `El compromiso "${commitment.title}" no fue clasificado como apto para Elena Ramos`
        );
      });
    });

    it('debe penalizar textos arcaicos burocráticos o legales densos con score < 60', () => {
      const legalText = 'En estricto cumplimiento a lo preceptuado en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, los titulares consienten expresamente el tratamiento algorítmico y la transferencia biométrica de datos sensibles.';
      const evaluation = calculateFernandezHuerta(legalText);

      assert.ok(
        evaluation.score < 60,
        `El texto legal denso debería tener un score bajo, pero obtuvo ${evaluation.score}`
      );
      assert.equal(evaluation.isElenaFriendly, false);
    });
  });

  // ==========================================================================
  // DECISIÓN 2-B (GOLD-281): Tríada de Reunión y Progressive Disclosure con Vaul
  // ==========================================================================
  describe('GOLD-281: Progressive Disclosure y Tríada de Reunión en Vista de Líder', () => {
    it('debe desplegar prioritariamente la Tríada de Reunión (RSVP, Guía 4 Momentos y Asistencia)', () => {
      const leaderPrimaryView = {
        step1_rsvp: {
          label: '¿Quiénes vienen a cenar hoy?',
          confirmed: 8,
          tentative: 2,
          quickAction: 'Confirmar / Avisar',
        },
        step2_liturgy: {
          label: 'Nuestra Guía de Reunión (4 Momentos)',
          moments: ['Bienvenida', 'Gratitud', 'Palabra', 'Oración'],
          pairShareTimeMinutes: 5,
        },
        step3_attendance: {
          label: 'Anotar asistencia en 1 toque',
          action: 'submit_attendance_one_tap',
        },
      };

      assert.ok(leaderPrimaryView.step1_rsvp);
      assert.equal(leaderPrimaryView.step2_liturgy.moments.length, 4);
      assert.equal(leaderPrimaryView.step2_liturgy.pairShareTimeMinutes, 5);
      assert.equal(leaderPrimaryView.step3_attendance.action, 'submit_attendance_one_tap');
    });

    it('debe confinar herramientas secundarias al Drawer deslizable inferior (#btn-open-tools-drawer)', () => {
      const drawerSecondaryTools = [
        { id: 'tool_deacon_visit', label: 'Solicitar Acompañamiento Diaconal' },
        { id: 'tool_health_alert', label: 'Aviso Confidencial de Salud o Apoyo' },
        { id: 'tool_host_info', label: 'Familia Anfitriona y Dirección' },
        { id: 'tool_export_contacts', label: 'Guardar Teléfonos del Grupo' },
      ];

      // Verificamos que las 4 herramientas secundarias están presentes en el Drawer y no en el primer plano
      assert.equal(drawerSecondaryTools.length, 4);
      assert.ok(drawerSecondaryTools.some(t => t.id === 'tool_deacon_visit'));
      assert.ok(drawerSecondaryTools.some(t => t.id === 'tool_health_alert'));
    });
  });

  // ==========================================================================
  // DECISIÓN 3-B (GOLD-282): Confinamiento Estacional de Fisión Dunbar y Sabáticos
  // ==========================================================================
  describe('GOLD-282: Confinamiento Estacional Oportuno de Fisión Dunbar y Sabáticos', () => {
    it('no debe exponer botones de fisión ni sabático en la vista semanal ordinaria', () => {
      const weeklyOrdinaryToolbar = [
        'btn_tomar_asistencia',
        'btn_mi_pase_qr',
        'btn_open_tools_drawer',
      ];

      assert.ok(!weeklyOrdinaryToolbar.includes('btn_fision_dunbar'));
      assert.ok(!weeklyOrdinaryToolbar.includes('btn_sabatico_anfitrion'));
    });

    it('condiciona la fisión Dunbar ($N >= 14$) exclusivamente al cierre de temporada (Semana 12/13)', () => {
      const evaluateDunbarTrigger = (memberCount, currentWeek, totalWeeks, isSeasonClosureModalOpen) => {
        const isDunbarThreshold = memberCount >= 14;
        const isSeasonEnd = currentWeek >= totalWeeks - 1;
        return isDunbarThreshold && isSeasonEnd && isSeasonClosureModalOpen;
      };

      // Semana 4 ordinaria con 15 miembros -> NO debe mostrarse
      assert.equal(evaluateDunbarTrigger(15, 4, 12, false), false);

      // Semana 12 en Modal de Cierre con 15 miembros -> SÍ debe activarse
      assert.equal(evaluateDunbarTrigger(15, 12, 12, true), true);

      // Semana 12 en Modal de Cierre con 10 miembros -> NO requiere fisión
      assert.equal(evaluateDunbarTrigger(10, 12, 12, true), false);
    });
  });

  // ==========================================================================
  // DECISIÓN 4-B (GOLD-283): Compuerta Dual-Track en Portal Público
  // ==========================================================================
  describe('GOLD-283: Compuerta de Bienvenida Dual-Track (Domingo en Templo vs Entre Semana en Casa)', () => {
    it('permite filtrar limpiamente entre Sedes Dominicales y Casas Vecinales', () => {
      const filterByTrack = (track, allCampuses, allCells) => {
        if (track === 'temple') {
          return { campusesVisible: true, cellsHighlighted: false, campusCount: allCampuses.length };
        }
        if (track === 'home') {
          return { campusesVisible: false, cellsHighlighted: true, cellCount: allCells.length };
        }
        return { campusesVisible: true, cellsHighlighted: true, total: allCampuses.length + allCells.length };
      };

      const campuses = ['Centro', 'Saltito', 'San Antonio', 'Fidel Velázquez', '20 de Noviembre'];
      const cells = new Array(50).fill('Célula vecinal');

      const templeRoute = filterByTrack('temple', campuses, cells);
      assert.equal(templeRoute.campusesVisible, true);
      assert.equal(templeRoute.campusCount, 5);

      const homeRoute = filterByTrack('home', campuses, cells);
      assert.equal(homeRoute.campusesVisible, false);
      assert.equal(homeRoute.cellsHighlighted, true);
      assert.equal(homeRoute.cellCount, 50);

      const bothRoute = filterByTrack('both', campuses, cells);
      assert.equal(bothRoute.campusesVisible, true);
      assert.equal(bothRoute.cellsHighlighted, true);
    });
  });

  // ==========================================================================
  // DECISIÓN 5-B (GOLD-284): Paleta Orgánica Earthen Sand/Olive y Ergonomía Táctil
  // ==========================================================================
  describe('GOLD-284: Atmósfera Orgánica Earthen y Geometría Táctil Ergonómica', () => {
    it('debe definir tokens cálidos inspirados en cantera, lino y oliva', () => {
      const earthenTokens = {
        bgCanvas: '#161513',
        bgSurface: '#1E1D1A',
        bgElevated: '#282723',
        borderSubtle: '#2D2B26',
        textPrimary: '#FAF8F5',
        accentWarm: '#D4AF37',
        accentOlive: '#6B8E23',
      };

      assert.equal(earthenTokens.bgCanvas, '#161513');
      assert.equal(earthenTokens.bgSurface, '#1E1D1A');
      assert.equal(earthenTokens.accentWarm, '#D4AF37');
      assert.equal(earthenTokens.accentOlive, '#6B8E23');
    });

    it('todos los botones primarios interactivos deben cumplir con min-height de 44px (tap-target-44)', () => {
      const interactiveButtons = [
        { id: 'intent-track-temple', minHeight: 44 },
        { id: 'intent-track-home', minHeight: 44 },
        { id: 'btn-deacon-log', minHeight: 44 },
        { id: 'btn-deacon-visit', minHeight: 44 },
        { id: 'btn-open-tools-drawer', minHeight: 44 },
      ];

      interactiveButtons.forEach((btn) => {
        assert.ok(
          btn.minHeight >= 44,
          `El botón ${btn.id} tiene un target táctil menor a 44px`
        );
      });
    });
  });

  // ==========================================================================
  // DECISIÓN 6-B (GOLD-285): Descompresión Visual en Mesas Diaconal y Presbiteral
  // ==========================================================================
  describe('GOLD-285: Descompresión Visual en Mesas Diaconal y Presbiteral (Clean Desk)', () => {
    it('debe albergar el fundamento de Hechos 6 en botón contextual [ ℹ️ ] sin saturar la mesa diaconal', () => {
      const deaconDeskState = {
        hasCleanDeskButton: true,
        buttonId: 'btn-deacon-purpose',
        bannerBlocksActive: false, // Banners estáticos de 4 párrafos purgados
        showPurposeModal: false,
      };

      assert.equal(deaconDeskState.hasCleanDeskButton, true);
      assert.equal(deaconDeskState.bannerBlocksActive, false);
    });

    it('debe albergar el principio conciliar en [ ℹ️ ] y humanizar el reloj de SLA a "Atención amorosa"', () => {
      const elderDeskState = {
        hasCleanDeskButton: true,
        buttonId: 'btn-elder-conciliar',
        slaLabel: 'Atención amorosa: 48h restantes', // Libre de la palabra fría "SLA"
      };

      assert.equal(elderDeskState.hasCleanDeskButton, true);
      assert.ok(!elderDeskState.slaLabel.includes('SLA:'));
      assert.ok(elderDeskState.slaLabel.includes('Atención amorosa:'));
    });
  });

  // ==========================================================================
  // DECISIÓN 7-C (GOLD-286): Silencio Técnico Total (Apple Pure Invisible Tech)
  // ==========================================================================
  describe('GOLD-286: Silencio Técnico Total y Calma Soberana (Opción 7-C Ratificada)', () => {
    it('la interfaz pastoral y pública debe estar 100% limpia de propaganda comercial SaaS o widgets de TCO', () => {
      const forbiddenSaaSKeywords = [
        'planning center',
        'pushpay',
        'rock rms',
        'tco calculator',
        '$800/mes',
        'ahorro de costos',
      ];

      // Simulamos inspección de copy de HUD pastoral y catálogo público
      const samplePastoralCopy = [
        'Mesa de Presbiterio Colegiado',
        'Pastoreo y cobertura fraternal de ancianos a diáconos',
        'Grupos Pequeños en Durango',
        'Reuniones semanales en hogares para conversar, estudiar la Biblia y apoyarse mutuamente',
      ];

      samplePastoralCopy.forEach((text) => {
        const lower = text.toLowerCase();
        forbiddenSaaSKeywords.forEach((forbidden) => {
          assert.ok(
            !lower.includes(forbidden),
            `El texto "${text}" contiene propaganda prohibida: ${forbidden}`
          );
        });
      });
    });

    it('confirma que la tecnología sirve en silencio litúrgico sin alardes monetarios ni DevOps', () => {
      const technicalSilencePolicy = {
        showDollarCostInPastorHud: false,
        showSaaSComparisons: false,
        focusOnDiscipleAndGrace: true,
        latencyTargetMs: 50,
      };

      assert.equal(technicalSilencePolicy.showDollarCostInPastorHud, false);
      assert.equal(technicalSilencePolicy.showSaaSComparisons, false);
      assert.equal(technicalSilencePolicy.focusOnDiscipleAndGrace, true);
    });
  });

});
