# 📋 PLAN-018: Despliegue Inmediato Quick Tunnel ($0 USD) y Página Pública de Pórtico OS en GitHub Pages

```yaml
document_id: "PLAN-018"
cycle: "Ciclo 10 Complementario / Fase de Publicación y Acceso en Vivo"
version: "3.4.1"
status: "IN_PROGRESS"
author: "Principal Human Interface & Systems Architecture Engineer + Sovereign Central Research Laboratory"
runtime_budget: "$0 USD/mes (Quick Tunnel trycloudflare.com + GitHub Pages)"
user_directives:
  - "Opción C Ratificada: Quick Tunnel a costo $0 vía trycloudflare.com para evitar anticiparse o usurpar el dominio de Josh"
  - "Frontera Hermética: smatminerals queda 100% aislada de la actividad pastoral"
  - "Página Pública de Pórtico OS: Landing editorial sobria y plain para memoestefani.github.io/portico (MVP) con contacto directo a Guillermo"
  - "Ejecución Llave en Mano: El asistente ejecuta toda la descarga, configuración, encendido y verificación"
```

---

## 🏛️ 1. Contexto y Objetivos Estratégicos

1. **Acceso Inmediato en Teléfonos Móviles sin Costo ni Fricción:**
   * El Pastor Josh y los diáconos en Durango necesitan poder abrir la aplicación en sus teléfonos hoy mismo a través de una URL pública con HTTPS válida.
   * Al utilizar **Cloudflare Quick Tunnels (`trycloudflare.com`)**, obtenemos un túnel TLS saliente que conecta el puerto 3000 de Pórtico con la red global de Cloudflare a costo $0, sin abrir puertos en el módem, sin configurar DNS y sin registrar ningún dominio que compita con los planes institucionales de Josh.
2. **Landing Page Editorial y Human-Centered para Pórtico OS:**
   * Una presencia web sobria y plain (sin estridencias comerciales ni modas SaaS de Silicon Valley) orientada a pastores y líderes de iglesias que sufren el desorden de los grupos masivos de WhatsApp, la pérdida de miembros entre grietas y el miedo a plataformas corporativas abusivas.
   * Alojada de forma nativa en **GitHub Pages** (`https://memoestefani.github.io/portico/`) vinculada al repositorio personal de Guillermo.

---

## 📋 2. Checklist Exhaustivo de Implementación

### Fase 1: Aprovisionamiento de Cloudflared y Despliegue Quick Tunnel ($0 USD)
- [ ] **1.1** Descargar binario oficial de Cloudflare `cloudflared.exe` en `portico/tools/cloudflared.exe`.
- [ ] **1.2** Asegurar que el backend de Pórtico (`portico-server`) esté corriendo y sirviendo la compilación estática de producción de React (`dist/`) en el puerto 3000.
- [ ] **1.3** Levantar el túnel rápido con `cloudflared.exe tunnel --url http://127.0.0.1:3000` y capturar la URL pública asignada (`https://<id>.trycloudflare.com`).
- [ ] **1.4** Validar que la URL pública sea accesible desde el navegador móvil y de escritorio con certificado SSL válido de Cloudflare.

### Fase 2: Diseño y Construcción de la Landing Page de Pórtico OS (`docs/index.html`)
- [ ] **2.1** Estructurar la página en `docs/index.html` (formato estándar para GitHub Pages en branch `main`).
- [ ] **2.2** Diseñar una estética editorial *Earthen & Paper*, con tipografía humanista, paleta sobria (azul marino noble, pizarra y ámbar) y lectura fluida en móviles.
- [ ] **2.3** Redactar la narrativa pastoral:
  * El problema: La tiranía y dispersión de WhatsApp en las congregaciones.
  * La solución: Pórtico OS como plataforma de calma, soberanía y cuidado de personas.
  * Los 10 Primeros Principios (Límites de Dunbar, Privacidad LFPDPPP, Cero Deuda Técnica, Propiedad Comunitaria de Datos).
  * Las 6 Superficies de la Iglesia (Pórtico Público, Silo del Miembro, Mesa Diaconal, Consejo de Ancianos, HUD Pastoral, Consola Soberana).
- [ ] **2.4** Incorporar sección de contacto directo con Guillermo (`mailto:memoestefani@gmail.com`) y enlace al repositorio oficial en GitHub.

### Fase 3: Activación en GitHub Pages y Verificación
- [ ] **3.1** Añadir la carpeta `docs/` al repositorio Git de `C:\Users\52331\Documents\Proyectos\portico`.
- [ ] **3.2** Crear commit y documentar la activación de GitHub Pages (`Source: Deploy from a branch -> /docs`).
- [ ] **3.3** Probar localmente y documentar los pasos de acceso.
