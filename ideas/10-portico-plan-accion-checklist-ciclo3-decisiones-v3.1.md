# 📋 Pórtico OS v3.1 — Plan de Acción Canónico y Checklist de Implementación (Ciclo 3)
## Arquitectura Preventiva ante Modos de Falla: Las 10 Decisiones Canónicas (1-C a 10-C)
### Basado en los Benchmarks de GitHub (GOLD-240 a GOLD-249), LFPDPPP y Primeros Principios Eclesiológicos

```yaml
version: 3.1.3-action-plan-cycle-3
document_id: PORTICO-10-ACTION-PLAN-CYCLE-3
date: 2026-09-25
status: COMPLETED_100_PERCENT_VERIFIED
code_freeze_active: false
canonical_dossier: DOSSIER-068 (research)
canonical_registry: ADOPTED_REGISTRY.md (GOLD-240 a GOLD-249)
decisions_adopted:
  1_C_anti_schism_contact_shield: "GOLD-240: Visibilidad de contactos estacional y bloqueo 403 Forbidden a exportación CSV/Excel para laicado"
  2_C_structured_prayer_lfpdppp: "GOLD-241: Intercesión estructurada por categorías cerradas (salud, trabajo, familia, gratitud, direccion) con cero texto libre"
  3_C_fast_track_pastoral_safeguard: "GOLD-242: Escalación rápida de emergencias pastorales con guía de 3 pasos de primeros auxilios emocionales"
  4_C_micro_rsvp_catering_lock: "GOLD-243: Micro-RSVP binario con bloqueo de insumos por hora límite (rsvp_cutoff_hours) y contador confirmado"
  5_C_seasonal_covenant_attentive_listening: "GOLD-244: Pacto comunitario en 1 tap con promesa explícita de escucha atenta, confidencialidad, no MLM y no préstamos"
  6_C_liturgical_facilitation_flow: "GOLD-245: Guía litúrgica con 4 momentos libres (Acción de gracias, Lectura, Oración, Mesa) + temporizador pair-share de 5 min"
  7_C_anti_collision_discrete_routing: "GOLD-246: Ruteo preventivo anti-colisión mediante tabla cifrada de pares restringidos sin revelar conflicto"
  8_C_sidewalk_hospitality_protocol: "GOLD-247: Protocolo de Acera en WhatsApp solicitando salir a recibir a la banqueta para abatir la ansiedad de umbral"
  9_C_triad_leadership_structure: "GOLD-248: Estructura triádica de liderazgo laico (Facilitador, Anfitrión, Aprendiz) desplegada en catálogo y silo"
  10_C_kids_accommodation_tagging: "GOLD-249: Etiquetado de espacio para niños (kids_welcome, kids_space_type) con filtro dedicado en catálogo"
verification_gates:
  debris_purged: true
  zero_mockups_zero_placeholders: true
  automated_test_suite_coverage: "Rust 25/25 Backend Tests (19 unit + 1 exif + 5 integration) + Frontend 21/21 Unit/Integration Tests"
  compiler_health: "Cargo clean build 0 warnings + Vite build 0 warnings + Oxlint 0 errors"
  browser_subagent_verified: true
```

---

## 🏛️ 1. Declaración de Principios de la Arquitectura Preventiva

1. **Principio Anti-Cisma y Blindaje del Rebaño (`1-C` / `GOLD-240`):**
   La base de datos de miembros pertenece a la iglesia y a las familias bajo custodia de la LFPDPPP. Ningún voluntario o facilitador laico puede descargar listas completas de contactos en formatos masivos (CSV/Excel). El endpoint responde `403 Forbidden` informando la restricción legal.
2. **Principio de Intercesión Estructurada sin Difamación (`2-C` / `GOLD-241`):**
   El software previene el "chisme espiritual". La oración comunitaria se organiza por categorías objetivas cerradas sin campos de texto libre público que violen el derecho a la intimidad o expongan diagnósticos de salud sensibles.
3. **Principio de Primeros Auxilios Emocionales y Salvaguarda (`3-C` / `GOLD-242`):**
   Ante crisis de violencia, duelo severo o ideación de riesgo, el facilitador cuenta con un botón silencioso directo al Pastor con una guía de 3 pasos para contener con prudencia sin pretender actuar como terapeuta clínico.
4. **Principio de Hospitalidad sin Fatiga (Catering Lock - `4-C` / `GOLD-243`):**
   El anfitrión que abre su hogar no debe desperdiciar comida ni pasar vergüenza por falta de provisiones. El sistema congela la confirmación horas antes de la reunión y entrega el número exacto confirmado.
5. **Principio del Pacto Comunitario y Escucha Atenta (`5-C` / `GOLD-244`):**
   Toda comunidad requiere reglas de convivencia explícitas antes de iniciar la temporada. El pacto sella 4 pilares: escucha activa considerando a los demás, confidencialidad total, renuncia a ventas multinivel/catálogo y cero préstamos de dinero.
6. **Principio de Liturgia Libre y Conversación en Parejas (`6-C` / `GOLD-245`):**
   La reunión no es un monólogo escolar. Se sugieren 4 momentos para vivirse con libertad (Acción de gracias, Lectura bíblica, Oración mutua y Mesa de alimentos) respaldados por un temporizador de 5 minutos para dinámicas vulnerables de dos en dos.
7. **Principio de Ruteo Anti-Colisión Silencioso (`7-C` / `GOLD-246`):**
   Las tensiones relacionales previas (exparejas, querellas familiares) se gestionan con discreción absoluta. El sistema desvía preventivamente las solicitudes hacia grupos alternos sin exponer a nadie a la humillación.
8. **Principio de la Hospitalidad en la Acera (`8-C` / `GOLD-247`):**
   Vence la ansiedad de umbral del visitante. El mensaje de WhatsApp preformateado incluye la solicitud explícita: *"¿Podrías salir a recibirme a la banqueta al llegar para entrar juntos?"*.
9. **Principio de la Tríada Ministerial Laica (`9-C` / `GOLD-248`):**
   Nadie sostiene un grupo solo. Se visibilizan los tres carismas: Facilitador (moderación bíblica), Anfitrión (casa y mesa) y Aprendiz (co-liderazgo y relevo).
10. **Principio de Inclusión Familiar Urbana (`10-C` / `GOLD-249`):**
    En México las familias van con sus hijos. El catálogo filtra claramente dónde hay patio o espacio acondicionado para evitar la deserción por incomodidad.

---

## 🧹 2. Inventario Forense de Purga de Debris y Código Arcaico

- [x] **Purga de Exportaciones Masivas Laicas:** Erradicados botones o enlaces directos de descarga CSV en vistas de miembros y facilitadores; reemplazado por control de acceso `403 Forbidden` (`GOLD-240`).
- [x] **Purga de Formularios de Oración de Texto Libre:** Erradicados textareas de difamación en el muro comunitario; reemplazados por selector de categorías canónicas cerradas (`salud`, `trabajo`, `familia`, `gratitud`, `direccion`) (`GOLD-241`).
- [x] **Purga de Procesos Desconectados de Emergencia:** Reemplazados reportes informales por el flujo de salvaguarda pastoral con triaje formal y bitácora confidencial en el HUD (`GOLD-242`).
- [x] **Purga de Confirmaciones Tardías:** Eliminada la ambigüedad en el refrigerio con el cerrojo de catering (`rsvp_cutoff_hours`) (`GOLD-243`).
- [x] **Purga de Suposiciones Implícitas en Grupos:** Erradicadas normas no escritas; formalizado el modal del Pacto Comunitario con persistencia en localStorage y estado reactivo (`GOLD-244`).
- [x] **Purga de Emojis Infantiles y Jargon Religioso:** Mantenida la política de vocabulario sobrio de preparatoria y tipografía editorial limpia (`Ciclo 2` & `Ciclo 3`).
- [x] **Purga de Esquemas SQLite Desactualizados:** Añadidas migraciones idempotentes automáticas (`ALTER TABLE meeting_template ADD COLUMN ...`) para proteger bases de datos preexistentes en disco contra fallas de columna inexistente (`apprentice_id`, `kids_welcome`, `kids_space_type`, `rsvp_cutoff_hours`).
- [x] **Cero Placeholders y Cero Mockups:** Todo componente está conectado a endpoints reales Axum / SQLite probados en integración.

---

## 📋 3. Checklist Detallado de Implementación por Fases (Ciclo 3)

### FASE 1: Core Domain & Data Plane (Rust / libSQL / SQLite)
- [x] **`portico-core/src/domain.rs`:**
  - [x] Añadido enum `PrayerCategory` (`Salud`, `Trabajo`, `Familia`, `Gratitud`, `Direccion`).
  - [x] Añadido struct `PrayerNeed` (`id`, `edition_id`, `author_id`, `author_name`, `category`, `is_answered`, `created_at`).
  - [x] Añadido struct `SafeguardAlert` (`id`, `edition_id`, `reporter_id`, `reporter_name`, `urgency_level`, `status`, `created_at`).
  - [x] Añadido struct `RestrictedPairing` (`id`, `phone_a`, `phone_b`, `reason_category`, `created_at`).
  - [x] Añadido struct `MeetingRsvp` (`id`, `edition_id`, `meeting_date`, `member_id`, `status`, `created_at`).
  - [x] Actualizado struct `MeetingTemplate` con campos de Tríada y Niños (`apprentice_id`, `kids_welcome`, `kids_space_type`, `rsvp_cutoff_hours`).
- [x] **`portico-core/src/db/data_plane.rs`:**
  - [x] DDL de tablas `prayer_need`, `safeguard_alert`, `restricted_pairing`, `meeting_rsvp`.
  - [x] Índices de alto rendimiento para búsquedas por `edition_id` y `meeting_date`.
  - [x] Migraciones idempotentes automáticas en `initialize_data_plane`.
  - [x] Operaciones CRUD: `insert_prayer_need`, `list_prayer_needs_for_edition`, `insert_safeguard_alert`, `list_safeguard_alerts`, `update_safeguard_alert_status`, `insert_restricted_pairing`, `list_restricted_pairings`, `is_pairing_restricted`, `upsert_meeting_rsvp`, `get_catering_headcount`.
- [x] **Unit Tests en `portico-core`:**
  - [x] `test_prayer_needs_crud_and_categories` -> OK.
  - [x] `test_meeting_rsvp_and_catering_lock` -> OK.
  - [x] `test_safeguard_alerts_triage` -> OK.
  - [x] `test_restricted_pairing_anti_collision` -> OK.

### FASE 2: API Endpoints & Business Logic (Axum `portico-server`)
- [x] **`portico-server/src/routes/catalog.rs`:**
  - [x] Actualizado `CatalogQuery` soportando `kids_welcome` y `kids_friendly`.
  - [x] Proyección de Tríada (`leader_name`, `host_name`, `apprentice_name`) y Niños en `PublicEditionCard`.
  - [x] Ruteo anti-colisión en `submit_join_request_handler` desviando discretamente números con restricción registrada.
- [x] **`portico-server/src/routes/member.rs`:**
  - [x] `export_contacts_handler` emite `403 Forbidden` con mensaje Anti-Cisma.
  - [x] `create_prayer_handler` valida categorías cerradas y registra el motivo.
  - [x] `create_safeguard_alert_handler` procesa alertas de emergencia (`high`, `critical`).
  - [x] `submit_rsvp_handler` procesa confirmaciones y retorna `catering_headcount_confirmed`.
  - [x] `get_group_detail_handler` incluye la Tríada completa (`facilitator_name`, `host_reference`, `apprentice_name`), motivos de oración y conteo de catering.
- [x] **`portico-server/src/routes/pastor.rs`:**
  - [x] `list_safeguard_alerts_handler` y `triage_safeguard_alert_handler` para el Pastor Josh.
  - [x] `list_restricted_pairings_handler` y `create_restricted_pairing_handler` para gestión anti-colisión.
- [x] **`portico-server/src/routes/mod.rs`:**
  - [x] Enrutamiento de todas las rutas `/api/groups/{id}/prayers`, `/api/groups/{id}/safeguard-alert`, `/api/groups/{id}/rsvp`, `/api/groups/{id}/export-contacts`, `/api/pastor/safeguards`, `/api/pastor/restricted-pairings`.
- [x] **Integration Tests en `portico-server`:**
  - [x] `test_cycle3_canonical_10_decisions_integration_flow` cubriendo de extremo a extremo las 10 decisiones -> OK.

### FASE 3: Frontend Interfaces & Component Architecture (React 19 / TypeScript / Vite)
- [x] **`frontend/src/types.ts`:**
  - [x] Modelos `PrayerItem`, `SafeguardAlertItem`, `RestrictedPairingItem`.
  - [x] Campos de Tríada (`facilitator_name`, `host_reference`, `apprentice_name`), Niños (`kids_welcome`, `kids_space_type`) y Catering (`rsvp_cutoff_hours`, `catering_headcount_confirmed`).
- [x] **`frontend/src/api.ts`:**
  - [x] Clientes API con tipado estricto: `createPrayerNeed`, `createSafeguardAlert`, `submitRsvp`, `exportGroupContacts`, `fetchSafeguardAlerts`, `triageSafeguardAlert`, `fetchRestrictedPairings`, `createRestrictedPairing`.
- [x] **`frontend/src/components/PublicPortal.tsx`:**
  - [x] Chip de filtro `Espacio Infantil / Niños`.
  - [x] Insignia visual en tarjetas con espacios adaptados.
  - [x] Tríada mostrada en la cabecera de la tarjeta.
  - [x] Modal de ingreso con botón de despacho directo a WhatsApp implementando el **Protocolo de Acera** (`GOLD-247`).
- [x] **`frontend/src/components/MemberSilo.tsx`:**
  - [x] Modal y banner del **Pacto Comunitario de Temporada** con los 4 pilares explícitos (Escucha atenta, Confidencialidad, No MLM, No préstamos) (`GOLD-244`).
  - [x] Banner de la **Estructura Triádica de Liderazgo** (Facilitador, Anfitrión, Aprendiz) (`GOLD-248`).
  - [x] Tarjeta de **Guía de Reunión: 4 Momentos Libres** (Acción de gracias, Lectura, Oración mutua, Mesa de alimentos) con **temporizador de 5 minutos en vivo para dinámica en parejas** (`GOLD-245`).
  - [x] Tarjeta de **Muro de Oración Estructurado** por categorías objetivas con diálogo de captura en 1 tap (`GOLD-241`).
  - [x] Componente de **Micro-RSVP con Bloqueo de Alimentos (Catering Lock)** y conteo confirmado para el anfitrión (`GOLD-243`).
  - [x] Botón de **Alerta Silenciosa de Salvaguarda** con modal de 3 pasos de Primeros Auxilios Emocionales (`GOLD-242`).
  - [x] Botón de **Exportar Directorio (CSV)** enlazado a notificación de bloqueo legal 403 Anti-Cisma (`GOLD-240`).
- [x] **`frontend/src/components/PastorHud.tsx`:**
  - [x] Bandeja de entrada de **Salvaguarda Pastoral** para triaje rápido de emergencias (`GOLD-242`).
  - [x] Panel de **Ruteo Preventivo Anti-Colisión** con formulario para registrar pares restringidos (`GOLD-246`).

### FASE 4: Visual & Ergonomic Verification (Browser Subagent)
- [x] Ejecución de subagente de navegación automatizado en `http://127.0.0.1:5173/`.
- [x] Comprobación del conmutador de tema (`Modo Claro` / `Modo Oscuro`).
- [x] Comprobación visual de modal del Pacto Comunitario y aceptación en 1 tap.
- [x] Comprobación visual de modal de Salvaguarda y guía de primeros auxilios.
- [x] Comprobación visual de la bandeja pastoral y registro de restricciones anti-colisión.
- [x] Capturas forenses guardadas en artefactos (`public_portal_initial`, `covenant_modal`, `pastor_hud_view`, `safeguard_alert_modal`).

### FASE 5: Automated Testing & Continuous Verification Suite
- [x] **Backend Test Suite (`cargo test --workspace`):**
  - [x] 19 tests unitarios en `portico-core` (100% exitosos).
  - [x] 1 test unitario en `portico-server` (100% exitoso).
  - [x] 5 tests de integración en `portico-server` (100% exitosos).
  - [x] **Total Backend: 25 tests pasando, 0 fallas.**
- [x] **Frontend Test Suite (`npm test`):**
  - [x] 8 tests en `ciclo2_sobriedad.test.mjs` (100% exitosos).
  - [x] 13 tests en `ciclo3_decisiones.test.mjs` (100% exitosos).
  - [x] **Total Frontend: 21 tests pasando, 0 fallas.**
- [x] **Compilador y Linter:**
  - [x] `tsc -b && vite build` -> **0 errores, 0 advertencias**.
  - [x] `npx oxlint` -> **0 errores**.

---

## 🎯 4. Matriz de Cobertura de las 10 Decisiones Canónicas

| Decisión | Código | Resumen Arquitectónico | Backend / DB | Frontend UI | Tests Verificados |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **1-C** | `GOLD-240` | Anti-Cisma y Blindaje de Contactos | `GET /api/groups/{id}/export-contacts` -> `403 Forbidden` | Botón CSV con mensaje de aviso legal | Rust Integration + Node Suite |
| **2-C** | `GOLD-241` | Intercesión Estructurada sin Difamación | Tabla `prayer_need`, enum `PrayerCategory` cerrado | Tarjeta "Motivos de Oración" sin texto libre | Rust DataPlane + Integration + Node |
| **3-C** | `GOLD-242` | Salvaguarda Pastoral y Primeros Auxilios | Tabla `safeguard_alert`, handlers de triaje pastoral | Botón rojo discreto + Modal 3 pasos de primeros auxilios | Rust DataPlane + Integration + Node + Subagent |
| **4-C** | `GOLD-243` | Micro-RSVP con Catering Lock | Tabla `meeting_rsvp`, `get_catering_headcount` | Selector binario + Alerta de cierre de cocina | Rust DataPlane + Integration + Node |
| **5-C** | `GOLD-244` | Pacto Comunitario y Escucha Atenta | Persistencia de aceptación de pacto | Modal formal con los 4 pilares obligatorios | Node Suite + Subagent Screenshot |
| **6-C** | `GOLD-245` | Protocolo Litúrgico en 4 Momentos | Modelo de reunión y dinámicas relacionales | 4 momentos libres + Temporizador de 5 min Pair-Share | Node Suite |
| **7-C** | `GOLD-246` | Ruteo Preventivo Anti-Colisión | Tabla `restricted_pairing`, check en join request | Bandeja en HUD Pastoral + Modal de registro | Rust DataPlane + Integration + Node + Subagent |
| **8-C** | `GOLD-247` | Protocolo de Acera en WhatsApp | Plantilla `sidewalk_greeting` en WhatsApp link | Botón de despacho con saludo preformateado | Rust Integration + Node Suite |
| **9-C** | `GOLD-248` | Estructura Triádica de Liderazgo | `facilitator`, `host_reference`, `apprentice` en template | Insignias en Catálogo y Banner de Tríada en Silo | Rust Integration + Node Suite + Subagent |
| **10-C** | `GOLD-249` | Adaptación y Espacio Infantil | `kids_welcome`, `kids_space_type` en template/query | Filtro chip en catálogo + badge familiar | Rust Catalog Query + Integration + Node |

---

## ⚡ 5. Comandos de Reproducción y Verificación Continua

Para que el usuario o cualquier auditor verifique el 100% de este sistema:

```bash
# 1. Ejecutar la suite completa de pruebas unitarias y de integración de Backend (Rust)
cd c:\Users\52331\Documents\Proyectos\2_portico\backend
cargo test --workspace

# 2. Ejecutar la suite completa de pruebas de Frontend (Node.js)
cd c:\Users\52331\Documents\Proyectos\2_portico\frontend
npm test

# 3. Compilar el bundle de producción sin advertencias ni errores
npm run build

# 4. Iniciar el binario servidor soberano
cargo run -p portico-server
```

---
*Fin del Plan de Acción y Checklist de Implementación Canónico de Pórtico OS v3.1 (Ciclo 3).*
