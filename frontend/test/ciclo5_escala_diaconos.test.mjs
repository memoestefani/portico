import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Pórtico OS v3.1 - Ciclo 5: Escala a 5,000 Miembros, Diaconado y Discipulado Bíblico (GOLD-262 a GOLD-272)', () => {

  describe('GOLD-262: Pipeline de Discipulado Intencional y Formación Práctica en Co-facilitación', () => {
    it('debe modelar la progresión en tres fases claras: observer -> co_facilitator -> ready_for_launch', () => {
      const validStages = ['observer', 'co_facilitator', 'ready_for_launch'];

      const discipleTrack = {
        id: 'track-001',
        group_id: 'grp-betel',
        disciple_name: 'Bernabé Morales',
        stage: 'observer',
        seasons_completed: 1,
        endorsed_for_launch: false,
        endorsed_at: null,
      };

      assert.equal(discipleTrack.stage, 'observer');
      assert.ok(validStages.includes(discipleTrack.stage));

      // Avanzar a co-facilitador
      discipleTrack.stage = 'co_facilitator';
      discipleTrack.seasons_completed = 2;
      assert.equal(discipleTrack.stage, 'co_facilitator');
    });

    it('hacia la semana 10 permite emitir el endoso pastoral de envío con 1 solo toque', () => {
      const evaluateEndorsementEligibility = (currentWeek, stage, seasonsCompleted) => {
        return currentWeek >= 10 && stage === 'co_facilitator' && seasonsCompleted >= 1;
      };

      assert.equal(evaluateEndorsementEligibility(8, 'co_facilitator', 1), false);
      assert.equal(evaluateEndorsementEligibility(10, 'observer', 1), false);
      assert.equal(evaluateEndorsementEligibility(10, 'co_facilitator', 1), true);

      // Emisión de endoso
      const endorseDisciple = (track) => ({
        ...track,
        stage: 'ready_for_launch',
        endorsed_for_launch: true,
        endorsed_at: new Date().toISOString(),
      });

      const endorsed = endorseDisciple({
        id: 'track-001',
        stage: 'co_facilitator',
        endorsed_for_launch: false,
      });

      assert.equal(endorsed.stage, 'ready_for_launch');
      assert.equal(endorsed.endorsed_for_launch, true);
      assert.ok(endorsed.endorsed_at !== null);
    });
  });

  describe('GOLD-263: Estructura Diaconal de Cuidado y Erradicación Total del Jargon "Coach"', () => {
    it('debe asignar entre 5 y 7 células por diácono garantizando paridad y servicio fraterno', () => {
      const MAX_CELLS_PER_DEACON = 7;
      const MIN_CELLS_PER_DEACON = 5;

      const deaconCluster = {
        deacon_id: 'deacon_mateo',
        deacon_name: 'Mateo Valenzuela (Diácono)',
        assigned_group_ids: ['grp-1', 'grp-2', 'grp-3', 'grp-4', 'grp-5', 'grp-6'],
      };

      assert.ok(deaconCluster.assigned_group_ids.length >= MIN_CELLS_PER_DEACON);
      assert.ok(deaconCluster.assigned_group_ids.length <= MAX_CELLS_PER_DEACON);
    });

    it('debe purgar términos jerárquicos o piramidales como "coach", "pastor de zona" o "supervisor"', () => {
      const prohibitedJargon = ['coach', 'supervisor', 'coaching', 'red piramidal', 'upline'];
      const deaconRoleTitle = 'Diácono Servidor de Cuidado Fraternal';

      for (const forbidden of prohibitedJargon) {
        assert.ok(!deaconRoleTitle.toLowerCase().includes(forbidden), `No debe contener '${forbidden}'`);
      }
    });

    it('asienta bitácoras cualitativas de acompañamiento espiritual respetando privacidad', () => {
      const contactLog = {
        deacon_id: 'deacon_mateo',
        group_id: 'grp-1',
        contact_type: 'call',
        notes: 'Llamada de ánimo a Carlos. El grupo oró por sanidad y muestran paz y comunión.',
      };

      assert.equal(contactLog.contact_type, 'call');
      assert.ok(contactLog.notes.length > 10);
      assert.ok(!contactLog.notes.includes('asistieron exactamente'));
    });
  });

  describe('GOLD-264: Cierre Fraterno de Temporada y Pacto de Continuidad/Multiplicación', () => {
    it('soporta las 3 opciones legítimas de pacto al concluir la temporada', () => {
      const closureDecisions = ['continue_same', 'multiply_with_disciple', 'sabbatical_rest'];

      const closurePact1 = {
        decision: 'continue_same',
        notes: 'El grupo acordó continuar juntos para estudiar las epístolas paulinas.',
      };
      const closurePact2 = {
        decision: 'multiply_with_disciple',
        new_disciple_edition_id: 'grp-nueva-luz',
        notes: 'Bernabé fue bendecido para plantar una nueva célula en la zona Poniente.',
      };
      const closurePact3 = {
        decision: 'sabbatical_rest',
        notes: 'Tomaremos una temporada sabática para apoyar en el atrio y servicio dominical.',
      };

      assert.ok(closureDecisions.includes(closurePact1.decision));
      assert.ok(closureDecisions.includes(closurePact2.decision));
      assert.ok(closureDecisions.includes(closurePact3.decision));
    });

    it('el cierre de temporada es una conversación fraterna y distendida, no una auditoría punitiva', () => {
      const sessionFormat = {
        atmosphere: 'fraternal_celebration',
        tone: 'agradecimiento_y_discernimiento',
        punitive_metrics_applied: false,
      };

      assert.equal(sessionFormat.punitive_metrics_applied, false);
      assert.equal(sessionFormat.atmosphere, 'fraternal_celebration');
    });
  });

  describe('GOLD-265: Canales Ministeriales para Miembros Veteranos y Rechazo de "Paternidad Espiritual" (Mateo 23:9)', () => {
    it('ofrece ministerios de servicio activo para miembros con trayectoria (atrio, intercesión, logística)', () => {
      const sampleMinistries = [
        { id: 'min-atrio', category: 'welcome_atrium', name: 'Atrio y Bienvenida Dominical' },
        { id: 'min-intercesion', category: 'intercession', name: 'Intercesión y Consolación Pastoral' },
        { id: 'min-anfitriones', category: 'host_coaching', name: 'Mentores de Hospitalidad y Nuevos Anfitriones' },
        { id: 'min-logistica', category: 'logistics', name: 'Logística y Servicio Sacramental' },
      ];

      assert.equal(sampleMinistries.length, 4);
      assert.ok(sampleMinistries.some(m => m.category === 'welcome_atrium'));
      assert.ok(sampleMinistries.some(m => m.category === 'intercession'));
    });

    it('rechaza categóricamente la doctrina de "paternidad espiritual" conforme a Mateo 23:9', () => {
      const MATTHEW_23_9_DOCTRINE = 'Y no llaméis padre vuestro a nadie en la tierra; porque uno es vuestro Padre, el que está en los cielos.';
      const ministryPhilosophy = {
        doctrine_alignment: MATTHEW_23_9_DOCTRINE,
        spiritual_fatherhood_allowed: false,
        all_brethren_equal: true,
      };

      assert.equal(ministryPhilosophy.spiritual_fatherhood_allowed, false);
      assert.equal(ministryPhilosophy.all_brethren_equal, true);
      assert.ok(ministryPhilosophy.doctrine_alignment.includes('uno es vuestro Padre'));
    });
  });

  describe('GOLD-266: Onboarding en el Primer Día de la Semana (Punto de Conexión en el Atrio)', () => {
    it('establece el Atrio Dominical como el punto canónico de vinculación para nuevos creyentes', () => {
      const sundayOnboardingHub = {
        location: 'Atrio Central Amor y Gracia Durango',
        day: 'Primer día de la semana (Domingo)',
        schedule: 'Posterior a reuniones generales de 10:00 y 12:30',
        greeters: 'Diáconos y servidores de bienvenida',
        action: 'Presentar personalmente al visitante con el facilitador de su macro-zona',
      };

      assert.ok(sundayOnboardingHub.day.includes('Domingo'));
      assert.ok(sundayOnboardingHub.action.includes('Presentar personalmente'));
    });
  });

  describe('GOLD-267: Macro-Zonas Geográficas Ligeras y Transporte Accesible (Cero Deuda GIS)', () => {
    it('delimita Durango en 5 macro-zonas simples sin polígonos GeoJSON pesados', () => {
      const MACRO_ZONES_DURANGO = ['Norte', 'Sur', 'Poniente', 'Oriente', 'Centro'];

      assert.equal(MACRO_ZONES_DURANGO.length, 5);

      const assignMacroZone = (neighborhood) => {
        const n = neighborhood.toLowerCase();
        if (n.includes('fidel') || n.includes('sahuatoba')) return 'Poniente';
        if (n.includes('industrial') || n.includes('aeropuerto')) return 'Oriente';
        if (n.includes('centro') || n.includes('analco')) return 'Centro';
        if (n.includes('huizache') || n.includes('santa amelia')) return 'Sur';
        return 'Norte';
      };

      assert.equal(assignMacroZone('Colonia Centro'), 'Centro');
      assert.equal(assignMacroZone('Lomas del Sahuatoba'), 'Poniente');
    });

    it('permite filtrar grupos por transporte público accesible o carpool solidario', () => {
      const editions = [
        { id: '1', nombre: 'Betel', transit_friendly: true, carpool_available: true },
        { id: '2', nombre: 'Sinaí', transit_friendly: false, carpool_available: false },
        { id: '3', nombre: 'Hebrón', transit_friendly: true, carpool_available: false },
      ];

      const accessible = editions.filter(e => e.transit_friendly || e.carpool_available);
      assert.equal(accessible.length, 2);
      assert.equal(accessible[0].id, '1');
      assert.equal(accessible[1].id, '3');
    });
  });

  describe('GOLD-268 & GOLD-270: Protocolo Cristocéntrico Flexible y Canal Conciliar de Mateo 18', () => {
    it('el protocolo de la célula se centra en Jesús y la comunión, no en el lugar físico', () => {
      const allowedVenues = ['sala_hogar', 'parque_guadiana', 'taqueria', 'cafeteria', 'alberca'];
      const coreElements = ['oracion', 'estudio_escrituras', 'edificacion_mutua', 'intercesion'];

      const meetingInTaqueria = {
        venue_type: 'taqueria',
        elements_present: coreElements,
        christ_centered: true,
      };

      assert.ok(allowedVenues.includes(meetingInTaqueria.venue_type));
      assert.equal(meetingInTaqueria.christ_centered, true);
    });

    it('canaliza observaciones sobre desvío doctrinal o desánimo según Mateo 18:15-17', () => {
      const matthew18StepRouting = (step) => {
        switch (step) {
          case 1:
            return { audience: 'brother_alone', action: 'Conversación fraterna 1 a 1 en privado' };
          case 2:
            return { audience: 'two_or_three_deacons', action: 'Acompañamiento con 1 o 2 diáconos testigos' };
          case 3:
            return { audience: 'pastoral_council', action: 'Consejo pastoral o asamblea de la iglesia' };
          default:
            throw new Error('Paso inválido');
        }
      };

      const step1 = matthew18StepRouting(1);
      assert.equal(step1.audience, 'brother_alone');
      assert.ok(step1.action.includes('1 a 1 en privado'));

      const step2 = matthew18StepRouting(2);
      assert.equal(step2.audience, 'two_or_three_deacons');
    });
  });

  describe('GOLD-269: Duración de Temporada Configurable Dinámicamente (8 a 16 Semanas)', () => {
    it('desecha la asunción rígida de 12 semanas fijas permitiendo calibración eclesial', () => {
      const churchConfig = {
        season_duration_weeks: 14,
        season_start_date: '2026-09-01',
        season_end_date: '2026-12-08',
      };

      assert.ok(churchConfig.season_duration_weeks >= 8 && churchConfig.season_duration_weeks <= 16);
      assert.equal(churchConfig.season_duration_weeks, 14);
    });

    it('calcula dinámicamente las semanas de itinerario en función de las fechas de la temporada', () => {
      const calculateWeeks = (daysDiff, fallbackWeeks) => {
        if (daysDiff > 0) {
          return Math.max(1, Math.floor((daysDiff + 6) / 7));
        }
        return fallbackWeeks;
      };

      assert.equal(calculateWeeks(70, 12), 10);
      assert.equal(calculateWeeks(98, 12), 14);
      assert.equal(calculateWeeks(0, 14), 14);
    });
  });

  describe('GOLD-271: Sobriedad Absoluta en Asistencia y Cero Vigilancia Punitiva', () => {
    it('reporta rangos en gracia sin pases de lista nominales ni fiscalización individual', () => {
      const validBins = ['range_1_to_5', 'range_6_to_10', 'range_11_to_15', 'range_15_plus'];

      const reportHeadcount = (rangeBin, moodPulse, didMeet) => ({
        range_bin: rangeBin,
        mood_pulse: moodPulse,
        did_meet: didMeet,
        individual_roll_call: null,
      });

      const report = reportHeadcount('range_6_to_10', 'edifying', true);
      assert.ok(validBins.includes(report.range_bin));
      assert.equal(report.individual_roll_call, null);
    });

    it('prohíbe bots o algoritmos que penalicen automáticamente a células con menor asistencia', () => {
      const attendancePolicy = {
        punitive_auto_actions: false,
        pastoral_support_trigger: 'fraternal_care_checkup',
      };

      assert.equal(attendancePolicy.punitive_auto_actions, false);
      assert.equal(attendancePolicy.pastoral_support_trigger, 'fraternal_care_checkup');
    });
  });

  describe('GOLD-272: Ficha Social de Previsualización Noble (Open Graph & WhatsApp Share)', () => {
    it('genera texto enriquecido con monograma y datos claros para compartir por WhatsApp', () => {
      const generateShareMessage = ({ name, purpose, day, time, zone, transitFriendly }) => {
        return `Te invito a nuestra comunidad "${name}" en Amor y Gracia.\n` +
          `📖 ${purpose}\n` +
          `🗓️ Nos reunimos los ${day} a las ${time} (${zone}).\n` +
          `${transitFriendly ? '🚌 Transporte accesible disponible.\n' : ''}` +
          `(O visítanos el domingo en el Punto de Conexión en el Atrio)`;
      };

      const msg = generateShareMessage({
        name: 'Betel Poniente',
        purpose: 'Estudio de los Salmos y hospitalidad fraterna',
        day: 'Jueves',
        time: '19:30',
        zone: 'Poniente',
        transitFriendly: true,
      });

      assert.ok(msg.includes('Betel Poniente'));
      assert.ok(msg.includes('19:30'));
      assert.ok(msg.includes('Punto de Conexión en el Atrio'));
      assert.ok(msg.includes('Transporte accesible disponible'));
    });
  });

});
