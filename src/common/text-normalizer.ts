// src/common/utils/text-normalizer.ts

export function normalizeSpaces(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' '); // colapsar espacios múltiples
}

// 👉 Categorías: Solo primera letra en mayúscula, resto minúscula
export function normalizeCategoryName(value: string): string {
  const base = normalizeSpaces(value).toLowerCase();
  if (!base) return '';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

// 👉 Nombres de producto: Cada palabra con inicial mayúscula
export function normalizeProductName(value: string): string {
  const base = normalizeSpaces(value).toLowerCase();
  if (!base) return '';
  return base
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// 👉 Descripción: primera letra mayúscula, resto minúsculas
export function normalizeDescription(value: string): string {
  const base = normalizeSpaces(value).toLowerCase();
  if (!base) return '';
  return base.charAt(0).toUpperCase() + base.slice(1);
}
