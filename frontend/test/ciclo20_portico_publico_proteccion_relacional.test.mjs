import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const docsDir = path.join(rootDir, 'docs');
const indexPath = path.join(docsDir, 'index.html');
const dossierPublicoHtmlPath = path.join(docsDir, 'dossier_publico.html');
const dossierPublicoPdfPath = path.join(docsDir, 'Dossier_Portico_Publico.pdf');
const croppedImagePath = path.join(docsDir, 'assets/dossier/portico_publico_catalogo_recortado.png');
const dossierPastoralPdfPath = path.join(docsDir, 'Dossier_Pastoral_Portico.pdf');
const toolsDir = path.join(rootDir, 'tools');
const generarDossierPath = path.join(toolsDir, 'generar_dossier.ps1');
const indexContent = fs.readFileSync(indexPath, 'utf-8');

describe('Ciclo 20 — Pórtico Público, Aislamiento Visual y Filtro Ético Implícito', () => {

  // ==========================================================================
  // Decisión 1-A (GOLD-356): Cuaderno Editorial Público de 3 Páginas
  // ==========================================================================
  describe('Decisión 1-A (GOLD-356): Cuaderno Editorial Público de 3 Páginas', () => {
    it('docs/dossier_publico.html debe existir y estructurar exactamente 3 láminas', () => {
      assert.ok(fs.existsSync(dossierPublicoHtmlPath), 'docs/dossier_publico.html debe existir');
      const htmlContent = fs.readFileSync(dossierPublicoHtmlPath, 'utf-8');
      const slideMatches = htmlContent.match(/class="dossier-slide"/g) || [];
      assert.equal(slideMatches.length, 3, 'Debe contener exactamente 3 láminas (.dossier-slide)');
      assert.match(htmlContent, /@page\s*\{\s*size:\s*letter\s+portrait;\s*margin:\s*0;\s*\}/, 'Debe definir W3C paged media Letter Portrait');
    });

    it('docs/Dossier_Portico_Publico.pdf debe existir, ser un PDF válido y tener exactamente 3 páginas', () => {
      assert.ok(fs.existsSync(dossierPublicoPdfPath), 'docs/Dossier_Portico_Publico.pdf debe existir');
      const buffer = fs.readFileSync(dossierPublicoPdfPath);
      assert.ok(buffer.length > 50 * 1024, `El PDF debe tener más de 50 KB (tamaño: ${buffer.length} bytes)`);

      // Firma mágica canónica %PDF-
      const magic = buffer.subarray(0, 5).toString('utf-8');
      assert.equal(magic, '%PDF-', 'El archivo debe comenzar con la firma canónica %PDF-');

      // Conteo de páginas
      const pdfString = buffer.toString('binary');
      const pageMatches = pdfString.match(/\/Type\s*\/Page\b/g) || [];
      assert.equal(pageMatches.length, 3, 'El PDF compilado debe contener exactamente 3 páginas');
    });

    it('docs/dossier_publico.html debe tener CERO menciones a tablas internas, esquemas SQL o mecánicas de veto', () => {
      const htmlContent = fs.readFileSync(dossierPublicoHtmlPath, 'utf-8');
      assert.doesNotMatch(htmlContent, /restricted_pairing/i, 'Cero filtraciones de tabla restricted_pairing');
      assert.doesNotMatch(htmlContent, /deacon_clusters/i, 'Cero filtraciones de tabla deacon_clusters');
      assert.doesNotMatch(htmlContent, /sqlite/i, 'Cero menciones al motor interno SQLite');
      assert.doesNotMatch(htmlContent, /schema/i, 'Cero esquemas técnicos de base de datos');
      assert.doesNotMatch(htmlContent, /veto/i, 'Cero exposición de jerarquías de veto pastoral');
      assert.doesNotMatch(htmlContent, /fision/i, 'Cero algoritmos de fisión o división celular');
      assert.doesNotMatch(htmlContent, /dunbar/i, 'Cero referencias académicas a Dunbar');
    });

    it('docs/dossier_publico.html debe usar la paleta cálida editorial y tipografías nobles', () => {
      const htmlContent = fs.readFileSync(dossierPublicoHtmlPath, 'utf-8');
      assert.match(htmlContent, /#FAF8F5/i, 'Debe usar fondo pergamino cálido (#FAF8F5)');
      assert.match(htmlContent, /#93432F/i, 'Debe usar acento terracota (#93432F)');
      assert.match(htmlContent, /family=Lora/i, 'Debe importar tipografía Lora');
      assert.match(htmlContent, /family=Plus\+Jakarta\+Sans/i, 'Debe importar tipografía Plus Jakarta Sans');
    });
  });

  // ==========================================================================
  // Decisión 2-A (GOLD-357): Aislamiento Visual de la Superficie 01
  // ==========================================================================
  describe('Decisión 2-A (GOLD-357): Aislamiento Visual de la Superficie 01', () => {
    it('docs/assets/dossier/portico_publico_catalogo_recortado.png debe existir y medir más de 20 KB', () => {
      assert.ok(fs.existsSync(croppedImagePath), 'La imagen recortada de superficie 01 debe existir');
      const stat = fs.statSync(croppedImagePath);
      assert.ok(stat.size > 20 * 1024, `La imagen debe medir más de 20 KB (actual: ${stat.size} bytes)`);
    });

    it('docs/dossier_publico.html debe incrustar la imagen recortada de superficie 01', () => {
      const htmlContent = fs.readFileSync(dossierPublicoHtmlPath, 'utf-8');
      assert.match(htmlContent, /assets\/dossier\/portico_publico_catalogo_recortado\.png/, 'Debe enlazar la captura recortada');
    });

    it('docs/dossier_publico.html NO debe exponer consolas diaconales, radar de pastores ni conmutador de roles', () => {
      const htmlContent = fs.readFileSync(dossierPublicoHtmlPath, 'utf-8');
      assert.doesNotMatch(htmlContent, /09_mesa_diacono\.png/, 'No debe incluir la consola de mesa de diácono');
      assert.doesNotMatch(htmlContent, /10_pastor_hud_radar\.png/, 'No debe incluir el radar de pastor');
      assert.doesNotMatch(htmlContent, /11_pastor_anti_collision\.png/, 'No debe incluir la consola anti-colisión');
      assert.doesNotMatch(htmlContent, /12_modal_disciplina_pastoral\.png/, 'No debe incluir la disciplina pastoral');
      assert.doesNotMatch(htmlContent, /RoleSwitcher/i, 'No debe exhibir el conmutador de roles');
    });
  });

  // ==========================================================================
  // Decisión 3-A (GOLD-358): Filtro Ético Implícito y Experiencia Relacional
  // ==========================================================================
  describe('Decisión 3-A (GOLD-358): Filtro Ético Implícito y Experiencia Relacional', () => {
    it('docs/index.html debe enlazar a Dossier_Portico_Publico.pdf en el botón principal', () => {
      assert.match(indexContent, /href="Dossier_Portico_Publico\.pdf"/, 'El botón principal debe apuntar al PDF público');
      assert.match(indexContent, /Consultar Cuaderno de Visión Comunitaria en PDF \(3 Páginas\)/, 'El texto del botón debe reflejar el cuaderno de 3 páginas');
      assert.doesNotMatch(indexContent, /href="Dossier_Pastoral_Portico\.pdf"/, 'La landing pública no debe enlazar directamente al expediente técnico de 15 páginas');
    });

    it('docs/index.html debe mantener el filtro ético 100% implícito (cero advertencias defensivas ni moralistas)', () => {
      assert.doesNotMatch(indexContent, /charlat[aá]n/i, 'No debe incluir palabras como charlatán');
      assert.doesNotMatch(indexContent, /estafador/i, 'No debe incluir palabras como estafador');
      assert.doesNotMatch(indexContent, /secta/i, 'No debe incluir advertencias sobre sectas');
      assert.doesNotMatch(indexContent, /pir[aá]mide/i, 'No debe incluir advertencias defensivas sobre pirámides');
    });

    it('docs/index.html debe preservar el canal de diálogo relacional con Web3Forms y salvaguardas anti-bot', () => {
      assert.match(indexContent, /<dialog\s+id="contactModal"/, 'Debe preservar el modal dialog nativo');
      assert.match(indexContent, /value="d173722b-932e-4f7f-ab53-db38c7abdaaa"/, 'Debe mantener la clave anónima oficial de Web3Forms');
      assert.match(indexContent, /name="botcheck"/, 'Debe mantener el honeypot anti-bot');
      assert.match(indexContent, /modalOpenedAt/, 'Debe mantener el time-gating');
      assert.doesNotMatch(indexContent, /memo\.estefani@gmail\.com/i, 'Cero exposición del correo del usuario');
    });
  });

  // ==========================================================================
  // Preservación del Expediente Técnico Interno (Entrega Pastoral Privada)
  // ==========================================================================
  describe('Preservación del Expediente Técnico Interno (Entrega Privada)', () => {
    it('docs/Dossier_Pastoral_Portico.pdf debe existir y conservarse intacto', () => {
      assert.ok(fs.existsSync(dossierPastoralPdfPath), 'docs/Dossier_Pastoral_Portico.pdf debe mantenerse disponible');
      const stat = fs.statSync(dossierPastoralPdfPath);
      assert.ok(stat.size > 1000 * 1024, 'El dossier de 15 láminas debe conservarse íntegro');
    });

    it('tools/generar_dossier.ps1 debe admitir parámetros -Type Public y -Type Pastoral', () => {
      assert.ok(fs.existsSync(generarDossierPath), 'tools/generar_dossier.ps1 debe existir');
      const scriptContent = fs.readFileSync(generarDossierPath, 'utf-8');
      assert.match(scriptContent, /ValidateSet\("Public",\s*"Pastoral",\s*"All"\)/, 'Debe soportar tipos Public, Pastoral y All');
      assert.match(scriptContent, /Dossier_Portico_Publico\.pdf/, 'Debe compilar la versión pública');
      assert.match(scriptContent, /Dossier_Pastoral_Portico\.pdf/, 'Debe compilar la versión pastoral');
    });
  });

  // ==========================================================================
  // Tarjeta Gráfica Open Graph y Metadatos Canónicos (WhatsApp, Facebook, X)
  // ==========================================================================
  describe('Tarjeta Gráfica Open Graph y Metadatos Canónicos (WhatsApp, Facebook, X)', () => {
    const ogImgPath = path.join(docsDir, 'og.png');
    const ogScriptPath = path.join(toolsDir, 'generar_og_preview.ps1');

    it('docs/og.png debe existir, ser un PNG válido y medir menos de 300 KB para WhatsApp', () => {
      assert.ok(fs.existsSync(ogImgPath), 'docs/og.png debe existir');
      const stat = fs.statSync(ogImgPath);
      assert.ok(stat.size > 20 * 1024, `og.png debe tener contenido visual (actual: ${stat.size} bytes)`);
      assert.ok(stat.size <= 300 * 1024, `og.png debe medir <= 300 KB para evitar descarte en WhatsApp (actual: ${stat.size} bytes)`);

      // Verificar firma PNG (\x89PNG\r\n\x1a\n)
      const buffer = fs.readFileSync(ogImgPath);
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      assert.ok(isPng, 'docs/og.png debe ser un archivo PNG legítimo');
    });

    it('docs/index.html debe declarar metadatos Open Graph y Twitter Cards canónicos absolutos', () => {
      assert.match(indexContent, /property="og:url"\s+content="https:\/\/memoestefani\.github\.io\/portico\/"/, 'Falta og:url canónico');
      assert.match(indexContent, /property="og:image"\s+content="https:\/\/memoestefani\.github\.io\/portico\/og\.png"/, 'Falta og:image absoluto');
      assert.match(indexContent, /property="og:image:secure_url"\s+content="https:\/\/memoestefani\.github\.io\/portico\/og\.png"/, 'Falta og:image:secure_url');
      assert.match(indexContent, /property="og:image:width"\s+content="1200"/, 'Falta og:image:width=1200');
      assert.match(indexContent, /property="og:image:height"\s+content="630"/, 'Falta og:image:height=630');
      assert.match(indexContent, /name="twitter:card"\s+content="summary_large_image"/, 'Falta twitter:card summary_large_image');
      assert.match(indexContent, /name="twitter:image"\s+content="https:\/\/memoestefani\.github\.io\/portico\/og\.png"/, 'Falta twitter:image');
    });

    it('tools/generar_og_preview.ps1 debe existir para compilar la tarjeta social', () => {
      assert.ok(fs.existsSync(ogScriptPath), 'tools/generar_og_preview.ps1 debe existir');
    });
  });
});
