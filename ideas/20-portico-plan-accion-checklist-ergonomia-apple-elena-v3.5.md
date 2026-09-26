# 📋 Plan de Acción y Checklist Exhaustivo: Ergonomía Apple, Voz Humana y Arquitectura de Santuario (Pórtico OS v3.5)
## Hoja de Ruta de Implementación de las 10 Decisiones Canónicas Ratificadas (GOLD-320 a GOLD-329), Re-expresión Humana bajo el Filtro «Elena Ramos», Escalabilidad a 15,000 Miembros y Purga Radical de Debris

```yaml
project: portico
document_id: PLAN-020-ERGONOMIA-APPLE-ELENA-V3.5
version: 3.5.0-cycle12
target_path: "C:\\Users\\52331\\Documents\\Proyectos\\portico"
github_remote_origin: "https://github.com/memoestefani/portico.git"
github_author: "Guillermo <memoestefani@gmail.com>"
evaluation_date: 2026-09-26
author: "Principal Human Interface & Systems Architecture Engineer + Sovereign Central Research Laboratory (`research`)"
status: COMPLETED_100_PERCENT
benchmarks_adopted:
  - "framasoft/mobilizon (Dual-Tier Engagement Model: Public Showcase vs Member Logistics)"
  - "apple/swift-ui-guidelines (Single-Intent Action Hierarchy: One Primary Door)"
  - "alphagov/govuk-frontend (Subtle Civic Care Footer Placement)"
  - "plainlanguage/guidelines (Radical Plain Language: Elena Ramos Grade 6 Reading Level)"
  - "airbnb/react-dates + algolia/instantsearch (Proximity-First Navigation & Lazy Batch Slices)"
  - "whatsapp/wa-link-generator + OWASP (DOM Phone Masking & Action-Triggered Dispatch)"
  - "duckduckgo/tracker-radar + privacy-by-design (Sanctuary Reassurance Micro-Copy)"
  - "google/material-design + apple/human-interface-guidelines (Physical 48px Touch Targets & Earthen Noble Palette)"
  - "37signals/handbook + signalapp (Sovereign Sanctuary Silence: Zero Self-Promotional Marketing)"
  - "thoughtbot/humane-interface (Relational Shepherd Cards over Cold Issue Trackers in DeaconDesk)"
ratified_decisions:
  - "GOLD-320 (1-B): Doble Capa en Iniciativas (Vitrina Testimonial Pública + Logística de Insumos en Silo del Miembro)"
  - "GOLD-321 (2-A): Puerta Única de Visita en Catálogo Abierto (Desacople del Botón Pase/QR Público)"
  - "GOLD-322 (3-B): Cortesía Cívica Vecinal en Pie de Página Institucional (Retiro de Cajón Ruidoso)"
  - "GOLD-323 (4-B): Re-expresión Humana Total al Español Sereno Cotidiano (Filtro Elena Ramos sin Jargon)"
  - "GOLD-324 (5-B): Escala Masiva 15,000 Miembros con Proximidad Primero en 1 Toque y Lotes de 6 Tarjetas"
  - "GOLD-325 (6-B): Blindaje Anti-Scrapers y Botón Directo wa.me Ocultando Teléfonos Crudos en el DOM"
  - "GOLD-326 (7-B): Diseño de Santuario y Micro-copys de Abrazo y Confianza en Puntos de Contacto"
  - "GOLD-327 (8-B): Ergonomía Táctil 48px y Paleta Earthen Noble para Tableta Android"
  - "GOLD-328 (9-C): Silencio Total de Marca y Cero Mercadotecnia en Web Pública (Trato Pastoral en Persona)"
  - "GOLD-329 (10-B): Consola Diaconal Humana en DeaconDesk (Fichas Fraternales de 5 Familias)"
zero_mockups_zero_placeholders: true
debris_purge_directive: MANDATORY_100_PERCENT
cognitive_persona: "Elena Ramos (25 años, preparatoria, tableta Android de gama media en Durango, diaconisa)"
executive_persona: "Pastor Josh (Durango: pastoreo en gracia, serenidad y cero burocracia)"
execution_policy: "FULLY_EXECUTED_AND_VERIFIED_ALL_TESTS_GREEN"
```

---

## 🏛️ 1. Resumen Ejecutivo y Compromisos de Diseño

Este plan traduce las 10 decisiones ratificadas por el usuario en una arquitectura de software quirúrgica, elegante y libre de conceptos huérfanos.

### Los Objetivos Cumplidos de esta Implementación:
1. **El Filtro «Elena Ramos»:** Toda la interfaz es comprensible y manejable por una mujer de 25 años con educación media superior en Durango, usando una tableta Android económica. Se erradicó el vocabulario de ingeniería de software, términos judiciales y jerga abstracta.
2. **Arquitectura de Santuario y Doble Capa:** La calle pública muestra únicamente lo que inspira y acoge; la logística interna de la iglesia (donación de víveres, inventario de insumos y datos de miembros) reside estrictamente en el Silo del Miembro.
3. **Escala Masiva sin Colapso en Tableta:** Preparación para 15,000 miembros y 1,200 células mediante segmentación por colonias de Durango (*Proximity First*), búsqueda instantánea en cliente (`<10ms`) y carga progresiva por lotes de 6 tarjetas para no saturar la memoria gráfica.
4. **Ergonomía Táctil Apple HIG:** Blancos táctiles con altura mínima de 48px, separación física generosa para evitar toques accidentales y paleta *Earthen Noble* que descansa la vista.
5. **Cero Mockups, Cero Placeholders y Purga Radical de Debris:** Ningún componente simulado; todos los formularios, enlaces de WhatsApp, filtros y fichas son interactivos, fuertemente tipados y respaldados por 162 pruebas automatizadas en verde.

---

## 🧭 2. Arquitectura de Información y Reubicación de Componentes

Para garantizar **cero conceptos huérfanos**, cada elemento auditado tiene un destino natural y coherente:

```mermaid
graph TD
    subgraph "Portal Público (Atrio Ciudadano)"
        P1["Selector de Colonias (Proximidad en 1 Toque)"]
        P2["Buscador en Vivo (<10ms)"]
        P3["Tarjetas de Célula: Solo 1 Botón 'Quiero Conocer'"]
        P4["Botón Directo wa.me (Teléfono Oculto a Scrapers)"]
        P5["Vitrina Testimonial de Servicio Comunitario (Sin listas de insumos)"]
        P6["Pie de Página: Enlace de Cortesía Vecinal Silencioso"]
    end

    subgraph "Silo del Miembro (Vida de la Iglesia)"
        M1["Pestaña 'Servicio Comunitario'"]
        M2["Gestor de Insumos: Café, Tortas, Cobijas, Reforestación"]
        M3["Libro de Voluntarios con Nombres y Contacto"]
        M4["Pase de Conexión (QR) para Miembros y Visitas Confirmadas"]
    end

    subgraph "Mesa Diaconal (DeaconDesk)"
        D1["Fichas Fraternales de 5 Familias"]
        D2["Fecha de Última Visita Presencial ('Los visitaste hace 12 días')"]
        D3["Alerta de Cuidado sin Reproche ('Llamar con cariño a Pedro')"]
        D4["Botón 1-Tap: Saludo de WhatsApp"]
        D5["Botón 1-Tap: Concesión de Descanso Sabático"]
    end
```

---

## 📖 3. Diccionario Canónico de Re-expresión Humana (Filtro Elena Ramos)

Todas las cadenas de texto visibles en la interfaz han sido auditadas y sustituidas según este estándar de claridad familiar:

| Expresión Técnica Anterior (Debris Cognitivo) | Nueva Expresión Humana Serena (Filtro Elena Ramos) | Ubicación / Componente |
| :--- | :--- | :--- |
| *Privacidad Polimórfica Sellada* | **«La dirección de este hogar está cuidada»** | `PublicPortal.tsx` (Ficha de Casa) |
| *Pase Comunitario Autónomo en Navegador* | **«Mi Pase de Bienvenida»** | `MemberSilo.tsx` (Pase QR) |
| *Pacto Litúrgico de Temporada (Obligatorio)* | **«Nuestro compromiso de respeto y cuidado»** | `MemberSilo.tsx` (Pacto) |
| *Ruteo Anti-Colisión y Desanonimización* | **«Cuidado pastoral para evitar incomodidades»** | `PastorHud.tsx` / `ElderDesk.tsx` |
| *Fisión Dunbar de Célula* | **«El grupo creció con amor: preparar la multiplicación»** | `PastorHud.tsx` / `MemberSilo.tsx` |
| *Sincronización WebCal / RFC 5545* | **«Guardar reuniones en el calendario de mi celular»** | `PublicPortal.tsx` / `MemberSilo.tsx` |
| *Concesión de Sabático in situ* | **«Dar descanso a este líder un mes»** | `DeaconDesk.tsx` |
| *Bandeja Diaconal Mancomunada* | **«Células que acompaño en mi colonia»** | `DeaconDesk.tsx` |
| *Atención a Vecinos y Convivencia (Cajón)* | **«¿Eres vecino de alguna reunión? Escríbenos con confianza»** | `PublicPortal.tsx` (Footer) |
| *Aviso LFPDPPP México (Tratado legal)* | **«Tu número solo lo recibe el anfitrión para darte la bienvenida. Jamás compartiremos tus datos con nadie más.»** | `PublicPortal.tsx` (Modal Visita) |

---

## 🎨 4. Especificación Ergonómica Apple HIG & Paleta Earthen Noble

### A. Paleta Earthen Noble (Descanso Visual y Dignidad Natural)
* **Fondo de Lectura:** `#FBF9F5` (pergamino lino cálido, descansa los ojos en tabletas de bajo contraste).
* **Superficie de Tarjetas:** `#FFFFFF` con sombra de elevación natural `0 2px 12px rgba(0,0,0,0.03)` y borde cálido `#EFECE6`.
* **Tipografía:** Pizarra profunda `#262B33` (cero negro puro para evitar fatiga retiniana) combinando **Lora** (títulos humanistas) y **Plus Jakarta Sans** (cuerpo diáfano).
* **Acentos de Acompañamiento:** Barro terracota `#93432F` (acciones primarias cálidas) y Salvia serrana `#435E4B` (confirmaciones y paz).

### B. Geometría Táctil de Pulgar (Tabletas y Móviles)
* **Altura mínima:** `min-height: 48px` en todos los botones, filtros y chips táctiles (`index.css`).
* **Separación de seguridad:** `margin/gap: 12px` mínimo entre controles adyacentes para erradicar pulsaciones dobles o erráticas.
* **Tamaño tipográfico mínimo:** `0.88rem` (14px) en textos auxiliares; nunca menos de 12px en tabletas.

---

## 📋 5. Checklist Exhaustivo de Implementación por Fases

### Fase 1: Tokens de Diseño, Paleta Earthen y Ergonomía Táctil 48px
- [x] Modificar [`frontend/src/index.css`](file:///c:/Users/52331/Documents/Proyectos/portico/frontend/src/index.css) actualizando las variables CSS de paleta:
  - `--bg-primary: #FBF9F5`
  - `--bg-secondary: #FFFFFF`
  - `--text-main: #262B33`
  - `--text-muted: #586171`
  - `--border-subtle: #EFECE6`
  - `--accent-terracotta: #93432F`
  - `--accent-olive: #435E4B`
- [x] Crear la clase utilitaria `.tap-target-48` asegurando `min-height: 48px`, `display: inline-flex`, `align-items: center` y `justify-content: center`.
- [x] Asegurar que todos los filtros de botones y selectores horizontales apliquen `.tap-target-48` con `gap: 12px`.
- [x] Suprimir bordes oscuros duros de 2px; reemplazar por sombras suaves de elevación natural.

### Fase 2: Rediseño del Portal Público (`PublicPortal.tsx`)
- [x] **Puerta Única en Tarjetas (`GOLD-321`):** Retirar el botón secundario *"Pase / QR"* de la tarjeta pública de grupo. Dejar un solo botón principal: `[ Quiero conocer este grupo ]`.
- [x] **Blindaje de Teléfonos y Botón `wa.me` (`GOLD-325`):** Retirar la exposición de números telefónicos en texto plano en la tarjeta pública. Generar el botón `[ Saludar por WhatsApp a {anfitrión} ]` utilizando `https://wa.me/{phone}?text={mensaje_preformateado}` sin exponer la cadena numérica cruda en el DOM indexable.
- [x] **Proximidad Primero y Escala a 15,000 Miembros (`GOLD-324`):**
  - Implementar franja táctil horizontal única con las principales colonias de Durango: `[ Todas ] [ Centro ] [ Lomas ] [ Las Rosas ] [ Fidel Velázquez ] [ Valle del Sur ]`.
  - Limitar el renderizado a un lote inicial de **6 tarjetas** por colonia.
  - Si hay más grupos, mostrar botón sereno: `[ Ver {n} grupos más en esta colonia ]`.
  - Añadir campo de búsqueda instantánea en cliente (`<10ms`) filtrando por nombre de colonia o anfitrión.
- [x] **Vitrina Testimonial de Servicio Comunitario (`GOLD-320`):**
  - Reemplazar el formulario de insumos/donaciones de la página pública por una tarjeta testimonial limpia tipo *Ventana de Servicio*.
  - Mostrar: Título, fecha general y frase inspiracional (*«Sábado de Servicio: Café y Acompañamiento en Hospital 450. Conoce cómo amamos a Durango este domingo»*).
  - Suprimir la lista de tortas, cobijas y nombres de voluntarios de la vista de la calle.
- [x] **Reubicación de Buena Vecindad en Pie de Página (`GOLD-322`):**
  - Retirar el cajón protagónico de quejas al pie del catálogo.
  - Integrar en el pie de página institucional un enlace sobrio de cortesía cívica:  
    *«¿Eres vecino de alguna de nuestras reuniones? Queremos ser una bendición para tu colonia. Si tienes alguna observación sobre estacionamiento o ruido, háznoslo saber con confianza aquí.»*  
  - Al pulsar, abrir el modal de convivencia vecinal.
- [x] **Diseño de Santuario y Micro-copys de Confianza (`GOLD-326`):**
  - En el modal de *Quiero Conocer*, incorporar el micro-copy:  
    *«Tu número solo lo recibe el anfitrión para darte la bienvenida. Jamás compartiremos tus datos con nadie más ni te enviaremos publicidad.»*
  - En la ficha de casa particular, incorporar:  
    *«Cuidamos el hogar de la familia que nos recibe. Al confirmar tu asistencia te enviaremos la ubicación exacta por WhatsApp.»*
- [x] **Silencio Total de Marca (`GOLD-328`):** Verificar que la página pública no contenga tablas de precios, anuncios de venta de software ni propuestas de ahorro comercial.

### Fase 3: Logística de Insumos Comunitarios en el Silo del Miembro (`MemberSilo.tsx`)
- [x] Incorporar en `MemberSilo.tsx` la pestaña o sección *"Vida de la Iglesia"* / *"Servicio Comunitario"*.
- [x] Alojar allí el gestor completo de insumos (`CommunityInitiativesHub.tsx`) con la lista interactiva de donaciones (termos de café, tortas, cobijas, árboles) y el padrón de voluntarios para discípulos autenticados.
- [x] Mantener en el Silo del Miembro la generación y visualización del *Pase de Conexión QR* para miembros regulares y visitas con confirmación.

### Fase 4: Consola Humana Diaconal (`DeaconDesk.tsx`)
- [x] **Fichas Fraternales de 5 Familias (`GOLD-329`):** Reestructurar la vista diaconal para que cada célula se presente como una tarjeta de acompañamiento familiar:
  - Nombre del grupo y monograma cálido de los facilitadores (*Pedro y Martha*).
  - Indicador de última visita presencial: *«Los visitaste hace {n} días»*.
  - Alerta fraterna no punitiva si llevan 3 semanas consecutivas con ausencias: *«Sugerencia de cuidado: Llamar con cariño a Pedro»*.
  - Botón táctil directo: `[ Saludar por WhatsApp ]`.
  - Botón táctil directo: `[ Dar descanso sabático a esta célula ]` (concesión en 1-clic).
- [x] Eliminar cualquier término que sugiera tickets de soporte, SLAs o fiscalización corporativa.

### Fase 5: Purga Radical de Debris y Filtro «Elena Ramos» (`GOLD-323`)
- [x] Auditar todos los componentes del frontend para sustituir términos intimidantes según el *Diccionario Canónico de Re-expresión Humana* (Sección 3).
- [x] Verificar que no existan etiquetas de tickets (`GOLD-XXX`) en texto visible de la interfaz.
- [x] Verificar que no exista ninguna referencia a "SQLite" en la interfaz de usuario.
- [x] Ejecutar [`tools/clean_debris.ps1`](file:///c:/Users/52331/Documents/Proyectos/portico/tools/clean_debris.ps1) certificando la frontera hermética del repositorio.

### Fase 6: Suite de Testing Automatizado (`frontend/test/ciclo12_ergonomia_apple_elena.test.mjs`)
- [x] Crear el archivo de pruebas `frontend/test/ciclo12_ergonomia_apple_elena.test.mjs` cubriendo las 10 decisiones canónicas:
  - **Test 1 (`GOLD-320`):** `PublicPortal.tsx` no renderiza listas de insumos de víveres ni voluntarios en la calle abierta; `MemberSilo.tsx` contiene el gestor logístico.
  - **Test 2 (`GOLD-321`):** `PublicPortal.tsx` no contiene botones "Pase / QR" en las tarjetas de células no confirmadas.
  - **Test 3 (`GOLD-322`):** La atención vecinal reside en el pie de página como enlace cívico respetuoso y no como módulo protagónico invasivo.
  - **Test 4 (`GOLD-323`):** Cero términos intimidantes ("Fisión Dunbar", "Polimórfica", "LFPDPPP") en la interfaz de usuario de Elena.
  - **Test 5 (`GOLD-324`):** El catálogo público implementa selector de colonias de Durango y limita la carga a lotes de 6 tarjetas.
  - **Test 6 (`GOLD-325`):** Los números de teléfono de líderes no se imprimen como cadenas de texto crudas en el DOM público; se usan botones de WhatsApp seguros.
  - **Test 7 (`GOLD-326`):** Presencia de micro-copys de confianza y santuario en los modales de contacto.
  - **Test 8 (`GOLD-327`):** `index.css` define `min-height: 48px` y la paleta Earthen Noble (`#FBF9F5`, `#93432F`, `#262B33`).
  - **Test 9 (`GOLD-328`):** El portal público está 100% libre de tablas de precios o marketing de venta de software.
  - **Test 10 (`GOLD-329`):** `DeaconDesk.tsx` renderiza tarjetas de acompañamiento familiar con última visita presencial y descanso sabático.
- [x] Ejecutar `npm test` en `frontend/`: **162 de 162 tests pasando al 100% en verde** a través de 96 suites.
- [x] Ejecutar `npm run build`: compilación de producción exitosa con 0 errores TypeScript y 0 advertencias críticas.

### Fase 7: Sincronización de Documentación Oficial y Respaldo Git
- [x] Actualizar [`README.md`](file:///c:/Users/52331/Documents/Proyectos/portico/README.md) documentando el Ciclo 12 (`GOLD-320` a `GOLD-329`), la filosofía Elena Ramos y la ergonomía Apple HIG.
- [x] Actualizar [`DEPLOYMENT_GUIDE.md`](file:///c:/Users/52331/Documents/Proyectos/portico/DEPLOYMENT_GUIDE.md) reflejando las métricas de prueba actualizadas (162 tests frontend, 46 backend).
- [x] Actualizar [`ideas/00-Indice.md`](file:///c:/Users/52331/Documents/Proyectos/portico/ideas/00-Indice.md) registrando este Plan 20 como completado tras su ejecución.
- [x] Regenerar capturas con `tools/capturar_pantallas.ps1` y compilar el nuevo PDF del Dossier Pastoral con `tools/generar_dossier.ps1`.
- [x] Ejecutar `git commit` y `git push` al repositorio privado `memoestefani/portico` en GitHub.

---

## 🔒 6. Certificación Canónica de Ejecución
> **CERTIFICACIÓN:** Todas las 10 decisiones canónicas ratificadas (`GOLD-320` a `GOLD-329`) han sido implementadas sin placeholders ni mockups. La suite de pruebas está al 100% verde (162/162) y la frontera hermética del repositorio ha sido purgada de cualquier residuo técnico.

