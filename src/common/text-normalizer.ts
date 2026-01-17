// src/common/utils/text-normalizer.ts

/**
 * Normaliza espacios:
 * - convierte NBSP a espacio normal
 * - trim
 * - colapsa múltiples espacios en uno
 */
export function normalizeSpaces(value: unknown): string {
  if (typeof value !== 'string') return '';

  return value
    .replace(/\u00A0/g, ' ') // NBSP -> espacio normal
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Categorías:
 * - minúsculas
 * - primera letra en mayúscula
 * Ej: "  beBiDaS  " -> "Bebidas"
 */
export function normalizeCategoryName(value: unknown): string {
  const base = normalizeSpaces(value).toLowerCase();
  if (!base) return '';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Nombres de producto:
 * - minúsculas
 * - cada palabra con inicial mayúscula
 * Ej: "coca cola  2l" -> "Coca Cola 2l"
 *
 * Nota: esto puede "aplanar" acrónimos ("USB" -> "Usb").
 * Si luego quieres, lo mejoramos para respetar acrónimos.
 */
export function normalizeProductName(value: unknown): string {
  const base = normalizeSpaces(value).toLowerCase();
  if (!base) return '';

  return base
    .split(' ')
    .map(w => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ')
    .trim();
}

/**
 * Descripción:
 * - minúsculas
 * - primera letra en mayúscula
 */
export function normalizeDescription(value: unknown): string {
  const base = normalizeSpaces(value).toLowerCase();
  if (!base) return '';
  return base.charAt(0).toUpperCase() + base.slice(1);
}
