import dayjs from "dayjs";

// Cada servicio tiene su fecha para liquidar (mandarlo al mayorista). Si no se eligió una,
// es 1 mes antes de la salida. Se avisa desde LIQUIDATION_WARNING_DAYS antes; vencida es urgente.
export const LIQUIDATION_WARNING_DAYS = 7;

type DateValue = string | Date | dayjs.Dayjs | null | undefined;

export interface iLiquidationAlert {
  level: "error" | "warning";
  short: string;
  detail: string;
}

// Fecha por defecto: 1 mes antes de la salida
export const defaultLiquidationDate = (fechaSalida: DateValue) =>
  fechaSalida ? dayjs(fechaSalida).subtract(1, "month").startOf("day") : null;

export const getLiquidationDate = (service: { fechaLiquidacion?: DateValue }, fechaSalida: DateValue) =>
  service.fechaLiquidacion ? dayjs(service.fechaLiquidacion).startOf("day") : defaultLiquidationDate(fechaSalida);

/**
 * Aviso para un servicio que todavía no se liquidó, según cuánto falta para su fecha de liquidación.
 * Una vez que el viaje salió ya no se avisa.
 */
export function getLiquidationAlert(
  service: { liquidado?: boolean; fechaLiquidacion?: DateValue },
  fechaSalida: DateValue
): iLiquidationAlert | null {
  if (service.liquidado || !fechaSalida) return null;
  const today = dayjs().startOf("day");
  if (dayjs(fechaSalida).startOf("day").isBefore(today)) return null;

  const deadline = getLiquidationDate(service, fechaSalida);
  if (!deadline) return null;
  const days = deadline.diff(today, "day");
  const date = deadline.format("DD/MM/YYYY");
  if (days < 0) {
    return {
      level: "error",
      short: "Liquidación vencida",
      detail: `Había que liquidarlo el ${date} y todavía no está liquidado: la reserva se puede caer.`,
    };
  }
  if (days === 0) {
    return { level: "error", short: "Liquidar hoy", detail: `Hoy (${date}) es el último día para liquidar este servicio.` };
  }
  if (days <= LIQUIDATION_WARNING_DAYS) {
    return {
      level: "warning",
      short: `Liquidar en ${days} día${days === 1 ? "" : "s"}`,
      detail: `Hay que liquidarlo antes del ${date}.`,
    };
  }
  return null;
}
