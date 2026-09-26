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

describe('Pórtico OS v3.6 - Ciclo 14: Página Personal Minimalista, Serena y Caso Amor y Gracia Durango', () => {
  const content = fs.readFileSync(indexPath, 'utf-8');

  // ==========================================================================
  // Arquitectura Ultra-Simple y Monolito Vanilla (< 10 KB)
  // ==========================================================================
  describe('Arquitectura Ultra-Simple y Monolito Vanilla Autónomo', () => {
    it('docs/index.html debe existir, ser legible y medir menos de 10 KB', () => {
      assert.ok(fs.existsSync(indexPath), 'docs/index.html debe existir');
      const stat = fs.statSync(indexPath);
      assert.ok(stat.size > 1500, 'El archivo debe contener el marcado esencial');
      assert.ok(stat.size < 10000, `El archivo pesa ${stat.size} bytes, debe ser ultra-ligero (< 10 KB)`);
    });

    it('debe estructurarse como una sola vista sin scripts externos ni trackers', () => {
      assert.doesNotMatch(content, /<script\s+src=/i, 'Cero scripts JS externos o trackers');
    });
  });

  // ==========================================================================
  // Tarjeta de Caso Vivo de Amor y Gracia Durango con Pastor Josh
  // ==========================================================================
  describe('Tarjeta de Caso Vivo Testimonial Real de Amor y Gracia', () => {
    it('debe identificar a la congregación Amor y Gracia, Durango y al Pastor Josh', () => {
      assert.match(content, /Amor y Gracia/i, 'Debe referenciar a la congregación Amor y Gracia');
      assert.match(content, /Durango/i, 'Debe situarse en la ciudad de Durango');
      assert.match(content, /Pastor Josh/i, 'Debe reconocer la cobertura pastoral de Josh');
    });

    it('debe enlazar directamente a la instancia comunitaria en vivo con Cloudflare Tunnels', () => {
      assert.match(content, /habitat-cleaning-benz-syndication\.trycloudflare\.com/, 'Debe enlazar al portal en vivo');
      assert.match(content, /target="_blank"/, 'Debe abrir en nueva pestaña');
      assert.match(content, /rel="noopener noreferrer"/, 'Debe proteger la navegación externa');
      assert.match(content, /Ver portal en vivo/i, 'Debe tener botón claro hacia el portal en vivo');
    });
  });

  // ==========================================================================
  // Poda Absoluta de Jerga Teórica y Realidades Cotidianas
  // ==========================================================================
  describe('Poda Absoluta de Jerga Teórica y Enfoque Humano', () => {
    it('no debe contener jerga de marketing ni principios teóricos densos', () => {
      assert.doesNotMatch(content, /Principio 01/i, 'Principio 01 debe ser purgado');
      assert.doesNotMatch(content, /Límites de Dunbar/i, 'Límites de Dunbar debe ser purgado de la portada');
      assert.doesNotMatch(content, /Privacidad Polimórfica Estricta/i, 'Privacidad Polimórfica debe ser purgada');
      assert.doesNotMatch(content, /Tríada Laica Anti-Burnout/i, 'Tríada Laica debe ser purgada');
      assert.doesNotMatch(content, /Las 6 Superficies/i, 'Las 6 Superficies deben ser purgadas');
    });

    it('debe expresar las necesidades reales en lenguaje cotidiano', () => {
      assert.match(content, /WhatsApp/i, 'Debe mencionar la coordinación sin saturar WhatsApp');
      assert.match(content, /anfitrion/i, 'Debe mencionar el cuidado y descanso de las familias anfitrionas');
      assert.match(content, /dueña de sus datos/i, 'Debe mencionar la soberanía de datos');
    });
  });

  // ==========================================================================
  // Estética Limpia, Serena y Tipografía Refinada
  // ==========================================================================
  describe('Estética Limpia, Serena y Tipografía Refinada', () => {
    it('debe usar la paleta cálida y noble (#FAF8F5, #93432F, etc.)', () => {
      assert.match(content, /#FAF8F5/i, 'Debe usar fondo pergamino cálido');
      assert.match(content, /#93432F/i, 'Debe usar terracota artesanal');
    });

    it('debe cargar y aplicar Lora para serif y Plus Jakarta Sans para sans', () => {
      assert.match(content, /family=Lora/i, 'Debe importar Lora');
      assert.match(content, /family=Plus\+Jakarta\+Sans/i, 'Debe importar Plus Jakarta Sans');
    });

    it('debe incrustar el isotipo SVG vectorial de Amor y Gracia / Pórtico', () => {
      assert.match(content, /<svg.*viewBox="0 0 100 100"/s, 'Debe renderizar el SVG del corazón entrelazado');
      assert.match(content, /fill="#93432F"/i, 'El SVG debe lucir el color terracota noble');
    });
  });

  // ==========================================================================
  // Canal Humano Directo y Discreto (WhatsApp + Email)
  // ==========================================================================
  describe('Canal Humano Directo y Discreto', () => {
    it('debe ofrecer enlace directo de WhatsApp con mensaje precargado para Guillermo', () => {
      assert.match(content, /https:\/\/wa\.me\/52/i, 'Debe usar deep-link wa.me');
      assert.match(content, /Hola%20Guillermo/i, 'Debe contener saludo precargado');
    });

    it('debe ofrecer enlace directo de correo electrónico a Guillermo', () => {
      assert.match(content, /mailto:memoestefani@gmail\.com/i, 'Debe enlazar a memoestefani@gmail.com');
    });
  });

  // ==========================================================================
  // Silencio Absoluto de GitHub y Veracidad
  // ==========================================================================
  describe('Silencio Absoluto de GitHub y Cero Simulaciones', () => {
    it('no debe exponer enlaces al repositorio de GitHub en el cuerpo', () => {
      assert.doesNotMatch(content, /github\.com\/memoestefani\/portico/i, 'No debe exponer enlaces a GitHub');
    });

    it('debe tener cero textos simulados o placeholders (Lorem Ipsum)', () => {
      assert.doesNotMatch(content, /Lorem ipsum/i, 'Cero Lorem Ipsum');
      assert.doesNotMatch(content, /ejemplo\.com/i, 'Cero ejemplo.com');
    });
  });
});
