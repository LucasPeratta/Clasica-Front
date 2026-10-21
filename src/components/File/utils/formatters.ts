/**
 * Genera las iniciales a partir del apellido y nombre
 */
export function initials(lastname = "", firstname = ""): string {
  const a = (lastname || "").trim()[0] ?? "";
  const b = (firstname || "").trim()[0] ?? "";
  return (a + b).toUpperCase();
}
