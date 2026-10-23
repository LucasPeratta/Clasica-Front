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
}

export interface iPayer {
  id: string;
  firstname: string;
  lastname: string;
}

export interface iPaymentsSummary {
  // Moneda en la que se cobra el file (null si no se puede definir)
  moneda: string | null;
  total: number;
  problema: "MIXED_CURRENCIES" | "NOTHING_TO_CHARGE" | null;
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
  } | null;
  estado: PaymentsStatus;
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

export const savePlan = (fileId: string, cuotas: iCuotaInput[]) =>
  send(`/${fileId}/plan`, { method: "PUT", body: JSON.stringify({ cuotas }) });

export const resetPlan = (fileId: string) => send(`/${fileId}/plan`, { method: "DELETE" });

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
