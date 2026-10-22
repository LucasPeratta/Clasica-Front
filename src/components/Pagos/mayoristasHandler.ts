import { apiFetch } from "../common/apiFetch";
import { fetchPage, iPaginated } from "../common/Pagination/types";
import { PaymentMethod } from "../File/paymentsHandler";
import { ServiceType } from "../Service/model";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

interface iFileRef {
  id: string;
  numero?: number | null;
  anio?: number | null;
  destino: string;
}

// Servicio con lo que hay que pagarle al mayorista (su precio neto)
export interface iServiceToPay {
  id: string;
  nombre: string;
  type: ServiceType;
  provider: string;
  currency: string;
  fechaInicio: string | null;
  neto: number;
  pagado: number;
  falta: number;
  vencimiento: string | null;
  diasParaVencer: number | null;
  file: (iFileRef & { fechaSalida: string; pasajero: { firstname: string; lastname: string } | null }) | null;
}

// File encontrado al buscar, con sus servicios
export interface iFileToPay extends iFileRef {
  fechaSalida: string;
  pasajero: { firstname: string; lastname: string } | null;
  services: iServiceToPay[];
}

export interface iSupplierPayment {
  id: string;
  fecha: string;
  mayorista: string;
  importe: number;
  moneda: string;
  medio: PaymentMethod;
  nota: string | null;
  aplicaciones: { id: string; importe: number; servicio: string; type: ServiceType; file: iFileRef | null }[];
}

export interface iSupplierPaymentInput {
  fecha: string;
  medio: PaymentMethod;
  mayorista: string;
  nota: string;
  aplicaciones: { serviceId: string; importe: number }[];
}

// Busca files por pasajero, número o destino, con lo pendiente de pago de cada servicio
export const searchServicesToPay = async (search: string): Promise<iFileToPay[]> => {
  try {
    const params = new URLSearchParams({ search });
    const response = await apiFetch(`${apiUrl}/mayoristas/servicios?${params}`);
    const data = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// File con lo pendiente de pagar, agrupado por mayorista (y moneda)
export interface iPendingFile {
  file: NonNullable<iServiceToPay["file"]>;
  // El vencimiento más próximo de sus servicios
  vencimiento: string | null;
  diasParaVencer: number | null;
  mayoristas: {
    mayorista: string;
    currency: string;
    falta: number;
    servicios: { id: string; nombre: string; type: ServiceType; falta: number }[];
  }[];
}

// Pendiente de pago, una fila por file, por vencimiento; totals: total pendiente por moneda
export const getPendingSupplierPage = (
  page: number,
  search: string
): Promise<iPaginated<iPendingFile> & { totals?: Record<string, number> }> =>
  fetchPage<iPendingFile>(`${apiUrl}/mayoristas/pendientes`, page, search);

// desde / hasta: "YYYY-MM-DD" (ambos días incluidos) o vacío; totals: pagado por moneda
export const getSupplierPaymentsPage = (
  page: number,
  search: string,
  desde = "",
  hasta = ""
): Promise<iPaginated<iSupplierPayment> & { totals?: Record<string, number> }> =>
  fetchPage<iSupplierPayment>(`${apiUrl}/mayoristas/pagos`, page, search, { desde, hasta });

// Devuelve null si salió bien, o el mensaje de error
export const addSupplierPayment = async (input: iSupplierPaymentInput): Promise<string | null> => {
  try {
    const response = await apiFetch(`${apiUrl}/mayoristas/pagos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return null;
    const data = await response.json().catch(() => null);
    return data?.msg || "No se pudo registrar el pago.";
  } catch (error) {
    console.error(error);
    return "No se pudo conectar con el servidor.";
  }
};

export const deleteSupplierPayment = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`${apiUrl}/mayoristas/pagos/${id}`, { method: "DELETE" });
    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};
