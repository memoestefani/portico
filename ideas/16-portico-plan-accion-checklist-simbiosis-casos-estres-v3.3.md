# 📋 Plan de Acción y Checklist Exhaustivo: Simbiosis de Vida Real, Casos de Estrés y Protección Comunitaria (Pórtico OS v3.3)
## Hoja de Ruta de Implementación de las 10 Decisiones Canónicas Ratificadas (GOLD-297 a GOLD-306), Purga Radical de Debris y Suite de Testing Automatizado

```yaml
project: portico
document_id: PLAN-016-SIMBIOSIS-CASOS-ESTRES-V3.3
version: 3.3.0-cycle9
target_path: C:\Users\52331\Documents\Proyectos\2_portico
evaluation_date: 2026-09-26
author: "Principal Human Interface & Systems Architecture Engineer + Sovereign Central Research Laboratory (`research`)"
status: COMPLETED_100_PERCENT
benchmarks_adopted: "research/ADOPTED_REGISTRY.md (GOLD-297 a GOLD-306) | DOSSIER_073"
github_presets_active: "GH-PORT-28 a GH-PORT-37"
ratified_decisions:
  - "1-B: Feed Litúrgico WebCal/ICS + Armonizador de Pulso Celular (Sumarnos, Ajustar, Mantener reunión)"
  - "2-B: Caracterización Binaria Sobria de Creación (hombre | mujer) para segmentación fraternal y salvaguarda Tito 2"
  - "3-B: Bandeja Diaconal Mancomunada con selector de Colonia y pase fraternal en 1-clic sin rastreo IP invasivo"
  - "4-B: Ficha de Grupo con Tríada Celular y Cobertura Pastoral Visible (Diácono y Anciano) en PastorHud"
  - "5-B: Desanonimización Contextual Exclusiva para Josh y Veto Pastoral Consciente en Ruteo Anti-Colisión"
  - "6-B: Pausa Litúrgica Centralizada de Temporada (sin deuda de asistencia) + Cerrojo Litúrgico Dominical"
  - "7-B: Actividades Comunitarias Agnósticas (Hospital 450, Coloquio de Narnia) con Padrón Abierto y Compromiso de Insumos"
  - "8-B: Convivio Fraternal Inter-Celular (asados, vigilias) con asistencia mancomunada y deduplicada"
  - "9-B: Sede Institucional o Especial (Cereso, Hospital) con Contacto/Enlace sin verborrea religiosa y resguardo de identidad"
  - "10-B: Sabático Directo Otorgado por Diácono en Visita + Niños como Dependientes Tutelados y Chat 1:1 Bloqueado por Diseño"
zero_mockups_zero_placeholders: true
debris_purge_directive: MANDATORY_100_PERCENT
cognitive_persona: "Pastor Josh / Mateo (Durango, pastoreando con serenidad humana, discernimiento y cero burocracia)"
field_leader_persona: "Carlos Martínez (facilitador), Hermano Pedro (diácono en visita presencial), Elena (esposa y líder de damas)"
runtime_budget: "$0 USD/mes (Axum Rust + libSQL Local + React 19 + Lucide 1.5px + CSS Semántico)"
test_metrics:
  frontend_tests: "126/126 passed (70 suites, 100% green)"
  backend_tests: "46/46 passed (0 failures)"
  build_status: "0 errors, dist/ production bundle compiled cleanly"
code_freeze_directive: "AUTORIZACIÓN EXPLÍCITA RECIBIDA Y EJECUTADA AL 100%"
```

---

## 🏛️ 1. Resumen Ejecutivo y Las 10 Decisiones Ratificadas

Este plan aborda las tensiones y dinámicas de la vida real de la iglesia que a menudo quedan como "conceptos huérfanos" en los sistemas de gestión tradicionales. Pórtico OS v3.3 resuelve estos 10 casos de estrés mediante una arquitectura simbiótica que respeta la libertad orgánica de la congregación, elimina el papeleo burocrático y protege legal y espiritualmente a la comunidad:

1. **Decisión 1-B (`GOLD-297`): Feed Litúrgico WebCal/ICS + Armonizador de Pulso Celular**
   * *Requisito:* Endpoint y exportador iCalendar estándar (`/api/calendar/liturgical.ics`) para eventos congregacionales magnos (Congreso de Jóvenes, Retiro de Mujeres). Cuando un evento general coincide con la fecha de una célula, el facilitador dispone de 3 opciones armónicas de 1-toque: *«Sumarnos como célula al evento»*, *«Mover reunión 24h antes/después»*, o *«Mantener reunión regular»*, sin penalizar métricas.
2. **Decisión 2-B (`GOLD-298`): Caracterización Binaria Sobria (`sexo`: `hombre` | `mujer`)**
   * *Requisito:* Enum sobrio de creación bíblica sin metadata ideológica. Uso restringido a segmentación fraternal legítima (retiros de damas, vigilias de varones) y reglas de salvaguarda pastoral y mentoría transparente conforme a Tito 2:3-5. No genera badges ruidosos en la interfaz pública.
3. **Decisión 3-B (`GOLD-299`): Bandeja Diaconal Mancomunada con Filtro por Colonia**
   * *Requisito:* Todos los diáconos acceden a la bandeja de auxilio vecinal. El solicitante indica su sector/colonia residencial (*Centro*, *Jardines*, *Valle del Sur*). Se descarta el rastreo por IP/GPS invasivo. Cualquier diácono puede atender la solicitud o transferirla en 1-clic con una nota fraterna al diácono del sector correspondiente (*«Pasar la posta fraternal»*).
4. **Decisión 4-B (`GOLD-300`): Ficha de Célula en `PastorHud` con Tríada y Supervisión Pastoral**
   * *Requisito:* Al abrir cualquier grupo en la consola pastoral, la cabecera muestra en sobrio vidrio ahumado la Tríada Operativa (*Facilitador, Anfitrión, Aprendiz*) y la Cadena Pastoral (*Diácono de Apoyo con fecha de última visita, y Anciano de Sector*), con botones de llamada o mensaje directo para Josh.
5. **Decisión 5-B (`GOLD-301`): Desanonimización Contextual y Veto Pastoral en Ruteo Anti-Colisión**
   * *Requisito:* En caso de transferencias o duplicidades entre células, Josh (y solo Josh) visualiza nombres reales, teléfonos, grupo de origen, grupo destino, motivo asentado por los facilitadores y el Anciano responsable. Josh puede presionar *«Ratificar Transición»* o *«Veto Pastoral con Diálogo»* para resolver la tensión relacional personalmente antes de mover registros.
6. **Decisión 6-B (`GOLD-302`): Pausas Litúrgicas Oficiales de Temporada y Cerrojo Dominical**
   * *Requisito:* El pastor puede definir intervalos litúrgicos de asueto congregacional (Semana Santa, conferencias, contingencias). Durante estas semanas el cómputo de la temporada se congela sin generar falsas inasistencias ni encender alertas amarillas/rojas. Además, el selector de día de reunión celular tiene **deshabilitado el domingo por arquitectura** para proteger la asamblea dominical de Hechos 20:7.
7. **Decisión 7-B (`GOLD-303`): Iniciativas Comunitarias Agnósticas (Hospital 450, Coloquio de Narnia)**
   * *Requisito:* Módulo ágil de convocatorias abiertas para cualquier iniciativa comunitaria (servicio de misericordia, café en el Hospital General 450, coloquio de lectura literaria de C.S. Lewis, convivencia barrial). Permite registro de voluntarios con nombre y WhatsApp, y compromiso ágil de insumos (*«Llevaré 1 termo de café»*, *«Llevaré 15 ejemplares del libro»*) sin forzar la creación de células de 12 semanas.
8. **Decisión 8-B (`GOLD-304`): Convivio Fraternal Inter-Celular con Asistencia Mancomunada**
   * *Requisito:* Opción de *«Reunión conjunta con [Célula Hermana]»* para carnes asadas de varones, vigilias o convivios de sector. Presenta una lista combinada de asistencia para ambos facilitadores; el backend acredita el encuentro a ambos grupos sin duplicar identidades ni distorsionar el historial de permanencia.
9. **Decisión 9-B (`GOLD-305`): Sede Institucional o Especial sin Verborrea Religiosa**
   * *Requisito:* Reconocimiento sobrio de sedes en centros penitenciarios (Cereso), capillas de hospital, empresas o asilos. Se erradican títulos eclesiales pomposos: el anfitrión de sala se sustituye por **«Contacto / Enlace Institucional»**, y se habilita el uso de alias de iniciales para salvaguarda jurídica e institucional de internos.
10. **Decisión 10-B (`GOLD-306`): Sabático Directo por Diácono y Protección Infranqueable de Menores**
    * *Requisito:*
      1. El Diácono en su visita fraternal puede pulsar *«Conceder Sabático de Hogar (1 a 3 semanas)»*, activando el relevo o reposo del anfitrión cansado y notificando de inmediato al radar pastoral de Josh.
      2. Niños (0–11 años): Registrados exclusivamente como dependientes tutelados sin cuenta de acceso.
      3. Adolescentes (12–17 años): Perfil restringido sin mensajería privada 1:1 con adultos; cualquier comunicación incluye de forma mandatoria al padre/tutor o diácono de zona en un canal transparente.

---

## 🧹 2. Directiva de Purga Forense de Debris y Código Arcaico

```mermaid
graph TD
    subgraph "Debris y Conceptos Huérfanos a Purgar"
        D1["Geolocalización forzosa por IP engañosa en móviles de Durango"]
        D2["Peticiones huérfanas de vecinos sin asignación clara"]
        D3["Pantallas de conflicto ciego con hashes o IDs despersonalizados"]
        D4["Deuda técnica de temporadas e inasistencias en Semana Santa"]
        D5["Células desubicadas sesionando en domingo compitiendo con el culto"]
        D6["Burocracia de 12 semanas forzada para repartir café en el Hospital 450"]
        D7["Doble conteo y celos de asistencia en carnes asadas de varones"]
        D8["Verborrea clerical ('Célula Misionera Especializada Penitenciaria')"]
        D9["Tratamiento de niños como cuentas adultas con riesgo de chat 1:1"]
        D10["Sabáticos de anfitriones atorados en juntas pastorales tardías"]
    end

    subgraph "Arquitectura Simbiótica Limpia v3.3"
        S1["Selector de Colonia/Sector + Pase Fraternal entre Diáconos"]
        S2["Bandeja Mancomunada Diaconal con trazabilidad visible"]
        S3["Desanonimización exclusiva para Josh con Veto Pastoral Consciente"]
        S4["Pausas Litúrgicas Oficiales con congelamiento de contador"]
        S5["Cerrojo de días que bloquea por diseño las reuniones en domingo"]
        S6["Iniciativas Comunitarias Agnósticas con compromiso de insumos"]
        S7["Convivio Inter-Celular con lista combinada y deduplicación"]
        S8["Sede Institucional sobria con Contacto/Enlace y alias de iniciales"]
        S9["Dependientes tutelados y chat privado con menores bloqueado por diseño"]
        S10["Concesión in situ de sabático por diácono con notificación a Josh"]
    end
```

---

## 📋 3. Checklist Exhaustivo de Implementación (Fase 1 a 6)

### Fase 1: Arquitectura de Datos y Schemas Backend (Axum / Rust + Memory Store)
- [x] **1.1** Actualizar modelo de `Member` / `Perfil` para incluir `sexo: Option<BiologicalSex>` (`"hombre" | "mujer"`) sin campos ideológicos redundantes (`GOLD-298`).
- [x] **1.2** Actualizar modelo de `Member` para incorporar categoría de edad y tutela: `age_category: "adulto" | "adolescente" | "nino"` y `guardian_id: Option<String>` (`GOLD-306`).
- [x] **1.3** Implementar estructura `LiturgicalPause`: `id`, `title`, `start_date`, `end_date`, `congregation_id` (`GOLD-302`).
- [x] **1.4** Implementar estructura `CommunityInitiative`: `id`, `title`, `category` (`"servicio"` | `"lectura_cultura"` | `"convivencia"` | `"apoyo_vecinal"`), `date`, `meeting_point`, `coordinator`, `pledges`, `volunteers` (`GOLD-303`).
- [x] **1.5** Implementar estructura `JointMeetingLog`: `id`, `host_group_id`, `guest_group_id`, `date`, `notes`, `attendee_ids` deduplicados (`GOLD-304`).
- [x] **1.6** Extender `Group` con tipología de sede institucional: `venue_type: "hogar" | "cafe" | "parque" | "auditorio" | "trabajo" | "institucional"`, y en caso institucional, campos para `liaison_name`, `liaison_role` y `access_protocol` (`GOLD-305`).
- [x] **1.7** Implementar endpoint y generador de feed iCalendar RFC 5545 (`/api/calendar/liturgical.ics`) que proyecta eventos magnos de la congregación (`GOLD-297`).
- [x] **1.8** Implementar endpoint para concesión diaconal de sabático: `POST /api/diaconos/sabatico` que actualiza el estado de la célula y emite alerta pastoral instantánea (`GOLD-306`).

### Fase 2: Componentes Core Frontend y Flujos Pastorales
- [x] **2.1** Crear componente `<LiturgicalFeedSync />` y `<CellHarmonizer />` con las 3 opciones (*Sumarnos*, *Mover fecha*, *Mantener reunión*) ante colisiones de agenda (`GOLD-297`).
- [x] **2.2** Enriquecer la ficha de grupo en `PastorHud` (`<GroupDetailCard />`) con la Tríada Celular (*Facilitador, Anfitrión, Aprendiz*) y la Cadena Pastoral (*Diácono con fecha de última visita y Anciano de Sector*) con botones de contacto directo (`GOLD-300`).
- [x] **2.3** Crear el panel de discernimiento `<PastorAntiCollisionVeto />` en `PastorHud` que desanonimiza el miembro en disputa para Josh con motivo asentado y botones `[ Ratificar Transición ]` y `[ Veto Pastoral ]` (`GOLD-301`).
- [x] **2.4** Configurar la vista de administración de temporadas en `PastorHud` con el control de *Pausas Litúrgicas* (`<LiturgicalPauseManager />`) y verificar que el contador de semanas de salud se congele en esos períodos (`GOLD-302`).
- [x] **2.5** Asegurar que en el formulario de creación/edición de células el día de reunión excluya estrictamente el domingo (`GOLD-302`).

### Fase 3: Bandeja Diaconal Mancomunada y Despacho Vecinal
- [x] **3.1** Diseñar la vista `<NeighborhoodAssistanceDesk />` compartida para diáconos: lista de solicitudes de auxilio barrial con selector de Colonia/Sector de Durango (`GOLD-299`).
- [x] **3.2** Implementar el botón táctil `[ Pasar la posta fraternal ]` que despliega modal simple con selector del diácono receptor y nota fraterna confidencial (`GOLD-299`).
- [x] **3.3** Incorporar en la consola diaconal de visita el botón `[ Conceder Sabático de Hogar ]` (1 a 3 semanas) con confirmación limpia y motivo de descanso pastoral (`GOLD-306`).

### Fase 4: Iniciativas Comunitarias Agnósticas y Convivios Fraternales
- [x] **4.1** Crear el módulo `<CommunityInitiativesHub />`: tarjeta con iniciativas abiertas (Hospital 450, Coloquio de Narnia, etc.) con barra de progreso de insumos comprometidos y botón para sumarse como voluntario (`GOLD-303`).
- [x] **4.2** Permitir que cualquier hermano registre insumos con 1 toque (*"Llevaré 1 termo de café"*, *"Llevaré 10 sándwiches"*, *"Llevaré 5 libros"*) sin ataduras de permanencia celular (`GOLD-303`).
- [x] **4.3** En el pase de lista de la célula (`<AttendanceTracker />`), incorporar el toggle *«Convivio con Célula Hermana»*, permitiendo seleccionar el grupo gemelo y fusionar temporalmente la lista de asistentes (`GOLD-304`).
- [x] **4.4** Garantizar que el reporte de asistencia conjunta guarde un solo registro consolidado con miembros de ambos grupos, acreditando comunión sin doble cómputo (`GOLD-304`).

### Fase 5: Sedes Institucionales Limpias y Salvaguarda de Menores
- [x] **5.1** En el catálogo y creación de células, al elegir sede `institucional` (*"Hospital, Cereso, Asilo o Empresa"*), renombrar automáticamente "Anfitrión" por **«Contacto / Enlace Institucional»** y permitir alias de protección (ej. *"Roberto M. - Cereso B"*) (`GOLD-305`).
- [x] **5.2** En el registro de miembros, clasificar a niños (0-11 años) como *dependientes tutelados* sin login ni credenciales (`GOLD-306`).
- [x] **5.3** Bloquear por arquitectura en el frontend y backend cualquier canal de mensajería privada 1:1 entre un adulto y un adolescente (12-17 años); la interfaz exige mandatoriamente la inclusión del padre/tutor o diácono de zona en un canal supervisado (`GOLD-306`).

### Fase 6: Purga Radical de Debris, Verificación de Testing y Documentación
- [x] **6.1** Purgar cualquier resto de código arcaico, textos de relleno (*Lorem ipsum*) y cadenas duras en desuso.
- [x] **6.2** Crear la suite de pruebas unitarias y de integración `frontend/test/ciclo9_simbiosis_vida_real.test.mjs` con cobertura exhaustiva de los 10 casos.
- [x] **6.3** Ejecutar `npm test` verificando que todas las suites (anteriores + nueva) pasen 100% en verde (126 tests, 70 suites).
- [x] **6.4** Ejecutar `cargo test` en backend para asegurar que las nuevas estructuras de Rust compilen y pasen con 0 errores (46 tests pasando).
- [x] **6.5** Ejecutar `npm run build` para garantizar cero errores de transpilación o tipos en producción (bundle generado limpiamente en `dist/`).
- [x] **6.6** Actualizar `README.md`, `ideas/00-Indice.md` y documentar el cierre exitoso del Ciclo 9.

---

## 🧪 4. Estrategia de Testing Automatizado (Ciclo 9)

Se ejecutó la suite `frontend/test/ciclo9_simbiosis_vida_real.test.mjs` utilizando el ejecutor nativo `node:test` de Node.js v20+, cubriendo:

1. **Test Suite 1 (D1 - WebCal e iCalendar):** Validación de generación de feed RFC 5545 y detección de colisiones de fecha con el armonizador celular en 3 opciones.
2. **Test Suite 2 (D2 - Sexo Biológico Sobrio):** Validación de enum binario (`hombre` | `mujer`), filtrado exclusivo para eventos segmentados (Tito 2) y ausencia de badges ruidosos.
3. **Test Suite 3 (D3 - Despacho Vecinal Diaconal):** Bandeja común visible para todos los diáconos, filtrado por Colonia de Durango y transferencia fraterna sin IP/GPS.
4. **Test Suite 4 (D4 - Tríada y Supervisión en Ficha):** Renderizado de Tríada Celular y Cadena Pastoral (Diácono y Anciano) con datos de contacto directo en la ficha de grupo.
5. **Test Suite 5 (D5 - Desanonimización y Veto Anti-Colisión):** Visibilidad de identidades reales y motivo exclusivamente para el Pastor Josh, con ejecución de *Ratificar* y *Veto Pastoral*.
6. **Test Suite 6 (D6 - Pausas Litúrgicas y Cerrojo Dominical):** Congelamiento del cómputo de semanas durante Semana Santa (cero inasistencias en semáforo) e imposibilidad de seleccionar el domingo como día de reunión.
7. **Test Suite 7 (D7 - Actividades Comunitarias Agnósticas):** Creación y confirmación de asistencia en el Coloquio de Narnia y entrega de café en el Hospital 450 con compromiso de insumos.
8. **Test Suite 8 (D8 - Convivio Inter-Celular):** Fusión temporal de asistencia entre dos células afines (carne asada de varones) con deduplicación de miembros.
9. **Test Suite 9 (D9 - Sede Institucional Limpia):** Transmutación a *«Contacto / Enlace Institucional»* en el Cereso/Hospital, lenguaje sin verborrea religiosa y soporte de alias de protección.
10. **Test Suite 10 (D10 - Sabático Diaconal y Protección de Menores):** Concesión in situ de sabático por el diácono con notificación a Josh; niños como dependientes sin cuenta; y **bloqueo estricto del canal 1:1 adulto-menor**.

---

## 🏁 5. Estado de Ejecución y Certificación Canónica

> [!NOTE]
> **ESTADO FINAL: IMPLEMENTADO Y VERIFICADO AL 100%.**
> Todas las 10 decisiones canónicas (`GOLD-297` a `GOLD-306`), la purga forense de debris, los nuevos componentes React 19, los modelos de dominio en Rust y las pruebas automatizadas (126 frontend / 46 backend) han sido ejecutados y validados con cero errores de compilación y total cumplimiento de las directivas soberanas.
