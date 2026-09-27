# 🚀 Guía de Despliegue y Protocolo de Actualizaciones — Pórtico OS v3.6

> **Repositorio de Producción:** [`https://github.com/memoestefani/portico`](https://github.com/memoestefani/portico)  
> **Identidad de Operador:** Guillermo (`memoestefani@gmail.com`)  
> **Presupuesto:** **$0 USD/mes** (Cloudflare Tunnels + GitHub Pages + Cloudflare R2 Free Tier + SQLite Local)

---

## 📊 1. Estado Actual de la Infraestructura en Vivo

| Componente | Estatus | URL / Endpoint | Función |
| :--- | :---: | :--- | :--- |
| **Landing Page Pública (GitHub Pages)** | 🟢 Live | [`https://memoestefani.github.io/portico/`](https://memoestefani.github.io/portico/) | Carta Pastoral Editorial (<12 KB Vanilla Single-Fold) con caso vivo de Amor y Gracia Durango y Pastor Josh. |
| **Aplicación Operativa (Cloudflare Tunnel)** | 🟢 Live | `https://habitat-cleaning-benz-syndication.trycloudflare.com` | Acceso completo para Pastor Josh, diáconos y miembros en sus teléfonos. |
| **Backend & Servidor Web (Rust Axum)** | 🟢 Live | `http://127.0.0.1:3000` | Motor HTTP de alto rendimiento sirviendo API y frontend embebido `dist/`. |
| **Persistencia Database-per-Tenant** | 🟢 Live | `backend/data/tenants/1fb2fd67-6b35-425c-967c-5405af97b401.db` | Base física SQLite aislada de Amor y Gracia Durango. |
| **Salida Soberana Dual (.db + CSV)** | 🟢 Live | `/api/pastor/export-sovereign-archive` | Botón táctil en `PastorHud` y exportación pastoral en `ElderDesk` ("No Strings Attached"). |
| **Pruebas Automatizadas** | 🟢 100% | **321 tests verdes** (284 frontend, 37 backend) | Certificación continua de cero regresiones, cero mockups y cero variables rotas. |

---

## 🔄 2. La Mecánica de Trabajo: ¿Cómo se actualizan los cambios?

La arquitectura soberana de Pórtico OS te da una ventaja única frente a la nube tradicional: **los cambios se prueban y reflejan al instante sin esperar 15 minutos de re-compilaciones en servicios de terceros**.

### El Flujo de Trabajo en 4 Pasos:

```mermaid
graph LR
    A["1. Observación / Feedback de Josh"] --> B["2. Ajuste Local en Código"]
    B --> C["3. Verificación & Compilación Local"]
    C --> D["4. Reflejo Inmediato en el Túnel"]
    D --> E["5. Sanitización de Debris & Git Push"]
```

---

### Paso a Paso Detallado:

#### Paso 1: Hacer el ajuste en el código
* **Si es cambio de Frontend (UI, textos, ergonomía, botones):**
  Se modifica el componente correspondiente en `frontend/src/components/` o las hojas de estilo en `frontend/src/index.css`.
* **Si es cambio de Backend (rutas, endpoints, lógica de negocio, reglas de acceso):**
  Se modifica la ruta correspondiente en `backend/crates/portico-server/src/routes/` o el modelo en `portico-core`.
* **Si es cambio en la Landing Page informativa:**
  Se modifica `docs/index.html`.

#### Paso 2: Ejecutar la batería de pruebas y compilar
Antes de publicar cualquier cambio, verificamos que el sistema mantenga su integridad:

```powershell
# A. Validar pruebas del frontend (181 tests)
cd C:\Users\52331\Documents\Proyectos\portico\frontend
npm test

# B. Compilar el bundle estático de producción (dist/)
npm run build

# C. Si se modificó código Rust, validar backend (47 tests)
cd C:\Users\52331\Documents\Proyectos\portico
cargo test --manifest-path backend/Cargo.toml
```

#### Paso 3: Reflejo en Vivo a través del Túnel
* Dado que el frontend compilado se ubica en `frontend/dist/`, **el servidor Axum sirve los archivos nuevos inmediatamente**.
* El Pastor Josh o tú solo requieren refrescar la página en su teléfono (`https://habitat-cleaning-benz-syndication.trycloudflare.com`) y el cambio estará visible al instante.
* Si el cambio fue en el código compilado de Rust, simplemente reiniciamos el binario `portico-server.exe` (tarda menos de 1 segundo).

#### Paso 4: Sanitización de Debris y Respaldo en GitHub
Una vez validado el cambio:

```powershell
cd C:\Users\52331\Documents\Proyectos\portico

# 1. Purgar archivos temporales y verificar frontera hermética
powershell -ExecutionPolicy Bypass -File tools/clean_debris.ps1

# 2. Agregar cambios y commitear con mensaje semántico
git add .
git commit -m "fix(pastor): ajustar horario habitual en cédula de matrimonios"

# 3. Empujar a tu repositorio personal
git push origin main
```

> **Efecto automático:**  
> Si se modificó `docs/index.html`, GitHub Pages se re-despliega de forma automática en 30 segundos en `https://memoestefani.github.io/portico/`.

---

## 🛠️ 3. Comandos Rápidos de Operación

### Iniciar el Backend Localmente:
```powershell
cd C:\Users\52331\Documents\Proyectos\portico
.\backend\target\debug\portico-server.exe --port 3000 --data-dir C:\Users\52331\Documents\Proyectos\portico\backend\data
```

### Iniciar el Cloudflare Quick Tunnel:
```powershell
cd C:\Users\52331\Documents\Proyectos\portico
.\tools\cloudflared.exe tunnel --url http://127.0.0.1:3000
```
*(Al iniciar, la consola mostrará la URL pública de `trycloudflare.com` asignada).*

### Modo Desarrollo Frontend con Hot-Reload (Vite):
Si prefieres ver cambios visuales instantáneos mientras programas:
```powershell
cd C:\Users\52331\Documents\Proyectos\portico\frontend
npm run dev
# Abre http://localhost:5173 con recarga en caliente
```

---

## 🛡️ 4. Protocolo de Fronteras y Seguridad Soberana

1. **Aislamiento Hermético de `smatminerals`:**  
   Bajo ninguna circunstancia se debe referenciar, vincular ni compartir recursos de `smatminerals` en Pórtico OS.
2. **Cero PII en el Repositorio:**  
   Las bases de datos SQLite locales con datos de miembros y teléfonos (`*.db`, `data/`) están estrictamente ignoradas por `.gitignore`.
3. **Privacidad Polimórfica:**  
   Los domicilios de hogares particulares nunca se envían al catálogo público; se sanitizan en la raíz del backend en Rust.
4. **Respaldo de Emergencia en 1 Toque:**  
   El Pastor Josh o el Administrador pueden descargar el archivo `.zip` con todos los datos crudos desde `PastorHud` en cualquier momento.

---

## 📄 5. Protocolo de Comunicación Pastoral y Generación del Dossier en PDF

Para líderes que no tienen por qué lidiar con enlaces web ni servidores (como el Pastor Josh), Pórtico OS incluye herramientas nativas para generar en 2 segundos un **Dossier Pastoral Ejecutivo en PDF** de 7 páginas en formato horizontal (`Letter Landscape`), listo para enviar por WhatsApp o imprimir en papel físico.

### Generación en 2 Pasos (Cero Dependencias de Node.js):

#### 1. Actualizar las 6 capturas de pantalla de la aplicación:
```powershell
cd C:\Users\52331\Documents\Proyectos\portico
powershell -ExecutionPolicy Bypass -File .\tools\capturar_pantallas.ps1
```
*(Captura las 6 superficies locales en resolución fija de 1280x780 sin barras de navegador y las guarda en `docs/assets/dossier/`).*

#### 2. Compilar el PDF editorial para Josh:
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\generar_dossier.ps1
```
*(Utiliza el motor nativo de Microsoft Edge Headless preinstalado en Windows y genera `docs/Dossier_Pastoral_Portico_Amor_y_Gracia.pdf` de ~1.1 MB listo para compartir por WhatsApp).*

---

## 🚀 6. Próxima Etapa: Transición de Quick Tunnel a Dominio Fijo

Cuando tú y Josh decidan dar el paso a una URL permanente (por ejemplo `ayg-grupos.com` o el dominio que Josh recupere):
1. Se compra o agrega el dominio en tu cuenta de Cloudflare.
2. En Zero Trust se crea el túnel con nombre (`portico-amorygracia`).
3. Se copia el `TUNNEL_TOKEN` al archivo `.env`.
4. Se ejecuta `docker compose up -d` y el sistema queda corriendo como servicio desatendido 24/7 sin ventanas de terminal abiertas.

