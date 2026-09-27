# Portico OS v3.10 -- Plan de Accion y Checklist Maestro
## Logistica Celular Agnostica, Asignacion de Roles en Bottom Sheet y Confinamiento Exclusivo al Lider (Ciclos 17 y 18)

```yaml
target_project: portico
document_id: PLAN-ACCION-CICLO-17-18-V3.10
execution_date: 2026-09-26
author: "Principal Human Interface & Systems Architecture Engineer"
methodology: "Apple HIG Ergonomics + Mobilizon Place Polymorphism + Cal.com Date Overrides + Rock RMS Group Scoping + Discourse Linked Groups"
scope: "7 Decisiones Canonicas Ratificadas: 1-C, 2-B, 3-A (Ciclo 17) + 1-C, 2-B Agnostica, 3-B, 4-B (Ciclo 18)"
canonical_registry: "ADOPTED_REGISTRY.md (GOLD-349 a GOLD-355)"
dossier_reference: "DOSSIER-077 y DOSSIER-078 (research/dossiers)"
status: COMPLETED
code_execution_permitted: true
fundamental_invariant: "CONFINAMIENTO EXCLUSIVO AL LIDER (isLeader === true): Los miembros ordinarios nunca pueden editar ni alterar sedes, roles u horarios; unicamente consumen la informacion actualizada, el aviso ambar noble y su RSVP voluntario."
```

---

## 1. Diagnostico del Estado Actual y Debris a Erradicar

1. **Confinamiento Estricto de Roles (Miembro vs Lider):**
   * El Miembro (`isLeader === false`, ej. Elena Ramos) no debe tener controles de edicion logistica ni asignacion. Solo ve la sede actual, el badge ambar si hubo un cambio de ultima hora, la ruta GPS y su RSVP.
   * El Lider (`isLeader === true`, ej. Carlos Mendoza) tiene el control pleno y ergonomico de su grupo desde su Living Card y su tira semanal, sin tener que ir a un panel administrativo distante.
2. **Debris de Asignacion de Aprendiz / Fision Celular (MemberSilo.tsx lineas 4290-4314):**
   * El modal de fision contiene un `<input type="text">` con placeholder libre que genera identificadores ficticios `apprentice-${...}`.
   * **Limpieza:** Erradicar esta generacion artificial; el nuevo lider o aprendiz debe ser un miembro real seleccionado mediante el `MemberPickerBottomSheet`.
3. **Debris en Modal de Sede Semanal (MemberSilo.tsx lineas 3450-3550):**
   * Texto de ticket arcaico: `Itinerario Nomada: Asignar Sede Semanal (GOLD-261)`.
   * Desplegable desconectado de 12 semanas que ignora sobre que semana hizo clic el usuario.
   * Botones redundantes en el Action Drawer ("Sede de esta semana" vs "Cambiar Sede esta semana").
   * **Limpieza:** Sustituir por una sabana tactil inferior deslizable `VenueEditorBottomSheet` que abre directamente la semana pulsada, con 4 modalidades funcionales agnosticas.
4. **Debris en el Living Gathering Card (MemberSilo.tsx lineas 1555-1631):**
   * Ausencia de boton directo de ajuste logistico para el lider.
   * La triada (Facilitador, Anfitrion, Aprendiz) no es interactiva; el lider no puede pulsar para nombrar al Aprendiz o cambiar de anfitrion.
   * **Limpieza:** Anadir boton sobrio "Ajustar Lugar u Horario" y affordance tactil en los slots de Aprendiz y Anfitrion exclusivo para `isLeader === true`.

---

## 2. Decisiones Canonicas Consolidadas

| ID | Decision | Descripcion Funcional |
| :---: | :---: | :--- |
| **D1 (C17)** | **1-C** | Busqueda de miembros acotada estrictamente al silo de la celula actual (`selectedGroupDetail.members`) para cumplimiento LFPDPPP y cero fugas del padron general de 15,000 personas (`GOLD-349`). |
| **D2 (C17)** | **2-B** | Bottom Sheet tactil deslizable inferior con buscador en vivo por nombre y apellido, debounce de 150ms, monogramas de 2 letras y tap targets de 48px (`GOLD-350`). |
| **D3 (C17)** | **3-A** | Autonomia fraterna directa: asignacion instantanea de rol sin bloqueos burocraticos con notificacion pasiva a la bitacora de `DeaconDesk` (`GOLD-351`). |
| **D4 (C18)** | **1-C** | Edicion de doble puerta exclusiva del lider: boton en Living Card de proxima cita + tap directo en cualquier semana de la tira de rotacion (`GOLD-352`). |
| **D5 (C18)** | **2-B** | Tipologia logistica agnostica en 4 modalidades: Hogar residencial, Espacio publico / Servicio misionero (CRESO, Hospital 450, Taqueria, Parque), Virtual y Destino foraneo/retiro (`GOLD-353`). |
| **D6 (C18)** | **3-B** | Coordinador de encuentros especiales: fusion sincronizada con celula hermana en un mismo mapa y anfitrion, o retiro de fin de temporada en cabanas con fechas extendidas y notas (`GOLD-354`). |
| **D7 (C18)** | **4-B** | Transmutacion visual ambar noble en la Living Card del miembro ante cambios logisticos + boton asistido en 1 toque por WhatsApp para el lider con mensaje pre-redactado y enlace GPS (`GOLD-355`). |

---

## 3. Checklist Maestro de Ejecucion (Verificable al 100%)

### Fase 1: Limpieza de Debris y Normalizacion de Tipos
- [x] **CH-01:** Purgar etiquetas de ticket arcaicas (`GOLD-261`, `Itinerario Nomada`) del codigo JSX visible y comentarios.
- [x] **CH-02:** Erradicar la generacion sintetica de identificadores `apprentice-${...}` en `handleExecuteDunbarFission`.
- [x] **CH-03:** Unificar los botones duplicados en el Action Drawer de Herramientas del Grupo.
- [x] **CH-04:** Extender interfaces en `types.ts` o `MemberSilo.tsx` para tipar roles y modalidades de sede agnostica (`hogar`, `publico`, `virtual`, `foraneo`, `is_joint_meeting`, `partner_group_name`, `is_retreat`, `retreat_date_range`, `arrival_notes`).
- [x] **CH-05:** Garantizar cero emojis o iconos decorativos en la totalidad de la nueva UI y textos.

### Fase 2: Componente MemberPickerBottomSheet (Ciclo 17 / GOLD-349 a GOLD-351)
- [x] **CH-06:** Implementar el componente `MemberPickerBottomSheet` dentro de `MemberSilo.tsx` con anclaje al fondo, altura acotada a 75dvh y barra de agarre fisica de 36px x 4px.
- [x] **CH-07:** Implementar el campo de busqueda en vivo con debounce de 150ms y normalizacion de tildes/acentos insensible a mayusculas.
- [x] **CH-08:** Renderizar la lista de companeros con monogramas de dos letras (`MonogramAvatar`), nombre completo y objetivos tactiles de 48px.
- [x] **CH-09:** Habilitar affordance de asignacion en la Triada Celular (Aprendiz y Anfitrion) visible y operable UNICAMENTE cuando `isLeader === true`.
- [x] **CH-10:** Conectar `MemberPickerBottomSheet` al modal de Fision Celular Dunbar para que el lider seleccione un miembro real del grupo en vez de un texto arbitrario.
- [x] **CH-11:** Implementar la emision pasiva de la observacion diaconal en `DeaconDesk` tras cada asignacion.

### Fase 3: Edicion de Doble Puerta y VenueEditorBottomSheet Agnostico (Ciclo 18 / GOLD-352 a GOLD-354)
- [x] **CH-12:** Incorporar boton directo "Ajustar Lugar u Horario" en el Living Gathering Card, visible y ejecutable UNICAMENTE por el lider (`isLeader === true`). Los miembros ordinarios NO ven este boton.
- [x] **CH-13:** Transformar las tarjetas de semana de "Sedes y Rotacion Semanal" en elementos interactivos con click directo que abran la sabana de edicion precargada con esa semana especifica para el lider.
- [x] **CH-14:** Construir la sabana tactil `VenueEditorBottomSheet` con 4 modalidades funcionales agnosticas:
  - *Hogar:* Selector rapido de anfitriones del grupo (Leo, Vero) con sellado LFPDPPP.
  - *Publico / Servicio:* Campos de Nombre de Sede (CRESO, Hospital 450, Taqueria, Parque), Direccion y Referencia de Llegada libre.
  - *Virtual:* Enlace unico de videollamada sin campos de direccion innecesarios.
  - *Foraneo / Retiro:* Destino foraneo con notas de llegada.
- [x] **CH-15:** Implementar el toggle "Encuentro Especial" con soporte para Fusion con Celula Hermana sincronizada o Retiro en Cabanas con rango de fechas extendido.

### Fase 4: Transmutacion Ambar y Despacho WhatsApp 1-Tap (Ciclo 18 / GOLD-355)
- [x] **CH-16:** Configurar la Living Card para mutar a estilo de borde ambar noble cuando la proxima fecha sea una excepcion logistica.
- [x] **CH-17:** Implementar el generador de enlace determinista `wa.me/?text=` pre-redactado con fecha, hora, lugar, indicacion de llegada y enlace GPS a Google Maps / Waze.
- [x] **CH-18:** Renderizar el boton de difusion asistida por WhatsApp exclusivo para el lider tras confirmar la edicion logistica.

### Fase 5: Suite de Pruebas Automatizadas
- [x] **CH-19:** Crear la suite de pruebas `frontend/test/ciclo17_18_busqueda_miembros_logistica_sedes.test.mjs`.
- [x] **CH-20:** Probar el aislamiento de permisos: verificar que los controles de edicion logistica y asignacion de roles solo se renderizan cuando `isLeader === true`.
- [x] **CH-21:** Probar la busqueda y seleccion de miembros acotada al grupo con normalizacion de acentos.
- [x] **CH-22:** Probar la doble entrada tactil y la precarga de la semana correcta.
- [x] **CH-23:** Probar el polimorfismo agnostico de sedes (Hogar, CRESO/Hospital, Taqueria, Cabanas).
- [x] **CH-24:** Probar el coordinador de encuentros especiales (fusion y retiro).
- [x] **CH-25:** Probar el generador determinista del enlace de WhatsApp.
- [x] **CH-26:** Ejecutar la suite completa (`npm test`) y verificar 100% de exito (0 fallos sobre todos los tests: 271 pruebas pasando).
- [x] **CH-27:** Ejecutar `tsc -b && vite build` y verificar 0 errores de tipos en TypeScript.

### Fase 6: Actualizacion Documental y Validacion Visual
- [x] **CH-28:** Actualizar `portico/ideas/00-Indice.md`.
- [x] **CH-29:** Actualizar `portico/README.md`.
- [x] **CH-30:** Validar interactivamente en el navegador en `http://localhost:3000/?dev=true&role=leader`.
