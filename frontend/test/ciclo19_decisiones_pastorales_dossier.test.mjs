import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const memberSiloPath = path.resolve('src/components/MemberSilo.tsx');
const memberSiloCode = fs.readFileSync(memberSiloPath, 'utf8');

const pastorHudPath = path.resolve('src/components/PastorHud.tsx');
const pastorHudCode = fs.readFileSync(pastorHudPath, 'utf8');

const roleSwitcherPath = path.resolve('src/components/RoleSwitcher.tsx');
const roleSwitcherCode = fs.readFileSync(roleSwitcherPath, 'utf8');

const typesPath = path.resolve('src/types.ts');
const typesCode = fs.readFileSync(typesPath, 'utf8');

const capturarPantallasPath = path.resolve('../tools/capturar_pantallas.ps1');
const capturarPantallasCode = fs.readFileSync(capturarPantallasPath, 'utf8');

const generarDossierPath = path.resolve('../tools/generar_dossier.ps1');
const generarDossierCode = fs.readFileSync(generarDossierPath, 'utf8');

const dossierHtmlPath = path.resolve('../docs/dossier_pastoral.html');
const dossierHtmlCode = fs.readFileSync(dossierHtmlPath, 'utf8');

describe('Pórtico OS - Ciclo 19: Las 10 Decisiones Pastorales, Modo Claro Editorial y Versionado', () => {

  describe('Decisión 1-B: Paleta y Estética del Dossier en Modo Claro Earthen Noble', () => {
    it('capturar_pantallas.ps1 debe forzar el modo claro en el motor headless de Edge', () => {
      assert.ok(capturarPantallasCode.includes('--force-prefers-color-scheme=light'), 'Falta parámetro --force-prefers-color-scheme=light en Edge');
      assert.ok(capturarPantallasCode.includes('theme=light'), 'Todas las URLs de captura deben incluir theme=light');
    });

    it('RoleSwitcher.tsx debe priorizar el parámetro URL theme=light sobre localStorage', () => {
      assert.ok(roleSwitcherCode.includes("new URLSearchParams(window.location.search).get('theme')"), 'Falta lectura de theme desde URL en RoleSwitcher');
    });

    it('dossier_pastoral.html debe usar la paleta editorial clara y estar libre de etiquetas arcaicas', () => {
      assert.ok(dossierHtmlCode.includes('--bg-cream: #FAF8F5;'), 'Falta paleta crema en dossier HTML');
      assert.ok(!dossierHtmlCode.startsWith('3'), 'No debe haber números residuales al inicio del documento');
      assert.ok(dossierHtmlCode.includes('Pastor Josh Gayosso'), 'Debe identificar formalmente al Pastor Josh Gayosso');
    });
  });

  describe('Decisión 2-A: Versionado Histórico y Nomenclatura ISO con Fecha', () => {
    it('generar_dossier.ps1 debe implementar nomenclatura YYYY-MM-DD_v-X en docs/dossiers/', () => {
      assert.ok(generarDossierCode.includes('$dossiersDir = Join-Path $PSScriptRoot "..\\docs\\dossiers"'), 'Falta ruta de carpeta dossiers');
      assert.ok(generarDossierCode.includes('${todayStr}_v-${nextVersion}_Dossier_Pastoral_Josh_Gayosso.pdf'), 'Falta patrón de versionado con fecha');
      assert.ok(generarDossierCode.includes('Copy-Item -Path $resolvedOutputPdf -Destination $canonicalPdfPath'), 'Debe actualizar la copia canónica');
    });
  });

  describe('Decisión 3-B: Encuadre Quirúrgico de Soberanía y Portabilidad de Datos', () => {
    it('PastorHud.tsx debe proveer vista dedicada cuando view=sovereignty', () => {
      assert.ok(pastorHudCode.includes("get('view') === 'sovereignty'"), 'Falta detección de view=sovereignty');
      assert.ok(pastorHudCode.includes('id="btn-export-sovereign-archive"'), 'Falta botón de exportación en vista dedicada');
      assert.ok(pastorHudCode.includes('amorygracia.db'), 'Falta mención a archivo SQLite amorygracia.db');
      assert.ok(pastorHudCode.includes('MANIFIESTO_SOBERANO.txt'), 'Falta manifiesto de garantía soberana');
    });

    it('capturar_pantallas.ps1 debe dirigir la superficie 06 a la vista limpia de soberanía', () => {
      assert.ok(capturarPantallasCode.includes('view=sovereignty'), 'Superficie 06 debe invocar view=sovereignty');
    });
  });

  describe('Decisión 4-B: Selector de Modalidad Litúrgica Semanal y Flexibilidad Logística', () => {
    it('types.ts debe tipificar WeeklyLogisticsMode y WeeklyLogisticsUpdate', () => {
      assert.ok(typesCode.includes('WeeklyLogisticsMode'), 'Falta tipo WeeklyLogisticsMode');
      assert.ok(typesCode.includes('habitual_home') && typesCode.includes('alternate_home') && typesCode.includes('outreach_hospital_creso') && typesCode.includes('fellowship_outing'), 'Faltan modalidades litúrgicas');
      assert.ok(typesCode.includes('WeeklyLogisticsUpdate'), 'Falta tipo WeeklyLogisticsUpdate');
    });

    it('MemberSilo.tsx debe ofrecer botón de ajuste rápido y modal logístico para el líder', () => {
      assert.ok(memberSiloCode.includes('id="btn-quick-adjust-venue"'), 'Falta botón de ajuste rápido de lugar');
      assert.ok(memberSiloCode.includes('handleOpenVenueEditor'), 'Falta handler para abrir editor de sede');
      assert.ok(memberSiloCode.includes('isLeader'), 'Ajuste logístico debe estar estrictamente acotado al líder');
    });
  });

  describe('Decisión 5-A: Acta de Convivio Fraternal Mancomunado', () => {
    it('MemberSilo.tsx debe admitir células aliadas en encuentros especiales sin duplicidad', () => {
      assert.ok(memberSiloCode.includes('venueIsJoint'), 'Falta estado venueIsJoint');
      assert.ok(memberSiloCode.includes('venuePartnerGroupName'), 'Falta campo de grupo o célula aliada');
      assert.ok(typesCode.includes('is_joint_meeting?: boolean;'), 'types.ts debe contener is_joint_meeting');
    });
  });

  describe('Decisión 6-B: Consola de Discernimiento Paternal Exclusiva para Josh Gayosso', () => {
    it('PastorHud.tsx y backend de semillas deben referenciar al Pastor Josh Gayosso sin rastro de García', () => {
      assert.ok(pastorHudCode.includes('Pastor Josh'), 'Falta referencia al Pastor Josh en PastorHud');
      assert.ok(!pastorHudCode.includes('Pastor Josh García'), 'No debe existir Pastor Josh García en PastorHud');
      assert.ok(pastorHudCode.includes('handleVetoPairing'), 'Falta función handleVetoPairing');
    });
  });

  describe('Decisión 7-A: Sabático Diaconal de Hogar in situ', () => {
    it('tipos y estructuras deben contemplar concesión de sabático diaconal', () => {
      assert.ok(typesCode.includes('DeaconSabbaticalGrant'), 'Falta interfaz DeaconSabbaticalGrant');
      assert.ok(pastorHudCode.includes('Conceder Sabático'), 'PastorHud debe mostrar opción de conceder sabático');
    });
  });

  describe('Decisión 8-A: Tutelaje Patriarcal y Bloqueo 1:1 Infranqueable de Menores', () => {
    it('MemberSilo.tsx debe bloquear el chat privado 1:1 adulto-menor por mandato de salvaguarda', () => {
      assert.ok(memberSiloCode.includes('showMinorProtectionNotice'), 'Falta modal de aviso de salvaguarda');
      assert.ok(memberSiloCode.includes('bloqueados por diseño'), 'Debe declarar que los canales 1:1 están bloqueados por diseño');
    });
  });

  describe('Decisión 10-A: Autocontención Local del Dossier para WhatsApp', () => {
    it('el script generador debe producir archivos PDF autocontenidos listos para WhatsApp', () => {
      assert.ok(generarDossierCode.includes('Listo para adjuntar y enviar por WhatsApp a Pastor Josh Gayosso.'), 'Falta confirmación de salida para WhatsApp');
    });
  });

});
