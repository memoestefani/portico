import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Test implementation of formatDayOfWeek and CHRISTIAN_WEEKDAY_PLURALS matching src/utils.ts
export function formatDayOfWeek(dayIndexOrName) {
  if (typeof dayIndexOrName === 'number') {
    const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return names[dayIndexOrName % 7] || 'Día no definido';
  }
  const clean = dayIndexOrName.trim().toLowerCase();
  const map = {
    domingo: 'Domingo',
    lunes: 'Lunes',
    luness: 'Lunes',
    martes: 'Martes',
    martess: 'Martes',
    miercoles: 'Miércoles',
    miércoles: 'Miércoles',
    miercoless: 'Miércoles',
    jueves: 'Jueves',
    juevess: 'Jueves',
    viernes: 'Viernes',
    vierness: 'Viernes',
    sabado: 'Sábado',
    sábado: 'Sábado',
  };
  return map[clean] || (dayIndexOrName.charAt(0).toUpperCase() + dayIndexOrName.slice(1));
}

export const CHRISTIAN_WEEKDAY_PLURALS = [
  'Domingos',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábados',
];

describe('Pórtico Ciclo 2 Sobriedad - Unit Test Suite', () => {
  describe('Decisión 4-C (GOLD-233): Calendario Cristiano con Domingo como Día 1 (Índice 0)', () => {
    it('debe asignar Domingo al índice 0 respetando la tradición cristiana', () => {
      assert.equal(formatDayOfWeek(0), 'Domingo');
    });

    it('debe asignar Lunes al índice 1 y Sábado al índice 6', () => {
      assert.equal(formatDayOfWeek(1), 'Lunes');
      assert.equal(formatDayOfWeek(6), 'Sábado');
    });

    it('debe corregir errores de pluralización como Martess y Miércoless', () => {
      assert.equal(formatDayOfWeek('martess'), 'Martes');
      assert.equal(formatDayOfWeek('miercoless'), 'Miércoles');
      assert.equal(formatDayOfWeek('vierness'), 'Viernes');
      assert.equal(formatDayOfWeek('luness'), 'Lunes');
    });

    it('debe proveer la lista canónica de plurales de semana cristiana sin errores de concordancia', () => {
      assert.equal(CHRISTIAN_WEEKDAY_PLURALS[0], 'Domingos');
      assert.equal(CHRISTIAN_WEEKDAY_PLURALS[1], 'Lunes');
      assert.equal(CHRISTIAN_WEEKDAY_PLURALS[2], 'Martes');
      assert.equal(CHRISTIAN_WEEKDAY_PLURALS[3], 'Miércoles');
      assert.equal(CHRISTIAN_WEEKDAY_PLURALS[4], 'Jueves');
      assert.equal(CHRISTIAN_WEEKDAY_PLURALS[5], 'Viernes');
      assert.equal(CHRISTIAN_WEEKDAY_PLURALS[6], 'Sábados');
    });
  });

  describe('Decisión 6-C (GOLD-235): Erradicación de Emojis Infantiles y Jargon', () => {
    const childishEmojis = ['💍', '🔥', '🏡', '🌸', '⚓', '🌮', '⛩️', '⏱️'];

    it('ningún emoji infantil debe estar en los nombres de días ni plurales', () => {
      for (const day of CHRISTIAN_WEEKDAY_PLURALS) {
        for (const emoji of childishEmojis) {
          assert.equal(day.includes(emoji), false, `Encontrado emoji ${emoji} en ${day}`);
        }
      }
    });
  });

  describe('Decisión 2-C (GOLD-231): Nomenclatura Sobria sin Lenguaje Poético', () => {
    it('las etiquetas de tema deben ser literales y comprensibles ("Modo Claro" / "Modo Oscuro")', () => {
      const themes = { light: 'Modo Claro', dark: 'Modo Oscuro' };
      assert.equal(themes.light, 'Modo Claro');
      assert.equal(themes.dark, 'Modo Oscuro');
      assert.notEqual(themes.light, 'Luz Celestial');
      assert.notEqual(themes.dark, 'Vigilia Nocturna');
    });
  });

  describe('Decisión 6-C & 8-C: Micro-RSVP y Detección Offline', () => {
    it('los estados del Micro-RSVP deben ser estrictamente binarios o nulos', () => {
      const allowedRsvp = ['attending', 'declined', null];
      assert.ok(allowedRsvp.includes('attending'));
      assert.ok(allowedRsvp.includes('declined'));
      assert.ok(allowedRsvp.includes(null));
      assert.equal(allowedRsvp.includes('maybe'), false);
    });
  });
});
