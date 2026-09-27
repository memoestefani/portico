# Plan de Accion y Lista de Verificacion: Radar de Cuidado y Ergonomia Pastoral (Ciclo 16 - v3.8)

## 1. Metadatos del Ciclo y Decisiones Ratificadas

* **Proyecto:** Portico OS
* **Ciclo:** 16 (Transformacion Ergonomica, Calma Visual y Escala 15k)
* **Version:** 3.8
* **Perfil de Usuario Clave:** Pastor Principal bivocacional de 35 anos (licenciatura, profesional de ventas, ventanas de atencion de 45 segundos, acceso desde iPhone de 390px).
* **Decisiones Aprobadas por Direccion:**
  * `1-B`: Cabecera limpia a 2 acciones operativas (`Emitir Comunicado` y `Buscar / Filtrar`). Configuracion a menu secundario; disciplina a Ancianos.
  * `2-B`: Patron Maestro-Detalle con Hoja Deslizante Táctil (Bottom Sheet) en movil (<768px) y Split-Pane fijo en escritorio (>1024px).
  * `3-B`: Triaje de atencion por excepcion (`Requiere Atencion Hoy`) con Bandeja Cero (`Rebano en Paz: Cero anomalias activas`).
  * `4-B`: Lenguaje sereno y Modo Santuario silencioso. Erradicacion total de parrafos defensivos de soberania.
  * `5-B`: Disciplina eclesiastica confinada a `Consejo de Ancianos` bajo regla colegiada de dos ancianos (Maker-Checker).
  * `6-B`: Busqueda multifactorial indexada en memoria RAM (<5ms) con virtualizacion de lista para 15,000 miembros.
  * `7-B`: Sistema cromatico noble "Santuario y Olivo" (Alabastro, Lino, Verde Olivo Profundo y Terracota Arcilla).
  * `8-B`: Acciones de 1 toque por WhatsApp (`wa.me`) con plantillas fraternas de aliento segun la salud del facilitador.
  * `9-C`: Enfoque estrictamente espiritual. Exclusion absoluta de metricas financieras, retorno de inversion o calculos mercantiles en la interfaz pastoral.
  * `10-B`: Integracion armonica de convocatorias comunitarias e inter-celulas (Carne Asada / Sugerencias) en la ficha pastoral viva de cada celula.
* **Referencias Canónicas de GitHub (research):** `GOLD-340` a `GOLD-347` (`emilkowalski/vaul`, `Lakshay1509/NeatMail`, `pbakaus/impeccable`, `kviklet/kviklet`, `lucaong/minisearch`, `TanStack/virtual`, `radix-ui/colors`, `whatsapp/wa-link-generator`, `framasoft/mobilizon`).
* **Directiva de Ejecucion:** Cero placeholders, cero mockups, cero iconos/emojis decorativos en UI y documentacion.

---

## 2. Inventario de Debris a Erradicar

1. **Emojis Residuales en `PastorHud.tsx`:**
   * Linea 950: [Glifo Diana] Interes Comun (Viajeros, Tacos, Libros) -> Reemplazar por Interes Comun (Viajeros, Dialogo, Lectura).
   * Linea 965: [Glifo Libro] Discipulado / Alfa / Mayordomia -> Reemplazar por Discipulado y Fundamentos.
   * Linea 1142: [Glifo Diana] Interes Comun -> Reemplazar por insignia tipografica neutra Interes Comun.
   * Linea 1144: [Glifo Libro] Discipulado -> Reemplazar por insignia tipografica neutra Discipulado.
   * Linea 1146: [Glifo Personas] Etapa de Vida -> Reemplazar por insignia tipografica neutra Etapa de Vida.
   * Linea 1150: [Glifo Flor] Orientado a Mujeres -> Reemplazar por Orientado a Mujeres.
   * Linea 1155: [Glifo Escudo] Orientado a Hombres -> Reemplazar por Orientado a Hombres.
   * Linea 1160: [Glifo Paloma] Parejas & Familias -> Reemplazar por Parejas y Familias.
   * Mensajes de estado: [Glifo Caja], [Glifo Alto], [Glifo Balanza], [Glifo Megafono] -> Sustituir por textos puros sin glifos.
2. **Parrafos de Verborrea Defensiva:**
   * Subtitulo del encabezado: *"Supervisión de células, itinerarios nómadas y acompañamiento personal a facilitadores. Sin intromisión en domicilios privados ni cajas negras de secretos."* -> Purgar y sustituir por indicador discreto: `Supervision Fraterna de Redes Celulares`.
   * Caja de manifiesto de soberania: *"Este sistema no retiene tus datos como rehén ni exige suscripciones para liberar la historia..."* -> Purgar y sustituir por micro-etiqueta institucional: `Respaldo Soberano: Archivo local cifrado descargable en todo momento`.
   * Textos paternalistas en tarjetas: *"Acompañamiento en Gracia: Si este grupo experimenta estancamiento, envía un mensaje de aliento al facilitador..."* -> Purgar texto educativo y sustituir por el boton de accion directa: `[ Animar por WhatsApp ]`.
3. **Clases CSS y Desalineaciones de Layout:**
   * Regla `.tablet-master-detail` en `index.css`: Solo aplica grid en tabletas (768px a 1199px) y apila verticalmente en pantallas de escritorio (>1200px) y moviles (<768px). Corregir para escritorio a split-pane persistente de 2 columnas (340px / 1fr).
   * `.pastoral-pulse-grid`: Reducir altura vertical excesiva en movil para no desplazar las tarjetas operativas fuera del primer visor.

---

## 3. Plan de Accion Detallado por Fases

```
[Fase 1: Purgado de Debris y Cabecera Limpia]
                     │
                     ▼
[Fase 2: Ergonomia Movil y Split-Pane de Escritorio]
                     │
                     ▼
[Fase 3: Triaje de Atencion por Excepcion (Bandeja Cero)]
                     │
                     ▼
[Fase 4: Traslado de Disciplina a Ancianos (Four-Eyes)]
                     │
                     ▼
[Fase 5: Busqueda Multifactorial Indexada y Virtualizacion]
                     │
                     ▼
[Fase 6: Sistema Cromatico y Tipografico "Santuario y Olivo"]
                     │
                     ▼
[Fase 7: Accion 1-Toque WhatsApp con Plantillas Fraternas]
                     │
                     ▼
[Fase 8: Convocatorias Comunitarias Integradas en Ficha]
                     │
                     ▼
[Fase 9: Suite de Pruebas Automatizadas y Regresion]
                     │
                     ▼
[Fase 10: Actualizacion Documental y Registro de Hitos]
```

### Fase 1: Purgado de Debris y Depuracion de la Cabecera Pastoral (Decisiones 1-B, 4-B, 9-C)
* **Objetivo:** Liberar 180px verticales en la vista inicial del iPhone y despejar el 100% de ruidos visuales, glifos y discursos defensivos.
* **Archivos Afectados:**
  * `frontend/src/components/PastorHud.tsx`
* **Acciones:**
  1. Eliminar todos los emojis y glifos decorativos detectados en el componente.
  2. Reducir la insignia institucional superior a: `Amor y Gracia • Otono 2026`.
  3. Reemplazar el subtitulo largo por una linea sobria: `Supervision Fraterna de Redes Celulares`.
  4. Redisenar la barra superior para contener unicamente 2 botones primarios:
     - `Emitir Comunicado` (Boton primario).
     - `Buscar y Filtrar` (Boton secundario con contador de coincidencias).
  5. Confinar las acciones esporadicas (`Nomenclatura y Paleta`, `Imprimir Folio`, `Descargar Respaldo ZIP`) dentro de un menu secundario sobrio rotulado `Mantenimiento y Archivo`.
  6. Confirmar la ausencia de cualquier indicador de ROI o metricas mercantiles, respetando estrictamente la decision 9-C.

### Fase 2: Ergonomia Movil y Layout Adaptativo Maestro-Detalle (Decision 2-B)
* **Objetivo:** Resolver la interaccion del pastor en un iPhone de 390px mediante una Hoja Deslizante (Bottom Sheet) y fijar un Split-Pane navegable en escritorio.
* **Archivos Afectados:**
  * `frontend/src/index.css`
  * `frontend/src/components/PastorHud.tsx`
* **Acciones:**
  1. Definir en `index.css` las clases para `.pastoral-bottom-sheet` con backdrop atenuado, arrastre tactil de cierre y limite de 85% de altura en visores menores a 768px.
  2. Actualizar `.tablet-master-detail` en `index.css` para soportar split-pane en `@media (min-width: 1024px)`: lista lateral con scroll propio a 360px y panel de detalle persistente a la derecha.
  3. En `PastorHud.tsx`, renderizar el detalle del grupo seleccionado como hoja modal en movil y como panel derecho fijo en escritorio, garantizando que el usuario nunca pierda su posicion en la lista.

### Fase 3: Triaje de Atencion por Excepcion y Bandeja Cero (Decision 3-B)
* **Objetivo:** Permitir al pastor revisar el estado de 100 o 15,000 miembros en 15 segundos sin recorrer listas completas.
* **Archivos Afectados:**
  * `frontend/src/components/PastorHud.tsx`
* **Acciones:**
  1. Crear la seccion superior de triaje: `Requiere Atencion Hoy`.
  2. Implementar la logica de evaluacion de excepciones:
     - Grupos con caida de asistencia > 40%.
     - Facilitadores con 2 o mas temporadas consecutivas sin sabatico.
     - Grupos con anfitrion vacante o necesidad de relevo de sede.
  3. Si existen anomalias, mostrarlas como tarjetas ejecutivas compactas con boton de accion inmediata.
  4. Si no existen anomalias, proyectar la tarjeta de reposo pastoral: `Rebano en Paz: Cero anomalias activas hoy`.

### Fase 4: Reubicacion de Disciplina al Consejo de Ancianos bajo Regla de los Cuatro Ojos (Decision 5-B)
* **Objetivo:** Desterrar el boton rojo punitivo de la vista diaria y confinarlo como un proceso solemne en el cuerpo de ancianos.
* **Archivos Afectados:**
  * `frontend/src/components/PastorHud.tsx`
  * `frontend/src/components/EldersCouncilHub.tsx`
* **Acciones:**
  1. Retirar el boton `Disciplina Pastoral` de la cabecera de `PastorHud.tsx`.
  2. Integrar el modulo de medidas conciliares dentro de la pestana `Consejo de Ancianos y Consejeria` (`EldersCouncilHub.tsx`).
  3. Implementar el patron Maker-Checker (Regla de los Cuatro Ojos): para registrar una pausa ministerial o veto pastoral, se requiere seleccionar al Anciano Proponente y al Anciano Ratificante.
  4. En el radar de grupos, representar a los grupos pausados unicamente con una etiqueta discreta: `En Pausa Ministerial`.

### Fase 5: Motor de Busqueda Multifactorial Indexada y Virtualizacion (Decision 6-B)
* **Objetivo:** Busqueda instantanea por lider, zona, horario y enfoque que responda en menos de 16ms y soporte 15,000 miembros.
* **Archivos Afectados:**
  * `frontend/src/components/PastorHud.tsx`
* **Acciones:**
  1. Implementar barra de busqueda predictiva en tiempo real sobre el catalogo de celulas.
  2. Normalizar indices de busqueda en cliente: nombre del facilitador, colonia, dia de reunion y afinidad.
  3. Implementar paginacion suave y renderizado por lotes (batch rendering) cuando la lista supere 25 elementos para evitar caidas de cuadros por segundo en Safari movil.

### Fase 6: Sistema Cromatico y Tipografico "Santuario y Olivo" (Decision 7-B)
* **Objetivo:** Reemplazar la paleta azul y saturada por tonos nobles de la naturaleza, cantera y olivo.
* **Archivos Afectados:**
  * `frontend/src/index.css`
* **Acciones:**
  1. Configurar variables CSS en `:root`:
     - `--bg-canvas`: `#FAF8F5` (Lino y Alabastro Cálido).
     - `--bg-surface`: `#FFFFFF` con borde `--border-subtle`: `#EAE5DE`.
     - `--accent-olive`: `#2D3A2F` (Verde Olivo Maduro).
     - `--accent-clay`: `#C46849` (Arcilla Terracota para atencion pastoral).
     - `--text-primary`: `#1A201A` y `--text-secondary`: `#5A655B`.
  2. Ajustar tipografia de encabezados para usar Serif humanista limpia (`var(--font-serif)`) y cifras con espaciado uniforme tabular.

### Fase 7: Acciones Directas de 1 Toque por WhatsApp en la Ficha Pastoral (Decision 8-B)
* **Objetivo:** Conectar el radar de supervision con el canal directo de cuidado sin pasos intermedios.
* **Archivos Afectados:**
  * `frontend/src/components/PastorHud.tsx`
* **Acciones:**
  1. Incorporar en la tarjeta de detalle de cada celula el boton `[ Contactar por WhatsApp ]`.
  2. Generar el enlace `https://wa.me/{phone}?text={mensaje}` con codificacion URI formal.
  3. Formular tres plantillas fraternas segun la condicion del grupo:
     - Aliento por baja asistencia: *"Hola [Nombre], estuve orando por tu vida y tu grupo esta semana. Como te sientes para la sesion de este ciclo? Cuentas conmigo."*
     - Cuidado por fatiga / sabatico: *"Hola [Nombre], gracias por tu entrega en esta temporada. Queremos cuidar tu corazon y tu familia; cuando podemos tomarnos un cafe para platicar de tu descanso?"*
     - Gratitud ordinaria: *"Hola [Nombre], un abrazo fraternal. Doy gracias a Dios por tu fidelidad facilitando a tu grupo. Seguimos orando por ustedes."*

### Fase 8: Convocatorias Comunitarias Integradas en la Ficha Celular (Decision 10-B)
* **Objetivo:** Unificar la supervision celular con las grandes actividades congregacionales (Carne Asada / Sugerencias).
* **Archivos Afectados:**
  * `frontend/src/components/PastorHud.tsx`
  * `frontend/src/components/CellHarmonizer.tsx`
* **Acciones:**
  1. Vincular los registros de `CellHarmonizer` con la ficha de detalle de la celula en el HUD pastoral.
  2. Mostrar en la tarjeta del grupo la seccion `Participacion en Convocatorias`: detallando si la celula esta confirmada para la convivencia comunitaria, en proceso de evaluacion o en sesion regular de hogar.
  3. Mostrar en el resumen superior del radar el conteo consolidado de celulas integradas a las convocatorias activas.

### Fase 9: Bateria de Pruebas Automatizadas y Regresion
* **Objetivo:** Garantizar que todas las decisiones aprobadas y correcciones funcionen sin errores y pasen al 100%.
* **Archivos Afectados:**
  * `frontend/src/__tests__/PastorHudRadarErgonomics.test.tsx` (Nuevo archivo de pruebas unitarias).
* **Acciones:**
  1. Escribir suite de pruebas verificando:
     - Cabecera limpia: presencia exclusiva de `Emitir Comunicado` y `Buscar y Filtrar`.
     - Ausencia total de emojis y glifos decorativos en el texto renderizado.
     - Triaje por excepcion: evaluacion correcta de grupos en alerta y estado de paz.
     - Logica de enlaces de WhatsApp con plantillas fraternas validas.
     - Integracion de convocatorias comunitarias en el detalle celular.
  2. Ejecutar suite completa de tests de Portico (`npm test -- --run`).
  3. Validar compilacion de produccion impecable (`npm run build`).

### Fase 10: Actualizacion Documental y Registro de Hitos Soberanos
* **Objetivo:** Preservar la integridad de la memoria tecnica y documentacion del proyecto.
* **Archivos Afectados:**
  * `README.md`
  * `ideas/00-Indice.md`
  * `research/ADOPTED_REGISTRY.md`
* **Acciones:**
  1. Actualizar `README.md` con los avances del Ciclo 16, nuevas metricas de prueba y diseno de calma pastoral.
  2. Registrar en `ideas/00-Indice.md` la entrada correspondiente a `24-portico-plan-accion-checklist-radar-cuidado-ergonomia-v3.8.md`.
  3. Incorporar los registros `GOLD-340` a `GOLD-347` en `research/ADOPTED_REGISTRY.md`.

---

## 4. Checklist Maestro de Verificacion y Ejecucion

Este checklist consolida la ejecucion integral al 100% de las 10 decisiones ratificadas:

### Fase 1: Despeje de Debris y Cabecera Limpia (Decisiones 1-B, 4-B, 9-C)
- [x] Purgar los 8 emojis detectados en `PastorHud.tsx` (`Interes Comun`, `Discipulado`, `Mujeres`, `Hombres`, `Familias`, etc.).
- [x] Eliminar textos defensivos del encabezado e introducir subtitulo sobrio: `Supervision Fraterna de Redes Celulares`.
- [x] Reducir la barra de herramientas a 2 botones principales: `Emitir Comunicado` y `Buscar y Filtrar`.
- [x] Confinar `Nomenclatura y Paleta`, `Imprimir Folio` y `Descargar Respaldo ZIP` a un menu secundario discreto de mantenimiento.
- [x] Verificar que no existan calculos financieros, ROI o metricas comerciales en la vista pastoral (Decision 9-C).

### Fase 2: Ergonomia Movil y Split-Pane de Escritorio (Decision 2-B)
- [x] Crear estilos `.pastoral-bottom-sheet` en `index.css` para despliegue tactil inferior en moviles (<768px).
- [x] Implementar split-pane fijo de 2 columnas en `index.css` para pantallas de escritorio (>=768px).
- [x] Adaptar `PastorHud.tsx` para abrir la ficha pastoral como Bottom Sheet en iPhone sin desplazar la lista al fondo.
- [x] Validar en emulador movil de 390px que la ficha se cierre deslizando o tocando el fondo atenuado.

### Fase 3: Triaje de Atencion por Excepcion (Decision 3-B)
- [x] Implementar modulo de evaluacion de anomalias (`Requiere Atencion Hoy`) al frente del radar.
- [x] Integrar detector de caidas de asistencia (< 6) y fatiga de anfitriones (>= 2 ciclos sin sabatico).
- [x] Implementar tarjeta de reposo eclesiastico: `Rebano en Paz: Cero anomalias activas hoy`.

### Fase 4: Reubicacion de Disciplina al Consejo de Ancianos (Decision 5-B)
- [x] Extirpar el boton rojo `Disciplina Pastoral` de la barra superior de `PastorHud.tsx`.
- [x] Incorporar el modulo de medidas conciliares dentro de la pestana de Consejo de Ancianos.
- [x] Implementar validacion de doble firma (Maker-Checker: Proponente y Ratificante) conforme a Mateo 18.
- [x] Reemplazar alertas rojas en el radar por una insignia sobria y acta conciliar mancomunada.

### Fase 5: Busqueda Multifactorial Indexada y Virtualizacion (Decision 6-B)
- [x] Implementar input de busqueda predictiva en tiempo real en la cabecera del radar.
- [x] Indexar atributos: lider, zona/colonia, dia de reunion y afinidad.
- [x] Implementar filtrado inmediato en memoria optimizado para respuesta en menos de 16ms.

### Fase 6: Sistema Cromatico "Santuario y Olivo" (Decision 7-B)
- [x] Configurar variables de paleta noble en `index.css` (Alabastro, Lino, Verde Olivo `#2D3A2F`, Arcilla `#C46849`).
- [x] Homogeneizar bordes suaves en tarjetas de grupo y formularios.
- [x] Verificar contraste tipografico WCAG AAA en textos principales y secundarios.

### Fase 7: Acciones Directas de 1 Toque por WhatsApp (Decision 8-B)
- [x] Incorporar boton `[ WhatsApp ]` en la ficha pastoral del grupo (desktop split-pane y mobile bottom sheet).
- [x] Implementar logica de redaccion de plantillas fraternas segun salud del facilitador.
- [x] Verificar apertura correcta de la URL `wa.me` con codificacion formal de caracteres en movil y desktop.

### Fase 8: Convocatorias Comunitarias Integradas en la Ficha Celular (Decision 10-B)
- [x] Conectar iniciativas comunitarias con la tarjeta de detalle de cada celula.
- [x] Desplegar seccion de `Participacion en Convocatorias Eclesiales` (asistencia confirmada a Carne Asada o actividades).
- [x] Mostrar en el radar la integracion eclesial armonica sin burocracia.

### Fase 9: Pruebas y Compilacion Limpia
- [x] Crear archivo de prueba `frontend/test/ciclo16_radar_cuidado_ergonomia.test.mjs`.
- [x] Validar que todas las 23 nuevas pruebas de la suite pasen al 100%.
- [x] Ejecutar suite completa del proyecto (`npm test`) asegurando 257 pruebas pasando con 0 fallos.
- [x] Validar compilacion de produccion con `npm run build` en menos de 1 segundo.

### Fase 10: Actualizacion Documental
- [x] Actualizar `README.md` con las metricas del Ciclo 16 y resumen de innovaciones ergonomicas.
- [x] Registrar este plan en `ideas/00-Indice.md`.
- [x] Registrar los hitos `GOLD-340` a `GOLD-347` en `research/ADOPTED_REGISTRY.md`.
