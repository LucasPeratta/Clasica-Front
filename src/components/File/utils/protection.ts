import { iFile } from "../model";

// Lo que tiene plata se guarda (lo puede pedir la AFIP): files facturados, con pagos del
// pasajero o con servicios pagados al mayorista no se pueden eliminar.

// Por qué no se puede eliminar el file, o null si se puede
export const fileProtectionReason = (file: Pick<iFile, "facturadoAt" | "_count" | "services">) => {
  if (file.facturadoAt) return "está facturado";
  if ((file._count?.pagos ?? 0) > 0) return "tiene pagos del pasajero";
  if ((file.services ?? []).some((s) => (s.pagosMayorista?.length ?? 0) > 0)) return "tiene pagos a mayoristas";
  return null;
};
