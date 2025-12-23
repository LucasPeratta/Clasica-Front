import dayjs from "dayjs";

/**
 * Genera las iniciales a partir del apellido y nombre
 */
export function initials(lastname = "", firstname = ""): string {
  const a = (lastname || "").trim()[0] ?? "";
  const b = (firstname || "").trim()[0] ?? "";
  return (a + b).toUpperCase();
}

/**
 * Formatea una fecha de forma segura
 */
export function safeFormatDate(value?: string | Date | null): string {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("DD-MM-YYYY") : "—";
}

/**
 * Muestra un valor o un guión si está vacío
 */
export function display(value?: string | null): string {
  return value && value.trim() ? value : "—";
}

/**
 * Normaliza texto para búsquedas (elimina acentos y convierte a minúsculas)
 */
export function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
