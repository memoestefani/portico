# Pórtico — PRD de producto (MVP)

**Versión:** 3.0  
**Fecha:** 22 de septiembre de 2026  
**Alcance:** piloto en una organización, un campus (Durango), 8–12 grupos pequeños. La arquitectura admite múltiples campus sin convertirlos en organizaciones separadas.  
**Estado:** decisiones de producto cerradas. Este documento es la fuente de alcance funcional.  
**Documentos hermanos:** `02` autorización, identidad y privacidad · `03` piloto e implementación.

---

## 0. Cambio estructural de la v2.0

Pórtico sigue siendo la puerta pública y el tablero oficial de los grupos pequeños de una temporada, pero deja de asumir que una organización vive en una sola ciudad.

El modelo canónico pasa a ser:

```text
Pórtico
└── organización (tenant)
    ├── campus
    │   └── temporada
    │       └── grupos pequeños (editions)
    ├── campus
    │   └── temporada
    │       └── grupos pequeños
    └── ...
```

Reglas derivadas:

- Una organización es una frontera de datos, responsabilidad y gobierno.
- Un campus es una **etiqueta administrativa y de alcance operativo**. No es otra organización, no tiene identidad propia de persona y no introduce un gobierno paralelo.
- Una temporada vigente existe por campus, no por toda la organización.
- Una persona tiene un solo `member_id` dentro de una organización y puede pertenecer simultáneamente a grupos pequeños de distintos campus.
- Una pertenencia nunca se hereda por semejanza, afinidad, campus, historial o linaje.
- El crecimiento por división, réplica, continuidad o traslado se registra como historia de edición; no mueve automáticamente personas, calles, QR, directorios ni recursos.
- Pórtico no calcula cuántos grupos “debería” tener una persona ni bloquea solapamientos de horario.
- Otra organización es otro tenant. Pórtico no crea un grafo de personas entre organizaciones.

La palabra de producto es **grupo pequeño**. `edition` es el objeto técnico que representa un grupo pequeño concreto dentro de una temporada. No existe un objeto técnico adicional para representar el grupo pequeño fuera de `edition`.

---

## 1. Qué es

Pórtico es la puerta pública y el tablero oficial de los grupos pequeños de una temporada.

Hace seis cosas:

1. Explica qué sostiene la organización y qué no.
2. Muestra los grupos pequeños reconocidos de la temporada vigente de cada campus.
3. Permite que una persona se afilie a un grupo pequeño para acceder a su silo privado.
4. Guarda la propuesta oficial de la próxima reunión y de la semana actual.
5. Muestra a cada integrante solamente los silos de los grupos pequeños a los que pertenece ahora.
6. Permite que una organización reproduzca grupos pequeños entre temporadas y campus sin heredar automáticamente datos privados.

No es red social, CRM pastoral, chat, lista de asistencia, gestor documental, motor de asignación de personas ni gobierno de la organización.

### Regla de canales

> Pórtico guarda la propuesta oficial del grupo pequeño.  
> WhatsApp es donde la gente se avisa, se contradice, se retrasa y se encuentra.  
> La conversación no se sustituye. La temporada tampoco se vuelve mentira porque el chat se cierre al final.

El dato canónico de “dónde y cuándo nos vemos” vive en Pórtico. Puede cambiar. Quien se integra a un grupo pequeño acepta que la propuesta de la semana puede moverse. El chat de temporada existe para conversación y coordinación informal, no como base de datos ni autoridad del sistema.

---

## 2. Principios de producto

### 2.1 Organización, no Big Brother

Cada organización configura y gobierna sus propios datos, campus, grupos pequeños, temporadas y responsables.

Pórtico como plataforma:

- no determina qué grupos debe crear una organización;
- no decide quién debe pertenecer a un grupo;
- no decide cuántos grupos pequeños debe tener una persona;
- no compara organizaciones;
- no crea una puntuación de participación;
- no lee WhatsApp;
- no observa asistencia presencial;
- no cruza identidades entre organizaciones.

La herramienta ayuda porque reduce trabajo real. No necesita vigilar para funcionar.

### 2.2 Liquidez presencial

La reunión presencial no es un recurso privado del software.

- Enterarse y asistir es legítimo aunque la persona no tenga cuenta, membresía ni QR.
- Pórtico no toma asistencia y no es portero.
- La membresía abre el silo privado; no es boleto de entrada.
- Un grupo pequeño puede recibir a alguien que llegó con un amigo.
- Si una persona quiere quedarse en el directorio, materiales o referencia privada, puede afiliarse después de llegar.

### 2.3 Silo por grupo pequeño

Lo privado pertenece al grupo pequeño, no a una persona global.

Se protege especialmente:

- calle y referencia privada;
- directorio del grupo;
- teléfonos/contactos;
- materiales y enlaces privados;
- recursos internos del grupo.

### 2.4 Temporadas duras

Una temporada termina de verdad.

La continuidad organizacional se conserva mediante historia y nuevas ediciones, no mediante membresías eternas.

### 2.5 Pórtico no impone la vida humana

Una persona puede estar en varios grupos pequeños, incluso en horarios que se sobreponen.

Pórtico no bloquea, recomienda, advierte ni puntúa esa situación.

El sistema solo muestra las reuniones derivadas de las membresías activas.

---

## 3. Decisiones cerradas (v3.0)

| # | Tema | Decisión |
| --- | --- | --- |
| 1 | Cliente / tenant | `organization` es el tenant de Pórtico. Cada organización tiene sus propios datos y gobierno. |
| 2 | Campus | `campus` es una etiqueta administrativa y de alcance operativo ligera. Tiene nombre, ciudad/identificación pública y estado, pero no tiene gobierno, miembros ni permisos propios. |
| 3 | Gobierno | Capacidades fijas + nombres configurables + delegación. Pórtico entiende `governance`, `support`, `responsible`, `member`; la organización decide cómo se llaman en pantalla y quién las ejerce. |
| 4 | Temporada | Una temporada vigente por campus. Una organización puede tener temporadas simultáneas en campus distintos. |
| 5 | Persona multi-campus | Un `member_id` por persona dentro de la organización. Puede tener membresías activas en grupos pequeños de distintos campus. |
| 6 | Solapamiento | No se bloquea ni se advierte el solapamiento de horarios entre grupos pequeños. |
| 7 | Linaje | `edition_lineage` registra `split`, `replicated`, `continued`, `moved_to_campus` y `merged` como historia. Nunca hereda automáticamente membresías, calle, QR, directorio o recursos. |
| 8 | Plantillas | `small_group_template` es propiedad de la organización y sirve para reproducir estructura, no personas ni datos privados. |
| 9 | Soporte Pórtico | `support_access_grant`: acceso de emergencia iniciado por la organización, acotado, temporal y totalmente auditable. No existe acceso rutinario de soporte a los silos. |
| 10 | Portal | Un portal público de la organización permite elegir campus. Los integrantes pueden navegar por campus; “Mis grupos” reúne sus membresías activas aunque pertenezcan a campus distintos. |
| 11 | Logística | Plantilla vigente por edición + excepciones por fecha. `Event` solo para asambleas. |
| 12 | Alta | Presencial por QR; remoto por “Quiero probar”, directo al responsable del grupo. Asistir no exige alta. |
| 13 | Identidad | `member_id` estable; activación de este dispositivo con token de un uso → sesión + passkey. Google opcional. Sin contraseñas ni SMS. |
| 14 | Zona | Lista corta por campus. No CP ni colonia libre. No `member.home_zone`. |
| 15 | Cupo | `cupo_orientativo` informativo. `is_full` manual. No se usa el número de memberships para abrir/cerrar cupo. |
| 16 | Inicio | Próximas 1–3 reuniones de todas las ediciones activas de la persona, por fecha. Puede cruzar campus. |
| 17 | Contacto | No hay consulta ni inbox. El contacto solo se expone en el directorio cuando la persona lo hace visible. |
| 18 | Temporada siguiente | Nueva edición limpia. El reingreso se ofrece a la persona por historial/linaje y confirmación; no hay reactivación automática. No existe lista histórica de teléfonos para el nuevo responsable. |
| 19 | Sesión | 30 días para catálogo y logística no sensible. Calle, directorio y recursos privados requieren revalidación corta y no se cachean. |
| 20 | Plataforma | Separación estricta entre organizaciones. No hay identidad global ni panel que permita navegar personas entre clientes. |

Además siguen vigentes:

- deny-by-default;
- autorización en servidor;
- una organización no comparte datos con otra;
- una edición cerrada no revive;
- sin chat, feed, ranking, pagos, mapas, matching, push, app nativa ni CRM;
- WhatsApp fuera de Pórtico.

---

## 4. Lenguaje

| En pantalla | En el modelo |
| --- | --- |
| Organización | `organization` |
| Campus | `campus` |
| Temporada | `season` |
| Grupo pequeño | `edition` |
| Plantilla de grupo pequeño | `small_group_template` |
| Afinidad | `affinity` |
| Persona | `member` |
| Pertenencia | `membership` |
| Responsable | `responsible` |
| Apoyo | `support` |
| Gobierno | `governance` |
| Asamblea | `event` |
| Reunión | plantilla + `meeting_exception` |
| Petición | `request` |
| QR del grupo | `join_capability` |
| Linaje | `edition_lineage` |
| Chat de la temporada | enlace privado en recursos, fuera de Pórtico |

Nadie ve `edition`, `RBAC`, `capability`, `tenant` ni nombres internos equivalentes.

---

## 5. Objetos que existen

### 5.1 Organización

Es la frontera de tenant, gobierno y datos.

Campos mínimos:

```text
id
nombre_publico
pais
public_domain
responsable_legal_nombre
responsable_legal_domicilio
contacto_privacidad
privacy_notice_current_version
role_labels
status
```

`role_labels` solo admite etiquetas conocidas por Pórtico (`responsible`, `support`, `governance`). No crea roles nuevos.

La organización es dueña de sus datos. Una persona con el mismo correo/Google/WhatsApp en otra organización no se fusiona con este `member`.

### 5.2 Campus

Unidad administrativa ligera dentro de la organización.

Campos mínimos:

```text
id
organization_id
nombre_publico
ciudad
slug
sort_order
status
timezone
```

El campus:

- agrupa temporadas y zonas;
- aparece como filtro/selector público;
- no tiene miembros propios;
- no tiene gobierno propio en el MVP;
- no crea una identidad jurídica separada;
- no contiene una política de privacidad separada;
- no es un tenant.

No existe `member.campus_id`.

### 5.3 Temporada

Una temporada vive en un campus.

```text
id
campus_id
nombre_publico
fecha_inicio
fecha_fin
estado
```

Estados:

```text
borrador → convocatoria → en_curso → cerrada
```

Reglas:

- máximo una temporada en `convocatoria` o `en_curso` por campus;
- un borrador puede existir para preparar la siguiente, pero no puede pasar a `convocatoria` mientras el campus tenga una temporada en curso;
- `cerrada` no revive;
- una organización puede tener temporadas activas simultáneamente en distintos campus.

### 5.4 Afinidad

Catálogo persistente de una organización.

Ejemplos:

```text
jóvenes
tacos
vino
pasteles
tortillas
fórmula 1
viaje
correr
bailar
otra
```

No tiene:

- integrantes;
- domicilio;
- responsable;
- chat;
- temporada propia;
- asignación automática.

Una afinidad puede existir aunque no tenga ningún grupo pequeño activo.

### 5.5 Plantilla de grupo pequeño (`small_group_template`)

Es una receta reutilizable propiedad de la organización.

Campos mínimos:

```text
id
organization_id
nombre_publico
proposito_base
affinity_id nullable
default_location_type
required_fields
suggested_language
suggested_resources
version
status
created_by
updated_at
```

Estados:

```text
draft → active → archived
```

Sirve para crear un borrador de edición con estructura inicial.

No contiene y nunca hereda:

- membresías;
- teléfonos;
- calles;
- `private_address`;
- directorios;
- QR;
- sesiones;
- historial pastoral;
- datos de otras ediciones.

Los recursos sugeridos son simplemente enlaces o sugerencias. El responsable decide cuáles realmente pertenecen a la edición.

### 5.6 Grupo pequeño (`edition`)

Es la unidad descubierta, reconocida y a la que se pertenece durante una temporada concreta.

Campos mínimos:

```text
id
season_id
created_from_template_id nullable
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
```

El campus se obtiene desde la temporada. No se duplica `campus_id` en la edición salvo que una optimización posterior mantenga una restricción de consistencia equivalente.

Estados:

```text
borrador → reconocida → cerrada
```

`is_full` es independiente.

No existe estado `pausada`.

Flujo:

```text
responsable crea borrador
→ completa ficha mínima
→ governance reconoce
→ aparece en catálogo
```

`support` no reconoce.

### 5.7 Linaje de edición (`edition_lineage`)

Relación histórica entre ediciones dentro de la misma organización.

Campos:

```text
id
organization_id
from_edition_id
to_edition_id
relation
created_by
created_at
note
```

Relaciones permitidas:

```text
split
replicated
continued
moved_to_campus
merged
```

El linaje es histórico y administrativo. Nunca ejecuta herencia de datos.

Ejemplo:

```text
Tacos — Otoño 2026
├── split → Tacos Norte — Primavera 2027
└── split → Tacos Centro — Primavera 2027
```

Ambas ediciones nuevas comienzan sin calle, recursos, QR ni membresías.

### 5.8 Persona (`member`)

Identidad estable dentro de una organización.

```text
member_id
organization_id
nombre_visible
estado
```

Estados:

```text
activo | bloqueado | anonimizado | desactivado
```

No tiene:

- domicilio;
- colonia;
- campus principal;
- grupo principal;
- foto obligatoria;
- perfil global;
- notas pastorales;
- lista pública de pertenencias.

Una persona puede estar en varios grupos pequeños de uno o varios campus de la misma organización.

### 5.9 Credenciales

Ligadas a `member_id` o, en el caso de una activación remota aún no canjeada, a una `request_id`.

Tipos:

```text
passkey | google | activation
```

Nunca son la identidad.

### 5.10 Membresía

Una por par persona–edición.

```text
id
member_id
edition_id
status
created_at
closed_at
```

Estados:

```text
solicitada → activa → revocada | finalizada | rechazada
```

Una persona puede tener muchas memberships activas.

El número de memberships no decide `is_full`.

### 5.11 Contacto

```text
id
member_id
contact_method
value_encrypted
contact_visibility
created_at
updated_at
```

En MVP:

```text
contact_method = whatsapp
contact_visibility = visible | oculto
```

Default: `oculto`.

La visibilidad aplica al directorio. No elimina la necesidad de que una petición remota contenga un WhatsApp para ser atendida.

### 5.12 Plantilla de reunión

Vive en la edición.

```text
weekday
time
location_type
zone_id
private_reference
private_address
host_reference
enabled
```

`location_type`:

```text
casa | cafe | parque | taqueria | online | otro
```

Reglas de visibilidad polimórfica:
- Si es `cafe`, `parque` o `taqueria` (`public_venue`): El nombre comercial, colonia y mapa son públicos en el catálogo para facilitar la llegada de personas nuevas.
- Si es `casa` (`private_home`): El catálogo público solo muestra la colonia/zona; `private_address` y `private_reference` quedan estrictamente sellados dentro del silo privado de miembros activos. Si es `casa`, `private_reference` es obligatorio.
- Si es `online` (`online_session` - Zoom/Meet): El enlace oficial vive protegido dentro del silo de miembros para prevenir accesos no autorizados.

`host_reference` es texto; el anfitrión no necesita cuenta.

### 5.13 Excepción de reunión

Una fecha concreta puede sustituir la plantilla o cancelar la reunión.

```text
id
edition_id
start_at
end_at
status
location_type
zone_id
private_reference
private_address
host_reference
note
logistics_version
updated_by
```

`status`:

```text
scheduled | cancelled
```

Debe existir como máximo una excepción por edición y fecha lógica de reunión.

La “próxima reunión” se resuelve así:

1. se calcula la próxima fecha habitual de la plantilla;
2. se busca una excepción para esa fecha;
3. si existe `scheduled`, sustituye la plantilla;
4. si existe `cancelled`, no hay reunión esa fecha y se continúa a la siguiente ocurrencia válida;
5. si no existe excepción, se usa la plantilla.

Un cambio válido de plantilla o excepción incrementa `logistics_version`.

### 5.14 Aviso

Objeto generado, no pieza creativa.

```text
edition_id
logistics_version
text
generated_at
```

Retención: 180 días, salvo obligación de conservación distinta.

El payload de WhatsApp puede generarse al abrirlo; no se necesita persistir otra copia si el aviso ya contiene el texto.

### 5.15 Recursos

Hasta cinco enlaces privados por edición.

Tipos sugeridos:

```text
chat | drive | pdf | youtube | notion | other
```

Pórtico controla que el enlace se muestre dentro del silo. No controla la privacidad del destino externo.

Por eso:

```text
Pórtico deja de mostrar el enlace
≠
Pórtico revoca el destino externo
```

Al cerrar la edición, Pórtico deja de servir el enlace.

### 5.16 Portada

Una por edición.

Storage privado, nombre generado, MIME/tamaño validados, sin EXIF de geolocalización.

Se sirve mediante URL firmada de lectura corta cuando haga falta.

Si existen rostros, quien sube declara que tiene autorización para tratarlos y publicarlos en el catálogo según el aviso de privacidad de la organización.

Al cerrar:

```text
deja de servirse → entra en retención/purga
```

### 5.17 QR de afiliación (`join_capability`)

Es una capacidad de incorporación a una edición, no una identidad.

```text
edition_id
token_hash
created_at
expires_at
revoked_at
status
```

Reglas:

- solo para ediciones reconocidas;
- TTL máximo 24 horas;
- puede ser usado por varias personas durante su vigencia;
- revocable;
- rotar crea uno nuevo y revoca el anterior;
- no lleva identidad;
- no abre una sesión ajena;
- no lista integrantes;
- no muestra calle.

Con sesión:

```text
scan → confirma “Te unes a X” → membership activa
```

Sin sesión:

```text
scan → nombre visible + privacidad + consentimiento → member + membership + activación del dispositivo
```

Si está lleno, expirado, revocado o la temporada está cerrada: no se crea membership.

### 5.18 Petición (`request`)

Tipos:

| Tipo | Quién | Destino |
| --- | --- | --- |
| `unirme_a_edicion` | visitante o integrante | responsable de esa edición |
| `proponer_grupo` | cualquiera | support |
| `unirme_sin_edicion` | visitante | support |

Campos:

```text
id
organization_id
type
name
whatsapp
member_id nullable
edition_id nullable
affinity_id nullable
zone_id nullable
status
close_reason
created_at
closed_at
```

En visitante remoto:

- no se crea `member` al enviar la petición;
- no se crea sesión;
- no se usa Google;
- llega al responsable de la edición.

Estados:

```text
nueva → cerrada
```

`close_reason`:

```text
aceptada | rechazada | desistida
```

### 5.19 Asamblea (`event`)

Solo asambleas de la organización.

```text
id
organization_id
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

`scope`:

```text
organization | campus
```

`type`:

```text
assembly_groups | assembly_city
```

No contiene:

- calle de una casa;
- directorio;
- asistencia;
- membresías.

### 5.20 Textos institucionales

Versionados y propiedad de la organización:

```text
what_we_hold
what_we_do_not_hold
privacy_notice
```

### 5.21 Zona

Catálogo corto ligado al campus.

```text
id
campus_id
label
sort_order
status
```

Sin coordenadas.

---

## 6. Objetos que no existen

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
cross_organization_identity
automatic_capacity_counter
time_conflict_engine
matching
platform_social_graph
organization_score
```

Tampoco existen:

- cuenta de anfitrión;
- chat interno;
- biblioteca de archivos;
- exportación global;
- push;
- WhatsApp Cloud API;
- IA que admita personas;
- IA que publique logística sin aceptación humana.

---

## 7. Roles y capacidades

Los nombres públicos pueden cambiar por organización; las capacidades técnicas no.

| Capacidad | Alcance | Función |
| --- | --- | --- |
| `member` | organización | ve sus membresías y catálogo |
| `responsible` | ediciones asignadas | opera sus grupos pequeños |
| `support` | organización | peticiones sin dueño, ARCO y operación de apoyo |
| `governance` | organización | temporadas, reconocimiento, cierre, asambleas y gobierno |

`governance` puede tener varios miembros activos.

`support` tiene máximo un principal y un suplente en el MVP.

`responsible_member_id` pertenece a cada edición y es único en su rol para esa edición.

No existe “superusuario de la iglesia” con lectura automática de todos los silos privados.

---

## 8. Flujos

### 8.1 Visitante entra al portal

```text
Pórtico
→ organización
→ selector de campus
→ grupos de la temporada vigente de ese campus
```

Si la organización tiene un solo campus, el selector puede omitirse visualmente.

Si el visitante cambia de campus, vuelve a consultar el catálogo de ese campus.

No se muestra ningún dato privado en el cambio de campus.

### 8.2 Visitante descubre y asiste sin cuenta

```text
Pórtico
→ qué sostenemos
→ campus
→ catálogo
→ ficha del grupo pequeño
```

La ficha pública muestra:

- nombre;
- propósito;
- afinidad;
- día/hora;
- tipo de lugar;
- zona;
- cupo orientativo;
- si está llena;
- fechas de temporada;
- aviso breve;
- responsable solo si su visibilidad es pública.

Si es lugar público, la persona puede ir.

No hay paso de registro.

### 8.3 Visitante llega a una casa

La ficha pública no muestra calle.

La persona puede:

- llegar con alguien del grupo;
- recibir la referencia por WhatsApp del responsable;
- afiliarse con QR para entrar al silo.

La reunión presencial no queda bloqueada por no estar en Pórtico.

### 8.4 Visitante quiere el silo o quedarse en el directorio

En reunión:

```text
QR
→ nombre + privacidad + consentimiento
→ member
→ membership activa
→ activación de dispositivo
```

Desde casa:

```text
Quiero probar
→ nombre + WhatsApp + privacidad
→ request al responsable
→ aceptación/rechazo humano
```

Si acepta:

```text
responsable emite activation token
→ persona lo canjea
→ member + membership + sesión/passkey
```

La organización puede definir una confirmación humana por WhatsApp. Esa confirmación no crea un estado de espera en Pórtico.

### 8.5 Integrante prueba otro grupo pequeño

Puede hacerlo dentro del mismo campus o de otro campus de la organización:

```text
catálogo
→ campus
→ ficha
→ Quiero probar
```

La request se dirige directamente al responsable de esa edición.

Alternativa:

```text
QR → confirmar → membership
```

No se cambia el `member_id` y no se copia el grupo anterior.

### 8.6 Integrante puede pertenecer a varios grupos

No hay bloqueo ni advertencia.

Ejemplo válido:

```text
Tacos — jueves 19:00
Vinos — jueves 19:00
Correr — sábado 08:00
```

Pórtico solo muestra las tres reuniones derivadas.

No concluye que existe un problema.

### 8.7 Crear un nuevo grupo pequeño a partir de una plantilla

```text
responsable
→ Nuevo grupo pequeño
→ elegir small_group_template
→ crear borrador
→ revisar propósito/afinidad/reunión
→ completar datos locales
→ enviar a reconocimiento
```

La plantilla prellena estructura. El nuevo grupo debe completar su propia:

- calle;
- referencia;
- responsable;
- QR;
- recursos;
- miembros.

### 8.8 Reproducir, dividir, continuar o mover un grupo

Ejemplo:

```text
Tacos — Otoño 2026
        ↓ split
Tacos A — Primavera 2027
Tacos B — Primavera 2027
```

La relación se registra en `edition_lineage`.

Las nuevas ediciones nacen vacías en datos privados.

Los antiguos integrantes no se transfieren.

### 8.9 Reingreso a una nueva temporada

No existe una lista histórica privada que el nuevo responsable pueda navegar.

La nueva edición puede tener linaje con una edición previa.

Si una persona con sesión tuvo membership en una edición de origen relevante, la nueva ficha puede mostrarle:

> **Volver a participar**

La persona confirma y se crea una nueva membership.

Si no tiene sesión, usa `Quiero probar` o un QR nuevo.

El responsable puede compartir la ficha o enlace de la nueva edición por WhatsApp. Pórtico no envía invitaciones por sí mismo.

Esto resuelve el reingreso sin reabrir el directorio anterior.

### 8.10 Responsable publica la semana

```text
Mis grupos
→ Esta semana
→ ver propuesta resuelta
```

Sin cambio:

```text
Abrir WhatsApp
```

Con cambio:

```text
editar excepción
→ logistics_version++
→ notice nuevo
→ Abrir WhatsApp
```

Con cancelación:

```text
marcar esta fecha como cancelada
→ aviso actualizado
```

Objetivo: menos de dos minutos.

### 8.11 Cierre de una edición

Si la edición termina antes que la temporada:

```text
edition → cerrada
memberships → finalizadas
join_capabilities → revocadas
silo → inaccesible
next_meeting → none
private_address → deja de resolverse
directory → deja de resolverse
resources → dejan de mostrarse
cover → deja de servirse
```

La afinidad permanece.

La persona permanece.

La historia de linaje puede permanecer.

### 8.12 Cierre de temporada

Gobernance cierra la temporada.

```text
memberships de esa temporada → finalizadas
QRs → muertos
silos → cerrados
editions → fuera del catálogo
calles → entran en retención/purga
portadas → entran en retención/purga
resources → dejan de mostrarse
```

El chat de WhatsApp se abandona/cierra por disciplina humana.

### 8.13 Campus nuevo

Crear un campus no crea grupos automáticamente.

Se necesita:

```text
campus creado
→ zonas configuradas
→ temporada de ese campus
→ grupos reconocidos
```

La organización puede reutilizar plantillas de grupos pequeños, pero cada edición se crea localmente.

### 8.14 Organización nueva

Una nueva organización recibe:

- tenant independiente;
- dominio independiente;
- gobierno independiente;
- catálogo independiente;
- privacidad independiente;
- miembros independientes.

No se importan personas desde otra organización como consecuencia de compartir correo, Google o WhatsApp.

---

## 9. Catálogo y fichas

### Navegación pública

```text
Organización
├── Qué sostenemos
├── Qué no sostenemos
├── Campus
│   ├── Grupos
│   │   └── Ficha
│   └── Asambleas
└── Privacidad
```

El selector de campus es visible cuando hay más de uno.

### Orden del catálogo

Dentro del campus seleccionado:

```text
afinidad elegida
→ día
→ llenas al final
→ orden administrativo
```

No se muestran:

- popularidad;
- likes;
- conteo de integrantes;
- “grupo ganador”;
- tendencias;
- ranking por crecimiento.

### Público ve

- portada;
- nombre;
- propósito;
- afinidad;
- campus;
- día/hora;
- tipo de lugar;
- zona;
- cupo orientativo;
- lleno/no lleno;
- fechas de temporada;
- aviso breve;
- responsable solo si está autorizado.

### Público no ve

- calle;
- directorio;
- teléfonos;
- materiales;
- chat;
- peticiones;
- historial de membresías;
- linaje privado.

### Integrante ve

Además de lo público:

- catálogo de otros campus mediante selector;
- sus próximas 1–3 reuniones en conjunto;
- silos de sus ediciones activas;
- referencia privada previa revalidación;
- directorio previa revalidación;
- recursos privados previa revalidación.

---

## 10. Pantallas

### Público

```text
Pórtico
├── Organización
├── Campus
│   └── Grupos
│       └── Ficha
├── Asambleas
├── Qué sostenemos
├── Qué no sostenemos
└── Privacidad
```

### Integrante

```text
Inicio
  → próximas 1–3 reuniones de todos mis grupos pequeños
     (pueden pertenecer a campus distintos)

Mis grupos
  → silo por edición
     ├── Esta semana
     ├── Materiales
     ├── Directorio
     └── Chat

Catálogo
  → selector de campus

Asambleas
```

Tap en una reunión:

```text
fecha/hora/tipo/zona
→ referencia privada si se revalida
→ recursos si se revalida
```

### Responsable

```text
Mis grupos
├── Ficha
├── Esta semana
│   ├── plantilla resuelta
│   ├── excepción
│   ├── cancelar
│   ├── aviso
│   └── WhatsApp
├── Integrantes
├── Peticiones
├── Materiales
├── QR
└── Nueva edición / plantilla
```

### Support

```text
Bandeja
├── Sin edición
├── Proponer grupo
├── Privacidad / ARCO
└── Suplencia
```

No ve silos por defecto.

### Governance

```text
Organización
├── Campus
├── Temporadas
├── Ediciones
│   ├── reconocer
│   └── retirar/cerrar
├── Asambleas
├── Gobierno / delegaciones
└── Auditoría institucional
```

No es una bandeja cotidiana de direcciones privadas.

### Estados obligatorios de cada pantalla

- vacío;
- carga;
- error;
- permiso denegado sin enumeración;
- objeto cerrado;
- sesión vencida;
- revalidación requerida;
- móvil.

---

## 11. WhatsApp

Tres usos de Pórtico:

1. Número institucional público para quien no eligió grupo.
2. Compartir el aviso generado.
3. Abrir conversación personal con una persona del directorio de la edición que hizo visible su contacto.

Nada más.

Pórtico no:

- lee chats;
- sincroniza participantes;
- envía automáticamente;
- crea grupos de WhatsApp;
- cierra grupos;
- usa Cloud API.

Cuando el aviso contiene calle o datos privados, la apertura a WhatsApp es una salida explícita de Pórtico hacia un tercero externo. La política de privacidad de la organización debe describir este flujo.

El enlace de salida debe evitar telemetría innecesaria, usar `referrer-policy: no-referrer` y no hacer que el secreto forme parte de logs propios de Pórtico.

---

## 12. Errores

| Caso | Texto |
| --- | --- |
| Llena | “Este grupo está lleno esta temporada.” |
| QR muerto | “Este código ya no está disponible. Pide uno nuevo al responsable.” |
| Temporada cerrada | “Esta temporada terminó.” |
| Edición cerrada | “Este grupo pequeño ya terminó.” |
| Calle no cargada | “El lugar exacto todavía no está en Pórtico.” |
| Revalidación | “El lugar exacto pide confirmar este dispositivo.” |
| Sesión revocada | “Vuelve a activar este dispositivo.” |
| Campus inactivo | “Este campus no tiene una temporada disponible.” |
| Permiso | “No tienes acceso a este contenido.” |
| Petición cerrada | “Esta petición ya fue cerrada.” |

Nunca completar una calle con datos de otra edición.

Nunca revelar si un miembro, request, QR o dirección existe cuando el actor no tiene derecho a saberlo.

---

## 13. Reglas de crecimiento

Pórtico no impone un máximo lógico de grupos pequeños por organización, campus, afinidad o persona en el MVP.

La plataforma debe soportar que una organización tenga:

```text
1 campus → 10 grupos
3 campus → 100 grupos
20 campus → 1,000 grupos
```

sin cambiar el modelo.

Los límites físicos y operativos pueden existir por infraestructura o contrato, pero no se convierten en reglas de pertenencia.

Especialmente:

- no existe `max_groups_per_member`;
- no existe `primary_group`;
- no existe `group_conflict`;
- no existe `campus_exclusivity`;
- no existe “afinidad exclusiva”;
- no existe asignación por geografía.

El crecimiento por expansión geográfica se resuelve con nuevos campus.

El crecimiento por reproducción de grupos pequeños se resuelve con plantillas y linaje.

La participación múltiple se resuelve con múltiples memberships.

---

## 14. Criterio de que el producto funciona

1. Una persona entiende qué grupos pequeños ofrece la organización en el campus que eligió.
2. Puede cambiar de campus sin crear otra cuenta.
3. Puede ir a un lugar público sin cuenta.
4. Puede entrar al silo sin una oficina central.
5. Una persona puede pertenecer a varios grupos pequeños sin que Pórtico actúe como policía de horarios.
6. El responsable actualiza la semana en menos de dos minutos.
7. El responsable no necesita administrar personalmente cada reingreso de una temporada anterior.
8. Las nuevas ediciones no heredan datos privados por accidente.
9. El integrante ve únicamente sus silos.
10. La organización puede tener más de un campus sin convertirse en varios productos.
11. Otra organización no puede atravesar la frontera del tenant.
12. La temporada termina y las calles y directorios dejan de resolverse.
13. Governance reconoce y cierra; no administra la reunión semanal de cada grupo.
14. Pórtico ayuda a la organización sin convertirse en observador de la organización.

### Preguntas de control

**Visitante:** ¿entiendo dónde puedo presentarme?  
**Integrante:** ¿sé cuál es la propuesta oficial de mis próximas reuniones?  
**Responsable:** ¿puedo operar mi grupo sin pedir permiso por cada cambio?  
**Support:** ¿veo principalmente lo que no tiene dueño de grupo?  
**Governance:** ¿puedo gobernar sin entrar al jueves de cada casa?  
**Organización:** ¿puedo abrir otro campus sin crear otro Pórtico?  
**Persona:** ¿puedo pertenecer a varios grupos sin que el software me juzgue o me limite?

Si alguna respuesta es no, primero se quita fricción o se reduce el modelo. No se agrega una capa de vigilancia.

---

## 15. Principio de frontera

> **Pórtico debe hacer reproducible la operación de los grupos pequeños sin absorber el gobierno de la organización ni convertir la pertenencia en una base de vigilancia.**

```text
Pórtico
  administra estructura

Organización
  administra gobierno y reglas

Campus
  organiza el alcance operativo y geográfico

Responsible
  administra su grupo pequeño

Member
  decide a qué grupos pequeños pertenece

WhatsApp
  administra conversación humana
```

Pórtico no necesita saber más para ser útil.

---

## 16. Especificación Funcional v3.1 (Decisiones Canónicas Calibradas)

Con base en la auditoría de literatura canónica y benchmarks del universo de GitHub (`DOSSIER-064`), la versión 3.1 integra formalmente:

1. **Avisos Oficiales con Purga Estacional (Decisión 1-C):**
   - Entidad relacional `notice` ligada a `edition_id`.
   - Propuesta oficial de la semana visible inmediatamente en el silo del miembro.
   - Directiva de purga estacional (retención máxima 180 días) para prevenir fragmentación de SQLite.
2. **Difusión Híbrida 1-Tap Share (Decisión 2-C):**
   - Invocación preferente de Web Share API (`navigator.share`) nativa en móviles.
   - Fallback instantáneo a URL universal `https://wa.me/?text=` y copiado al portapapeles (`navigator.clipboard`).
   - Cero dependencias de APIs corporativas o tokens de pago de Meta.
3. **Recursos Clave Acotados a Máximo 5 Enlaces (Decisión 3-C):**
   - Tabla relacional `resource_link` con control de invariante estricto (`COUNT(*) <= 5`).
   - Soporte para enlaces externos verificados (Drive, PDF, YouTube, Notion).
   - Cero almacenamiento de blobs binarios o CMS innecesario en el servidor.
4. **Alerta Preventiva Jetro y Headcount Numérico Agregado (Decisión 6-B):**
   - Insignia visual `⚡ Sugerir División (Jetro 1:10)` cuando un grupo alcanza 15 o más inscritos, invitando a la multiplicación pastoral sana.
   - Reporte opcional de asistencia para el pastor (`meeting_headcount`) registrando únicamente la cantidad agregada de asistentes (`attendee_count`), fecha y notas.
   - **Axioma Anti-Vigilancia:** Cero listas nominales ("roll-call"), cero registro de inasistencias individuales.
5. **Selector Contextual y Reactivo de Campus (Decisión 8-B):**
   - Si la iglesia tiene 1 solo campus (`campuses.length <= 1`), se despliega una insignia informativa fija.
   - Si la iglesia cuenta con 2 o más campus, se activa un selector interactivo tipo combobox que filtra el catálogo en tiempo real.
6. **Transición Estacional y Linaje Estructural a Borrador (Decisión 9-C):**
   - Clonación de metadatos del grupo (nombre, afinidad, día, horario, anfitrión) a una nueva edición en estado `draft` para la temporada siguiente ($T+1$).
   - Reseteo limpio de miembros y excepciones a 0 para garantizar nuevo consentimiento voluntario.
   - Registro inmutable en `edition_lineage` (`replicated` / `split`) preservando la trayectoria histórica del miembro.
7. **Modal Institucional Unificado de Identidad y Transparencia Legal (Decisión 10-B):**
   - Accesible en 1 tap desde el header y footer en cualquier pantalla.
   - Estructurado en 3 pestañas: *Qué Sostenemos*, *Qué No Sostenemos*, y *Aviso de Privacidad Integral (LFPDPPP)*.

---

## 17. Elevación de UI/UX, Estética Grado Apple y Triada de Dispositivos (GOLD-215 a GOLD-229)

Ratificado el 25 de septiembre de 2026 bajo el principio de **Igual Dignidad Tecnológica**:

1. **Paleta Dual "Luz de Atrio" + "Noche de Vigilia" (`GOLD-215` / D1-C):**
   - Modo claro con ratio de contraste solar > 13.5:1 (`#1A1F2C` sobre `#FFFFFF`), legible bajo el sol de mediodía en pantallas LCD de 350 nits.
   - Modo oscuro sobrio en olivo y brasa para veladas y oraciones.
2. **Arquitectura Cero-Blur a 60 FPS (`GOLD-216` / D2-C):**
   - Erradicación total de `backdrop-filter: blur(...)` para eliminar caídas de framerate en procesadores modestos Unisoc/MediaTek con 2 GB RAM. Superficies sólidas y sombras multicapa en GPU.
3. **Pila Tipográfica del Sistema Zero-Download (`GOLD-217` / D3-C):**
   - Pila Transitional (`Charter`, `Sitka Text`, `Cambria`, `Georgia`, `serif` y `system-ui`). Ahorro de ~182 KB de transferencia por sesión fresca ($0 costo para presupuestos prepago en México).
4. **Píldoras Horizontales Táctiles de 48px (`GOLD-218` / D4-C):**
   - Contenedor `affinity-scroller` con desplazamiento táctil por snap, `min-height: 48px` y `aria-pressed`. Cero menús desplegables modales invasivos.
5. **Living Gathering Pass (`GOLD-219` / D5-C):**
   - Pase semanal en relieve tangible con hora viva (*"En 2 horas"*) y lectura integral en menos de 3 segundos.
6. **Despachador Universal de Ruta GPS (`GOLD-220` / D6-C):**
   - Botón `[ 🗺️ Ver Ruta en Maps / Waze ]` que detecta iOS (`maps://`), Android (`geo:`) o navegador sin incrustar iframes de alto consumo de memoria.
7. **Difusión Atómica 1-Tap a WhatsApp (`GOLD-221` / D7-C):**
   - Botón `[ 🟢 Publicar y Enviar a WhatsApp ]` en la consola del líder que persiste la propuesta en base de datos y abre WhatsApp con el mensaje pastoral preformateado.
8. **Headcount Touch Stepper `[-] [ N ] [+]` (`GOLD-222` / D8-C):**
   - Control táctil de 48px para reportar asistencia en 2 segundos con un solo pulgar, sin desplegar el teclado en pantalla.
9. **Radar de Cuidado Pastoral en 2 Niveles (`GOLD-223` / D9-C):**
   - Nivel 1: 3 tarjetas de pulso superior (asistencia viva, alertas de multiplicación Jetro `⚡ Sugerir División` en 15+ personas, salud comunitaria).
   - Nivel 2: Cuadrícula y matriz por campus con indicadores de salud.
10. **Ergonomía de Tableta en Atril Master-Detail (`GOLD-224` / D10-C):**
    - Layout adaptativo CSS Grid (`340px 1fr`) para tabletas de 10" (768px-1199px) operable con un pulgar mientras reposa en el atril pastoral.
11. **Blindaje contra el Bug de Zoom de iOS Safari (`GOLD-225` / D11-C):**
    - Invariante `font-size: 16px !important` en todos los inputs, unidades dinámicas `100dvh` y variables de entorno `env(safe-area-inset-bottom)`.
12. **Resiliencia PWA Offline de Contingencia (`GOLD-226` / D12-C):**
    - Service Worker `sw.js` Network-First con fallback a la shell y última propuesta confirmada para colonias sin señal celular.
13. **Tarjeta Social Editorial OpenGraph `<300 KB` (`GOLD-227` / D13-C):**
    - Gráfico vectorial editorial `og-card.svg` con estética de cantera y tipografía noble para previsualización inmediata en chats de WhatsApp.
14. **Barra de Identidad Fraternal Soberana (`GOLD-228` / D14-C):**
    - Barra con saludo fraternal al miembro, selector de grupo y salida segura en 1 toque.
15. **Metamorfosis Visual de la Tarjeta ante Excepciones (`GOLD-229` / D15-C):**
    - Mutación perimetral a ámbar noble de la Living Gathering Card ante cambios de sede temporales con actualización automática de la ruta GPS.

---

## 18. Ciclo 2: Sobriedad de Lenguaje, Calendario Cristiano y Purga de Debris (GOLD-230 a GOLD-239)

Implementado y verificado el 25 de septiembre de 2026:

1. **Colapso Unicolumna en Móvil <900px (`GOLD-230` / D1-C):**
   - Regla responsive `.silo-layout-grid` que colapsa a `1fr` en teléfonos móviles (360-390px), garantizando que las tarjetas del pase semanal y el directorio de miembros no se compriman en columnas de 100px.
2. **Conmutador Manual Solar y Lenguaje Sobrio (`GOLD-231` / D2-C):**
   - Botón accesible `[ ☀️ Modo Claro / 🌙 Modo Oscuro ]` con persistencia en `localStorage`.
   - **Auditoría de Lenguaje de Preparatoria:** Erradicación total de lenguaje poético o místico ("Luz de Atrio", "Noche de Vigilia"). Las palabras significan exactamente lo que significan.
3. **Navegación Inercial sin Scrollbars Nativas (`GOLD-232` / D3-C):**
   - Reglas `.hide-scrollbar` (`scrollbar-width: none`, `-ms-overflow-style: none`, `::-webkit-scrollbar { display: none; }`) para navegación inercial horizontal limpia en iPhone y Android sin barras grises nativas antiestéticas.
4. **Calendario Litúrgico Cristiano con Domingo como Día 1 (`GOLD-233` / D4-C):**
   - Domingo establecido litúrgica e históricamente como el primer día de la semana (Día 1 / Índice 0 / `weekStartsOn: 0`).
   - Normalización ortográfica en `src/utils.ts` para corregir invariancias de plural en español (*Martes, Miércoles, Jueves*), erradicando errores como "Martess" o "Miércoless".
5. **Dual-Channel Handoff Inmediato en Solicitud de Visita (`GOLD-234` / D5-C):**
   - Al confirmar solicitud de visita, se despliega botón directo de WhatsApp al líder con mensaje preformateado, eliminando la latencia de respuesta para nuevos asistentes.
6. **Micro-RSVP de Asistencia y Erradicación de Emojis Infantiles (`GOLD-235` / D6-C):**
   - Píldoras de confirmación silenciosa `[ Asistiré ]` / `[ No podré ]` en el Pase Semanal, permitiendo al anfitrión calcular asistencia sin exhibir listas nominales invasivas.
   - **Erradicación de Emojis Infantiles:** Reemplazo de emojis de juguete (`💍`, `🔥`, `🏡`, `🌸`, `⚓`, `🌮`, `⛩️`, `⏱️`) por geometría vectorial sobria Lucide y tipografía editorial.
7. **Hoja de Estilos de Impresión Formal para Folio Pastoral (`GOLD-236` / D7-C):**
   - Reglas `@media print` con fondo blanco puro `#FFFFFF`, texto formal `#000000` de 11pt, `break-inside: avoid` y ocultamiento automático de botones web e interfaces interactivas para ancianos y pastores que operan con folios físicos.
8. **Banner de Contingencia Fuera de Línea (`GOLD-237` / D8-C):**
   - Detección reactiva de estado de red (`navigator.onLine` con eventos `online`/`offline`), desplegando cintillo discreto no bloqueante en colonias sin señal celular.
9. **Pozo Físico Inset Apple y Compresión Táctil (`GOLD-238` / D9-C):**
   - Sombra de relieve interior `--shadow-inset-input: inset 0 1px 2px rgba(0, 0, 0, 0.06)` y compresión táctil reactiva `active: scale(0.98)` con curva de resorte natural `--ease-apple`.
10. **Barra Multi-Campus Segmentada en Cabecera (`GOLD-239` / D10-C):**
    - Píldoras horizontales de filtrado inmediato de campus en Portal Público y Panel Pastoral cuando la congregación opera en 2 o más sedes físicas.


