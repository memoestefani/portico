# Portico OS v3.9 -- Plan de Accion y Checklist Maestro
## Busqueda de Miembros, Bottom Sheet Tactil y Asignacion Fraterna de Aprendiz y Anfitrion en el Silo del Lider (Ciclo 17)

```yaml
target_project: portico
document_id: PLAN-ACCION-CICLO-17-V3.9
creation_date: 2026-09-26
author: "Principal Human Interface & Systems Architecture Engineer"
methodology: "Apple HIG Ergonomics + Group Scoping (Rock RMS) + Vaul Bottom Sheet + ChurchTools Fraternal Audit"
scope: "3 Decisiones Canonicas Ratificadas: 1-C, 2-B, 3-A"
canonical_registry: "ADOPTED_REGISTRY.md (GOLD-349 a GOLD-351)"
dossier_reference: "DOSSIER-077 (research/dossiers)"
status: PENDING_USER_AUTHORIZATION
code_execution_permitted: false
```

---

## 1. Diagnostico del Estado Actual y Debris Detectado

1. **Debris en Fision Celular Dunbar (Lineas 4290-4314 de MemberSilo.tsx):**
   * El modal de fision utiliza un campo de texto libre (`<input type="text" placeholder="Nombre del aprendiz">`) que genera identificadores artificiales en memoria: `apprentice-${name.toLowerCase().trim().replace(/\s+/g, '_')}`.
   * Esto rompe la integridad relacional: el aprendiz facilitador que asume la nueva celula deberia ser un miembro real ya registrado en el grupo actual, no una cadena arbitraria escrita al vuelo.
2. **Ausencia de Asignacion en la Triada Celular (Lineas 1555-1570 de MemberSilo.tsx):**
   * La tarjeta superior muestra al Facilitador, Anfitrion y Aprendiz (*"En formacion"*), pero no ofrece ninguna capacidad de accion para el lider (`isLeader === true`) para nombrar o actualizar al Aprendiz o al Hogar Anfitrion desde su lista de companeros.
3. **Riesgo de Fuga de Directorio General (LFPDPPP):**
   * El lider no debe tener acceso a un buscador global que exponga nombres y telefonos de los 15,000 miembros de la congregacion. La busqueda debe estar estrictamente acotada a los miembros de su grupo (`selectedGroupDetail.members`).
4. **Ergonomia Movil en Pantallas Estrechas (390px):**
   * Un selector `<select>` nativo o dropdown de escritorio se deforma con el teclado virtual de iOS. Se requiere una sabana tactil inferior (`Bottom Sheet`) con barra de agarre, input fijo con debounce de 150ms y filas tactiles de 48px con monogramas de dos letras.

---

## 2. Decisiones Canonicas Ratificadas y Arquitectura de Solucion

* **Decision 1: 1-C (Alcance Acotado al Grupo / GOLD-349):**
  * La busqueda indexa unicamente el arreglo `selectedGroupDetail.members`.
  * Algoritmo de busqueda normalizado: insensible a mayusculas/minusculas y libre de acentos (ejemplo: "maria" coincide con "María").
* **Decision 2: 2-B (Bottom Sheet Tactil con Buscador en Vivo / GOLD-350):**
  * Componente `MemberPickerBottomSheet`: Sabana modal anclada al fondo (`bottom: 0`, `border-radius: 20px 20px 0 0`, altura maxima 75dvh).
  * Cabecera fija con zona de agarre fisica (`drag handle` de 36px x 4px) y campo de busqueda con altura minima de 44px.
  * Resultados en scroll vertical con tap targets de 48px, monograma sobrio (`MonogramAvatar`), nombre completo y rol/antiguedad.
  * Boton claro para desasignar o regresar al estado por defecto (*"En formacion"* o *"Hogar Sede"*).
* **Decision 3: 3-A (Autonomia Fraterna Directa con Notificacion Pasiva / GOLD-351):**
  * Asignacion optimista e instantanea en memoria y persistencia local/remota en `selectedGroupDetail`.
  * Generacion automatica de un registro pasivo en el feed de novedades pastorales / supervision diaconal (`DeaconDesk`): *"Carlos Mendoza asigno a [Nombre] como Aprendiz en Formacion en GP Online Frontera"*.
  * Cero bloqueos burocraticos ni colas de aprobacion paralizantes.

---

## 3. Checklist Maestro de Implementacion (Verificable al 100%)

### Fase 1: Limpieza de Debris y Preparacion de Tipos
- [ ] **CH-01:** Identificar y preparar la interfaz de seleccion de rol en `types.ts` o `MemberSilo.tsx` (`targetRole: 'apprentice' | 'host' | 'fission_leader'`).
- [ ] **CH-02:** Erradicar la generacion de identificadores artificiales `apprentice-${...}` en `handleExecuteDunbarFission`.
- [ ] **CH-03:** Asegurar que ningun nuevo codigo o plantilla JSX incorpore emojis o iconos decorativos infantiles (adherencia a la regla "hazlo sin iconos").

### Fase 2: Construccion del Componente MemberPickerBottomSheet
- [ ] **CH-04:** Crear el componente interno o modular `MemberPickerBottomSheet` dentro de `MemberSilo.tsx` (o componente dedicado sin sobrecargar dependencias).
- [ ] **CH-05:** Implementar la zona de agarre fisica (`drag handle`) centrada, sobria, con altura de 4px y color lino atenuado.
- [ ] **CH-06:** Implementar el campo de busqueda en vivo con debounce de 150ms y funcion de normalizacion de acentos.
- [ ] **CH-07:** Implementar el renderizado de filas con objetivos tactiles de 48px, monogramas de dos letras (`MonogramAvatar`), nombre del companero y boton de seleccion.
- [ ] **CH-08:** Implementar el boton de desasignacion ("Restablecer a En formacion" o "Restablecer a Hogar Sede") para revertir el estado limpiamente.
- [ ] **CH-09:** Implementar el cierre suave al tocar fuera (overlay oscuro translucido) o al presionar la tecla Escape.

### Fase 3: Integracion en el Silo del Lider y Fision Dunbar
- [ ] **CH-10:** Habilitar affordance tactil en la tarjeta de la Triada Celular (lineas 1555-1570 de `MemberSilo.tsx`) cuando `isLeader === true`:
  - Boton sutil "Asignar Aprendiz" o clic directo sobre la casilla del Aprendiz.
  - Boton sutil "Designar Anfitrion" o clic directo sobre la casilla del Anfitrion.
- [ ] **CH-11:** Conectar el callback de confirmacion para actualizar `apprentice_name`, `apprentice_id`, `host_reference` o `host_id` en el estado de `selectedGroupDetail`.
- [ ] **CH-12:** Sustituir el `<input type="text">` de la Fision Celular Dunbar por un boton de seleccion tactil que abra el mismo `MemberPickerBottomSheet` en modo `fission_leader`, garantizando que el nuevo lider sea un miembro real seleccionado de la lista.

### Fase 4: Registro Pasivo de Auditoria Diaconal
- [ ] **CH-13:** Disparar un evento fraterno asincrono al asignar un rol que inserte una observacion en la bitacora de `DeaconDesk` para la celula actual.
- [ ] **CH-14:** Verificar que la asignacion sea instantanea y no bloquee al facilitador con alertas de espera o estados de "Pendiente de autorizacion".

### Fase 5: Bateria de Pruebas Automatizadas
- [ ] **CH-15:** Crear el archivo de pruebas `frontend/test/ciclo17_busqueda_miembros_asignacion.test.mjs`.
- [ ] **CH-16:** Validar mediante pruebas que el universo de busqueda esta acotado estrictamente a `members` del grupo y que no hay fugas del padron global.
- [ ] **CH-17:** Validar mediante pruebas que la busqueda filtra correctamente por nombre y apellido con normalizacion de tildes.
- [ ] **CH-18:** Validar mediante pruebas la presencia de la estructura del Bottom Sheet (drag handle, tap targets >= 48px, monogramas tipograficos).
- [ ] **CH-19:** Validar que la fision celular Dunbar utiliza un miembro real en lugar de identificadores sinteticos `apprentice-${...}`.
- [ ] **CH-20:** Ejecutar la suite completa de pruebas (`npm test`) y verificar 100% de exito (0 fallos, 0 regresiones).
- [ ] **CH-21:** Ejecutar `tsc -b && vite build` y verificar compilacion limpia sin errores de tipos.

### Fase 6: Actualizacion de Documentacion y Cierre
- [ ] **CH-22:** Actualizar `portico/ideas/00-Indice.md` incorporando la entrada de este plan (v3.9).
- [ ] **CH-23:** Actualizar `portico/README.md` resumiendo la capacidad de asignacion fraterna de roles y busqueda en bottom sheet.
- [ ] **CH-24:** Validar en el navegador la experiencia interactiva en `http://localhost:3000/?dev=true&role=leader`.

---

## 4. Compromisos de No-Codigo y Transparencia

* No se ha escrito codigo ejecutable de la aplicacion todavia.
* Se requiere la instruccion expresa del usuario para iniciar la fase de implementacion siguiendo estrictamente el orden de esta checklist.
