# Pórtico — Piloto e implementación (MVP v3.1)

**Versión:** 3.1  
**Fecha:** 25 de septiembre de 2026  
**Hermano de:** `01` producto v3.0 · `02` autorización, identidad y privacidad v3.0.  
**Función:** especificar qué se construye, en qué orden, qué entrega la organización y cómo se demuestra que el piloto respeta el modelo sin crear conceptos huérfanos.

---

## 0. Alcance del piloto vs. arquitectura objetivo

El piloto operativo es deliberadamente enfocado:

```text
1 organización piloto: Amor y Gracia (Pastor Josh)
1 sede operativa real: Durango
8–12 grupos pequeños iniciales
1 governance real (Pastor Josh)
1 support principal + 1 support suplente
responsables y anfitriones reales
```

El sistema, sin embargo, se implementa desde el inicio como una plataforma escalable a 3,000 miembros:

```text
multi-organization (Control Plane desacoplado)
→ database-per-tenant (Data Plane dedicado en libSQL/SQLite)
→ multi-campus / multi-iglesia (naming_scheme configurable)
→ multi-season (cadencia de 12 semanas)
→ multi-edition
→ multi-membership
```

Para certificar la robustez del sistema, debe existir una **organización sintética separada** (Iglesia B) en pruebas automatizadas.

Objetivo: evitar que la arquitectura parezca multi-tenant solo por una columna en una tabla compartida. El aislamiento es físico a nivel de archivo de base de datos (`amorygracia.db` vs `iglesia_b.db`).

---

## 1. Modelo operativo de despliegue: Control Plane vs. Data Plane

```text
Pórtico Control Plane (portico_master.db)
│  - Catálogo de Iglesias / Licencias
│  - Mapeo de Subdominios (amorygracia.portico.lat) y Dominios Propios (amorygracia.mx)
│  - Naming Schemes ('Iglesia', 'Campus', 'Casa', 'Familia')
│  - Punteros de conexión Data Plane
│
├── Tenant Data Plane: Amor y Gracia (amorygracia.db)
│   ├── Sede: Durango
│   │   └── Otoño 2026 (12 Semanas)
│   │       ├── Jóvenes (Café Central — sede pública)
│   │       ├── Matrimonios (Casa Jardines — sede privada)
│   │       └── Zoom Internacional (online_session)
│   └── Sede: Laguna (futuro / sintético)
│
└── Tenant Data Plane: Iglesia Aliada B (iglesia_b.db)
    └── sus propias temporadas, miembros y grupos totalmente aislados
```

Una segunda organización no se resuelve creando otro namespace visual dentro de la misma iglesia: es una base de datos físicamente aislada a costo $0.

Un segundo campus/iglesia de la misma organización no requiere una segunda base de datos; vive dentro del mismo Data Plane del tenant.

---

## 2. Reglas arquitectónicas que no pueden romperse

### R1 — Tenant primero
Toda ruta privada determina `organization_id` y resuelve su base de datos Data Plane antes de consultar datos sensibles.

### R2 — Campus/Sede no es tenant
Campus es una dimensión operativa interna de la organización. No tiene gobierno técnico independiente ni base de datos separada.

### R3 — Temporada pertenece a campus
Una temporada tiene exactamente un campus/sede.

### R4 — Edición pertenece a temporada
Una edición nunca pertenece directamente a una persona, sede o afinidad sin pasar por su temporada.

### R5 — Member pertenece a organización
Una persona tiene un solo `member_id` por organización y puede pertenecer simultáneamente a grupos de distintas sedes.

### R6 — Lineage no hereda
`edition_lineage` es historia. Nunca ejecuta cascadas de membresías, recursos, calle, directorio, QR ni credenciales.

### R7 — Template no contiene personas
`small_group_template` es estructura reutilizable.

### R8 — Fullness manual
`is_full` es un switch manual del responsable. El sistema sugiere discretamente la división (*Split*) si hay sobrecupo (principio Jetro 1:10), pero no bloquea automáticamente por conteo de membresías.

### R9 — Silo en servidor
No confiar en ocultación de UI. Deny-by-default en el backend.

### R10 — No-store de privado
Calle de domicilios particulares, directorio, recursos privados y cookies de sesión no se cachean en CDN ni navegadores.

### R11 — Aislamiento Físico de Base de Datos (Database-per-Tenant)
Cada organización cliente posee su propio archivo de base de datos SQLite en el edge (`libsql`). Es matemáticamente imposible una fuga cruzada por un error de `JOIN` o `WHERE`.

### R12 — Privacidad Polimórfica de Sede
- `public_venue` (taquerías, cafeterías, parques): Nombre comercial, colonia y mapa son públicos en el catálogo.
- `private_home` (casas particulares): Solo colonia/zona en el catálogo público; calle exacta y timbre sellados dentro del silo de miembros.
- `online_session` (Zoom, Meet): Enlace protegido en el silo, accesible con 1-tap para miembros.

### R13 — Cadencia Canónica de 12 Semanas
Las temporadas operan bajo el estándar de **12 semanas activas + 1 semana de transición/descanso sabático** (4 ciclos anuales exactos = 52 semanas). El reingreso al siguiente ciclo es voluntario vía linaje.

---

## 3. Stack de referencia oficial (Suite Soberana)

### Backend
- **Lenguaje:** **Rust 2024** (homologado con `valgoritmo`, `smat`, `a_wbb`, `ekovoz`).
- **Framework Web:** `axum 0.8` con soporte asíncrono sobre `tokio 1.0`.
- **Motor de Base de Datos:** `libsql 0.6` (Turso / SQLite en el edge) con arquitectura *Database-per-Tenant* a costo $0.
- **Middleware:** `TenantResolver` sobre `axum::extract::Host` para despacho dinámico de bases de datos.
- **Seguridad y Criptografía:** `kanidm/webauthn-rs` (Passkeys), `ring`/`argon2` para hashing de tokens, y `qrcode` en Rust.
- **Observabilidad:** `tracing` estructurado sin PII sensible.

### Frontend
- **Lenguaje y Framework:** TypeScript + React 19 sobre `Vite 6`.
- **Diseño:** Mobile-first, diseño sobrio matte-dark / clean light sin dependencias pesadas.
- **Distribución:** PWA instalable en iOS y Android sin pasar por App Stores.
- **Canales y Compartición:** Web Share API nativa (`navigator.share`) y Deep Linking `wa.me` para WhatsApp (cero Meta Cloud API de pago).

### Auth con Degradación Agraciada
- **Primario:** Passkeys (WebAuthn biométrico / FIDO2).
- **Fallback ("Tía Devota"):** Token de un solo uso (Magic Link con TTL de 15 minutos) entregado directamente por WhatsApp o correo. Cero contraseñas, cero SMS de pago.
- **Opcional:** Google OIDC.

### Las 4 Superficies del Sistema
1. **Portal Público:** Catálogo responsivo por sede ("Iglesia Durango") con propuesta de la semana visible y botón "Quiero probar".
2. **Portal del Miembro y Líder ("Mis Grupos"):** Silos privados con dirección desbloqueada y botón de aviso oficial para WhatsApp con 1-tap.
3. **HUD de Licencia Pastoral (Panel de Josh):** Control de las 4 temporadas anuales, aprobación de grupos y radar Jetro de salud comunitaria (alertas de Split).
4. **Consola del Operador de Plataforma (Pórtico HQ MVP):** Panel para ti (`hq.portico.lat` o `/hq`) con autenticación de `platform_admin`. Permite aprovisionar una nueva iglesia cliente en 1 clic (slug, dominio, esquema de nombres), pausar/activar licencias, auditar permisos break-glass y monitorear la salud de bases de datos `libsql` sin acceder a los silos privados de miembros.

---

## 4. Esquema mínimo

Tablas que sí existen:

```text
organization
campus
season
affinity
zone
small_group_template
edition
edition_lineage
meeting_exception
member
credential
session
membership
contact_method
request
join_capability
resource_link
cover_asset
notice
event
institutional_page
organization_assignment
consent_record
privacy_request
audit_event
security_incident
support_access_grant
provider_inventory
purge_run
```

### No existen

```text
consultation
message
attendance
member_address
member_home_campus
member_home_zone
primary_group
waitlist
feed
pastoral_note
global_directory
member_global
organization_social_graph
attendance_score
time_conflict
matching
```

### Nota sobre responsabilidad

`edition.responsible_member_id` es suficiente para el responsable de esa edición.

`organization_assignment` cubre capacidades organizacionales delegadas como `governance` y `support` sin construir un RBAC genérico.

---

## 5. Esquema conceptual por tabla

### `organization`

```text
id PK
nombre_publico
pais
public_domain
responsable_legal_nombre
responsable_legal_domicilio
contacto_privacidad
privacy_notice_current_version
role_labels JSONB restringido a claves conocidas
status
created_at
updated_at
```

### `campus`

```text
id PK
organization_id FK
nombre_publico
ciudad
slug
sort_order
timezone
status
created_at
updated_at
```

Índice:

```text
(organization_id, status, sort_order)
```

### `season`

```text
id PK
organization_id FK de defensa
campus_id FK
nombre_publico
fecha_inicio
fecha_fin
estado
created_at
updated_at
```

Restricción de negocio:

```text
máximo 1 season en convocatoria/en_curso por campus
```

### `affinity`

```text
id PK
organization_id FK
nombre_publico
sort_order
status
```

### `zone`

```text
id PK
organization_id FK de defensa
campus_id FK
label
sort_order
status
```

### `small_group_template`

```text
id PK
organization_id FK
nombre_publico
proposito_base
affinity_id nullable
default_location_type
required_fields JSONB restringido
suggested_language JSONB/text
suggested_resources JSONB/lista
authoring_version
status
created_by
created_at
updated_at
```

### `edition`

```text
id PK
organization_id FK de defensa
season_id FK
created_from_template_id nullable FK
nombre_publico
proposito
affinity_id
portada_asset_id nullable
dia_habitual
hora_habitual
cupo_orientativo
responsible_member_id
public_responsible_visibility
estado
is_full
aviso_breve
created_at
updated_at
```

### `edition_lineage`

```text
id PK
organization_id FK
from_edition_id FK
to_edition_id FK
relation ENUM
created_by
created_at
note
```

Las dos ediciones deben pertenecer a la misma organización.

### `meeting_exception`

```text
id PK
organization_id FK de defensa
edition_id FK
start_at
end_at
status
location_type
zone_id nullable
private_reference nullable
private_address nullable
host_reference nullable
note
logistics_version
updated_by
updated_at
```

Restricción recomendada:

```text
UNIQUE(edition_id, fecha_logica_de_reunion)
```

### `member`

```text
id PK
organization_id FK
nombre_visible
estado
created_at
updated_at
```

Índice:

```text
(organization_id, estado)
```

### `credential`

```text
id PK
organization_id FK
member_id nullable
request_id nullable
type
secret_hash
status
expires_at
consumed_at
created_at
```

### `session`

```text
id PK
organization_id FK
member_id FK
session_hash
expires_at
revoked_at
created_at
last_seen_at
```

### `membership`

```text
id PK
organization_id FK
member_id FK
edition_id FK
status
created_at
closed_at
```

Restricción:

```text
UNIQUE(member_id, edition_id)
```

### `contact_method`

```text
id PK
organization_id FK
member_id FK
contact_method
value_encrypted
contact_visibility
created_at
updated_at
```

### `request`

```text
id PK
organization_id FK
type
name
whatsapp_encrypted
member_id nullable
edition_id nullable
affinity_id nullable
zone_id nullable
status
close_reason
created_at
closed_at
```

### `join_capability`

```text
id PK
organization_id FK
edition_id FK
token_hash
created_at
expires_at
revoked_at
status
```

### `resource_link`

```text
id PK
organization_id FK
edition_id FK
kind
title
url
sort_order
created_at
updated_at
```

Solo `https`.

### `cover_asset`

```text
id PK
organization_id FK
edition_id FK
storage_key
mime_type
byte_size
status
created_at
purge_after
```

### `notice`

```text
id PK
organization_id FK
edition_id FK
logistics_version
text
generated_at
purge_after
```

### `event`

```text
id PK
organization_id FK
campus_id nullable
scope
 type
start_at
end_at
location_type
public_location
notice
status
```

### `institutional_page`

```text
id PK
organization_id FK
kind
version
content
status
published_at
```

### `organization_assignment`

```text
id PK
organization_id FK
member_id FK
capability
status
starts_at
ends_at
created_at
```

Capacidades permitidas en MVP:

```text
governance
support
```

Restricción operacional:

- máximo dos `support` activos: principal + suplente;
- governance puede tener varios.

### `consent_record`

```text
id PK
organization_id FK
member_id nullable
request_id nullable
notice_version
purpose_code
consent_type
statement_hash
authenticated_by
timestamp
ip_truncated
user_agent_hash
revoked_at
```

### `privacy_request`

```text
id PK
organization_id FK
member_id nullable
type
status
received_at
verification_at
decision_at
effective_at
evidence
```

### `audit_event`

```text
id PK
organization_id nullable
actor_type
actor_id
action
object_type
object_id
occurred_at
result
request_id
ip_truncated
metadata_minimal
```

El `organization_id` puede ser `NULL` solo para eventos puramente de plataforma sin tenant, y aun esos no deben contener PII de clientes.

### `security_incident`

```text
id PK
organization_id nullable
severity
detected_at
systems
categories
affected_people_count
containment
notification
closed_at
postmortem
```

### `support_access_grant`

```text
id PK
organization_id FK
granted_by_member_id FK
scope_type
scope_id nullable
data_scope
reason
created_at
expires_at
revoked_at
status
```

### `provider_inventory`

```text
id PK
scope_type
organization_id nullable
provider
service
data_processed
purpose
country
role
contract_status
privacy_assessment
```

### `purge_run`

```text
id PK
organization_id nullable
started_at
finished_at
evaluated_count
deleted_count
blocked_count
error_count
purge_failed
```

---

## 6. API interna conceptual

### Identidad

```text
auth.start_google
auth.callback
auth.activation.issue
auth.activation.redeem
auth.passkey.register
auth.passkey.assert
auth.session.revoke
auth.session.revoke_all
```

### Organización/campus

```text
organization.get
campus.list
campus.create
campus.update
campus.archive
organization.assign
organization.unassign
```

### Temporada

```text
season.current
season.create
season.open_call
season.start
season.close
```

### Plantillas

```text
small_group_template.list
small_group_template.create
small_group_template.update
small_group_template.archive
```

### Ediciones

```text
edition.draft.create
edition.draft.create_from_template
edition.update
edition.recognize
edition.set_full
edition.close
edition.lineage.create
edition.return_eligibility
edition.rejoin
```

`edition.return_eligibility` es derivación, no una tabla de invitaciones.

### Reuniones

```text
meeting.template.upsert
meeting.exception.upsert
meeting.exception.cancel
meeting.resolve_next
```

### Avisos

```text
notice.generate
notice.whatsapp_payload
```

### Afiliación

```text
request.create
request.close
membership.activate
membership.revoke
membership.finish
join_capability.create
join_capability.revoke
join_capability.redeem
```

### Recursos

```text
resource.list
resource.create
resource.update
resource.delete
cover.put
cover.delete
```

### Catálogo

```text
catalog.organization.get
catalog.campuses.list
catalog.season.current
catalog.editions.list
catalog.edition.get
```

### Asambleas

```text
event.list
event.create
event.update
event.close
```

### Privacidad/seguridad

```text
privacy.request_create
privacy.request_verify
privacy.request_process
audit.list
incident.create
incident.update
purge.run
```

### Break-glass

```text
support_access_grant.create
support_access_grant.revoke
support_access_grant.active
```

Cada endpoint declara:

- actor permitido;
- organization scope;
- campus/edition scope cuando aplica;
- datos que puede leer;
- datos que puede escribir;
- si exige revalidación;
- si requiere auditoría;
- si requiere confirmación destructiva.

Sin política explícita, el endpoint no existe.

---

## 7. Regla de autorización reutilizable

Toda operación privada debe poder expresarse como:

```text
actor autenticado
AND actor activo
AND actor pertenece a organization O
AND recurso pertenece a organization O
AND scope requerido coincide
AND membership requerida está activa
AND season/edition está vigente
AND revalidación reciente si el dato es privado
```

Para responsible:

```text
actor = responsible_member_id de edition
```

o una asignación equivalente de esa capacidad.

Para support:

```text
capability = support
AND scope = organization
```

Para governance:

```text
capability = governance
AND scope = organization
```

Para platform support:

```text
active support_access_grant
AND scope incluye organization/recurso
AND data_scope permite el dato
AND grant no expiró
```

---

## 8. Plan de implementación de 12 semanas

El gate de cada bloque es funcional y de seguridad. Si falla, no se abre el siguiente bloque.

### Semanas 1–2 — Tenant, identidad y candado

Construir:

- organization;
- campus mínimo;
- season básico;
- affinity;
- zone;
- member;
- credential;
- session;
- membership;
- organization_assignment;
- middleware de autorización;
- consentimiento placeholder;
- audit event.

Implementar:

- aislamiento de tenant;
- passkey/token;
- Google opcional;
- session revoke;
- RLS o mecanismo equivalente si se adopta.

**Gate:**

```text
member A / organization X ↛ cualquier dato de organization Y
```

y:

```text
member A / campus X ↛ datos privados de campus Y
```

---

### Semanas 3–4 — Portal, campus y catálogo

Construir:

- portal de organización;
- selector de campus;
- catálogo de temporada por campus;
- ficha pública;
- institutional pages;
- cover asset;
- `is_full`;
- asambleas.

Construir también:

- `small_group_template`;
- creación de borrador desde plantilla.

**Gate:**

Un visitante sin cuenta:

```text
organización
→ campus
→ grupo pequeño
```

entiende propósito, día/hora, zona y tipo de lugar, y no ve:

```text
personas
calles
teléfonos
peticiones
```

---

### Semanas 5–6 — Puertas de afiliación

Construir:

- request al responsable;
- request sin edición a support;
- QR con TTL y revocación;
- canje con sesión;
- canje sin sesión;
- creación de member + membership;
- activation token para aceptación remota;
- “Quiero probar” dentro de otras ediciones;
- `contact_method` + visibilidad.

**Gate:**

```text
request remoto
→ no member
→ no session
```

hasta la aceptación y activación.

Además:

```text
QR expirado → no membership
QR revocado → no membership
is_full=true → no membership
```

---

### Semanas 7–8 — Semana y reproducción

Construir:

- meeting template;
- exceptions;
- cancelación;
- `logistics_version`;
- notice;
- payload WhatsApp;
- hasta cinco resources;
- resolución de próxima reunión;
- Inicio 1–3;
- revalidación de calle;
- `edition_lineage`;
- `return_eligibility`;
- `rejoin`;
- soporte de “Nueva edición desde plantilla”.

**Gate de logística:**

Responsable cambia hora/lugar/cancelación y abre aviso en menos de dos minutos.

**Gate de reproducción:**

```text
edition source
→ new edition
```

no hereda automáticamente:

```text
memberships
street
QR
resources
directory
```

Una persona histórica sí puede recibir “Volver a participar” al abrir la nueva edición autenticada.

---

### Semanas 9–10 — Cierre, privacidad y break-glass

Construir:

- cierre de edición;
- cierre de temporada;
- purgas;
- ARCO;
- incidents;
- provider inventory;
- backups/restore;
- `support_access_grant`;
- auditoría completa.

**Gate:**

Cerrar una temporada debe cortar:

```text
QR
silo
membership activa
resource visibility
private meeting access
```

Y una edición cerrada debe hacer lo mismo sin obligar a cerrar toda la temporada.

Break-glass:

- governance concede;
- support Pórtico ve solo scope concedido;
- expira;
- queda auditado.

---

### Semanas 11–12 — Piloto cerrado y prueba de escala

Operación real:

```text
1 organization
1 campus real
8–12 grupos pequeños
```

Fixtures sintéticos:

```text
organization X
organization Y
campus A
campus B
20+ editions
```

Ejercicios obligatorios:

- recuperación de dispositivo;
- sesión revocada;
- QR fotografiado y después revocado;
- responsable relevado;
- integrante en tres ediciones;
- integrante en dos campus;
- persona en un grupo público sin cuenta;
- grupo lleno marcado manualmente;
- cancelación de reunión;
- edición cerrada antes de temporada;
- temporada cerrada;
- reingreso con lineage;
- split de un grupo;
- réplica en otro campus;
- mismo Google en dos organizaciones;
- mismo WhatsApp en dos organizaciones;
- incidente simulado;
- restore de backup;
- prueba de purge;
- revisión de proveedor;
- soporte break-glass con acceso operacional;
- soporte break-glass con `private_silo` y caducidad.

---

## 9. Gates detallados

### Gate A — Aislamiento

Debe pasar:

```text
cross_tenant_api_tests = green
cross_tenant_route_tests = green
cross_tenant_cache_tests = green
cross_tenant_storage_tests = green
```

### Gate B — Silo

Para dos ediciones A/B:

```text
member A ↛ directory B
member A ↛ street B
member A ↛ resources B
responsible A ↛ requests B
```

Probar:

- web;
- API;
- URL directa;
- caché;
- service worker;
- dos pestañas.

### Gate C — Temporada

```text
close season
→ memberships finished
→ QRs dead
→ silos inaccessible
→ private address unavailable
```

### Gate D — Reingreso

```text
old membership
→ eligible to return
→ explicit confirmation
→ new membership
```

Nunca:

```text
old membership → new active membership
```

sin acción de la persona.

### Gate E — Break-glass

Sin grant:

```text
platform support ↛ street
platform support ↛ directory
```

Con grant:

```text
solo organization/scope permitido
solo data_scope permitido
solo mientras no expire
```

Al expirar:

```text
acceso = denegado
```

---

## 10. Definition of Done

Una función no está lista con tabla + pantalla.

Debe incluir:

```text
modelo
→ estado
→ tenant scope
→ autorización
→ validación
→ auditoría si es sensible
→ retención
→ purga
→ error
→ test
```

Una pantalla incluye:

```text
vacío
carga
error
404 de permiso
objeto cerrado
revalidación
móvil
```

Una operación:

```text
aceptar
rechazar
revocar
reconocer
cerrar
ver calle
ver directorio
cambiar responsable
```

incluye:

```text
auth
→ authorization
→ confirmation if destructive
→ audit
```

---

## 11. Operaciones atómicas importantes

### Afiliación por QR sin sesión

Debe ser una transacción única:

```text
validate qr
→ validate season
→ validate edition
→ validate !is_full
→ capture privacy/consent
→ create member
→ create membership
→ initialize device credential/session
→ audit
```

Si falla una parte:

```text
no membership
no partial member
```

### Aceptación remota

```text
request = nueva
→ responsible accepts
→ issue activation credential tied to request
→ person redeems
→ create member
→ create membership
→ session/passkey
→ close request accepted
→ audit
```

No crear `member` solo por aceptar una petición.

### Cierre de temporada

Debe ocurrir con una operación idempotente.

Repetirla no debe:

- reabrir memberships;
- revivir QR;
- restaurar calles;
- duplicar auditoría significativa.

---

## 12. Reglas para el calendario

La función de resolución debe ser pura y testeable.

Entrada:

```text
edition
current_time
season
exceptions
```

Salida:

```text
next_meeting | none
```

Casos de prueba:

- plantilla normal;
- cambio de hora;
- cambio de lugar;
- dos excepciones futuras;
- cancelación;
- excepción antigua;
- cambio de plantilla después de excepción;
- fin de temporada;
- edición cerrada;
- timezone del campus.

Ninguna otra tabla debe guardar “próxima reunión”.

---

## 13. Reglas para `is_full`

No usar:

```text
COUNT(membership)
```

para decidir automáticamente `is_full`.

Sí puede existir un `COUNT` técnico para integridad, mantenimiento o administración interna cuando sea estrictamente necesario, pero no debe controlar el producto.

El responsable puede:

```text
marcar llena
reabrir
```

y el cambio queda auditado.

---

## 14. Reglas para campus

Crear campus:

```text
governance only
```

Modificar campus:

```text
governance only
```

Cerrar campus:

```text
governance
→ no nuevas temporadas
→ cerrar/gestionar temporada existente
```

No crear automáticamente:

- grupos;
- afinidades;
- miembros;
- roles.

Un campus nuevo empieza estructuralmente vacío.

---

## 15. Reglas para small group templates

### Qué pueden contener

- nombre;
- propósito base;
- afinidad sugerida;
- tipo de lugar sugerido;
- campos requeridos;
- lenguaje sugerido;
- recursos sugeridos.

### Qué nunca pueden contener

- member ids;
- teléfonos;
- dirección privada;
- QR;
- session ids;
- passwords/tokens;
- directorio;
- historial pastoral.

### Flujo

```text
template active
→ create edition draft
→ copy structure only
→ local edit
→ recognize
```

Una modificación posterior de la plantilla no muta ediciones existentes.

Esto debe probarse expresamente.

---

## 16. Reglas para edition lineage

`edition_lineage` debe ser append-oriented.

No se borra ni se actualiza arbitrariamente para “hacer coincidir” personas.

Relaciones válidas:

```text
split
replicated
continued
moved_to_campus
merged
```

Ejemplos:

```text
A → B   split
A → C   split

A → D   replicated

A → E   continued

A → F   moved_to_campus

A + B → C   merged
```

El lineage nunca produce side effects automáticos.

Su función es permitir:

- historia;
- elegibilidad de “Volver a participar”;
- comprensión de reproducción organizacional.

No es una cola de migración de miembros.

---

## 17. Reingreso: implementación sin lista histórica de teléfonos

No implementar:

```text
previous_members_directory
```

No implementar:

```text
invite_history_contacts
```

En su lugar:

```text
new edition
+ lineage
+ authenticated member
+ prior membership
```

produce:

```text
return_eligibility = true
```

La nueva edición puede mostrar:

> “Volver a participar”

al miembro elegible.

La persona confirma:

```text
rejoin
→ new membership
```

El responsable puede compartir el enlace de la nueva edición por WhatsApp.

La coordinación humana sigue fuera de Pórtico.

---

## 18. Materiales y enlaces externos

Pórtico no hospeda archivos en el MVP.

Puede guardar hasta cinco URLs por edición.

Cada alta valida:

```text
scheme == https
```

No ejecutar contenido remoto dentro del origen autenticado.

Cuando una edición se cierra:

```text
resource.list → empty / inaccessible
```

pero no afirmar que el archivo externo fue destruido.

La organización es responsable de configurar la privacidad del destino externo.

---

## 19. Avisos y WhatsApp

### Generación

El aviso se deriva de:

```text
edition
+ resolved meeting
+ logistics_version
```

No se redacta manualmente desde cero.

### Invariante

Si cambia la logística:

```text
logistics_version_old ≠ logistics_version_new
```

Un aviso de versión anterior no debe presentarse internamente como “vigente”.

### Salida

El botón:

```text
Abrir WhatsApp
```

es una acción externa.

Pórtico no registra el chat resultante.

---

## 20. Privacidad operativa

Antes del primer día público deben existir:

```text
responsable legal
aviso simplificado
aviso integral
mecanismo ARCO
privacy contact
provider inventory
consent record
purge job
backup policy
incident procedure
```

La organización debe saber:

- quién atiende ARCO;
- quién atiende incidentes;
- quién es governance;
- quién es support principal;
- quién es suplente;
- qué proveedores intervienen.

---

## 21. Lo que la organización entrega

### Eclesial

1. Nombre público.
2. Qué sostiene.
3. Qué no sostiene.
4. Criterio de reconocimiento.
5. Personas con capacidad `governance`.
6. Responsable de cada grupo del piloto.
7. Lista de afinidades.
8. Lista corta de zonas del campus.
9. Fechas de temporada.
10. Calendario de asambleas.

### Campus

11. Nombre público del campus.
12. Ciudad.
13. Zona horaria.
14. Orden público de campus.
15. Zonas válidas.

### Operativo

16. Support principal.
17. Support suplente.
18. Cómo confirma un responsable una petición por WhatsApp, si desea hacerlo.
19. Cómo abre/cierra el chat de temporada.
20. Criterio humano para `is_full`.
21. Criterio humano para revocar una membership.
22. Disciplina de actualizar Pórtico cuando cambia la semana.

### Reproducción

23. Plantillas de grupos pequeños que quiere reutilizar.
24. Criterios para dividir/replicar/mover grupos.
25. Regla interna para quién puede crear lineage.

### Privacidad

26. Responsable jurídico.
27. Domicilio.
28. Contacto de privacidad/ARCO.
29. Aviso simplificado.
30. Aviso integral.
31. Proveedores.
32. Procedimiento de incidentes.
33. Regla: nadie comparte cuentas.

Sin los datos legales mínimos, el piloto no se abre públicamente.

---

## 22. Operación semanal del piloto

Media hora. No métricas de engagement.

### Producto

- ¿Los responsables corrigieron Pórtico cuando cambió la semana?
- ¿Alguien descubrió un grupo desde el catálogo?
- ¿Inicio mostró las próximas reuniones correctas?
- ¿Funcionó el selector de campus en entorno de prueba?

### Puerta abierta

- ¿Llegó gente a un lugar público sin cuenta?
- ¿El grupo la recibió normalmente?
- ¿Se usó QR en sitio?

### Privacidad

- ¿Apareció una calle donde no debía?
- ¿Apareció un teléfono donde no debía?
- ¿Hubo fuga entre campus?
- ¿Hubo fuga entre organizaciones?

### Operación

- ¿Algún support tiene petición sin edición de más de tres días?
- ¿Algún responsable tiene request de su edición sin tocar?
- ¿Algún grupo perdió responsable?

### Seguridad

- ¿Falló una purga?
- ¿Hubo sesión revocada que siguió viva?
- ¿Hubo QR revocado que siguió funcionando?
- ¿Hubo acceso break-glass?

No se miden:

- DAU;
- tiempo en pantalla;
- popularidad;
- retención espiritual;
- número de mensajes;
- “engagement”.

---

## 23. Éxito a 90 días

| Señal | Umbral | Alarma |
| --- | --- | --- |
| Responsables actualizan Pórtico | mayoría de ediciones | WhatsApp es la única verdad |
| Altas por QR/Quiero probar | flujo real | todo pasa por soporte |
| Personas asisten sin cuenta | ocurre | el grupo exige registro |
| Integrante prueba otro grupo | al menos un caso | catálogo no sirve |
| Integrante en varios grupos | al menos un caso posible sin fricción | Pórtico intenta limitarlo |
| Grupos reconocidos completos | 100% | catálogo hueco |
| Fuga de calle | 0 | incidente crítico |
| Fuga de teléfono | 0 en público | incidente |
| Directorio cruzado | 0 | incidente crítico |
| Cross-tenant access | 0 | detener ampliación |
| Cross-campus silo access | 0 | detener ampliación |
| Purga | corridas exitosas | retención rota |
| Break-glass | solo cuando existe incidente real | acceso rutinario |
| Tiempo de governance | minutos, no administración diaria | Pórtico absorbe gobierno |
| Nuevas ediciones desde plantilla | funcionan sin contaminación | template copia privacidad |
| Reingreso | explícito | membership heredada automáticamente |
| Incidentes críticos | 0 | detener ampliación |

---

## 24. Riesgos y controles

| Riesgo | Control |
| --- | --- |
| El chat se adelanta | disciplina + excepción rápida |
| QR fotografiado | TTL + revocación |
| Activation token reenviado | un uso + binding |
| Casa filtrada por caché | `no-store` + revalidación |
| Responsable saliente | cambio auditable + revocación |
| Grupo popular | `is_full` manual |
| Temporada que “sigue un poco” | cierre duro |
| Support ausente | suplente |
| Proveedor nuevo | inventory obligatorio |
| Template copia datos privados | esquema no permite esos campos |
| Lineage mueve miembros | no hay side effects de lineage |
| Campus se vuelve falso tenant | campus sin identidad/gobierno propio |
| Persona limitada por horarios | ningún motor de conflicto |
| Pórtico se convierte en Big Brother | no hay analytics conductual + break-glass explícito |
| Soporte Pórtico se vuelve superusuario | grant client-initiated + expiración + auditoría |
| Restore revive datos | política de restore + purge contrast |
| WhatsApp contradice Pórtico | Pórtico queda como ficha canónica; WhatsApp no se lee |

---

## 25. Checklist listo para piloto

Todo debe existir antes de publicar la URL al público:

```text
organization tenant
campus
season por campus
member_id estable
passkey/token
Google opcional
autorización en servidor
cross-tenant tests
cross-edition tests
cross-campus tests
membership por edición
QR revocable
activation one-time
revalidación de calle
directorio por edición
small_group_template
edition_lineage
return_eligibility
cierre de edición
cierre de temporada
purga
audit
incident
ARCO
support_access_grant
backup cifrado
restore probado
provider inventory
support principal
support suplente
governance real
```

---

## 26. Listo para producción

Además:

```text
visto bueno jurídico
revisión de seguridad
restore probado con evidencia
simulacro de incidente
purga comprobada contra backup policy
rotación de secretos probada
cero hallazgos críticos abiertos
prueba multi-organization
prueba multi-campus
prueba lineage
prueba de reingreso
prueba de break-glass
```

La aprobación jurídica no es un checkbox agregado después del código. Los comportamientos de privacidad ya deben existir en la implementación.

---

## 27. Prueba de expansión sin cambiar el producto

Antes de abrir un segundo campus real, ejecutar un escenario sintético:

```text
organization A
├── campus Durango
│   └── 100 editions
├── campus Chihuahua
│   └── 100 editions
└── campus Guadalupe Victoria
    └── 100 editions
```

Y:

```text
organization B
└── 100 editions
```

Probar:

- catálogo por campus;
- “Mis grupos” cross-campus;
- aislamiento cross-organization;
- consultas paginadas;
- auditoría;
- purga;
- creación desde template;
- lineage;
- reingreso;
- revocación;
- tiempos de autorización.

El objetivo no es demostrar que 300 grupos caben en una base de datos. El objetivo es demostrar que **el aumento de grupos no obliga a cambiar el modelo de seguridad ni de gobierno**.

---

## 28. Reglas de paginación y escala

Ninguna pantalla debe asumir que el catálogo o una bandeja tiene 10 elementos.

Todas las colecciones deben ser:

```text
server-side filtered
server-side paginated
ordered deterministically
```

Nunca:

```text
GET all
→ hide in frontend
```

Esto aplica especialmente a:

- catálogo;
- grupos por campus;
- requests;
- integrantes de una edición;
- auditoría;
- plantillas;
- eventos.

Un aumento de grupos no debe aumentar proporcionalmente la exposición de datos privados al cliente web.

---

## 29. Migraciones y cambios de esquema

Cada migración debe responder:

```text
¿qué tenant afecta?
¿qué datos toca?
¿hay riesgo de romper aislamiento?
¿es reversible?
¿cómo se prueba con datos sintéticos?
¿cómo afecta purga?
```

Nunca migrar producción copiando datos reales a un entorno de prueba sin controles y sin necesidad.

Cuando se cambie una regla de autorización:

```text
migration
→ policy tests
→ route tests
→ direct URL tests
→ cache tests
```

---

## 30. Qué liderazgo no decide a mitad de código

No se inventan:

- roles nuevos;
- campos pastorales;
- asistencia;
- ranking;
- chat interno;
- matching;
- scoring;
- pagos;
- mapas;
- biblioteca documental;
- identidad global;
- listas históricas de teléfonos.

Toda necesidad nueva sigue:

```text
necesidad
→ finalidad
→ objeto
→ tenant scope
→ permiso
→ estado
→ retención
→ purga
→ test
→ sí/no
```

Si la necesidad requiere un dato que Pórtico deliberadamente no quiere conocer, la respuesta predeterminada es no.

---

## 31. Frontera reservada

Después del MVP, solamente si el piloto demuestra que Pórtico ya es la ficha que la gente corrige:

- pegar un mensaje de WhatsApp → propuesta de excepción → aceptación humana;
- passkeys en varios dispositivos con recuperación más suave;
- mecanismo de clave por edición para datos privados;
- herramientas adicionales de reproducción organizacional.

Nunca sin decisión nueva:

- IA que publica;
- IA que admite personas;
- WhatsApp que escribe solo en Pórtico;
- asistencia;
- scoring;
- mapas;
- feed;
- grafo social;
- identidad global entre organizaciones.

---

## 32. Principio final de implementación

> **La implementación debe hacer que una organización pueda crecer en número de grupos pequeños y campus sin que Pórtico tenga que crecer como oficina central, ni como sistema de vigilancia.**

El crecimiento esperado es:

```text
más organizaciones
      ↓
 más campus
      ↓
 más temporadas
      ↓
 más grupos pequeños
      ↓
 más memberships
```

No:

```text
más supervisores Pórtico
más permisos globales
más datos personales
más dashboards de conducta
```

La plataforma escala cuando la organización puede reproducir su propia estructura con reglas que ella misma gobierna, mientras Pórtico conserva una frontera técnica estricta y útil.
