/**
 * Número automático del file, ej. "55-2026" (al menos dos cifras: "01-2026")
 */
export function formatFileNumber(file: { numero?: number | null; anio?: number | null }): string {
  if (!file.numero || !file.anio) return "";
  return `${String(file.numero).padStart(2, "0")}-${file.anio}`;
}
