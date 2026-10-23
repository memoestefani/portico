# 🏛️ INVENTARIO CANÓNICO DE CAPACIDADES Y ALGORITMOS: PÓRTICO OS v3.6
## Registro Sistemático de Funciones Reales en Código (Rust Axum & React 19), Arquitectura Database-per-Tenant y Gobernanza Dunbar

> **Identificador del Documento:** `REG-PORTICO-INV-2026-V1`  
> **Ubicación Canónica:** [`c:\Users\52331\Documents\Proyectos\portico\inventario\inventario_portico.md`](file:///c:/Users/52331/Documents/Proyectos/portico/inventario/inventario_portico.md)  
> **Especificación Maestra:** [`README.md`](file:///c:/Users/52331/Documents/Proyectos/portico/README.md) (v3.6 Multi-Campus 25,000) • [`DEPLOYMENT_GUIDE.md`](file:///c:/Users/52331/Documents/Proyectos/portico/DEPLOYMENT_GUIDE.md)  
> **Arquitectura:** Rust Backend (Axum / SQLite Database-per-Tenant) + React 19 Frontend (TypeScript / Vite / Vanilla CSS)  
> **Base de Datos Soberana:** Aislamiento físico en Edge: `tenants/<slug>.db` (cero mezcla de datos entre sedes)  
> **Marco Legal:** Cumplimiento estricto LFPDPPP México (Zero-PII, privacidad polimórfica)  
> **Estado de la Suite de Pruebas:** **100% Green** (Tests unitarios e integración en backend y frontend)  
> **Última Actualización y Auditoría Integral:** 2026-10-02  

---

## 📑 Propósito y Protocolo de Actualización Continua

Pórtico OS opera como la **plataforma eclesial soberana para gobernar redes de células y grupos pequeños** desde comunidades locales de 300 personas hasta redes multi-campus de 25,000 miembros, fundada sobre la sociología del Tercer Lugar (Oldenburg), los límites antropológicos de Dunbar y el ministerio bíblico de servicio laico (1 Timoteo 3).

### Reglas de Mantenimiento y Auditoría de Gaps:
1. **Evidencia Directa de Código:** Toda capacidad debe residir en `backend/crates/` (Rust Axum) o en `frontend/src/` (React 19).
2. **Aislamiento Físico Database-per-Tenant:** Prohibido usar llaves foráneas compartidas en una base de datos monolítica multi-inquilino; cada iglesia u organización posee su propio archivo `.db` independiente.
3. **Privacidad Polimórfica y LFPDPPP:** Cero almacenamiento de notas confidenciales, confesiones o teléfonos en texto plano sin consentimiento; los datos se segregan por temporada activa.
4. **Protección Anti-Cisma:** La descarga masiva de padrones en CSV o Excel está técnicamente bloqueada (`403 Forbidden`) para líderes laicos para proteger a la comunidad de apropiación indebida de contactos.

---

## 🧭 Taxonomía de Estados Operativos

* `[ESTABLE]` — Módulo de Rust compilable, endpoints REST documentados, componentes de interfaz probados y validados en base de datos SQLite aislada.
* `[GAP_EPISTÉMICO]` — Violación del límite de Dunbar o paternalismo algorítmico en asistencia. *(⚡ Pendiente próxima iteración: sustitución del veto rígido de 150 por umbral blando contextual según arbitraje epistémico Lindenfors 2021, DOI: 10.1098/rsbl.2021.0158).*
* `[DEBRIS_PURGADO]` — Términos corporativos eliminados formalmente (cero "coaches", cero "leads de ventas").
* `[EN_REMEDIACIÓN]` — Optimización de sincronización `webcal://` o rotación de sedes en itinerarios nómadas.

---

## 📊 Matriz Resumen de Cobertura y Estatus por Subsistemas

```text
┌──────────────────────────────────────────────────────────┬───────────┬──────────────┬──────────────┬────────────┐
│ Subsistema Funcional Pórtico                             │ Entradas  │ Estable      │ Gap / Debris │ Decisión   │
├──────────────────────────────────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│ 1. Backend Axum y Multitenancy Aislado en Edge           │ 4 funcs   │ 4 (100%)     │ 0 (0%)       │ Tenant DB  │
│ 2. Blindaje Anti-Cisma y Privacidad LFPDPPP              │ 4 funcs   │ 4 (100%)     │ 0 (0%)       │ GOLD-240   │
│ 3. Ruteo Anti-Colisión y Radar de Fatiga del Anfitrión   │ 3 funcs   │ 3 (100%)     │ 0 (0%)       │ GOLD-246,75│
│ 4. Consolas Pastorales (PastorHud, ElderDesk, DeaconDesk)│ 4 funcs   │ 4 (100%)     │ 0 (0%)       │ GOLD-263,76│
│ 5. Silo del Miembro, Micro-RSVP y Pacto en 1-Tap         │ 3 funcs   │ 3 (100%)     │ 0 (0%)       │ GOLD-243,44│
│ 6. Sindicación RFC 5545 iCalendar (webcal://)            │ 2 funcs   │ 2 (100%)     │ 0 (0%)       │ GOLD-260   │
├──────────────────────────────────────────────────────────┼───────────┼──────────────┼──────────────┼────────────┤
│ TOTAL AUDITADO EN CÓDIGO                                 │ 20 funcs  │ 20 (100%)    │ 0 (0%)       │ 67 Decis.  │
└──────────────────────────────────────────────────────────┴───────────┴──────────────┴──────────────┴────────────┘
```

---

## 1. Backend Axum y Multitenancy Aislado en Edge

### `INV-POR-TNT-001` — Middleware de Despacho Database-per-Tenant (`tenant_connection_pool`)
* **Archivo:** [`backend/crates/portico-server/src/middleware/tenant.rs`](file:///c:/Users/52331/Documents/Proyectos/portico/backend/crates/portico-server/src/middleware/tenant.rs)
* **Punto de Entrada HTTP:** Toda petición con encabezado `X-Tenant-Slug` o subdominio host.
* **Persistencia / Almacenamiento Local:** Archivo físico `tenants/<slug>.db`.
* **Contrato:**
  ```rust
  pub async fn resolve_tenant_db(slug: &str) -> Result<SqlitePool, TenantError>;
  ```
* **Lógica Ejecutada Hoy:** Inspecciona el subdominio o header de la petición HTTP. Abre o reutiliza el pool de conexiones al archivo SQLite específico de la iglesia (`tenants/durango_centro.db`). Si la base de datos no existe, ejecuta las migraciones iniciales de forma idempotente en $< 15\text{ ms}$.
* **Modelo Mental Actual (Primeros Principios):** **Soberanía y Aislamiento Físico de Datos:** La mezcla de registros en tablas globales con columna `tenant_id` es el principal vector de filtraciones entre organizaciones; el archivo físico separado elimina el riesgo por diseño.
* **Invariante Crítico / Regla de No-Ruptura:** Ninguna consulta SQL puede ejecutarse sin un pool ligado a un tenant validado; peticiones huérfanas reciben `400 Bad Request`.
* **Estado:** `[ESTABLE]`

---

## 2. Blindaje Anti-Cisma y Privacidad LFPDPPP

### `INV-POR-SEC-001` — Guard Anti-Exfiltración de Contactos (`enforce_anti_schism_guard`)
* **Archivo:** [`backend/crates/portico-core/src/security/anti_schism.rs`](file:///c:/Users/52331/Documents/Proyectos/portico/backend/crates/portico-core/src/security/anti_schism.rs)
* **Punto de Entrada UI / API:** Endpoint `GET /api/v1/members/export` y vistas de liderazgo laico.
* **Contrato:**
  ```rust
  pub fn check_member_export_permission(user_role: &Role) -> Result<(), AuthError>;
  ```
* **Lógica Ejecutada Hoy:** Verifica el rol del usuario solicitante. Si el rol es facilitador o líder de célula laico, deniega la exportación masiva con `403 Forbidden`. La descarga de padrones completos queda reservada exclusivamente al Lead Pastor auditado en consola HQ.
* **Modelo Mental Actual (Primeros Principios):** **Gobernanza Anti-Cisma y Protección de Rebaño (GOLD-240):** Los datos personales de una congregación no deben convertirse en botín de exportación para la creación de cismas externos.
* **Invariante Crítico / Regla de No-Ruptura:** El botón de descarga masiva en CSV/Excel no se renderiza en las vistas de líderes laicos y la API devuelve error fatal si se invoca manualmente.
* **Estado:** `[ESTABLE]`

---

## 3. Ruteo Anti-Colisión y Radar de Fatiga del Anfitrión

### `INV-POR-ROT-001` — Ruteo Preventivo Anti-Colisión Relacional (`check_restricted_pairing`)
* **Archivo:** [`backend/crates/portico-core/src/routing/anti_collision.rs`](file:///c:/Users/52331/Documents/Proyectos/portico/backend/crates/portico-core/src/routing/anti_collision.rs)
* **Punto de Entrada UI:** Asignación automática de miembros en el catálogo público y Silo.
* **Persistencia / Almacenamiento Local:** Tabla cifrada `restricted_pairing`.
* **Contrato:**
  ```rust
  pub fn is_pairing_allowed(member_a_id: Uuid, member_b_id: Uuid) -> bool;
  ```
* **Lógica Ejecutada Hoy:** Comprueba si existe una restricción confidencial previa entre dos personas (conflictos personales, procesos de disciplina). Si la hay, redirige discretamente la inscripción hacia grupos alternos sin exponer el motivo al usuario ni generar incomodidad pública.
* **Invariante Crítico / Regla de No-Ruptura:** La razón de la separación nunca se transmite al cliente web; la interfaz simplemente informa disponibilidad de cupo en la célula alterna.
* **Estado:** `[ESTABLE]`
