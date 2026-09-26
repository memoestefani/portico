# Pórtico — Autorización, identidad y privacidad (MVP v3.1)

**Versión:** 3.1  
**Fecha:** 25 de septiembre de 2026  
**Hermano de:** `01` producto v3.0 · `03` piloto e implementación v3.1.  
**Función:** contrato técnico de identidad, autorización, tratamiento, auditoría y retención. No sustituye el aviso legal de cada organización.

---

## 0. Cambio estructural respecto a v2.0 / v3.0

Pórtico es multi-tenant estricto con separación física entre el **Control Plane** de la plataforma y el **Data Plane** de cada iglesia:

```text
platform control plane (portico_master.db)
└── organization tenant (amorygracia.db - Data Plane dedicado)
    ├── campus / iglesia local (naming_scheme configurable)
    │   └── season (ciclo de 12 semanas)
    │       └── edition (grupos con sedes polimórficas)
    └── ...
```

La seguridad debe impedir tanto:

```text
persona A de organización X → datos de organización Y (aislamiento físico de DB)
```

como:

```text
persona A de campus X → silos de campus Y
```

salvo que exista una membership activa en la misma organización y la autorización correspondiente.

Una misma persona puede tener memberships en varios campus de la misma organización porque el `member_id` pertenece a la organización, no al campus.

Una persona que usa el mismo Google, correo o WhatsApp en dos organizaciones sigue teniendo identidades separadas. Pórtico no crea identidad global entre clientes.

---

## 1. Marco legal de implementación

La organización cliente es quien debe determinar, con asesoría jurídica, su calidad y obligaciones como responsable del tratamiento y la relación contractual aplicable con Pórtico y sus proveedores.

Para organizaciones privadas mexicanas, este diseño toma como referencia la **Ley Federal de Protección de Datos Personales en Posesión de los Particulares vigente**, cuya versión actualizada consultada corresponde a la reforma publicada el 14 de noviembre de 2025. La ley vigente considera sensibles, entre otros, los datos que puedan revelar creencias religiosas, filosóficas y morales, exige protección reforzada para datos sensibles y establece un marco para aviso de privacidad, seguridad y derechos ARCO. El tratamiento concreto de una pertenencia a un grupo pequeño debe ser clasificado jurídicamente por la organización; Pórtico, por diseño, la trata como información de alta protección y soporta consentimiento expreso cuando resulte jurídicamente exigible.

Los plazos operativos documentados para ARCO se alinean con el marco vigente consultado: 20 días para comunicar la determinación y, cuando procede, 15 días para hacerla efectiva, con la ampliación permitida por la ley. Estos plazos no sustituyen una revisión jurídica para el caso concreto.

El aviso de privacidad es responsabilidad de la organización. Pórtico debe impedir técnicamente que el aviso prometido sea contradicho por el comportamiento del sistema.

---

## 2. Identidad

La identidad es:

```text
member_id
```

No es:

- Gmail;
- teléfono;
- passkey;
- token;
- dispositivo.

Flujo conceptual:

```text
dispositivo / Google / activation token
        ↓
credential
        ↓
member_id dentro de una organization
        ↓
session
```

### 2.1 Frontera de tenant

`member_id` es único dentro de una organización.

No existe una tabla:

```text
global_person
```

No se fusionan identidades entre organizaciones.

Ejemplo permitido:

```text
Iglesia Vida
  member 01 → Google A

Amor y Gracia
  member 88 → Google A
```

Pórtico no concluye que ambos registros son la misma persona para fines de gobierno, búsqueda, métricas o transferencia de datos.

### 2.2 Misma persona en varios campus

Dentro de una misma organización:

```text
member 01
  ├── membership → Tacos / Durango
  ├── membership → Vinos / Durango
  └── membership → Correr / Guadalupe Victoria
```

Eso no crea tres personas.

No existe:

```text
member.home_campus
member.primary_group
```

---

## 3. Estados de persona

```text
activo | bloqueado | anonimizado | desactivado
```

### `activo`

Puede autenticarse y operar según sus memberships y capacidades.

### `bloqueado`

No puede acceder. Se conserva el mínimo necesario para gestionar la situación.

### `anonimizado`

La identidad se disocia en la medida jurídicamente y técnicamente procedente. El objetivo no es mantener un perfil vacío navegable.

### `desactivado`

No se permite uso normal. Puede conservarse evidencia mínima cuando exista una finalidad legítima o obligación de conservación.

---

## 4. Autenticación

### Camino principal

1. Token de activación de un uso.
2. Duración máxima: 30 minutos.
3. Asociado a `member_id` cuando ya existe o a `request_id` cuando la aceptación remota aún no ha creado `member`.
4. Canje.
5. Creación de sesión.
6. Registro de passkey en ese dispositivo.
7. Uso posterior mediante passkey.

### Google

Atajo opcional:

```text
OIDC
Authorization Code + PKCE
```

Solo identificación básica.

No se solicitan:

- Gmail;
- Drive;
- Calendar;
- contactos;
- correo del buzón como autorización adicional.

### Sin

- contraseñas;
- SMS como factor de recuperación;
- tokens permanentes en URL.

---

## 5. Credentials

Tabla conceptual:

```text
credential
├── id
├── organization_id
├── member_id nullable
├── request_id nullable
├── type
├── secret_hash
├── status
├── expires_at
├── consumed_at
└── created_at
```

Reglas:

- `activation` es de un solo uso;
- un token consumido muere definitivamente;
- si está ligado a `member_id`, no puede activar otra persona;
- si está ligado a `request_id`, solo puede crear el `member` previsto por esa petición y una membership de la edición correspondiente;
- nunca se registra el secreto en claro;
- nunca se deja el token en la URL después del canje.

### QR no es activation token

El `join_capability` del QR es una capacidad de invitación reutilizable durante su TTL.

El `activation` token es individual y de un solo uso.

No deben confundirse en código ni en nomenclatura pública.

---

## 6. Sesiones

Cookie:

```text
HttpOnly
Secure
SameSite=Strict
```

Máximo:

```text
30 días
```

Renovable con actividad válida.

Revocable por el titular:

```text
cerrar este dispositivo
cerrar todas
```

Roles administrativos:

- misma duración base;
- revocación administrativa inmediata;
- rotación al subir privilegio.

Dispositivo compartido no equivale a dispositivo de confianza.

Nunca se asume que el navegador compartido pertenece exclusivamente a un integrante.

---

## 7. Revalidación para datos privados

Con sesión viva, sin revalidación adicional:

- portal público;
- catálogo;
- campus;
- nombres de “Mis grupos”;
- próximas reuniones no sensibles;
- fecha/hora/tipo/zona;
- asambleas públicas;
- “Quiero probar”.

Con revalidación corta mediante passkey/biometría/desafío reciente:

- `private_reference`;
- `private_address`;
- directorio;
- recursos privados.

La calle, el directorio y los recursos privados no se cachean.

Respuesta cuando falla:

> “El lugar exacto pide confirmar este dispositivo.”

No se revela el contenido privado como compensación.

---

## 8. Autorización: regla fundamental

Toda autorización ocurre en servidor.

```text
deny-by-default
```

El frontend no es frontera.

Si el actor no tiene permiso, la respuesta debe evitar confirmar que el objeto existe cuando esa confirmación permita enumeración.

Usar una respuesta equivalente a `404` en rutas privadas enumerables.

---

## 9. Resolución de tenant

Toda petición privada debe determinar primero:

```text
organization_id
```

Después:

```text
actor
→ organization
→ campus/season/edition
→ recurso
```

Nunca:

```text
resource_id
→ cargar recurso
→ preguntar al final si tiene permiso
```

Debe evitarse que la consulta misma filtre la existencia de un objeto de otro tenant.

Preferencia de defensa en profundidad:

- `organization_id` presente directamente en las tablas de frontera o recuperable mediante una cadena de claves inequívoca;
- consultas filtradas por tenant desde el comienzo;
- políticas de base de datos/RLS cuando la implementación lo permita;
- pruebas de acceso cruzado en API y URLs directas.

---

## 10. Matriz de autorización

| Recurso | Visitante | Member | Responsible | Support | Governance | Platform Support |
| --- | --- | --- | --- | --- | --- | --- |
| Portal público | sí | sí | sí | sí | sí | diagnóstico |
| Catálogo de campus | sí | sí | sí | sí | sí | diagnóstico |
| Silo de edición | no | solo memberships activas | solo edición propia | no | no por defecto | solo con grant explícito |
| Calle/referencia | no | edición propia + revalidar | edición propia + revalidar | no | no por defecto | solo con grant explícito |
| Directorio | no | edición propia + revalidar | edición propia + revalidar | no | no por defecto | solo con grant explícito |
| Recursos privados | no | edición propia + revalidar | edición propia | no | no por defecto | solo con grant explícito |
| Petición de edición | no | propia / la creada | propia edición | solo las sin edición | lectura excepcional | no por defecto |
| Peticiones sin edición | crear | crear | no | sí, organización | sí | diagnóstico técnico |
| Crear borrador de edición | no | no | sí | no | sí | no |
| Reconocer edición | no | no | no | no | sí | no |
| Cerrar temporada | no | no | no | no | sí | no |
| Cambiar responsable | no | no | no | no | sí | no |
| QR de edición | no | canjear | crear/revocar de propia edición | no | no por defecto | no |
| ARCO | crear | propia | no | gestionar | gestionar | acceso solo con grant si es necesario |
| Auditoría institucional | no | no | no | limitada a operación propia | sí | acciones de soporte auditadas |

`Platform Support` no es un rol del cliente. Es un actor interno de la plataforma y no tiene acceso rutinario a datos privados.

---

## 11. Capacidades fijas y nombres configurables

La organización puede mostrar:

```text
responsible → Responsable
support → Apoyo

governance → Presbiterio
```

u otros nombres.

Pero no puede crear desde la interfaz:

```text
moderador_espiritual
supervisor_de_jovenes
pastor_universal
admin_total
```

como nuevas capacidades técnicas.

Esto preserva la posibilidad de servir a organizaciones con vocabulario de gobierno distinto sin convertir Pórtico en un motor de permisos arbitrario.

---

## 12. Governance

`governance` tiene alcance organizacional.

Puede:

- gestionar campus;
- abrir/convocar temporada;
- reconocer ediciones;
- cerrar ediciones;
- cerrar temporada;
- crear/modificar asambleas;
- administrar delegaciones de governance/support;
- consultar auditoría institucional.

No es lector universal de silos.

Acceder a la calle o directorio de una edición requiere otra decisión explícita y no forma parte del MVP cotidiano.

---

## 13. Support del cliente

`support` es el apoyo operativo de la organización.

En MVP:

- principal;
- suplente.

Puede recibir:

- peticiones sin edición;
- propuestas de grupos;
- “quiero unirme sin edición”;
- operaciones ARCO asignadas;
- señales administrativas que no tienen responsable de grupo.

No puede:

- reconocer grupos;
- leer directorios ajenos;
- leer calles ajenas;
- entrar a silos por defecto;
- actuar como responsable de todas las ediciones.

Una petición dirigida a una edición no pasa por `support` salvo que el responsable la derive fuera del sistema y cree una nueva petición de soporte, cosa que no es automática.

---

## 14. Acceso de emergencia de soporte Pórtico (`support_access_grant`)

El soporte de la plataforma necesita una vía de recuperación real, pero no una llave maestra.

Tabla:

```text
support_access_grant
├── id
├── organization_id
├── granted_by_member_id
├── scope_type
├── scope_id nullable
├── data_scope
├── reason
├── created_at
├── expires_at
├── revoked_at
└── status
```

### Scope

```text
organization
campus
edition
```

### Data scope

```text
operational
private_silo
```

`operational` permite diagnosticar:

- estados;
- IDs opacos;
- versiones;
- errores;
- timestamps;
- jobs;
- relaciones no sensibles necesarias para diagnosticar.

`private_silo` permite, solo cuando la organización lo concede expresamente, datos como:

- calle;
- directorio;
- contenido de peticiones;
- recursos privados.

### Límites

- lo concede una persona con `governance` de esa organización;
- expira automáticamente;
- máximo recomendado: 30 minutos;
- no puede ampliarse automáticamente;
- cada lectura/escritura queda auditada;
- no existe exportación global;
- no puede utilizarse para explorar otros tenants;
- el soporte no puede autoemitirse un grant.

El cliente debe poder ver que existió el acceso y con qué alcance.

---

## 15. Anti-enumeración

Prohibido exponer públicamente:

```text
/members?phone=
/search?name=
/membership?member_id=
```

Respuestas neutras.

Nunca decir:

> “Ese WhatsApp ya está registrado.”

cuando el actor no tiene autoridad para saberlo.

IDs públicos de objetos:

```text
ULID / UUID u otro identificador opaco
```

La opacidad no sustituye autorización.

---

## 16. Rate limiting

Aplicar rate limit a:

- petición de visitante;
- canje de activation token;
- inicio de sesión;
- canje de QR;
- creación/revocación de QR;
- ARCO;
- generación de activaciones.

Clave mínima:

```text
IP truncada
+ objeto/contexto
+ ventana temporal
```

No convertir los controles antifraude en perfiles ocultos de comportamiento.

---

## 17. Datos y almacenamiento

### PostgreSQL

Datos estructurados.

### Object storage

Portadas privadas.

- nombre generado;
- sin PII en la clave;
- MIME validado;
- tamaño validado;
- EXIF de geolocalización removido;
- acceso por URL firmada corta.

### Calle

Solo en plantilla/excepción de una edición.

Nunca:

```text
member.address
member.home_address
member.home_zone
```

### Teléfono

- `request.whatsapp` mientras la petición lo necesita;
- `contact_method.value_encrypted` cuando la persona decide conservarlo para su contacto de edición.

El teléfono no es identificador de cuenta.

### Recursos

Solo URLs `https`.

Pórtico deja de mostrar el enlace cuando corresponde, pero la privacidad del destino depende del proveedor externo.

---

## 18. Caché y navegación privada

Páginas públicas:

```text
cacheable
```

Calle, directorio, recursos privados y sesiones:

```text
Cache-Control: private, no-store
```

El service worker no debe almacenar:

- calle;
- directorio;
- recursos privados;
- respuestas privadas de membresías.

Probar:

- navegación atrás/adelante;
- pestañas múltiples;
- navegador compartido;
- URL directa;
- service worker;
- logout;
- revocación;
- restauración de sesión.

---

## 19. Cifrado y secretos

Mínimo:

- TLS;
- cifrado en reposo;
- base de datos no pública;
- secretos fuera del repositorio;
- rotación de secretos;
- backups cifrados;
- producción ≠ desarrollo;
- datos reales prohibidos en pruebas.

Logs no contienen:

- teléfono completo;
- calle;
- referencia de casa;
- token en claro;
- texto completo de aviso privado;
- contenido de recursos privados.

Objetivo de defensa adicional:

```text
private data
→ encryption at rest
→ opcionalmente clave por edición
```

La autorización y `no-store` no se relajan aunque este último objetivo no entre en el primer corte.

---

## 20. Consentimiento

No basta:

```text
accepted_privacy = true
```

Registro:

```text
consent_record
├── id
├── organization_id
├── member_id nullable
├── request_id nullable
├── notice_version
├── purpose_code
├── consent_type
├── statement_hash
├── authenticated_by
├── timestamp
├── ip_truncated
├── user_agent_hash
└── revoked_at
```

El texto se reconstruye mediante:

```text
notice_version + statement_hash
```

### Finalidades separadas

Pórtico no usa los datos para:

- marketing;
- venta;
- scoring;
- engagement;
- perfiles comerciales;
- entrenamiento de modelos;
- enriquecimiento de terceros.

### Afiliación a un grupo pequeño

El flujo de afiliación debe registrar de forma auditable que la persona vio el aviso correspondiente y dio el consentimiento requerido por la organización y la ley aplicable.

La interfaz debe permitir consentimiento expreso mediante autenticación electrónica. No se debe implementar un diseño que dependa de consentimiento tácito cuando la clasificación jurídica del tratamiento exija consentimiento expreso.

---

## 21. Aviso simplificado e integral

La organización debe proporcionar:

1. aviso simplificado en el momento de captura electrónica;
2. aviso integral permanentemente accesible.

El aviso debe explicar, como mínimo conforme al régimen aplicable:

- responsable;
- datos tratados;
- datos sensibles, cuando correspondan;
- finalidades;
- medios para limitar uso/divulgación;
- ARCO;
- cambios al aviso.

No se publica un texto legal genérico de Pórtico en lugar del de la organización.

---

## 22. ARCO

Desde:

- página de privacidad;
- área del integrante;
- contacto publicado.

Tipos:

```text
acceso
rectificación
cancelación
oposición
```

### Autenticado

La solicitud se vincula con `member_id`.

### No autenticado

Se aplica verificación humana proporcional.

No se guarda foto de identificación oficial como método normal del MVP.

### Estados

```text
recibida
→ verificacion
→ decision
→ efectiva
→ evidencia
```

El objetivo operativo se basa en el marco legal vigente consultado:

- comunicar determinación en máximo 20 días;
- hacer efectiva, cuando proceda, dentro de los 15 días siguientes;
- gestionar la ampliación legal cuando corresponda.

La organización y su asesoría deben validar el caso concreto y cualquier norma sectorial adicional.

### Cancelación

“Borrar” no equivale a:

```sql
DELETE FROM member;
```

Orden conceptual:

```text
fin de finalidad
→ bloqueo cuando corresponda
→ no uso
→ conservación mínima si existe obligación
→ destrucción
```

---

## 23. Retención operativa

La obligación legal o un bloqueo prevalecen sobre estos objetivos.

| Dato | Objetivo de retención |
| --- | --- |
| Petition abierta | mientras sirva para su finalidad |
| Petition cerrada | identificación operativa fuera a 90 días, salvo obligación |
| Persona sin memberships activas | PII bloqueada/eliminada, objetivo 30 días si no existe otra finalidad |
| Sesión | máximo 30 días o antes por revocación |
| Calle/referencia | deja de resolverse al cierre; eliminación objetivo 6 meses |
| Portada | deja de servirse al cierre; eliminación objetivo 6 meses |
| Avisos | 180 días |
| Recursos | mientras edición reconocida y en curso |
| Logs técnicos | 60 días |
| Auditoría/seguridad | mínimo necesario para cumplimiento y gestión de incidentes |
| Consentimientos/ARCO | mientras sean necesarios para acreditar tratamiento/atender obligaciones |
| Lineage | puede conservarse como historia estructural sin reabrir datos privados |
| Templates | mientras la organización los mantenga activos/archivados |

El linaje no debe funcionar como puerta trasera para recuperar el directorio antiguo.

---

## 24. Purga

Job programado:

```text
purge_closed_requests
purge_expired_activation_credentials
purge_expired_sessions
purge_old_addresses
purge_closed_covers
purge_expired_qr
purge_old_notices
purge_technical_logs
process_blocked_records
```

Cada corrida genera:

```text
purge_run_id
started_at
finished_at
evaluated_count
deleted_count
blocked_count
error_count
purge_failed
```

No incluye PII en el log.

Si falla:

```text
purge_failed = true
→ alerta
→ pendiente para reintento
```

No se finge que el dato fue purgado.

### Backups

Purgar producción no basta.

Los backups deben tener:

- cifrado;
- acceso mínimo;
- caducidad propia;
- política de restore;
- prueba de que un restore no reintroduce datos activos sin control.

---

## 25. Auditoría

`audit_event`:

```text
id
organization_id
actor_type
actor_id
action
object_type
object_id
time
result
request_id
ip_truncated
metadata_minimal
```

Registrar como mínimo:

- reconocer;
- cerrar edición;
- abrir/cerrar temporada;
- aceptar/rechazar/revocar membership;
- ver calle;
- ver directorio;
- crear/revocar QR;
- cambiar responsable;
- cambiar governance/support;
- cambiar aviso;
- ARCO;
- purgas;
- incidentes;
- emitir/revocar support access grant;
- acciones realizadas bajo break-glass.

No registrar:

- contenido de chats;
- comportamiento para engagement;
- navegación indiscriminada como perfil.

---

## 26. Incidentes

`security_incident`:

```text
id
organization_id
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

Severidad:

```text
informativo | bajo | alto | crítico
```

Un incidente crítico de frontera de tenant o exposición de calle/directorio debe detener ampliación del piloto hasta contención y prueba.

---

## 27. Proveedores

Inventario:

```text
provider
service
data_processed
purpose
country
role
contract_status
privacy_assessment
```

Puede ser de alcance plataforma u organización.

Debe incluir, según corresponda:

- hosting;
- PostgreSQL;
- object storage;
- Google OIDC;
- correo si algún día existe.

WhatsApp no recibe dumps ni sincronizaciones desde Pórtico. Cuando el usuario abre WhatsApp, la transferencia ocurre por la acción explícita del usuario en un canal externo y el aviso de la organización debe contemplarlo.

No se copia producción a staging.

---

## 28. Pruebas obligatorias del silo

```text
org X ↛ datos org Y

member A / campus 1 ↛ directorio B / campus 2
member A / edition A ↛ directorio B
member A / edition A ↛ calle B
member A / edition A ↛ recursos B
responsible A ↛ peticiones B
support ↛ silos privados

membership finalizada ↛ calle
membership finalizada ↛ directorio
season cerrada ↛ silo
edition cerrada ↛ silo
QR expirado ↛ membership
QR revocado ↛ membership
activation consumido ↛ segunda activación
session revocada ↛ ruta privada

public catalog ↛ teléfonos
public catalog ↛ calle
public catalog ↛ directorio
```

### Multi-campus

Probar:

```text
member A
  ├── Tacos / Durango
  ├── Vinos / Durango
  └── Carrera / Guadalupe Victoria
```

Resultado esperado:

- un solo `member_id`;
- tres memberships;
- Inicio muestra las próximas 1–3 reuniones correctas;
- cada silo queda separado.

### Multi-organización

Probar mismo Google y mismo WhatsApp en dos organizaciones.

Resultado:

- dos `member_id` independientes;
- ningún catálogo, silo, request o historial cruzado.

---

## 29. Pruebas de reingreso

Caso:

```text
Tacos Otoño 2026
    ↓ lineage split
Tacos A Primavera 2027
Tacos B Primavera 2027
```

Una persona de Tacos Otoño:

- puede ver “Volver a participar” en A;
- puede ver “Volver a participar” en B;
- puede elegir una, ambas o ninguna;
- no vuelve automáticamente;
- no ve el directorio anterior;
- el responsable nuevo no recibe una lista histórica de teléfonos.

---

## 30. Reglas que evitan objetos de más

- Un miembro no tiene domicilio.
- Una persona no tiene campus principal.
- Una persona no tiene grupo principal.
- Una pertenencia pertenece a una edición concreta.
- Una asamblea no hereda el silo del grupo.
- Un QR no es sesión.
- Un activation token no es QR.
- Support no es lector universal.
- Governance no es superusuario de silos.
- Lineage no es herencia.
- Template no es grupo activo.
- Campus no es tenant.
- Organization sí es tenant.
- No existe identidad global entre organizaciones.
- Cada campo nuevo responde: finalidad, visibilidad, alcance de tenant, duración, purga y test.

---

## 31. Principio de seguridad de plataforma

> **La plataforma debe poder operar sin poder mirar rutinariamente aquello que ayuda a proteger.**

La arquitectura debe hacer más fácil para Pórtico:

```text
diagnosticar una falla
```

que:

```text
explorar los datos de una iglesia.
```

El soporte excepcional existe para incidentes reales, no para convertir a Pórtico en administrador oculto de sus clientes.

---

## 32. Políticas Calibradas de Seguridad, Privacidad y LFPDPPP (v3.1)

En cumplimiento con los primeros principios y las 10 decisiones canónicas (`DOSSIER-064`), la versión 3.1 establece formalmente los siguientes controles de seguridad criptográfica y privacidad de datos sensibles:

1. **Autenticación Passwordless Criptográfica (Decisión 4-B):**
   - El acceso por Magic Link genera un token criptográfico seguro de 32 bytes (`csprng`).
   - El token se almacena exclusivamente en base de datos como hash SHA-256 (`magic_token_hash`), con una vida útil estricta de 15 minutos (`expires_at`) y consumo único (`consumed_at IS NULL`).
   - Al validarse, emite una sesión persistente de 30 días (`auth_session`), eliminando contraseñas vulnerables a fuerza bruta.
2. **Privacidad Celular de Domicilios Particulares No-Store (Decisión 5-C):**
   - Las ubicaciones de grupos en domicilios particulares (`home`) se consideran datos de alta sensibilidad bajo la LFPDPPP y jamás se exponen en catálogos públicos.
   - En el silo privado, el endpoint `GET /api/groups/{id}` inyecta obligatoriamente la cabecera HTTP:
     `Cache-Control: no-store, no-cache, must-revalidate, private`.
   - El frontend mantiene la dirección física exclusivamente en memoria de componentes volátiles de React (`useState`), con **cero persistencia en `localStorage` o `sessionStorage`**, garantizando su purga automática al cerrar o recargar la pestaña.
3. **Privacidad de Contacto Telefónico por Defecto (Decisión 7-B):**
   - En la tabla `membership`, la visibilidad de contacto se inicializa en `contact_visibility = 'hidden'`.
   - El número telefónico se enmascara como `(Privado)` en las vistas de miembros ordinarios.
   - Solo se revela a otros miembros si el usuario otorga su consentimiento expreso mediante opt-in (`'edition_members'`). Líder y pastor conservan acceso para pastoreo directo legítimo.
4. **Conteo Agregado de Asistencia Anti-Vigilancia (Decisión 6-B):**
   - La tabla `meeting_headcount` registra únicamente la cantidad numérica de asistentes (`attendee_count`), si hubo reunión (`did_meet`) y notas de contexto.
   - Se prohíbe técnica y axiológicamente el pase de lista nominal ("roll-call"), asegurando que la participación espiritual comunitaria permanezca libre de perfiles de fiscalización individual.
5. **Transparencia Institucional Unificada en 1-Tap (Decisión 10-B):**
   - Exposición permanente y accesible del Aviso de Privacidad Integral en cumplimiento con la reforma LFPDPPP de noviembre de 2025, integrando los principios ARCO, finalidades primarias y canales de revocación.

