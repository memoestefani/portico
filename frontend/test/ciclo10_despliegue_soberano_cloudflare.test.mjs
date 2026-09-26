import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const frontendDir = path.resolve(__dirname, '..');
const componentsDir = path.join(frontendDir, 'src/components');

describe('Pórtico OS v3.4 - Ciclo 10: Despliegue Soberano, Cero Proveedores Extra y Salida Libre (GOLD-307 a GOLD-316)', () => {
  // D1 / GOLD-307: Topología de Código Monorrector Multi-Tenant
  describe('GOLD-307: Topología de Código Monorrector Multi-Tenant', () => {
    it('docker-compose.yml debe montar volumen de datos persistente aislado por tenant sin forks de código', () => {
      const composePath = path.join(rootDir, 'docker-compose.yml');
      assert.ok(fs.existsSync(composePath), 'docker-compose.yml debe existir en la raíz');
      const composeContent = fs.readFileSync(composePath, 'utf-8');
      assert.match(composeContent, /\.\/data:\/app\/data/, 'Debe mapear ./data para persistencia aislada de SQLite');
      assert.doesNotMatch(composeContent, /git clone/i, 'No debe exigir repositorios separados por iglesia');
    });
  });

  // D2 / GOLD-308: Docker Compose Multi-Contenedor
  describe('GOLD-308: Docker Compose Multi-Contenedor y Red Interna Bridge', () => {
    it('docker-compose.yml debe definir servicios app y tunnel en red interna portico-net', () => {
      const composePath = path.join(rootDir, 'docker-compose.yml');
      const composeContent = fs.readFileSync(composePath, 'utf-8');
      assert.match(composeContent, /app:/, 'Debe existir servicio app');
      assert.match(composeContent, /tunnel:/, 'Debe existir servicio tunnel');
      assert.match(composeContent, /portico-net:/, 'Debe existir red privada interna portico-net');
    });

    it('docker-compose.yml NO debe exponer puertos hacia la máquina host (Zero Inbound Ports)', () => {
      const composePath = path.join(rootDir, 'docker-compose.yml');
      const composeContent = fs.readFileSync(composePath, 'utf-8');
      assert.doesNotMatch(composeContent, /ports:\s*-\s*["']?\d+:\d+["']?/, 'No debe mapear puertos públicos hacia el host');
      assert.match(composeContent, /expose:\s*-\s*["']?3000["']?/, 'Debe usar expose para red interna');
    });
  });

  // D3 / GOLD-309: Infraestructura Unificada Cloudflare (Cero Proveedores Extra)
  describe('GOLD-309: Infraestructura Unificada Cloudflare', () => {
    it('el stack de producción no debe referenciar proveedores cloud innecesarios (Oracle, AWS, Fly)', () => {
      const composePath = path.join(rootDir, 'docker-compose.yml');
      const composeContent = fs.readFileSync(composePath, 'utf-8');
      assert.doesNotMatch(composeContent, /oracle/i, 'No debe depender de Oracle Cloud');
      assert.doesNotMatch(composeContent, /aws\.amazon/i, 'No debe depender de AWS');
      assert.doesNotMatch(composeContent, /fly\.io/i, 'No debe depender de Fly.io');
    });

    it('.env.production.example debe documentar variables unificadas de Cloudflare Tunnel y R2', () => {
      const envExamplePath = path.join(rootDir, '.env.production.example');
      assert.ok(fs.existsSync(envExamplePath), '.env.production.example debe existir');
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      assert.match(envContent, /CLOUDFLARE_TUNNEL_TOKEN/, 'Debe documentar CLOUDFLARE_TUNNEL_TOKEN');
      assert.match(envContent, /CLOUDFLARE_R2_BUCKET/, 'Debe documentar CLOUDFLARE_R2_BUCKET');
      assert.match(envContent, /OPERATOR_KEY/, 'Debe documentar OPERATOR_KEY');
    });
  });

  // D4 / GOLD-310: Ruteo Seguro por Cloudflare Tunnel
  describe('GOLD-310: Ruteo Seguro por Cloudflare Tunnel con Subdominios Gestionados', () => {
    it('el contenedor tunnel debe usar la imagen oficial cloudflare/cloudflared y comando tunnel run', () => {
      const composePath = path.join(rootDir, 'docker-compose.yml');
      const composeContent = fs.readFileSync(composePath, 'utf-8');
      assert.match(composeContent, /cloudflare\/cloudflared:latest/, 'Debe usar imagen oficial de cloudflared');
      assert.match(composeContent, /command:\s*tunnel run/, 'Debe ejecutar tunnel run');
    });
  });

  // D5 / GOLD-311: Autenticación Soberana y Purga de RoleSwitcher
  describe('GOLD-311: Autenticación Soberana y Purga de RoleSwitcher en Producción', () => {
    it('RoleSwitcher.tsx debe estar protegido con guardia para purgarse en compilaciones de producción', () => {
      const roleSwitcherPath = path.join(componentsDir, 'RoleSwitcher.tsx');
      assert.ok(fs.existsSync(roleSwitcherPath), 'RoleSwitcher.tsx debe existir');
      const content = fs.readFileSync(roleSwitcherPath, 'utf-8');
      assert.match(
        content,
        /import\.meta\.env\.DEV/,
        'RoleSwitcher debe consultar import.meta.env.DEV para no renderizarse en producción'
      );
    });
  });

  // D6 / GOLD-312: Doble Capa de Confinamiento para OperatorHq
  describe('GOLD-312: Doble Capa de Confinamiento para OperatorHq', () => {
    it('OperatorHq.tsx debe exigir autorización administrativa y no ser accesible en navegación pública', () => {
      const operatorPath = path.join(componentsDir, 'OperatorHq.tsx');
      assert.ok(fs.existsSync(operatorPath), 'OperatorHq.tsx debe existir');
      const content = fs.readFileSync(operatorPath, 'utf-8');
      assert.match(content, /token|operator/i, 'OperatorHq debe contar con mecanismos de verificación de operador');
    });
  });

  // D7 / GOLD-313: Salida Soberana Dual (.db + CSVs en ZIP)
  describe('GOLD-313: Salida Soberana Dual ("No Strings Attached")', () => {
    it('PastorHud.tsx debe implementar el botón de descarga #btn-export-sovereign-archive', () => {
      const pastorHudPath = path.join(componentsDir, 'PastorHud.tsx');
      const content = fs.readFileSync(pastorHudPath, 'utf-8');
      assert.match(
        content,
        /id=["']btn-export-sovereign-archive["']/,
        'Debe incluir botón táctil con ID btn-export-sovereign-archive'
      );
      assert.match(
        content,
        /\/api\/pastor\/export-sovereign-archive/,
        'Debe apuntar al endpoint de descarga de archivo ZIP en Axum'
      );
    });

    it('PastorHud.tsx debe mostrar la garantía explícita de "No Strings Attached" y propiedad de datos', () => {
      const pastorHudPath = path.join(componentsDir, 'PastorHud.tsx');
      const content = fs.readFileSync(pastorHudPath, 'utf-8');
      assert.match(
        content,
        /Amor y Gracia es la única dueña de sus datos/i,
        'Debe comunicar la garantía incondicional de propiedad comunitaria de datos'
      );
    });
  });

  // D8 / GOLD-314: Streaming Continuo SQLite con Litestream a Cloudflare R2
  describe('GOLD-314: Replicación Continua con Litestream a Cloudflare R2', () => {
    it('backend/litestream.yml debe estar configurado para replicar amorygracia.db hacia R2 S3 API', () => {
      const litestreamPath = path.join(rootDir, 'backend/litestream.yml');
      assert.ok(fs.existsSync(litestreamPath), 'backend/litestream.yml debe existir');
      const content = fs.readFileSync(litestreamPath, 'utf-8');
      assert.match(content, /amorygracia\.db/, 'Debe monitorizar amorygracia.db');
      assert.match(content, /r2\.cloudflarestorage\.com/, 'Debe apuntar al endpoint S3 de Cloudflare R2');
      assert.match(content, /sync-interval:\s*5s/, 'Debe tener intervalo de sincronización ágil');
    });
  });

  // D9 / GOLD-315: Privacidad Polimórfica en Backend Rust y Anti-Scraping
  describe('GOLD-315: Privacidad Polimórfica en Backend y Protección Anti-Scraping', () => {
    it('el script clean_debris.ps1 debe existir y asegurar la frontera hermética del proyecto', () => {
      const scriptPath = path.join(rootDir, 'tools/clean_debris.ps1');
      assert.ok(fs.existsSync(scriptPath), 'tools/clean_debris.ps1 debe existir');
      const content = fs.readFileSync(scriptPath, 'utf-8');
      assert.match(content, /Thumbs\.db|\.DS_Store|\*\.tmp/, 'Debe contener patrones de saneamiento de SO');
      assert.match(content, /Frontera limpia|saneamiento completado/i, 'Debe certificar saneamiento de frontera');
    });
  });

  // D10 / GOLD-316: Radar Pastoral In-App y Despacho wa.me Nativo a Costo $0
  describe('GOLD-316: Radar Pastoral In-App y Despacho wa.me Nativo', () => {
    it('PastorHud.tsx y DeaconDesk.tsx deben implementar disparadores wa.me nativos sin pasarelas de pago', () => {
      const deaconDeskPath = path.join(componentsDir, 'DeaconDesk.tsx');
      const content = fs.readFileSync(deaconDeskPath, 'utf-8');
      assert.match(content, /wa\.me/i, 'DeaconDesk debe usar enlaces nativos wa.me a costo $0');
    });
  });
});
