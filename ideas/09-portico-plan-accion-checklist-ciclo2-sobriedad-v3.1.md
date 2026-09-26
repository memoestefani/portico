# 📋 Pórtico OS v3.1 — Plan de Acción Canónico y Checklist de Implementación (Ciclo 2)
## Refinamiento Ergonómico, Purga de Debris y Jargon, Calendario Cristiano y Sobriedad Visual
### Basado en las 10 Decisiones Canónicas (1-C a 10-C), Benchmarks de GitHub (GOLD-230 a GOLD-239) y Auditoría Forense Post-Impl```yaml
version: 3.1.2-action-plan-cycle-2
document_id: PORTICO-09-ACTION-PLAN-CYCLE-2
date: 2026-09-25
status: COMPLETED_100_PERCENT_VERIFIED
code_freeze_active: false
canonical_dossier: DOSSIER-067 (research)
canonical_registry: ADOPTED_REGISTRY.md (GOLD-230 a GOLD-239)
directives_incorporated:
  plain_language_audit: "Erradicación total de jargon religioso, poético o publicitario. Vocabulario directo de preparatoria (Decisión 2-C)"
  christian_calendar_model: "Cálculo semanal cristiano con Domingo como Día 1 (weekStartsOn: 0) y normalización ortográfica (Decisión 4-C)"
  childish_emoji_eradication: "Supresión de emojis de juguete/caricatura (💍, 🔥, 🏡, 🌸, ⚓, 🌮, ⛩️) sustituidos por geometría sobria Lucide (Decisión 6-C)"
  hardware_triada_protection:
    1_apple_iphone: "Eliminación de scrollbars grises nativos, safe areas y viewport dinámico 100dvh"
    2_tabletas_sin_laptop: "Master-Detail split, soporte de impresión formal @media print para ancianos y pastores"
    3_android_gama_baja_prepago: "Colapso a 1 columna en <900px (360-390px), conmutador solar manual directo y cero blur"
verification_gates:
  debris_purged: true
  zero_mockups_zero_placeholders: true
  automated_test_suite_coverage: "Rust 20/20 Backend Tests + Frontend 7/7 Tests + Vite Build 0 Warnings + Subagent Visual Proof"
  documentation_synchronization_mandate: true
```

---

## 🏛️ 1. Declaración de Principios del Ciclo 2

1. **Principio de la Palabra Exacta (Lenguaje de Preparatoria):**
   El software eclesial no debe ser poético ni persuasivo. No intenta vender una experiencia ni recurre a metáforas místicas. Las palabras significan exactamente lo que significan (*"Modo Claro"*, *"Modo Oscuro"*, *"Asistencia"*, *"Reunión"*, *"Grupos"*). La interfaz es un instrumento de servicio honesto, sereno y transparente.
2. **Principio de Identidad Histórica Cristiana:**
   El calendario de la iglesia parte de la Resurrección del Señor: el **Domingo es el primer día de la semana (Día 1)**. El sistema respeta este orden litúrgico e histórico (*Génesis 1, Hechos 20:7, 1 Corintios 16:2*), corrigiendo además cualquier deformación ortográfica en español (*Martes, Miércoles, Jueves*).
3. **Principio de Seriedad Visual (Cero Caricaturas):**
   La comunión fraternal entre adultos, ancianos y jóvenes es una realidad digna y solemne. Se erradicaron todos los emojis infantiles de juguete (`💍`, `🔥`, `🏡`, `🌸`, `⚓`, `🌮`, `⛩️`) en favor de una tipografía editorial sobria y una geometría vectorial limpia con trazos uniformes de 1.5px.
4. **Principio de No Deformación en Pantallas Angostas:**
   En teléfonos de 360px a 390px de ancho (la realidad de decenas de millones de usuarios en México), el layout colapsa ordenadamente a una sola columna vertical elegante donde ningún texto se quiebra ni se trunca.

---

## 🧹 2. Inventario Forense de Purga de Debris y Código Muerto

- [x] **Purga de Layout Rígido en Silo del Miembro:** Erradicado el estilo en línea `gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)'` en `MemberSilo.tsx`, reemplazado por la clase responsive `.silo-layout-grid` que colapsa limpiamente a 1 columna en viewports $< 900\text{px}$.
- [x] **Purga de Lenguaje Poético / Jargon Religioso:**
  - Sustituido *"Luz de Atrio"* por **`Modo Claro`**.
  - Sustituido *"Noche de Vigilia"* por **`Modo Oscuro`**.
  - Sustituido *"Santuario / Catedral"* por **`Iglesia / Congregación`**.
  - Sustituido *"Living Gathering Pass"* en UI por **`Pase de Reunión Semanal`**.
  - Sustituido *"Silo Cifrado y Aislado"* por **`Tu Información Privada (Cifrado Local)`**.
- [x] **Purga de Emojis Infantiles:** Eliminados emojis de juguete (`💍`, `🔥`, `🏡`, `🌸`, `⚓`, `🌮`, `⛩️`, `⏱️`) en `PublicPortal.tsx`, `MemberSilo.tsx`, `RoleSwitcher.tsx` y `PastorHud.tsx`.
- [x] **Purga de Scrollbars Nativas Grises en Móvil:** Inyectadas reglas `scrollbar-width: none` y `::-webkit-scrollbar { display: none }` en la barra de navegación de roles de `RoleSwitcher.tsx`.
- [x] **Purga del Bug de Pluralización Ortográfica:** Erradicada la concatenación espuria de `s` en `PublicPortal.tsx` (`"Martess"`, `"Miércoless"`), centralizada en `src/utils.ts`.
- [x] **Cero Placeholders y Mockups:** Toda nueva función (micro-RSVP de asistencia, selector de campus, conmutador de tema, botón WhatsApp directo) enlazada a estados reactivos tipados y verificada de extremo a extremo.

---

## 📋 3. Checklist Detallado de Implementación por Fases (Ciclo 2)

---

### [x] Fase 1: Tokens de Diseño, Purga de Jargon y Estilos de Impresión (@media print)
- [x] **Tokens de Diseño en `src/index.css`:**
  - [x] Renombradas variables y comentarios eliminando jargon lírico (*Luz de Atrio / Noche de Vigilia* a *Modo Claro / Modo Oscuro*).
  - [x] Añadido token de pozo de entrada físico Apple: `--shadow-inset-input: inset 0 1px 2px rgba(0, 0, 0, 0.06)` (en claro) y `rgba(0, 0, 0, 0.3)` (en oscuro) (`GOLD-238`).
  - [x] Añadido token de curva de resorte natural Apple: `--ease-apple: cubic-bezier(0.16, 1, 0.3, 1)` y regla táctil de compresión `active: transform: scale(0.98)` para botones y píldoras.
- [x] **Clases de Layout Responsive:**
  - [x] Definida clase `.silo-layout-grid`: `display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 28px;`.
  - [x] Inyectada media query `@media (max-width: 900px)` con `grid-template-columns: 1fr; gap: 20px;` para colapso vertical completo en móvil (`GOLD-230`).
- [x] **Utilidad de Supresión de Scrollbar:**
  - [x] Definida clase `.hide-scrollbar` con `scrollbar-width: none; -ms-overflow-style: none;` y `::-webkit-scrollbar { display: none; }` (`GOLD-232`).
- [x] **Hoja de Estilos de Impresión Formal (@media print):**
  - [x] Definido bloque `@media print` en `src/index.css` (`GOLD-236`):
    - Oculta navegación, barra de roles, botones interactivos (`.btn-primary`, `.btn-secondary`), switchers y modales con `display: none !important`.
    - Configurado fondo blanco puro `#FFFFFF`, texto `#000000` y tamaño de fuente tipográfica formal de 11pt.
    - Aplicado `break-inside: avoid !important; box-shadow: none !important; border: 1pt solid #D0D0D0 !important;` en tarjetas de células y filas de reporte.
    - Habilitada cabecera de folio formal pastoral con fecha formal y nombre del campus.

---

### [x] Fase 2: Cabecera Fraternal, Conmutador de Modo Solar y Purga Visual
- [x] **Actualización de `src/components/RoleSwitcher.tsx`:**
  - [x] Reemplazado el emoji `⛩️` del logotipo por un icono sobrio vectorial de Lucide (`Church`).
  - [x] Añadido botón accesible de conmutación manual de tema: `[ ☀️ Modo Claro / 🌙 Modo Oscuro ]` (`GOLD-231`).
  - [x] Implementada la persistencia de tema en `localStorage.getItem('portico_theme')` y aplicación reactiva en `document.documentElement.setAttribute('data-theme', theme)`.
  - [x] Aplicada la clase `.hide-scrollbar` al contenedor `<nav>` para eliminar la barra gris nativa en pantallas de 375px (`GOLD-232`).
  - [x] Auditados textos de cabecera: reemplazado `"Silo Cifrado y Aislado"` por `"Tu Información Privada (Cifrado Local)"`.

---

### [x] Fase 3: Catálogo Público, Calendario Cristiano y Visita Inmediata WhatsApp
- [x] **Actualización de `src/components/PublicPortal.tsx`:**
  - [x] **Calendario Cristiano (Domingo Día 1):** Configurado el orden de días iniciando en **Domingo** (`weekStartsOn: 0`, `GOLD-233`):
    `['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']`.
  - [x] **Función Normalizadora Ortográfica:** Implementado `formatDayOfWeek(day)` en `src/utils.ts` para erradicar las palabras mal formadas (`Martess`, `Miércoless`, `Juevess`).
  - [x] **Erradicación de Emojis Infantiles:** Reemplazados `💍 Matrimonios`, `🔥 Jóvenes`, `🏡 Familias`, `🌸 Mujeres`, `⚓ Hombres` por texto limpio con tipografía noble o iconos sobrios de Lucide (`Users`, `Heart`, `Sparkles`, `Home`).
  - [x] **Selector Multisede de Campus Condicional (`GOLD-239`):**
    - Si `campuses.length <= 1`: mostrar insignia estática sobria.
    - Si `campuses.length >= 2`: desplegar barra de píldoras táctiles horizontales directas en el encabezado para alternar entre sedes en 1 toque.
  - [x] **Dual-Channel Handoff Inmediato en Modal de Solicitud de Visita (`GOLD-234`):**
    - Tras confirmar la solicitud de visita, además del registro en base de datos, desplegar botón primario: `[ 💬 Escribir al Líder en WhatsApp Ahora ]` con deep-link a `https://wa.me/...` con mensaje de bienvenida precargado.

---

### [x] Fase 4: Silo del Miembro con Layout Responsive y Micro-RSVP de Asistencia
- [x] **Actualización de `src/components/MemberSilo.tsx`:**
  - [x] Sustituido el `style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}` por la clase responsive `.silo-layout-grid` (`GOLD-230`).
  - [x] **Pase de Reunión Semanal (Hero Card):**
    - Erradicados emojis infantiles del encabezado y notas.
    - Integrado **Micro-RSVP de Asistencia Silenciosa** (`GOLD-235`):
      - Píldoras táctiles de 1 toque: `[ Asistiré ]` / `[ No podré ]`.
      - Contador anónimo agregado para el anfitrión: *"~11 personas confirmadas para este jueves"*, sin exhibir listas nominales inquisitivas.
  - [x] Auditados textos del silo: vocabulario directo de preparatoria sin florituras.
  - [x] Verificado que en pantallas de 375px el Pase ocupe el 100% y el Directorio quede abajo sin quiebres de texto.

---

### [x] Fase 5: HUD Pastoral con Folio de Impresión y Selector de Campus
- [x] **Actualización de `src/components/PastorHud.tsx`:**
  - [x] Integrado el selector multisede condicional en cabecera si `campuses.length >= 2` (`GOLD-239`).
  - [x] Añadido botón de acción rápida `[ 🖨️ Imprimir Folio Pastoral ]` que dispare `window.print()` con las reglas `@media print` de `GOLD-236`.
  - [x] Auditados textos de supervisión pastoral para asegurar vocabulario funcional y sobrio.

---

### [x] Fase 6: Transparencia Offline y Detección de Red
- [x] **Actualización de `src/App.tsx`:**
  - [x] Integrado hook de conectividad reactiva escuchando eventos `online` y `offline` de `window` (`GOLD-237`).
  - [x] Cuando `!navigator.onLine`, desplegar cintillo superior sutil y no invasivo:
    `[ 📡 Modo sin conexión · Mostrando última reunión guardada de tu grupo ]`.
  - [x] Cero bloqueo de navegación; garantizar lectura instantánea desde la caché local.

---

### [x] Fase 7: Estrategia de Testing Integral y Validación Multidispositivo
- [x] **Validación Estática de Frontend:**
  - [x] Ejecutado `tsc -b && vite build` en `2_portico/frontend`. Confirmado 0 errores de TypeScript y 0 advertencias de bundling.
- [x] **Validación de Tests Unitarios Frontend:**
  - [x] Ejecutado `npm test` (`node --test test/*.test.mjs`). 7/7 tests pasan al 100% verificando calendario cristiano, plurales, sobriedad y estados de RSVP.
- [x] **Validación del Backend en Rust:**
  - [x] Ejecutado `cargo test` en `2_portico/backend`. Confirmado que los **20/20 tests** (unitarios y de integración) continúan pasando en verde al 100%.
- [x] **Auditoría Visual Táctil en Browser Subagent:**
  - [x] Desplegado subagente en resolución móvil (375x812), tableta (768x1024) y escritorio (1280x800).
  - [x] Capturado y verificado:
    1. Layout móvil de 1 columna en Silo del Miembro (verificado que no hay texto quebrado en vertical).
    2. Conmutador de Modo Claro / Modo Oscuro funcionando y persistiendo.
    3. Catálogo público con orden de días iniciando en Domingo y ortografía correcta (*Martes, Miércoles*).
    4. Cero emojis infantiles en toda la interfaz.
    5. Modal de solicitud de visita con botón directo a WhatsApp.
    6. Micro-RSVP de asistencia funcionando en la tarjeta del pase.
    7. Vista previa de impresión (`@media print`) limpia sin botones ni desorden web.

---

### [x] Fase 8: Sincronización Mandatoria de Documentación Canónica
- [x] **Actualizar PRD Canónico `01-portico-producto-mvp-v3.0.md`:** Incorporar la Sección 18 documentando las Decisiones del Ciclo 2 (`GOLD-230` a `GOLD-239`), la sobriedad del lenguaje y el calendario cristiano con Domingo como Día 1.
- [x] **Actualizar Checklist Canónico:** Marcar al 100% este documento `09-portico-plan-accion-checklist-ciclo2-sobriedad-v3.1.md`.

---

## 🏁 4. Estado de Conclusión y Verificación

> **ESTADO DE EJECUCIÓN: COMPLETADO AL 100% Y VERIFICADO.**  
> Todas las 10 decisiones de Ciclo 2 han sido implementadas, probadas con 20/20 tests en Rust, 7/7 tests unitarios en frontend, 0 advertencias de compilación y validadas visualmente con subagente de navegador en móvil, tableta y escritorio.
