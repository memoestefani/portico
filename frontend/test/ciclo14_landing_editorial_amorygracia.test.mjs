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
const issueFormPath = path.join(rootDir, '.github/ISSUE_TEMPLATE/solicitud.yml');

describe('Pórtico — Portal en Desarrollo: Software Ligero para Organizar Grupos Pequeños en tu Ciudad', () => {
  const content = fs.readFileSync(indexPath, 'utf-8');

  // ==========================================================================
  // Arquitectura Ultra-Simple y Monolito Vanilla (< 14 KB)
  // ==========================================================================
  describe('Arquitectura Ultra-Simple y Documento Fundacional', () => {
    it('docs/index.html debe existir, ser legible y medir menos de 14 KB', () => {
      assert.ok(fs.existsSync(indexPath), 'docs/index.html debe existir');
      const stat = fs.statSync(indexPath);
      assert.ok(stat.size > 1500, 'El archivo debe contener el marcado esencial');
      assert.ok(stat.size < 14000, `El archivo pesa ${stat.size} bytes, debe ser ultra-ligero (< 14 KB)`);
    });

    it('debe estructurarse como una sola vista sin scripts externos ni trackers', () => {
      assert.doesNotMatch(content, /<script\s+src=/i, 'Cero scripts JS externos o trackers');
    });
  });

  // ==========================================================================
  // Purga Estricta: Cero Amor y Gracia, Cero Pastor Josh, Cero Durango
  // ==========================================================================
  describe('Purga de Referencias Locales y Cobertura Específica', () => {
    it('no debe contener referencias a Amor y Gracia', () => {
      assert.doesNotMatch(content, /Amor y Gracia/i, 'No debe referenciar a la congregación Amor y Gracia');
    });

    it('no debe contener referencias al Pastor Josh', () => {
      assert.doesNotMatch(content, /Pastor Josh/i, 'No debe referenciar al Pastor Josh');
      assert.doesNotMatch(content, /\bJosh\b/i, 'No debe contener ninguna mención a Josh');
    });

    it('no debe contener referencias a Durango', () => {
      assert.doesNotMatch(content, /Durango/i, 'No debe situarse o mencionar Durango');
    });
  });

  // ==========================================================================
  // "Portal en desarrollo" y Cero "Portal en vivo"
  // ==========================================================================
  describe('Estado del Portal: "Portal en desarrollo" sin "Portal en vivo"', () => {
    it('debe indicar claramente que es un portal en desarrollo', () => {
      assert.match(content, /portal en desarrollo/i, 'Debe indicar que es un portal en desarrollo');
    });

    it('no debe decir "portal en vivo"', () => {
      assert.doesNotMatch(content, /portal en vivo/i, 'No debe contener la frase "portal en vivo"');
    });

    it('debe enlazar al entorno de pruebas en Cloudflare Tunnels', () => {
      assert.match(content, /habitat-cleaning-benz-syndication\.trycloudflare\.com/, 'Debe enlazar al entorno de pruebas');
      assert.match(content, /target="_blank"/, 'Debe abrir en nueva pestaña');
      assert.match(content, /rel="noopener noreferrer"/, 'Debe proteger la navegación externa');
    });
  });

  // ==========================================================================
  // Propuesta de Valor Oficial
  // ==========================================================================
  describe('Propuesta de Valor Oficial', () => {
    it('debe titularse "Software ligero para organizar grupos pequeños en tu ciudad"', () => {
      assert.match(content, /Software ligero para organizar grupos pequeños en tu ciudad/i, 'Debe incluir la propuesta exacta');
    });

    it('debe expresar las necesidades reales en lenguaje cotidiano', () => {
      assert.match(content, /WhatsApp/i, 'Debe mencionar la coordinación sin saturar WhatsApp');
      assert.match(content, /anfitrion/i, 'Debe mencionar el cuidado y descanso de las familias anfitrionas');
      assert.match(content, /dueña de sus datos/i, 'Debe mencionar que la iglesia o comunidad es dueña de sus datos');
    });
  });

  // ==========================================================================
  // Formulario Oficial de GitHub para Recibir Información
  // ==========================================================================
  describe('Formulario Oficial de GitHub para Recibir Información', () => {
    it('debe existir la plantilla oficial de Issue Form en .github/ISSUE_TEMPLATE/solicitud.yml', () => {
      assert.ok(fs.existsSync(issueFormPath), '.github/ISSUE_TEMPLATE/solicitud.yml debe existir');
      const formContent = fs.readFileSync(issueFormPath, 'utf-8');
      assert.match(formContent, /name:\s*Solicitar información/i, 'Debe tener nombre descriptivo');
      assert.match(formContent, /ciudad/i, 'Debe capturar la ciudad');
      assert.match(formContent, /contacto/i, 'Debe capturar medio de contacto');
    });

    it('debe enlazar directamente al formulario oficial de GitHub en la landing', () => {
      assert.match(content, /github\.com\/memoestefani\/portico\/issues\/new\?template=solicitud\.yml/, 'Debe enlazar al formulario oficial');
    });
  });

  // ==========================================================================
  // Poda Absoluta de Jerga Teórica, Palabrería y Ventas
  // ==========================================================================
  describe('Poda Absoluta de Jerga Teórica y Retórica Publicitaria', () => {
    it('no debe contener jerga de marketing ni principios teóricos densos', () => {
      assert.doesNotMatch(content, /Principio 01/i, 'Principio 01 debe ser purgado');
      assert.doesNotMatch(content, /Límites de Dunbar/i, 'Límites de Dunbar debe ser purgado de la portada');
      assert.doesNotMatch(content, /Privacidad Polimórfica Estricta/i, 'Privacidad Polimórfica debe ser purgada');
      assert.doesNotMatch(content, /Tríada Laica Anti-Burnout/i, 'Tríada Laica debe ser purgada');
      assert.doesNotMatch(content, /Las 6 Superficies/i, 'Las 6 Superficies deben ser purgadas');
    });

    it('no debe contener la palabrería de "soberano" ni "soberanía"', () => {
      assert.doesNotMatch(content, /soberan/i, 'No debe usar palabrería confusa como soberano o soberanía');
    });

    it('no debe contener frases de venta comercial ni preguntas publicitarias', () => {
      assert.doesNotMatch(content, /¿Te gustaría/i, 'Cero preguntas de venta comercial');
      assert.doesNotMatch(content, /platicar con nosotros/i, 'Cero retórica de captación comercial');
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

    it('debe priorizar pureza tipográfica editorial sin logos ni SVG decorativos', () => {
      assert.doesNotMatch(content, /<svg/i, 'Cero logos o imágenes decorativas - pureza tipográfica editorial');
    });
  });

  // ==========================================================================
  // Privacidad Absoluta: Cero Datos Personales Directos
  // ==========================================================================
  describe('Privacidad Absoluta: Cero Datos Personales Directos', () => {
    it('no debe exponer nombres personales ("Guillermo Estefani") ni correos personales', () => {
      assert.doesNotMatch(content, /Guillermo/i, 'No debe exponer el nombre personal Guillermo');
      assert.doesNotMatch(content, /Guillermo\s+Estefani/i, 'No debe exponer el nombre completo personal');
      assert.doesNotMatch(content, /memoestefani@gmail\.com/i, 'No debe exponer correo personal');
    });

    it('no debe exponer enlaces a WhatsApp ni correos', () => {
      assert.doesNotMatch(content, /wa\.me/i, 'No debe contener enlaces de WhatsApp');
      assert.doesNotMatch(content, /mailto:/i, 'No debe contener enlaces mailto');
    });

    it('debe tener cero textos simulados o placeholders (Lorem Ipsum)', () => {
      assert.doesNotMatch(content, /Lorem ipsum/i, 'Cero Lorem Ipsum');
      assert.doesNotMatch(content, /ejemplo\.com/i, 'Cero ejemplo.com');
    });
  });
});
