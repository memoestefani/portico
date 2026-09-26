import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');
const componentsDir = path.resolve(srcDir, 'components');
const cssPath = path.resolve(srcDir, 'index.css');

describe('Pórtico OS v3.5 - Ciclo 12: Ergonomía Apple HIG, Filtro Elena Ramos y Santuario (GOLD-320 a GOLD-329)', () => {

  // ==========================================================================
  // GOLD-320 (1-B): Doble Capa en Iniciativas Comunitarias
  // ==========================================================================
  describe('GOLD-320: Doble Capa en Iniciativas Comunitarias (Público vs Silo)', () => {
    const portalPath = path.join(componentsDir, 'PublicPortal.tsx');
    const siloPath = path.join(componentsDir, 'MemberSilo.tsx');
    const hubPath = path.join(componentsDir, 'CommunityInitiativesHub.tsx');

    it('PublicPortal.tsx debe renderizar CommunityInitiativesHub en modo vitrina pública (publicShowcaseOnly)', () => {
      const portalContent = fs.readFileSync(portalPath, 'utf-8');
      assert.match(portalContent, /<CommunityInitiativesHub\s+publicShowcaseOnly=\{true\}/i, 'PublicPortal debe usar publicShowcaseOnly={true}');
    });

    it('MemberSilo.tsx debe integrar el gestor logístico completo de iniciativas comunitarias', () => {
      const siloContent = fs.readFileSync(siloPath, 'utf-8');
      assert.match(siloContent, /<CommunityInitiativesHub\s+publicShowcaseOnly=\{false\}/i, 'MemberSilo debe albergar la logística de iniciativas');
    });

    it('CommunityInitiativesHub.tsx debe soportar el prop publicShowcaseOnly para ocultar insumos en la calle abierta', () => {
      const hubContent = fs.readFileSync(hubPath, 'utf-8');
      assert.match(hubContent, /publicShowcaseOnly\?: boolean/i, 'CommunityInitiativesHub debe definir el prop publicShowcaseOnly');
      assert.match(hubContent, /!publicShowcaseOnly\s*\?\s*\(/i, 'CommunityInitiativesHub debe condicionar los insumos a usuarios autenticados');
    });
  });

  // ==========================================================================
  // GOLD-321 (2-A): Puerta Única de Visita en Catálogo Abierto
  // ==========================================================================
  describe('GOLD-321: Puerta Única de Visita (Desacople de Botón Pase/QR Público)', () => {
    const portalPath = path.join(componentsDir, 'PublicPortal.tsx');

    it('las tarjetas del catálogo público no deben contener el botón confuso Pase / QR', () => {
      const portalContent = fs.readFileSync(portalPath, 'utf-8');
      // Verificamos que el botón Pase / QR no esté dentro del mapeo de tarjetas
      assert.doesNotMatch(portalContent, /<span>Pase \/ QR<\/span>/i, 'PublicPortal todavía muestra el botón Pase / QR en las tarjetas');
    });

    it('la tarjeta pública debe presentar una sola puerta de entrada clara: Quiero Conocer Este Grupo', () => {
      const portalContent = fs.readFileSync(portalPath, 'utf-8');
      assert.match(portalContent, /<span>Quiero Conocer Este Grupo<\/span>/i, 'Falta la puerta única: Quiero Conocer Este Grupo');
    });
  });

  // ==========================================================================
  // GOLD-322 (3-B): Cortesía Cívica Vecinal en Pie de Página Institucional
  // ==========================================================================
  describe('GOLD-322: Cortesía Cívica Vecinal en Pie de Página', () => {
    const portalPath = path.join(componentsDir, 'PublicPortal.tsx');

    it('el canal vecinal debe ubicarse en el pie de página como un enlace noble y no como cajón de quejas', () => {
      const portalContent = fs.readFileSync(portalPath, 'utf-8');
      assert.match(portalContent, /id="btn-open-civic-care"/i, 'Falta enlace btn-open-civic-care en el footer');
      assert.match(portalContent, /¿Eres vecino de alguna de nuestras reuniones en casa\?/i, 'Falta texto sereno de cortesía vecinal');
      assert.doesNotMatch(portalContent, /Reportar Inquietud Vecinal<\/button>/i, 'No debe existir el botón alarmista de quejas');
    });
  });

  // ==========================================================================
  // GOLD-323 (4-B): Re-expresión Humana Total (Filtro Elena Ramos)
  // ==========================================================================
  describe('GOLD-323: Re-expresión Humana Total (Filtro Elena Ramos)', () => {
    const portalPath = path.join(componentsDir, 'PublicPortal.tsx');

    it('no debe exhibir tecnicismos como Privacidad Polimórfica en texto público', () => {
      const portalContent = fs.readFileSync(portalPath, 'utf-8');
      assert.doesNotMatch(portalContent, /Privacidad Sellada/i, 'Aún existe Privacidad Sellada en PublicPortal');
      assert.match(portalContent, /La dirección de este hogar está cuidada/i, 'Falta expresión humana: La dirección de este hogar está cuidada');
    });
  });

  // ==========================================================================
  // GOLD-324 (5-B): Escala Masiva 15k con Proximidad Primero en Durango
  // ==========================================================================
  describe('GOLD-324: Escala Masiva 15k Miembros (Proximidad Primero y Lotes de 6)', () => {
    const portalPath = path.join(componentsDir, 'PublicPortal.tsx');

    it('PublicPortal.tsx debe exportar DURANGO_COLONIAS y renderizar selector en 1 toque', () => {
      const portalContent = fs.readFileSync(portalPath, 'utf-8');
      assert.match(portalContent, /DURANGO_COLONIAS/i, 'Falta array DURANGO_COLONIAS');
      assert.match(portalContent, /id="colonia-pill-all"/i, 'Falta pill de todas las colonias');
      assert.match(portalContent, /id="input-quick-search-colonia"/i, 'Falta buscador instantáneo de proximidad');
    });

    it('PublicPortal.tsx debe limitar la carga inicial a 6 tarjetas y ofrecer botón de revelación', () => {
      const portalContent = fs.readFileSync(portalPath, 'utf-8');
      assert.match(portalContent, /displayedGroups\.slice\(0,\s*visibleLimit\)/i, 'No se está paginando con visibleLimit');
      assert.match(portalContent, /id="btn-load-more-groups"/i, 'Falta botón de carga progresiva btn-load-more-groups');
    });
  });

  // ==========================================================================
  // GOLD-325 (6-B): Blindaje Anti-Scrapers y Botón Directo wa.me
  // ==========================================================================
  describe('GOLD-325: Blindaje Anti-Scrapers en Teléfonos de Anfitriones', () => {
    const portalPath = path.join(componentsDir, 'PublicPortal.tsx');

    it('la tarjeta pública debe contar con el botón seguro Saludar por WhatsApp sin exponer teléfonos crudos', () => {
      const portalContent = fs.readFileSync(portalPath, 'utf-8');
      assert.match(portalContent, /btn-wa-safe/i, 'Falta botón con clase btn-wa-safe');
      assert.match(portalContent, /https:\/\/wa\.me\//i, 'Debe enlazar directamente a wa.me');
      assert.match(portalContent, /Saludar por WhatsApp/i, 'Falta texto Saludar por WhatsApp');
    });
  });

  // ==========================================================================
  // GOLD-326 (7-B): Diseño de Santuario y Micro-copys de Confianza
  // ==========================================================================
  describe('GOLD-326: Diseño de Santuario y Micro-copys de Confianza', () => {
    const portalPath = path.join(componentsDir, 'PublicPortal.tsx');

    it('el modal de visita debe explicar el cuidado del número telefónico sin lenguaje legal hostil', () => {
      const portalContent = fs.readFileSync(portalPath, 'utf-8');
      assert.match(portalContent, /Un espacio seguro:.*Tu número solo lo recibe el anfitrión/i, 'Falta micro-copy de santuario');
      assert.match(portalContent, /Jamás compartiremos tus datos con nadie más/i, 'Falta garantía de privacidad cálida');
    });
  });

  // ==========================================================================
  // GOLD-327 (8-B): Ergonomía Táctil 48px y Paleta Earthen Noble
  // ==========================================================================
  describe('GOLD-327: Ergonomía Táctil 48px y Paleta Earthen Noble', () => {
    it('index.css debe definir tap targets de 48px y variables Earthen Noble', () => {
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      assert.match(cssContent, /min-height:\s*48px/i, 'Falta min-height: 48px');
      assert.match(cssContent, /--bg-primary:\s*#FBF9F5/i, 'Falta fondo pergamino lino #FBF9F5');
      assert.match(cssContent, /--accent-terracotta:\s*#93432F/i, 'Falta terracota #93432F');
    });
  });

  // ==========================================================================
  // GOLD-328 (9-C): Silencio Total de Marca en la Web Pública
  // ==========================================================================
  describe('GOLD-328: Silencio Total de Marca y Cero Mercadotecnia en Portal Público', () => {
    const portalPath = path.join(componentsDir, 'PublicPortal.tsx');

    it('la web pública debe estar libre de tablas de precios, planes de suscripción o venta de software', () => {
      const portalContent = fs.readFileSync(portalPath, 'utf-8');
      assert.doesNotMatch(portalContent, /precio|suscripción|plan mensual|features saas/i, 'El portal público contiene lenguaje comercial');
    });
  });

  // ==========================================================================
  // GOLD-329 (10-B): Consola Diaconal Humana en DeaconDesk
  // ==========================================================================
  describe('GOLD-329: Consola Diaconal Humana y Fichas Fraternales en DeaconDesk', () => {
    const deaconPath = path.join(componentsDir, 'DeaconDesk.tsx');

    it('DeaconDesk.tsx debe mostrar a las comunidades como familias con indicador de última visita', () => {
      const content = fs.readFileSync(deaconPath, 'utf-8');
      assert.match(content, /Familia Anfitriona:/i, 'Falta etiqueta Familia Anfitriona');
      assert.match(content, /✓ Visitado hace/i, 'Falta indicador positivo de visita');
      assert.match(content, /⚠️ Visita presencial sugerida/i, 'Falta recordatorio fraternal de visita');
      assert.match(content, /Dar Sabático/i, 'Falta botón de dar sabático en la tarjeta familiar');
    });
  });
});
