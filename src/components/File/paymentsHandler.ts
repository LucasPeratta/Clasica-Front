import { apiFetch } from "../common/apiFetch";
import { fetchPage, iPaginated } from "../common/Pagination/types";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA";
export type PaymentsStatus = "SIN_PLAN" | "PAGADO" | "VENCIDO" | "POR_VENCER" | "AL_DIA";

// Cómo se muestra cada estado de cobro
export const PAYMENT_STATUS: Record<PaymentsStatus, { label: string; color: "success" | "error" | "warning" | "info" | "default" }> = {
  PAGADO: { label: "Pagado", color: "success" },
  VENCIDO: { label: "Pago vencido", color: "error" },
  POR_VENCER: { label: "Vence pronto", color: "warning" },
  AL_DIA: { label: "Al día", color: "info" },
  SIN_PLAN: { label: "Sin plan", color: "default" },
};

export interface iCuota {
  id: string | null;
  concepto: string;
  importe: number;
  vencimiento: string;
  pagado: number;
  falta: number;
  estado: "PAGADA" | "PARCIAL" | "PENDIENTE";
  vencida: boolean;
  diasParaVencer: number;
}

export interface iPago {
  id: string;
  fecha: string;
  importe: number;
  moneda: string;
  tipoCambio: number | null;
  importeAplicado: number;
  medio: PaymentMethod;
  nota: string | null;
  // Quién pagó (uno de los pasajeros del file)
  pagador: iPayer | null;
  reciboNumero: number | null;
  // Reservas de grupos: a qué moneda se aplicó
  monedaAplicada?: string | null;
}

export interface iPayer {
  id: string;
  firstname: string;
  lastname: string;
}

// Lo que se cobra en una moneda: su plan, lo cobrado y lo que falta
export interface iChargePart {
  moneda: string | null;
  total: number;
  planPersonalizado: boolean;
  planTotal: number;
  cuotas: iCuota[];
  cobrado: number;
  falta: number;
  aFavor: number;
  proximoVencimiento: {
    concepto: string;
    falta: number;
    vencimiento: string;
    diasParaVencer: number;
    moneda?: string | null;
  } | null;
  estado: PaymentsStatus;
}

// Los campos de arriba son los de la moneda principal; porMoneda tiene una parte por moneda
// (más de una solo en las reservas de grupos, que cobran cada moneda por separado)
export interface iPaymentsSummary extends iChargePart {
  problema: "MIXED_CURRENCIES" | "NOTHING_TO_CHARGE" | null;
  porMoneda: iChargePart[];
  pagos: iPago[];
}

export interface iPagoInput {
  fecha: string;
  importe: number;
  moneda: string;
  tipoCambio: number | null;
  medio: PaymentMethod;
  nota: string;
  pagadorId: string | null;
  // Reservas de grupos: a qué moneda se aplica
  monedaAplicada?: string | null;
}

export interface iCuotaInput {
  concepto: string;
  importe: number;
  vencimiento: string;
}

// Resultado de cada operación: el estado actualizado, o el mensaje de error del backend
type Result = { ok: true; data: iPaymentsSummary } | { ok: false; msg: string };

const send = async (path: string, init: RequestInit = {}): Promise<Result> => {
  try {
    const response = await apiFetch(`${apiUrl}/file${path}`, {
      ...init,
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return { ok: false, msg: data?.msg || "No se pudo completar la operación." };
    return { ok: true, data };
  } catch (error) {
    console.error(error);
    return { ok: false, msg: "No se pudo conectar con el servidor." };
  }
};

export const getFilePayments = (fileId: string) => send(`/${fileId}/pagos`);

export const addPago = (fileId: string, pago: iPagoInput) =>
  send(`/${fileId}/pagos`, { method: "POST", body: JSON.stringify(pago) });

export const updatePago = (fileId: string, pagoId: string, pago: iPagoInput) =>
  send(`/${fileId}/pagos/${pagoId}`, { method: "PUT", body: JSON.stringify(pago) });

export const deletePago = (fileId: string, pagoId: string) =>
  send(`/${fileId}/pagos/${pagoId}`, { method: "DELETE" });

// moneda: en las reservas de grupos, el plan de esa moneda (las otras no se tocan)
export const savePlan = (fileId: string, cuotas: iCuotaInput[], moneda?: string | null) =>
  send(`/${fileId}/plan`, { method: "PUT", body: JSON.stringify({ cuotas, moneda }) });

export const resetPlan = (fileId: string, moneda?: string | null) =>
  send(`/${fileId}/plan${moneda ? `?moneda=${moneda}` : ""}`, { method: "DELETE" });

/* ---------- Sección "Pagos": cobros de todos los files ---------- */

interface iFileRef {
  id: string;
  numero?: number | null;
  anio?: number | null;
  destino: string;
}

// File que todavía debe plata
export interface iCobranza extends iFileRef {
  fechaSalida: string;
  pasajero: { firstname: string; lastname: string } | null;
  // Todos los pasajeros del file (para elegir quién pagó)
  pasajeros: iPayer[];
  // Reservas de grupos: lo que se cobra en cada moneda
  porMoneda: { moneda: string; total: number; cobrado: number; falta: number }[];
  moneda: string;
  total: number;
  cobrado: number;
  falta: number;
  estado: PaymentsStatus;
  proximoVencimiento: iPaymentsSummary["proximoVencimiento"];
}

// Pago recibido, con su file
export interface iPagoHistorial extends iPago {
  file: iFileRef;
  pasajero: { firstname: string; lastname: string } | null;
}

// filtro: "vencidos" | "semana" | "mes" | "todos"
export const getCobranzasPage = (
  page: number,
  search: string,
  filtro: string
): Promise<iPaginated<iCobranza>> =>
  fetchPage<iCobranza>(`${apiUrl}/cobranzas`, page, search, { filtro });

// desde / hasta: "YYYY-MM-DD" (ambos días incluidos) o vacío; totals: cobrado por moneda
export const getPaymentsHistoryPage = (
  page: number,
  search: string,
  desde = "",
  hasta = ""
): Promise<iPaginated<iPagoHistorial> & { totals?: Record<string, number> }> =>
  fetchPage<iPagoHistorial>(`${apiUrl}/cobranzas/pagos`, page, search, { desde, hasta });

/**
 * Cuánto cubre un pago en la moneda del file (misma regla que el backend):
 * con pesos de por medio, el tipo de cambio es "pesos por 1 dólar/euro".
 */
export const appliedAmount = (
  importe: number,
  paidCurrency: string,
  chargeCurrency: string,
  tipoCambio: number | null
): number | null => {
  if (paidCurrency === chargeCurrency) return importe;
  if (!tipoCambio || tipoCambio <= 0) return null;
  if (paidCurrency === "PESOS") return Math.round((importe / tipoCambio) * 100) / 100;
  return Math.round(importe * tipoCambio * 100) / 100;
};
