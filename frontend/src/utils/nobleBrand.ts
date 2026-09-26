/**
 * Pórtico OS v3.1 - Utilidades de Marca Noble y Monogramas Algorítmicos (GOLD-257 & GOLD-259)
 */

import { NOBLE_PALETTES, extractInitials, getPaletteForName, type MonogramPalette } from '../components/MonogramAvatar';

export { NOBLE_PALETTES, type MonogramPalette };

export function getDeterministicPalette(name: string): MonogramPalette {
  return getPaletteForName(name);
}

export function getMonogram(name: string): string {
  return extractInitials(name);
}
