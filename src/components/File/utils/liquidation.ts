import dayjs from "dayjs";

// Avisar de servicios sin liquidar a partir de 30 días antes de la salida, urgente desde 21
export const LIQUIDATION_WARNING_DAYS = 30;
export const LIQUIDATION_URGENT_DAYS = 21;

export interface iLiquidationAlert {
  level: "error" | "warning";
  short: string;
  detail: string;
}

/**
 * Aviso para un servicio que todavía no se mandó a liquidar, según cuánto falta para la salida.
 * Una vez que el viaje salió ya no se avisa.
 */
export function getLiquidationAlert(
  service: { liquidado?: boolean },
  fechaSalida: string | Date | dayjs.Dayjs | null | undefined
): iLiquidationAlert | null {
  if (service.liquidado || !fechaSalida) return null;
  const days = dayjs(fechaSalida).startOf("day").diff(dayjs().startOf("day"), "day");
  if (days < 0 || days > LIQUIDATION_WARNING_DAYS) return null;

  const when = days === 0 ? "hoy" : `en ${days} día${days === 1 ? "" : "s"}`;
  if (days <= LIQUIDATION_URGENT_DAYS) {
    return {
      level: "error",
      short: "Sin liquidar",
      detail: `El viaje sale ${when} y este servicio no está liquidado: la reserva se puede caer.`,
    };
  }
  return {
    level: "warning",
    short: "Liquidar",
    detail: `El viaje sale ${when}: conviene liquidar este servicio.`,
  };
}
