# Pórtico OS v3.6 — Plataforma Soberana para Grupos Pequeños & Redes Multi-Campus

**Pórtico OS** es una plataforma de software eclesial soberano diseñada para gobernar la transición crítica de comunidades locales de 300 miembros hasta redes multi-campus de **25,000 miembros**, fundada sobre primeros principios eclesiológicos neotestamentarios, antropológicos (Límites de Dunbar, Sociología del Tercer Lugar de Oldenburg) y de estricta soberanía y privacidad legal (LFPDPPP México).

---

## 🏛️ Arquitectura del Sistema

El sistema implementa una arquitectura desacoplada de alto rendimiento y cero costo base:
- **Backend Soberano (Rust / Axum):** Ubicado en `backend/crates/portico-server` y `backend/crates/portico-core`. Aislamiento físico estricto *Database-per-Tenant* utilizando motores embebidos SQLite/libSQL en el Edge (`tenants/<slug>.db`), garantizando cero mezcla de datos entre iglesias sin costo de infraestructura en reposo.
- **Frontend Grado Apple (React 19 / TypeScript / Vite / Vanilla CSS):** Ubicado en `frontend/src/`. Diseño editorial sobrio, paleta *Atrio y Hogar*, tipografía legible, navegación fluida de 6 superficies activas: **Pórtico Público**, **Silo del Miembro**, **Mesa Diaconal (`DeaconDesk`)**, **Mesa Presbiteral (`ElderDesk`)**, **HUD Pastoral (`PastorHud`)** y **Consola de Operador HQ (`OperatorHq`)**.

---

## 🛡️ Las Decisiones Canónicas Preventivas (Ciclos 3 al 9: GOLD-240 a GOLD-306)

Adoptadas del universo de investigación de GitHub (`DOSSIER-068` al `DOSSIER-073` / `research`):

### Ciclo 3 — Blindaje Canónico Comunitario (GOLD-240 a GOLD-249)
1. **1-C (`GOLD-240`) — Protección Anti-Cisma y Blindaje de Contactos:** Visibilidad de contactos delimitada a la temporada activa; descarga masiva en CSV/Excel bloqueada con `403 Forbidden` para líderes laicos.
2. **2-C (`GOLD-241`) — Intercesión Estructurada sin Difamación (LFPDPPP):** Peticiones de oración clasificadas en categorías cerradas (`salud`, `trabajo`, `familia`, `gratitud`, `direccion`) con cero texto libre que propicie chisme.
3. **3-C (`GOLD-242`) — Escalación Rápida de Salvaguarda Pastoral:** Botón silencioso de alerta de crisis (`high` / `critical`) con guía de 3 pasos de Primeros Auxilios Emocionales y bandeja de triaje confidencial en el HUD pastoral.
4. **4-C (`GOLD-243`) — Micro-RSVP con Bloqueo de Alimentos (Catering Lock):** Confirmación binaria de asistencia en 1 tap con cerrojo temporal (`rsvp_cutoff_hours`) para evitar desperdicio de comida o desabasto al anfitrión.
5. **5-C (`GOLD-244`) — Pacto Comunitario de Temporada en 1 Tap:** Compromiso formal obligatorio que incluye la promesa explícita de **escucha atenta y consideración mutua**, confidencialidad total, prohibición de ventas multinivel (No MLM) y cero préstamos de dinero entre miembros.
6. **6-C (`GOLD-245`) — Protocolo Litúrgico de Facilitación en 4 Momentos:** Guía libre para reuniones (Acción de gracias, Lectura bíblica, Oración mutua, Compartir alimentos) + temporizador interactivo de 5 minutos para dinámicas en parejas (*Pair-Share*).
7. **7-C (`GOLD-246`) — Ruteo Preventivo Anti-Colisión:** Tabla relacional encriptada `restricted_pairing` que separa discretamente números en conflicto (exparejas, querellas) reubicándolos en grupos alternos sin exponer el motivo.
8. **8-C (`GOLD-247`) — Protocolo de Acera en WhatsApp:** Enlace directo con mensaje preformateado que solicita al líder o anfitrión salir a recibir al visitante a la banqueta para abatir la *ansiedad de umbral*.
9. **9-C (`GOLD-248`) — Estructura Triádica de Liderazgo Laico:** Desacople en modelo de datos y UI entre tres carismas complementarios: Facilitador, Anfitrión y Aprendiz (anti-burnout).
10. **10-C (`GOLD-249`) — Adaptación y Espacio para Niños:** Etiquetado explícito de hospitalidad hacia la niñez (`kids_welcome`, `kids_space_type`) con filtro reactivo en el catálogo público.

### Ciclo 4 — Gobernanza Teocéntrica, White-Labeling Noble e Itinerarios Nómadas (GOLD-250 a GOLD-261)
11. **11-C (`GOLD-250`) — Despacho Universal de Resumen de Anfitrión:** Desacoplamiento de WhatsApp mediante Web Share API nativa y fallback automático a portapapeles con confirmación háptica.
12. **12-C (`GOLD-251`) — Pase Comunitario Autónomo en Navegador:** Renderizado vectorial QR SVG sin apps externas, botón Canvas PNG de descarga, vista de impresión y persistencia local sin conexión.
13. **13-C (`GOLD-252`) — Asistencia Cualitativa en Gracia:** Bandas amables de asistencia (`1-5`, `6-10`, `11-15`, `15+`) y pulso de reunión, sin tarjetas de sugerencia algorítmica ni paternalismo.
14. **14-C (`GOLD-253`) — Cero Secretos en Base de Datos:** Cero notas confidenciales o secretos en BD; motivos comunitarios públicos de intercesión y consejería delicada 100% en persona o mensajería 1:1.
15. **15-C (`GOLD-254`) — Gobernanza Teocéntrica con Veto y Disciplina:** Omnisciencia y facultad exclusiva del Lead Pastor para vetar decisiones o aplicar disciplina fraternal, junto con gestión pastoral de facilitadores (reasignación de campus/célula y estatus activo/sabático/tutoría).
16. **16-C (`GOLD-255` & `GOLD-257`) — White-Labeling Noble y Monograma Oficial:** Logotipo SVG monograma oficial de Amor y Gracia, 6 paletas cromáticas nobles matemáticas WCAG AAA y motor dinámico de nomenclatura eclesial.
17. **17-C (`GOLD-256`) — Rol Board Auditor Zero-PII y Transmisión Pastoral:** Certificación de cero datos PII para la Mesa Directiva y despacho unidireccional de comunicados solemnes a todos los facilitadores.
18. **18-C (`GOLD-258`) — Hospitalidad No Excluyente y Tipos de Enfoque:** Grupos por interés en común (viajeros, café) y formativos (Alfa para nuevos creyentes, Mayordomía Cristiana) sin estatus elitista; desaliento explícito a la discriminación en grupos matrimoniales y etiquetas orientativas de género sin bloqueos técnicos.
19. **19-C (`GOLD-259`) — Monogramas Algorítmicos Deterministas:** Generación de 2 iniciales mayúsculas en <0.02ms mediante DJB2 hash mapeado a las 6 paletas nobles, a costo $0 y sin almacenar fotos.
20. **20-C (`GOLD-260` & `GOLD-260b`) — Sincronización Móvil al Calendario Nativo:** Suscripción dinámica auto-actualizable `webcal://` (RFC 5545) que actualiza el celular ante rotaciones de sede, y descarga individual de archivo `.ics`.
21. **21-C (`GOLD-261`) — Itinerarios Nómadas con Casas Rotativas por Diseño:** Rotación semanal de hogares con anfitriones y teléfonos protegidos por privacidad polimórfica, sedes públicas (taquerías/cafés) y tolerancia a afluencia de 30+ personas.

### Ciclo 5 — Escala a 5,000 Miembros, Diaconado, Discipulado y Difusión Social (GOLD-262 a GOLD-272)
22. **22-C (`GOLD-262`) — Pipeline de Discipulado Práctico en el Hogar:** Progresión de tres etapas (Observador -> Co-facilitador -> Listo para Envío) con emisión de endoso pastoral en la semana 10 mediante 1 toque en el Silo.
23. **23-C (`GOLD-263`) — Estructura Diaconal de Acompañamiento Fraternal (Cero Verticalidad):** Erradicación absoluta del término corporativo "coach". Adopción del ministerio bíblico de Diáconos (1 Timoteo 3) al servicio de franjas de 5 a 7 células, con consola sobria `DeaconDesk` y registro de acompañamiento personal.
24. **24-C (`GOLD-264`) — Cierre Fraternal de Temporada:** Acuerdo voluntario en ambiente festivo de gratitud al finalizar la temporada (`continue_same`, `multiply_with_disciple`, `sabbatical_rest`), desterrando rupturas intempestivas a mitad de ciclo.
25. **25-C (`GOLD-265`) — Activación de Veteranos en Ministerios Activos de Servicio:** Rechazo tajante a la "paternidad espiritual" unigénita (Mateo 23:9). Canalización del corazón pastoral hacia áreas reales de servicio: Atrio dominical, Intercesión, Logística y Asesoría de anfitriones.
26. **26-C (`GOLD-266`) — Onboarding Seguro en Sede Dominical (El Primer Día de la Semana):** Punto de conexión en el Atrio del templo como primer entorno seguro y presencial de saludo cara a cara antes o además de acudir a una casa particular.
27. **27-C (`GOLD-267`) — Macro-Zonificación Ligera Sin Deuda GIS:** División metropolitana en 5 macro-zonas amplias para Durango e insignia declarativa `[Transporte Accesible / Carpool]` con cero peso cartográfico o dependencias GPS.
28. **28-C (`GOLD-268` & `GOLD-270`) — Flexibilidad Cristocéntrica y Canal Conciliar Mateo 18:** Jesús es el centro en cualquier sede o actividad. Canal sobrio y confidencial para que los miembros reporten desviaciones atendidas en persona por el Diácono y el Pastor (cero chismes en BD).
29. **29-C (`GOLD-269`) — Temporadas de Duración Configurable:** Duración estacional parametrizable por el Lead Pastor (8 a 16 semanas, default 10-12), con cálculo dinámico de itinerario y reactivación autónoma por facilitador.
30. **30-C (`GOLD-271`) — Sobriedad Absoluta en Monitoreo de Asistencia:** Registro de afluencia en rangos comunitarios en gracia, con cero pases de lista punitivos o fiscalización policial de inasistencias.
31. **31-C (`GOLD-272`) — Difusión Social Elegante y Open Graph Cards:** Tarjetas visuales nobles con monograma oficial, botón de compartir en WhatsApp / redes sociales y previsualizaciones HTML/SVG dinámicas para bots y crawlers.

### Ciclo 6 — Escala a 25,000 Miembros, Multi-Campus y Presbiterio (GOLD-273 a GOLD-279)
32. **32-C (`GOLD-273`) — Directiva de Escala a 25,000 y Toggles Institucionales de Crecimiento:** Directiva pastoral de crecimiento institucional para Durango (800k hab, 3.125% de saturación, ~2,270 células). Toggles activables por el Lead Pastor en la configuración (`enable_deacon_system`, `enable_eldership_system`, `growth_target_members`).
33. **33-C (`GOLD-274`) — Modelo Multi-Campus Territorial de 5 Macro-Sedes:** Catálogo de 5 macro-campus en Durango (Centro Histórico, Durango Norte, Durango Sur, Poniente Las Rosas y Oriente Fidel Velázquez) con aforos de 1,800 a 3,500 personas por servicio. Matriz de sedes híbridas (`private_home`, `campus_room`, `civic_cafe`, `public_park`).
34. **34-C (`GOLD-275`) — Radar de Fatiga del Anfitrión y Sabático Sagrado Rotativo:** Monitoreo preventivo del desgaste de hogares. Concesión formal de sabático de 1 temporada tras 2-3 temporadas consecutivas de hospitalidad para preservar la paz familiar.
35. **35-C (`GOLD-276`) — Descentralización Presbiteral y Proporción 10-12 Diáconos por Anciano:** Descentralización colegiada en 5 Consejos Presbiterales (`EldershipCouncil`) de 3-5 ancianos por macro-zona. Superficie `ElderDesk` para que cada presbítero acompañe a una mesa de 10-12 diáconos con triaje conjunto de desviaciones.
36. **36-C (`GOLD-277`) — Arquitectura Litúrgica Curada y Orden de Guardianes Eméritos:** Currículo litúrgico semanal unificado en video con pasaje de Escritura, dinámica de 5 minutos en parejas (*Pair-Share*) y temporizador. Orden de Guardianes Eméritos para comisionar formalmente el legado y consejo de miembros fundadores y veteranos sin fatiga operativa.
37. **37-C (`GOLD-278`) — Mesa Cívica de Buena Vecindad y Gestión Ágil de Fricciones Urbanas:** Buzón vecinal abierto para presidentes de colonia y colonos de Durango con SLA de resolución < 72h. Distintivos de confianza `[ 🤝 Buena Vecindad ]` y `[ 🛡️ Ventana Abierta ]` en comunidades y campus.
38. **38-C (`GOLD-279`) — Fisión Celular por Umbral de Dunbar con Núcleo Semilla:** Detección de saturación celular ($N \ge 14\text{–}20$ personas). Proceso de fisión fraterna mediante envío del aprendiz facilitador acompañado de un núcleo semilla voluntario de 3-4 miembros, conservando el linaje de célula madre (`parent_group_id`).

### Ciclo 7 — Ergonomía Grado Apple, Lenguaje Humano y Atmósfera Earthen (GOLD-280 a GOLD-286)
39. **39-C (`GOLD-280`) — Lenguaje Claro ISO 24495-1 (La Prueba de Elena Ramos):** Mapeo de términos de ingeniería a español cálido y comprensible (Fernández-Huerta > 70).
40. **40-C (`GOLD-281`) — Progressive Disclosure y Tríada de Reunión en Vista de Líder:** Despliegue prioritario de los 3 momentos clave (RSVP, Guía y Asistencia) y confinamiento de herramientas secundarias al Drawer inferior.
41. **41-C (`GOLD-282`) — Confinamiento Estacional Oportuno de Fisión Dunbar y Sabáticos:** Ocultamiento de acciones complejas durante la temporada ordinaria; activación exclusiva en el Cierre de Temporada (semana 12+).
42. **42-C (`GOLD-283`) — Compuerta de Bienvenida Dual-Track:** Filtro claro entre Sedes Dominicales (templo/atrio) y Sedes Entre Semana (casas vecinales).
43. **43-C (`GOLD-284`) — Atmósfera Orgánica Earthen y Geometría Táctil Ergonómica:** Paleta de tonos cálidos inspirados en cantera, lino y oliva, y tap targets mínimos de 44px-48px.
44. **44-C (`GOLD-285`) — Descompresión Visual en Mesas Diaconal y Presbiteral (Clean Desk):** Descompresión de paneles con botón contextual [ ℹ️ ] y humanización de tiempos a "Atención amorosa (< 3 días)".
45. **45-C (`GOLD-286`) — Silencio Técnico Total y Calma Soberana:** Erradicación del 100% de propaganda SaaS o widgets comerciales en la experiencia de usuario.

### Ciclo 8 — Interfaz Invisible, Calma Pastoral y Gobernanza Distribuida (GOLD-287 a GOLD-296)
46. **46-C (`GOLD-287`) — Purga Absoluta de Residuos Técnicos (Debris Purge):** Cero etiquetas `GOLD-XXX` en JSX o strings, cero menciones técnicas a `SQLite` en componentes de usuario, y supresión de cuotas demográficas artificiales de 25,000 miembros.
47. **47-C (`GOLD-288`) — Silencio Total de Marca de Software:** Desaparición del nombre del software en barras superiores, títulos y pies de página; único botón umbral `"Pórtico Público"`, con primacía de la identidad congregacional local ("Amor y Gracia Durango").
48. **48-C (`GOLD-289`) — Ergonomía Móvil Apple con Barra Inferior de Pulgar:** Barra de navegación fija en el borde inferior (`fixed bottom-0 md:hidden`) con tap targets ergonómicos $\ge 48$px accesibles a una sola mano.
49. **49-C (`GOLD-290`) — Sedes Híbridas sin Emoticones Infantiles:** Tipificación sobria de sedes (hogar, salón de campus, cafetería o parque) con badges y chips de texto neutros.
50. **50-C (`GOLD-291`) — Selector Territorial Único Horizontal:** Fusión de filtros apilados en una sola fila táctil compacta horizontal, ahorrando >200px de scroll vertical en pantallas móviles.
51: **51-C (`GOLD-292`) — Humanización Mateo 18:** Lenguaje restaurativo de confianza y acompañamiento ("Observación Pastoral al Diácono"), desterrando cualquier tono penal o policial.
52: **52-C (`GOLD-293`) — Progressive Disclosure en HUD Pastoral:** Reestructuración en 5 vistas serenas (*Comunidades*, *Salud y Sabáticos*, *Diaconado*, *Consejo de Ancianos y Consejería*, *Distribución Territorial*) para escala orgánica de 100 a 10,000 discípulos.
53: **53-C (`GOLD-294` a `GOLD-296`) — Gobernanza Distribuida de Consejería y Veto Pastoral:**
   * **Ancianos (`ElderDesk`):** Brindan consejería pastoral y gestionan directamente los ruteos anti-colisión de su sector en `/api/elder/restricted-pairings`, supervisando a 10-12 diáconos y honrando a los Servidores Veteranos.
   * **Pastor Josh Gayosso (`PastorHud`):** Vista consolidada de toda la red, con facultad activa de ratificación y **derecho a veto pastoral** (`handleVetoPairing`) para levantar restricciones en gracia.
   * **Diáconos (`DeaconDesk`):** Atención ágil a fricciones urbanas ("Atención a Vecinos y Convivencia") resolviendo reportes vecinales en menos de 3 días sin burocracia.

### Ciclo 9 — Simbiosis de Vida Real, Casos de Estrés y Protección Comunitaria (GOLD-297 a GOLD-306)
54. **54-C (`GOLD-297`) — Feed Litúrgico WebCal/ICS y Armonizador de Pulso Celular:** Exportador estándar RFC 5545 (`/api/calendar/liturgical.ics`) para asambleas magnas y armonizador celular en 3 opciones de 1-toque (*Sumarnos*, *Mover fecha 24h*, *Mantener reunión regular*) sin penalización de salud.
55. **55-C (`GOLD-298`) — Caracterización Binaria Sobria de Creación (`sexo`: `hombre` | `mujer`):** Enum binario bíblico sobrio para segmentación fraternal legítima (Tito 2) sin campos ideológicos ni badges ruidosos en la interfaz pública.
56. **56-C (`GOLD-299`) — Bandeja Diaconal Mancomunada y Pase Fraternal por Colonia:** Bandeja común de auxilio barrial con selector de Colonia/Sector de Durango y pase fraternal de 1-clic (*"Pasar la posta fraternal"*) descartando rastreo invasivo por IP o GPS.
57. **57-C (`GOLD-300`) — Ficha de Célula con Tríada Celular y Cobertura Pastoral Visible:** En `PastorHud`, visualización en vidrio ahumado de la Tríada Operativa (*Facilitador, Anfitrión, Aprendiz*) y la Cadena Pastoral (*Diácono con fecha de última visita y Anciano de Sector*) con contacto directo.
58. **58-C (`GOLD-301`) — Desanonimización Contextual y Veto Pastoral en Ruteo Anti-Colisión:** Desanonimización en colisiones reservada exclusivamente para el Pastor Josh (nombres, teléfonos, grupos, motivo y anciano responsable) con botones *Ratificar Transición* y *Veto Pastoral con Diálogo*.
59. **59-C (`GOLD-302`) — Pausas Litúrgicas Oficiales de Temporada y Cerrojo Dominical:** Congelamiento del conteo de semanas en temporadas litúrgicas de asueto (Semana Santa, contingencias) sin falsa deuda técnica ni alertas rojas, y exclusión arquitectónica estricta del domingo para reuniones celulares.
60. **60-C (`GOLD-303`) — Convocatorias de Actividades Comunitarias Agnósticas:** Módulo de iniciativas abiertas (Hospital General 450, Coloquio de Narnia, reforestación) con padrón abierto y compromiso ágil de insumos sin ataduras celulares de 12 semanas.
61. **61-C (`GOLD-304`) — Convivio Fraternal Inter-Celular con Asistencia Mancomunada:** Encuentros conjuntos entre células afines (asados de varones, vigilias) con asistencia mancomunada y deduplicación en el histórico sin doble cómputo.
62. **62-C (`GOLD-305`) — Sede Institucional o Especial sin Verborrea Religiosa:** Espacios en Cereso, hospitales o empresas con rol sobrio **«Contacto / Enlace Institucional»** sin títulos clericales pomposos y soporte de alias de protección para internos.
63. **63-C (`GOLD-306`) — Sabático Directo por Diácono y Protección Infranqueable de Menores:** Concesión in situ de sabático de hogar (1 a 3 semanas) por el diácono en visita con notificación instantánea a Josh; niños (0-11) como dependientes tutelados sin cuenta; y **bloqueo estricto por arquitectura de cualquier chat privado 1:1 adulto-menor**.

### Ciclo 10 — Despliegue Soberano, Cero Proveedores Extra y Salida Libre (GOLD-307 a GOLD-316)
64. **64-C (`GOLD-307`) — Monorrector Soberano Multi-Tenant:** Repositorio privado único en `https://github.com/memoestefani/portico.git`. Aislamiento físico de bases de datos por iglesia (`tenants/amorygracia.db`) sin bifurcar código ni mezclar inquilinos.
65. **65-C (`GOLD-308`) — Docker Compose Multi-Contenedor:** Orquestación reproducible mediante `docker-compose.yml` que enlaza el binario Axum (sirviendo frontend embebido) y el conector `cloudflared` en red interna bridge sin puertos abiertos al host.
66. **66-C (`GOLD-309`) — Infraestructura Unificada Cloudflare ($0 USD/mes):** Cero dispersión entre AWS, Oracle o Fly.io. Exposición segura de borde a través de Cloudflare Tunnel con cero puertos entrantes abiertos en el router.
67. **67-C (`GOLD-310`) — Ruteo Seguro por Cloudflare Tunnel:** Mapeo de subdominios gestionados (`amorygracia.<dominio>`) hacia `http://app:3000` con certificados TLS automáticos de borde a costo $0.
68. **68-C (`GOLD-311`) — Autenticación Passkey WebAuthn First + WhatsApp:** Cero contraseñas. Purga automática de `RoleSwitcher` en compilaciones de producción (`import.meta.env.DEV`) y sesiones mediante cookies HttpOnly firmadas por backend con RBAC.
69. **69-C (`GOLD-312`) — Doble Capa de Confinamiento para OperatorHq:** Consola de operador invisible para la iglesia; exige host/red administrativa y verificación de cabecera criptográfica `X-Portico-Operator-Key`.
70. **70-C (`GOLD-313`) — Salida Soberana Dual ("No Strings Attached"):** Botón táctil en `PastorHud` (`#btn-export-sovereign-archive`) que genera en 1-clic un archivo ZIP con el `.db` íntegro y hojas `.csv` bajo RFC 4180 legibles en Excel.
71. **71-C (`GOLD-314`) — Replicación Continua Litestream a Cloudflare R2:** Demonio Litestream (`litestream.yml`) replicando páginas WAL de SQLite hacia Cloudflare R2 con $0 en costos de transferencia (egress) dentro de los 10 GB gratuitos.
72. **72-C (`GOLD-315`) — Privacidad Polimórfica en Backend Rust y Anti-Scraping:** Serializador de Rust que omite físicamente direcciones particulares y teléfonos de anfitriones en endpoints públicos + script `tools/clean_debris.ps1` que certifica la frontera hermética del proyecto.
73. **73-C (`GOLD-316`) — Radar Pastoral In-App y Despacho wa.me Nativo a Costo $0:** Disparadores de acompañamiento diaconal y pastoral a través de enlaces directos `https://wa.me/` sin contratar APIs de pago de Meta o Twilio.

### Ciclo 16 — Radar de Cuidado y Pastoreo, Ergonomía Móvil y Libertad Litúrgica (GOLD-340 a GOLD-348)
77. **77-B (`GOLD-340`) — Cabecera Limpia Despejada y Menú Secundario de Mantenimiento:** Reducción del HUD pastoral a dos acciones primarias ("Emitir Comunicado" + "Buscar y Filtrar") y confinamiento de configuración de marca, folios físicos y exportación ZIP al menú secundario.
78. **78-B (`GOLD-341`) — Layout Adaptativo: Mobile Bottom Sheet & Desktop Split-Pane:** Hoja táctil deslizante inferior (`.pastoral-bottom-sheet`) en iPhone <768px y panel maestro-detalle persistente (`.tablet-master-detail`) en pantallas >=768px.
79. **79-B (`GOLD-342`) — Triaje de Atención por Excepción y Reposo Pastoral:** Detección automática de anomalías prioritarias ("Requiere Atención Hoy") o confirmación de reposo eclesiástico ("Rebaño en Paz: Cero anomalías activas hoy").
80. **80-B (`GOLD-343`) — Modo Santuario Silencioso y Ausencia de Manifiestos Defensivos:** Supresión absoluta de textos combativos anti-SaaS en UI pastoral, sustituidos por la sobriedad serena de "Santuario Cifrado Eclesiástico".
81. **81-B (`GOLD-344`) — Tribunal Conciliar Colegiado bajo Regla de los Cuatro Ojos (Mateo 18):** Disciplina eclesiástica transferida al Consejo de Ancianos bajo el principio Maker-Checker (doble firma obligatoria de dos ancianos ordenados).
82. **82-B (`GOLD-345`) — Búsqueda Predictiva Multi-Factor Indexada en Memoria (<16ms):** Búsqueda instantánea en cliente por facilitador, colonia/zona, día de reunión y afinidad sin latencia de red.
83. **83-B (`GOLD-346`) — Paleta Noble "Santuario y Olivo":** Sustitución de colores estridentes por tonalidades de la naturaleza y cantera (Alabastro, Lino, Verde Olivo Maduro `#2D3A2F` y Arcilla Terracota `#C46849`).
84. **84-B (`GOLD-347`) — Acompañamiento Fraterno Contextual 1-Toque vía WhatsApp:** Enlaces contextuales pre-redactados `wa.me` para aliento y cuidado según la salud de la célula, disponibles en escritorio y móvil.
85. **85-B (`GOLD-348`) — Descentralización Litúrgica y Primacía de los 4 Elementos del Santuario:** Erradicación del currículo homogéneo forzado, preguntas con temporizador y videos centrales; primacía de los 4 elementos esenciales del santuario en casa (Mesa, Palabra, Oración, Bendición), respetando la libertad de los grupos de interés y el acuerdo relacional e informal para emprender estudios de libros bíblicos específicos (ej. Éxodo).

---

## 🧪 Verificación y Pruebas Automatizadas

El proyecto cuenta con certificación automatizada continua del 100% en backend y frontend sin mockups ni placeholders (**294+ pruebas verdes en total**):

### Backend (Rust Workspace)
```bash
cd backend
cargo test -p portico-core
```
* **37+ pruebas pasando (0 fallas):** Pruebas unitarias de datos, dominio y calendario en `portico-core`, sanitización EXIF y endpoints Axum de gobernanza presbiteral.

### Frontend (Node.js Test Runner & TypeScript Build)
```bash
cd frontend
npm test
npm run build
```
* **287 pruebas pasando (0 fallas en 156 suites):** 
  * Ciclo 2 (Sobriedad y Rendimiento)
  * Ciclo 3 (Decisiones Canónicas)
  * Ciclo 4 (Gobernanza y Branding Noble)
  * Ciclo 5 (Diaconado y Discipulado)
  * Ciclo 6 (Multi-Campus y Escala)
  * Ciclo 7 (Ergonomía Apple y Lenguaje Humano)
  * Ciclo 8 (Interfaz Invisible, Calma Pastoral y Gobernanza Distribuida)
  * Ciclo 9 (Simbiosis de Vida Real, Casos de Estrés y Protección Comunitaria)
  * Ciclo 10 (Despliegue Soberano, Cero Proveedores Extra y Salida Libre: GOLD-307 a GOLD-316)
  * Ciclo 11 (Dossier Pastoral Ejecutivo Automatizado y Motor Nativo PDF: GOLD-317 a GOLD-319)
  * Ciclo 12 (Ergonomía Grado Apple, Eliminación de Ruido y Filtro Elena Ramos: GOLD-320 a GOLD-329)
  * Ciclo 13 (Identidad Noble Amor y Gracia Durango, Conmutador Multi-Grupo y Silencio de Santuario: GOLD-330 a GOLD-339)
  * Ciclo 14 (Landing Editorial Pastoral, Carta Fraternal y Caso Vivo de Amor y Gracia Durango: GOLD-340 a GOLD-349)
  * Ciclo 15 (Ergonomía 390px, Dock Adaptativo, Ruta Recursiva, Gobernanza Conciliar, Armonizador de Carne Asada y Separación Mi Perfil: GOLD-350 a GOLD-359)
  * Ciclo 16 (Radar de Cuidado y Pastoreo, Calm Tech, Triaje Inbox Zero, Maker-Checker Conciliar y Libertad Litúrgica: GOLD-340 a GOLD-348)
  * Ciclo 17 (Búsqueda de Miembros Acotada a la Célula y Asignación Fraterna de Roles: GOLD-349 a GOLD-351)
  * Ciclo 18 (Logística Celular Agnóstica, Edición de Doble Puerta Exclusiva del Líder y Sedes Flexibles: GOLD-352 a GOLD-355)
  * Ciclo 19 (Las 10 Decisiones Pastorales, Modo Claro Earthen Noble y Versionado Histórico del Dossier: GOLD-356 a GOLD-365)
* **Build de producción:** 0 errores, 0 advertencias de compilación (`tsc -b && vite build` sobre 1,906 módulos en `dist/`).

---

## 🚀 Puesta en Marcha Local

```bash
# Iniciar backend Axum (puerto 3000)
cd backend
cargo run -p portico-server -- --port 3000 --data-dir ./data

# En otra terminal, iniciar frontend Vite (puerto 5173)
cd frontend
npm run dev
```

Abra el navegador en `http://localhost:5173/` para explorar las superficies eclesiales con ergonomía Apple y calma pastoral:
1. **Pórtico Público:** Selector territorial horizontal único de un toque, sedes híbridas serenas y buzón de atención a vecinos.
2. **Silo de la Comunidad:** Tríada de reunión, acompañamiento fraterno Mateo 18 y descanso sabático de hogares.
3. **Mesa Diaconal (`DeaconDesk`):** Acompañamiento a 5-7 comunidades y resolución ágil de atención vecinal (< 3 días).
4. **Consejo de Ancianos (`ElderDesk`):** Consejería pastoral, gestión de ruteos anti-colisión por sector y Servidores Veteranos.
5. **HUD Pastoral (`PastorHud`):** 5 paneles serenos, consolidación pastoral con veto de ruteos y cobertura territorial de 100 a 10,000 miembros.
6. **Consola HQ (`OperatorHq`):** Auditoría soberana con aislamiento físico de base de datos por congregación.
