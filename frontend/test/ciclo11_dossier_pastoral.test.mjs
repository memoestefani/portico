import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const docsDir = path.join(rootDir, 'docs');
const toolsDir = path.join(rootDir, 'tools');
const assetsDir = path.join(docsDir, 'assets/dossier');

describe('Pórtico OS v3.5 - Ciclo 11: Dossier Pastoral Ejecutivo Automatizado y Motor Nativo PDF (GOLD-317 a GOLD-319)', () => {
  // GOLD-317: Dossier Pastoral Ejecutivo en PDF de 7 Páginas Letter Landscape
  describe('GOLD-317: Plantilla Editorial HTML W3C Paged Media (docs/dossier_pastoral.html)', () => {
    const htmlPath = path.join(docsDir, 'dossier_pastoral.html');

    it('la plantilla HTML docs/dossier_pastoral.html debe existir y ser legible', () => {
      assert.ok(fs.existsSync(htmlPath), 'docs/dossier_pastoral.html debe existir');
      const stat = fs.statSync(htmlPath);
      assert.ok(stat.size > 2000, 'El archivo HTML debe tener contenido sustancial');
    });

    it('debe definir reglas W3C Paged Media con @page letter portrait y márgenes cero', () => {
      const content = fs.readFileSync(htmlPath, 'utf-8');
      assert.match(content, /@page\s*\{\s*size:\s*letter portrait;\s*margin:\s*0;\s*\}/, 'Debe especificar @page { size: letter portrait; margin: 0; }');
      assert.match(content, /break-after:\s*page/, 'Debe forzar salto de página con break-after: page');
      assert.match(content, /break-inside:\s*avoid/, 'Debe evitar corte de elementos con break-inside: avoid');
    });

    it('debe contener exactamente 15 hojas pastorales (.dossier-slide)', () => {
      const content = fs.readFileSync(htmlPath, 'utf-8');
      const matches = content.match(/<section class="dossier-slide">/g);
      assert.ok(matches, 'Debe contener secciones con clase dossier-slide');
      assert.equal(matches.length, 15, 'El dossier debe tener exactamente 15 páginas');
    });

    it('las páginas de contenido anatómico deben incluir la especificación de propósito, base de datos y salvaguarda', () => {
      const content = fs.readFileSync(htmlPath, 'utf-8');
      const targetMatches = content.match(/spec-card target/g);
      const dbMatches = content.match(/spec-card db/g);
      const protectionMatches = content.match(/spec-card protection/g);

      assert.ok(targetMatches && targetMatches.length >= 13, 'Debe haber tarjetas de Propósito Pastoral');
      assert.ok(dbMatches && dbMatches.length >= 13, 'Debe haber tarjetas de Mutación y Base de Datos');
      assert.ok(protectionMatches && protectionMatches.length >= 13, 'Debe haber tarjetas de Salvaguarda Eclesial');
    });

    it('debe honrar la identidad noble de Amor y Gracia Durango y el pastoreo de Josh sin emojis', () => {
      const content = fs.readFileSync(htmlPath, 'utf-8');
      assert.match(content, /Amor y Gracia/i, 'Debe incluir el nombre de la congregación');
      assert.match(content, /Durango/i, 'Debe referenciar a Durango');
      assert.match(content, /Pastor Josh/i, 'Debe estar dedicado al Pastor Josh');
      assert.doesNotMatch(content, /Lorem ipsum/i, 'Cero placeholders o textos simulados');
      assert.doesNotMatch(content, /[\u{1F300}-\u{1F9FF}]/u, 'Cero emojis en la plantilla editorial');
    });
  });

  // GOLD-318: Script Nativo PowerShell de Generación de PDF (tools/generar_dossier.ps1)
  describe('GOLD-318: Script Nativo PowerShell con Edge Headless (tools/generar_dossier.ps1)', () => {
    const scriptPath = path.join(toolsDir, 'generar_dossier.ps1');

    it('tools/generar_dossier.ps1 debe existir y contener banderas oficiales de Edge Headless', () => {
      assert.ok(fs.existsSync(scriptPath), 'tools/generar_dossier.ps1 debe existir');
      const content = fs.readFileSync(scriptPath, 'utf-8');
      assert.match(content, /--headless=new/, 'Debe usar el modo headless moderno');
      assert.match(content, /--print-to-pdf/, 'Debe usar la bandera nativa --print-to-pdf');
      assert.match(content, /--no-pdf-header-footer/, 'Debe suprimir encabezados y pies de página de navegador');
      assert.match(content, /Start-Process.*-Wait/, 'Debe sincronizar el proceso con -Wait');
    });

    it('el archivo PDF compilado docs/Dossier_Pastoral_Portico_Amor_y_Gracia.pdf debe existir y ser válido', () => {
      const pdfPath = path.join(docsDir, 'Dossier_Pastoral_Portico_Amor_y_Gracia.pdf');
      assert.ok(fs.existsSync(pdfPath), 'El PDF del Dossier debe existir');
      const stat = fs.statSync(pdfPath);
      assert.ok(stat.size > 100 * 1024, `El PDF debe tener más de 100 KB (tamaño actual: ${stat.size} bytes)`);

      // Verificar cabecera mágica de PDF (%PDF-)
      const buffer = Buffer.alloc(5);
      const fd = fs.openSync(pdfPath, 'r');
      fs.readSync(fd, buffer, 0, 5, 0);
      fs.closeSync(fd);
      assert.equal(buffer.toString('utf-8'), '%PDF-', 'El archivo debe comenzar con la firma canónica %PDF-');
    });
  });

  // GOLD-319: Script de Capturas Automatizadas (tools/capturar_pantallas.ps1)
  describe('GOLD-319: Script de Capturas Automatizadas y Banco de Imágenes (tools/capturar_pantallas.ps1)', () => {
    const scriptPath = path.join(toolsDir, 'capturar_pantallas.ps1');

    it('tools/capturar_pantallas.ps1 debe existir y estar configurado a resolución fija sin scrollbars', () => {
      assert.ok(fs.existsSync(scriptPath), 'tools/capturar_pantallas.ps1 debe existir');
      const content = fs.readFileSync(scriptPath, 'utf-8');
      assert.match(content, /--screenshot=/, 'Debe usar la bandera --screenshot');
      assert.match(content, /--hide-scrollbars/, 'Debe ocultar scrollbars para capturas limpias');
      assert.match(content, /--window-size=(\$Width|\d+),(\$Height|\d+)/, 'Debe fijar resolución exacta');
    });

    it('las capturas de pantalla deben existir en docs/assets/dossier/ y ser imágenes válidas', () => {
      const expectedImages = [
        '01_portico_publico.png',
        '02_mi_perfil_elena.png',
        '02b_silo_living_card.png',
        '03_modal_sedes_flexibles.png',
        '04_modal_asignar_roles.png',
        '05_modal_fision_dunbar.png',
        '06_modal_armonizador_liturgico.png',
        '07_modal_salvaguarda_crisis.png',
        '08_modal_pase_qr.png',
        '09_mesa_diacono.png',
        '10_pastor_hud_radar.png',
        '11_pastor_anti_collision.png',
        '12_modal_disciplina_pastoral.png',
        '13_soberania_datos.png'
      ];

      for (const img of expectedImages) {
        const imgPath = path.join(assetsDir, img);
        assert.ok(fs.existsSync(imgPath), `La imagen ${img} debe existir en docs/assets/dossier/`);
        const stat = fs.statSync(imgPath);
        assert.ok(stat.size > 10 * 1024, `La imagen ${img} debe tener más de 10 KB (tamaño actual: ${stat.size} bytes)`);

        // Verificar cabecera mágica de PNG (\x89PNG)
        const buffer = Buffer.alloc(4);
        const fd = fs.openSync(imgPath, 'r');
        fs.readSync(fd, buffer, 0, 4, 0);
        fs.closeSync(fd);
        assert.deepEqual([...buffer], [0x89, 0x50, 0x4E, 0x47], `El archivo ${img} debe ser un archivo PNG válido`);
      }
    });
  });
});
