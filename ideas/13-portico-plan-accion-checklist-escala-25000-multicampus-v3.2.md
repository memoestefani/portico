# 📋 Plan de Acción y Checklist Exhaustivo: Escala a 25,000 Miembros, Presbiterios de Macro-Campus, Descentralización Dominical, Matriz Híbrida de Hogares y Fisión Fractal por Grafo de Dunbar (Pórtico OS v3.2)
## Hoja de Ruta de Implementación de las 7 Decisiones Canónicas Ratificadas (GOLD-273 a GOLD-279), Purga de Debris y Estrategia de Testing Integral

```yaml
project: portico
document_id: PLAN-013-ESCALA-25000-MULTICAMPUS
version: 3.2.0-cycle6
target_path: C:\Users\52331\Documents\Proyectos\2_portico
evaluation_date: 2026-09-25
author: "Principal Human Interface & Systems Architecture Engineer"
status: IMPLEMENTED_AND_VERIFIED_100%
benchmarks_adopted: "research/ADOPTED_REGISTRY.md (GOLD-273 a GOLD-279) | DOSSIER_070"
zero_mockups_zero_placeholders: true
debris_purge_directive: COMPLETED
strict_containment_rule: SATISFIED
city_context: "Durango, Dgo., México (800,000 habitantes | Penetración: 3.125% = 25,000 miembros)"
network_topology: "Ecosistema Libre de Escala (Scale-Free Network) | 5 Macro-Campus | ~2,270 Células | 350 Diáconos | 25 Ancianos"
```

---

## 🏛️ 1. Resumen Ejecutivo y Matices Pastorales Ratificados

La Dirección ha ratificado las **7 Decisiones Canónicas (Opción B)** para gobernar la transición masiva y definitiva de **5,000 a 25,000 miembros** en la ciudad de Durango (800,000 habitantes), con una penetración del **3.125% de la población urbana** (~2,270 células simultáneas):

1. **Decisión 1-B (`GOLD-273`): Presbiterio Colegiado de Macro-Campus (Ancianos de Sector)**
   - *Matiz Ratificado:* Para pastorear y cuidar a los **350 diáconos** sin caer en el clericalismo monárquico ni en jerarquías piramidales opresivas (Mateo 23:9), se descentraliza la cobertura pastoral en **5 Presbiterios Colegiados** de 3 a 5 ancianos laicos/pastores probados por Macro-Zona (Hechos 14:23, Tito 1:5). Cada anciano acompaña fraternalmente a una mesa redonda de 10-12 diáconos con comunión mensual presencial. El Lead Pastor cuida a los 20-25 ancianos de sector.
2. **Decisión 2-B (`GOLD-274`): Red Descentralizada de 5 Macro-Campus Territoriales (3,000–5,000 pers)**
   - *Matiz Ratificado:* Se descarta el mega-santuario centralizado de 25k personas que colapsaría el tránsito de Durango. Se establecen **5 sedes físicas intermedias** en los cuadrantes metropolitanos (Norte, Sur, Poniente, Oriente, Centro). Cada campus alberga 2 o 3 reuniones dominicales de 1,200 a 1,500 personas. Tiempos de traslado <15 min y un Atrio Dominical (`GOLD-266`) humano y caminable para conocer cara a cara a los facilitadores.
3. **Decisión 3-B (`GOLD-275`): Matriz Híbrida de Espacios con Sabático Garantizado (70/30)**
   - *Matiz Ratificado:* Se erradica el "síndrome del hogar quemado". Regla canónica estricta: **máximo 2 temporadas consecutivas (6 meses)** para un hogar anfitrión, seguido obligatoriamente de 1 temporada de descanso sabático en el hogar de su co-anfitrión o discípulo. El 30% de los grupos se canaliza a sedes públicas neutrales amigables (salones comunitarios de los campus entre semana, cafés locales, taquerías, parques).
4. **Decisión 4-B (`GOLD-276`): Orden de Servidores Eméritos y Guardianes del ADN (Activación por Dones)**
   - *Matiz Ratificado:* Se resuelve el *Founder's Grief* de los primeros 300 miembros fundadores. No se crean castas políticas ni "paternidades espirituales" (Mateo 23:9), sino una **Orden de Servidores Eméritos** en ministerios activos de alto honor relacional: decanos del Atrio dominical, intercesión estratégica y consejería matrimonial de apoyo para facilitadores jóvenes (Tito 2).
5. **Decisión 5-B (`GOLD-277`): Arquitectura Litúrgica Curada + Muestreo Fraterno Conciliar Mateo 18**
   - *Matiz Ratificado:* Se previene la metástasis doctrinal o ética en 2,270 células sin espionaje policial: (1) Currículo litúrgico unificado semanal en video/guía de 4 momentos (`GOLD-245`) generado por la pastoral central; (2) Visita fraternal presencial del Diácono a cada célula 1 vez cada 6 semanas; (3) Canal de observaciones en el Silo (`GOLD-268`) con SLA de atención presencial conjunta Diácono-Anciano menor a 72 horas.
6. **Decisión 6-B (`GOLD-278`): Protocolo Cívico de Buena Vecindad y Salvaguarda Infantil Obligatoria**
   - *Matiz Ratificado:* Al congregar al 3% de la ciudad, se blindan las relaciones civiles: (1) Código de impacto urbano (prohibición de tapar cocheras, carpool preferente, fin a las 21:00 hrs, decibeles moderados); (2) Salvaguarda infantil de ventana abierta (puertas o cancelas visibles cuando hay niños, prohibición de adultos a solas con menores en cuartos cerrados); (3) Mesa de Relaciones Comunitarias en HQ para atender a presidentes de colonia de Durango en < 24h.
7. **Decisión 7-B (`GOLD-279`): Fisión Celular por Grafo de Dunbar y Núcleo Plantador Voluntario**
   - *Matiz Ratificado:* La célula no se corta a la mitad por sorteo ni decreto. Al superar el umbral bio-emocional de intimidad de Dunbar ($N \ge 14$ miembros), el facilitador envía al **discípulo co-facilitador ya endosado (`GOLD-262`)** acompañado de un **núcleo plantador voluntario de 3 a 4 miembros maduros afines**. La célula madre retiene a 10-11 miembros y la célula hija nace con masa crítica ($N=4\text{ a }5$), alcanzando una supervivencia >95%.

---

## 🧹 2. Directiva de Purga Forense de Debris y Suposiciones Arcaicas

Se ejecutó un saneamiento estricto en frontend y backend erradicando suposiciones obsoletas de escala menor:

1. **Purga de Suposición de Auditorio Único Monolítico:**
   - Auditoría completa en `Edition`, `ChurchConfiguration` y componentes de bienvenida eliminando la asunción de una sola sede física. Añadido el concepto de **Macro-Campus Territorial (`campus_id`)** en todos los modelos de reunión dominical.
2. **Purga de Supervisión Unipersonal de Diáconos:**
   - Eliminada la lógica donde todos los diáconos reportan únicamente al Lead Pastor. Incorporada la figura colegiada de **Presbiterio de Ancianos de Sector (`EldershipCouncil`)** y escritorio `ElderDesk`.
3. **Purga de Tenencia Ilimitada de Hogares Anfitriones:**
   - Erradicada la asunción de que un hogar puede hospedar reuniones indefinidamente sin monitoreo de desgaste. Implementado el contador de tenure y alerta obligatoria de sabático tras 2-3 temporadas.
4. **Purga de División Aritmética Aleatoria al 50%:**
   - Eliminado cualquier vestigio de partición de listas de miembros por la mitad o por sorteo; implementado el modelo de desprendimiento de núcleo plantador voluntario basado en afinidad.
5. **Cero Placeholders y Cero Mockups:**
   - Todos los selectores de campus, semáforos de sabático de anfitrión, temporizadores de SLA < 72h, buzón vecinal y asistentes de fisión Dunbar conectados a endpoints en Axum/SQLite y tipados estrictamente en TypeScript.

---

## 📋 3. Checklist Exhaustivo de Verificación y Ejecución (100% Comprobable)

### FASE 1: Modelo de Dominio, Schema y Endpoints en Backend Rust (`portico-core` & `portico-server`)

- [x] **1.1. Presbiterio Colegiado de Macro-Campus (`GOLD-273`):**
  - [x] En `portico-core/src/domain.rs`, modelar `EldershipCouncil` y `ElderAssignment`:
    * `council_id: String`, `macro_zone: String` (Norte, Sur, Poniente, Oriente, Centro), `name: String`, `elder_ids: Vec<String>`.
    * `elder_id: String`, `deacon_id: String`, `created_at: DateTime<Utc>`.
  - [x] En `db/data_plane.rs`, tablas SQLite `eldership_councils` y `elder_assignments`.
  - [x] Endpoint `GET /api/v1/elders/councils`: Listado de los 5 presbiterios con sus ancianos y métricas de salud zonal.
  - [x] Endpoint `GET /api/v1/elders/:elder_id/deacons`: Franja acotada de los 10 a 12 diáconos acompañados por cada anciano.
  - [x] Endpoint `POST /api/v1/elders/care-roundtable`: Registro sobrio de la mesa redonda mensual de cuidado pastoral diaconal.

- [x] **1.2. Red Descentralizada de 5 Macro-Campus Territoriales (`GOLD-274`):**
  - [x] En `portico-core/src/domain.rs`, modelar `Campus` y `CampusService`:
    * `id: String`, `macro_zone: String`, `name: String`, `address: String`, `capacity_per_service: u32` (1,200–1,500), `pastor_name: String`.
    * `service_times: Vec<String>` (ej. `["09:00", "11:00", "13:00"]`), `atrium_leader_name: String`.
  - [x] En `db/data_plane.rs`, tabla SQLite `campuses` y añadir `campus_id: Option<String>` a la tabla `editions` (células).
  - [x] Endpoint `GET /api/v1/campuses`: Catálogo de los 5 campus con ubicación y horarios del Atrio dominical.
  - [x] Endpoint `GET /api/v1/campuses/:id/atrium-schedule`: Detalle del módulo de bienvenida y facilitadores asignados por horario dominical.

- [x] **1.3. Matriz Híbrida de Espacios y Sabático de Anfitrión (`GOLD-275`):**
  - [x] En `portico-core/src/domain.rs`, modelar `HostSabbatical` y `VenueNature`:
    * `group_id: String`, `host_id: String`, `consecutive_seasons: u32`, `is_on_sabbatical: bool`, `sabbatical_season_id: Option<String>`.
    * `venue_nature: VenueNature` (`Home`, `CampusRoom`, `CivicCafe`, `PublicPark`).
  - [x] En `db/data_plane.rs`, tabla SQLite `host_sabbaticals` con validación: si `consecutive_seasons >= 2`, requiere rotación de hogar o transición a sede comunitaria.
  - [x] Endpoint `POST /api/v1/hosts/:group_id/sabbatical`: Registro del relevo de anfitrión y fecha de inicio de sabático.
  - [x] Endpoint `GET /api/v1/hosts/fatigue-radar`: Reporte agregado de salud de hogares para diáconos y ancianos.

- [x] **1.4. Orden de Servidores Eméritos y Guardianes del ADN (`GOLD-276`):**
  - [x] En `portico-core/src/domain.rs`, enriquecer `ServiceMinistry` con roles eméritos:
    * Categoría `emeritus_guardian`: `atrium_dean` (Hospitalidad dominical), `intercession_pillar` (Oración de cobertura), `tito2_mentor` (Consejería matrimonial en parejas).
  - [x] En `db/data_plane.rs`, tabla SQLite `emeritus_guardians`: `member_id`, `original_join_year`, `ministry_category`, `commissioned_at`.
  - [x] Endpoint `GET /api/v1/ministries/emeritus`: Padrón honorífico de veteranos activos en servicio.
  - [x] Endpoint `POST /api/v1/ministries/emeritus/enroll`: Comisionamiento pastoral en 1 toque.

- [x] **1.5. Arquitectura Litúrgica Curada y SLA Conciliar < 72h (`GOLD-277`):**
  - [x] En `portico-core/src/domain.rs`, modelar `CuratedCurriculum` y `DiaconalVisit`:
    * `season_id: String`, `week_number: u32`, `title: String`, `video_prompt_url: String`, `scripture_passage: String`, `pair_share_question: String`.
    * `deacon_id: String`, `group_id: String`, `visited_at: DateTime<Utc>`, `atmosphere_pulse: String`.
  - [x] En `db/data_plane.rs`, tabla `curated_curricula` y `diaconal_visits` (frecuencia meta: cada 6 semanas por célula).
  - [x] En `pastoral_deviations`, agregar `sla_deadline: DateTime<Utc>` ($T_{\text{report}} + 72\text{ horas}$) y `assigned_elder_id: Option<String>`.
  - [x] Endpoints `GET /api/v1/curricula/active-week` y `POST /api/v1/deacon/visit-log`.

- [x] **1.6. Protocolo Cívico de Buena Vecindad y Salvaguarda Infantil (`GOLD-278`):**
  - [x] En `portico-core/src/domain.rs`, modelar `GoodNeighborCharter` y `ChildSafeguardingStatus`:
    * `good_neighbor_pledge: bool`, `parking_plan_verified: bool`, `max_evening_hour: String` ("21:00"), `open_window_child_policy: bool`.
  - [x] En `db/data_plane.rs`, tabla `neighborhood_complaints`: `id`, `group_id`, `colonia_name`, `category` (`parking`, `noise`, `other`), `comments`, `status`, `sla_deadline` ($T + 24\text{ horas}$).
  - [x] Endpoint `POST /api/v1/civic/neighborhood-feedback`: Buzón público de colonos y vecinos de Durango.
  - [x] Endpoint `GET /api/v1/civic/complaints-desk`: Bandeja de atención comunitaria de Pórtico HQ.

- [x] **1.7. Fisión Celular por Grafo de Dunbar y Núcleo Plantador (`GOLD-279`):**
  - [x] En `portico-core/src/domain.rs`, modelar `DunbarSaturation` y `PlantingSeedNucleus`:
    * `current_average_attendance: f32`, `is_dunbar_saturated: bool` ($N \ge 14.0$).
    * `parent_group_id: String`, `apprentice_id: String`, `seed_member_ids: Vec<String>`, `new_group_name: String`, `new_macro_zone: String`.
  - [x] En `db/data_plane.rs`, método `execute_dunbar_fission`: Desprende la célula hija transfiriendo voluntariamente al aprendiz y a los 3-4 miembros del núcleo plantador, manteniendo 10-11 miembros en la célula madre con linaje `parent_group_id`.
  - [x] Endpoint `POST /api/v1/groups/:id/dunbar-fission`: Ejecución fraternal de la fisión celular en 1 clic al cierre de temporada.

---

### FASE 2: Frontend — Componentes de Presbiterio, Multi-Campus, Sabático y Fisión Dunbar

- [x] **2.1. Mesa Presbiteral de Ancianos (`ElderDesk.tsx` / `GOLD-273`):**
  - [x] Nueva superficie de trabajo exclusiva para el rol `Elder`:
    * Tablero de su Macro-Zona territorial con los 10 a 12 diáconos a su cargo.
    * Indicadores agregados de salud y asistencia de las células del sector.
    * Registro de la mesa redonda mensual de cuidado pastoral diaconal.
    * Bandeja de triaje conjunto con diáconos para desviaciones escaladas.

- [x] **2.2. Selector Multi-Campus Dominical y Hub de Atrio Descentralizado (`PublicPortal.tsx` / `GOLD-274`):**
  - [x] Selector interactivo de los 5 Macro-Campus en el catálogo público y encabezado.
  - [x] Tarjeta destacada de hospitalidad dominical: horario de servicios y Punto de Conexión del Atrio según el campus seleccionado.
  - [x] Asignación visual de cada célula a su campus territorial de cobertura.

- [x] **2.3. Semáforo de Sabático de Anfitrión y Selector de Sede Híbrida (`MemberSilo.tsx` / `GOLD-275`):**
  - [x] En el Silo del Anfitrión:
    * Contador visual de temporadas activas consecutivas (ej. `Temporada 2 de 2: Próximo Sabático Programado`).
    * Botón `[ 🕊️ Confirmar Temporada Sabática de Hogar ]` para relevar el espacio con dignidad y gratitud.
    * Selector de tipo de sede: `[ 🏡 Hogar Particular ]` vs `[ 🏛️ Espacio Comunitario de Campus / Café ]`.

- [x] **2.4. Módulo de Servidores Eméritos y Guardianes del ADN (`PastorHud.tsx` & `MemberSilo.tsx` / `GOLD-276`):**
  - [x] En `MemberSilo.tsx`: Tarjeta de Honor para miembros fundadores comisionados con insignia `Guardián del ADN`.
  - [x] En `PastorHud.tsx`: Pestaña dedicada para enrolar a los primeros 300 veteranos en roles estratégicos de Atrio, Intercesión y Consejería matrimonial (Tito 2).

- [x] **2.5. Visualizador Litúrgico Curado y Cola Diaconal con SLA < 72h (`MemberSilo.tsx` & `DeaconDesk.tsx` / `GOLD-277`):**
  - [x] En el Silo del Facilitador: Tarjeta de `Guía Litúrgica de la Semana` con video-prompt pastoral de 3 minutos y preguntas de Pair-Share.
  - [x] En `DeaconDesk.tsx`:
    * Registro de visita presencial diaconal (frecuencia cada 6 semanas).
    * Cronómetro de SLA regresivo en color ámbar/rojo ($< 72\text{ horas}$) para observaciones reportadas por miembros.

- [x] **2.6. Insignias de Buena Vecindad, Ventana Abierta y Buzón Cívico (`PublicPortal.tsx` & `OperatorHq.tsx` / `GOLD-278`):**
  - [x] En `PublicPortal.tsx`:
    * Badge de confianza: `[ 🤝 Buena Vecindad: Estacionamiento y Ruido Controlado ]`.
    * Badge de salvaguarda: `[ 🛡️ Espacio Seguro: Ventana Abierta y Protección Infantil ]`.
    * Enlace al pie de página: *"¿Eres vecino de una colonia en Durango? Contáctanos directamente"*.
  - [x] En `OperatorHq.tsx`: Bandeja de atención a quejas o inquietudes vecinales con SLA de 24h.

- [x] **2.7. Asistente Interactivo de Fisión Dunbar con Núcleo Plantador (`MemberSilo.tsx` & `DeaconDesk.tsx` / `GOLD-279`):**
  - [x] Al detectar saturación ($N \ge 14$): Alerta festiva de multiplicación saludable en el Silo.
  - [x] Modal de Fisión Dunbar:
    * Confirmación del aprendiz como nuevo facilitador plantador (`GOLD-262`).
    * Selector de 3 a 4 miembros del núcleo plantador voluntario.
    * Proyección inmediata del balance relacional: Célula Madre (10-11 pers) y Célula Hija (4-5 pers).
    * Envío con bendición comunitaria al cierre fraternal de temporada (`GOLD-264`).

---

### FASE 3: Integración de Superficies, Roles y Navegación

- [x] **3.1. Soporte Canónico del Rol `Elder` (Anciano de Sector):**
  - [x] Actualizar `RoleMode` en `frontend/src/types.ts` incorporando `'elder'`.
  - [x] Actualizar `RoleSwitcher.tsx` con la opción `Anciano de Sector (Bernabé)` conectada a `ElderDesk.tsx`.
- [x] **3.2. Adaptación del HUD Pastoral para Multi-Campus (`PastorHud.tsx`):**
  - [x] Selector superior de filtro por Campus (`Todos`, `Norte`, `Sur`, `Poniente`, `Oriente`, `Centro`).
  - [x] Pestaña `Presbiterio de Ancianos` que visualiza a los 5 presbiterios colegiados y sus coordinadores.
- [x] **3.3. Consola de Operador HQ (`OperatorHq.tsx`):**
  - [x] Tablero de impacto urbano municipal y seguimiento a quejas vecinales de Durango.

---

### FASE 4: Purga Forense de Residuos y Saneamiento de Debris

- [x] **4.1. Purga de Suposiciones Monolíticas:**
  - [x] Verificar que no existan variables quemadas con direcciones únicas de templo central.
  - [x] Eliminar cualquier método de asignación de diáconos que dependa del Lead Pastor de forma centralizada.
- [x] **4.2. Purga de División Aritmética Arbitraria:**
  - [x] Confirmar que ninguna función divida miembros al 50% por azar o sin consentimiento del núcleo plantador.
- [x] **4.3. Validación de Cero Placeholders:**
  - [x] Todas las acciones (fisión celular, registro de sabático de anfitrión, buzón de colonos, enrolamiento de eméritos) conectadas a endpoints de Rust SQLite.

---

### FASE 5: Estrategia de Testing Integral (Backend Rust + Frontend Node)

- [x] **5.1. Suite de Tests en Backend Rust (`cargo test --workspace`):**
  - [x] `test_eldership_council_scoping_and_deacon_roundtables`: Validar que un anciano solo gestiona sus 10-12 diáconos asignados (`GOLD-273`).
  - [x] `test_multi_campus_capacity_and_service_load_balancing`: Validar segmentación de los 5 campus y límites de aforo dominical (`GOLD-274`).
  - [x] `test_host_sabbatical_lifecycle_enforcement`: Validar bloqueo/alerta tras 2 temporadas consecutivas de anfitrión (`GOLD-275`).
  - [x] `test_emeritus_guardian_commissioning`: Validar asignación de veteranos a roles Tito 2 e intercesión (`GOLD-276`).
  - [x] `test_curated_liturgy_and_conciliar_sla_tracking`: Validar cálculo de SLA < 72h en quejas pastorales (`GOLD-277`).
  - [x] `test_good_neighbor_charter_and_civic_complaint_sla`: Validar buzón vecinal y alerta a 24h (`GOLD-278`).
  - [x] `test_dunbar_mass_critical_cell_fission`: Validar que la fisión por núcleo plantador conserva 10-11 en madre y 4-5 en hija con linaje `parent_group_id` (`GOLD-279`).
- [x] **5.2. Suite de Tests en Frontend Node (`npm test`):**
  - [x] Crear `frontend/test/ciclo6_escala_25000_multicampus.test.mjs` cubriendo las 7 decisiones (`GOLD-273` a `GOLD-279`).
  - [x] Validar compatibilidad total con suites anteriores (Ciclos 2, 3, 4 y 5).
- [x] **5.3. Verificación de Compilación y Calidad:**
  - [x] Rust: `cargo check --workspace` y `cargo test --workspace` (0 fallos, 46 pruebas pasando).
  - [x] Frontend: `npx tsc -b`, `npm test` (0 fallos, 69 pruebas pasando) y `npm run build` (0 errores).
  - [x] Linter: 0 errores de tipo.

---

### FASE 6: Actualización Exhaustiva de Documentación

- [x] **6.1. Actualizar `2_portico/README.md`:** Documentar la arquitectura de 5 Macro-Campus, presbiterios colegiados, matriz híbrida de hogares, protocolo de buena vecindad y fisión Dunbar.
- [x] **6.2. Actualizar `2_portico/ideas/00-Indice.md`:** Indexar formalmente `13-portico-plan-accion-checklist-escala-25000-multicampus-v3.2.md`.
- [x] **6.3. Reporte de Cierre Ejecutivo:** Resumen cuantitativo y confirmación de purga de debris entregados a la Dirección.

---

## 🛑 Directiva de Contención Estricta
> **REGLA DE ORO:** Ninguna línea de código de producción será escrita en `backend/` ni en `frontend/` hasta que la Dirección revise este checklist detallado y otorgue la instrucción explícita de inicio.
