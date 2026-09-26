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

describe('Pórtico OS v3.6 - Ciclo 14: Landing Editorial y Carta Pastoral de Amor y Gracia (GOLD-340 a GOLD-349)', () => {
  const content = fs.readFileSync(indexPath, 'utf-8');

  // ==========================================================================
  // GOLD-340 & GOLD-348: Monolito Vanilla Editorial de Una Sola Vista (< 15 KB)
  // ==========================================================================
  describe('GOLD-340 & GOLD-348: Arquitectura Single-Fold y Monolito Vanilla Autónomo', () => {
    it('docs/index.html debe existir, ser legible y medir menos de 15 KB', () => {
      assert.ok(fs.existsSync(indexPath), 'docs/index.html debe existir');
      const stat = fs.statSync(indexPath);
      assert.ok(stat.size > 2000, 'El archivo debe contener la carta editorial completa');
      assert.ok(stat.size < 15000, `El archivo pesa ${stat.size} bytes, debe ser menor a 15 KB`);
    });

    it('debe estructurarse como una Carta Editorial centrada en max-width: 680px sin scripts externos', () => {
      assert.match(content, /max-width:\s*680px/, 'Debe centrar la lectura en 680px');
      assert.match(content, /<article>/i, 'Debe contener la etiqueta semántica article');
      assert.doesNotMatch(content, /<script\s+src=/i, 'Cero scripts JS externos o trackers');
    });
  });

  // ==========================================================================
  // GOLD-341: Tarjeta de Caso Vivo de Amor y Gracia Durango con Pastor Josh
  // ==========================================================================
  describe('GOLD-341: Tarjeta de Caso Vivo Testimonial Real', () => {
    it('debe identificar a la congregación Amor y Gracia, Durango y al Pastor Josh', () => {
      assert.match(content, /Amor y Gracia/i, 'Debe referenciar a la congregación Amor y Gracia');
      assert.match(content, /Durango/i, 'Debe situarse en la ciudad de Durango');
      assert.match(content, /Pastor Josh/i, 'Debe reconocer la cobertura pastoral de Josh');
    });

    it('debe enlazar en vivo a la instancia activa de Cloudflare Tunnels con badge verde', () => {
      assert.match(content, /habitat-cleaning-benz-syndication\.trycloudflare\.com/, 'Debe enlazar al túnel comunitario');
      assert.match(content, /target="_blank"/, 'Debe abrir en nueva pestaña');
      assert.match(content, /rel="noopener noreferrer"/, 'Debe proteger la navegación externa');
      assert.match(content, /En uso comunitario activo en Durango/i, 'Debe incluir el badge de estado vivo');
    });
  });

  // ==========================================================================
  // GOLD-342: Poda de Jerga Teórica y Tríada de Realidades Cotidianas
  // ==========================================================================
  describe('GOLD-342: Poda Absoluta de Jerga Teórica y Adopción de 3 Realidades', () => {
    it('no debe contener los 6 principios teóricos antiguos ni listas impersonales de superficies', () => {
      assert.doesNotMatch(content, /Principio 01/i, 'Principio 01 debe ser purgado');
      assert.doesNotMatch(content, /Límites de Dunbar/i, 'Límites de Dunbar como principio de marketing debe ser purgado');
      assert.doesNotMatch(content, /Privacidad Polimórfica Estricta/i, 'Privacidad Polimórfica debe ser purgada');
      assert.doesNotMatch(content, /Tríada Laica Anti-Burnout/i, 'Tríada Laica debe ser purgada');
      assert.doesNotMatch(content, /Las 6 Superficies/i, 'Las 6 Superficies deben ser purgadas de la portada');
      assert.doesNotMatch(content, /Consola Soberana de Operador/i, 'Consola de Operador debe ser purgada de la portada');
    });

    it('debe contener las 3 Realidades Cotidianas de la vida comunitaria', () => {
      assert.match(content, /Coordinación familiar sin saturar WhatsApp/i, 'Debe contener la realidad 1 (WhatsApp familiar)');
      assert.match(content, /Cuidado y descanso para la familia anfitriona/i, 'Debe contener la realidad 2 (Descanso del anfitrión)');
      assert.match(content, /Tu iglesia es la única dueña de sus datos/i, 'Debe contener la realidad 3 (Soberanía de datos)');
    });
  });

  // ==========================================================================
  // GOLD-343: Identidad de Taller Artesanal y Hogar Fundacional
  // ==========================================================================
  describe('GOLD-343: Narrativa de Taller Artesanal y Hogar Fundacional', () => {
    it('debe enunciar a Pórtico como taller artesanal y a Amor y Gracia como hogar fundacional', () => {
      assert.match(content, /Taller Artesanal de Software Soberano/i, 'Debe incluir la divisa de taller artesanal');
      assert.match(content, /hogar fundacional y testimonio vivo/i, 'Debe honrar a Amor y Gracia como hogar de origen');
    });
  });

  // ==========================================================================
  // GOLD-344: Estética Earthen Noble Cálido Unificada (WCAG AAA)
  // ==========================================================================
  describe('GOLD-344: Paleta Earthen Noble Cálido Unificada y Tipografía Serena', () => {
    it('debe definir la paleta cromática cálida (#FBF9F5, #2C2623, #93432F)', () => {
      assert.match(content, /#FBF9F5/i, 'Debe usar pergamino cálido #FBF9F5');
      assert.match(content, /#2C2623/i, 'Debe usar tinta carbón suave #2C2623');
      assert.match(content, /#93432F/i, 'Debe usar terracota artesanal #93432F');
    });

    it('debe cargar y aplicar Lora para serif y Plus Jakarta Sans para sans', () => {
      assert.match(content, /family=Lora/i, 'Debe importar Lora');
      assert.match(content, /family=Plus\+Jakarta\+Sans/i, 'Debe importar Plus Jakarta Sans');
      assert.match(content, /--font-serif:\s*'Lora'/i, 'Debe asignar Lora a la variable de serif');
    });

    it('debe incrustar el isotipo SVG vectorial de Amor y Gracia', () => {
      assert.match(content, /<svg.*viewBox="0 0 100 100"/s, 'Debe renderizar el SVG del corazón de Amor y Gracia');
      assert.match(content, /fill="#93432F"/i, 'El SVG debe lucir el color terracota noble');
    });
  });

  // ==========================================================================
  // GOLD-345: Canal Dual Humano y Directo (WhatsApp + Email)
  // ==========================================================================
  describe('GOLD-345: Canal Dual Humano y Directo', () => {
    it('debe ofrecer botón dominante de WhatsApp con mensaje precargado para Guillermo', () => {
      assert.match(content, /https:\/\/wa\.me\/52/i, 'Debe usar deep-link wa.me');
      assert.match(content, /Hola%20Guillermo/i, 'Debe contener saludo precargado a Guillermo');
      assert.match(content, /min-height:\s*48px/i, 'Debe cumplir ergonomía táctil de 48px');
    });

    it('debe ofrecer enlace directo de correo electrónico a Guillermo', () => {
      assert.match(content, /mailto:memoestefani@gmail\.com/i, 'Debe enlazar a memoestefani@gmail.com');
    });
  });

  // ==========================================================================
  // GOLD-346: Ocultamiento Total de GitHub en Portada Pública (Decisión 7-1)
  // ==========================================================================
  describe('GOLD-346: Silencio Absoluto de GitHub en Portada Pública', () => {
    it('no debe exponer enlaces ni menciones visibles al repositorio de GitHub en el cuerpo', () => {
      assert.doesNotMatch(content, /github\.com\/memoestefani\/portico/i, 'No debe exponer enlaces a GitHub');
      assert.doesNotMatch(content, /Ver Repositorio en GitHub/i, 'No debe mostrar botón de GitHub');
    });
  });

  // ==========================================================================
  // GOLD-347: Tarjeta Resiliente con Snapshot y Nota de Cortesía
  // ==========================================================================
  describe('GOLD-347: Resiliencia de Túnel con Vista Previa Optimizada', () => {
    it('debe integrar la captura real 01_portico_publico.png', () => {
      assert.match(content, /assets\/dossier\/01_portico_publico\.png/i, 'Debe enlazar al snapshot de respaldo');
    });

    it('debe incluir la nota pastoral de cortesía ante ventanas de mantenimiento', () => {
      assert.match(content, /Nota de cortesía/i, 'Debe contener la nota de cortesía');
      assert.match(content, /ventana de mantenimiento o descanso/i, 'Debe explicar con dignidad si el túnel duerme');
    });
  });

  // ==========================================================================
  // GOLD-349: Poda de Enlaces a PDFs Antiguos y Veracidad Total
  // ==========================================================================
  describe('GOLD-349: Poda de Enlaces a PDFs y Cero Textos Simulados', () => {
    it('no debe enlazar a descargas de PDFs ni al dossier antiguo en la navegación pública', () => {
      assert.doesNotMatch(content, /\.pdf/i, 'No debe enlazar a archivos .pdf');
      assert.doesNotMatch(content, /dossier_pastoral\.html/i, 'No debe enlazar al dossier HTML');
    });

    it('debe tener cero textos simulados o placeholders (Lorem Ipsum)', () => {
      assert.doesNotMatch(content, /Lorem ipsum/i, 'Cero Lorem Ipsum');
      assert.doesNotMatch(content, /ejemplo\.com/i, 'Cero ejemplo.com');
    });
  });
});
