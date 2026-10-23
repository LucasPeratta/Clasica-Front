import { apiFetch } from "../common/apiFetch";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

export interface iInvoiceInput {
  fecha: string;
  importe: number;
  moneda: string;
  numero: string;
}

// Marca el file como facturado; devuelve un mensaje de error o null
export const setInvoice = async (fileId: string, input: iInvoiceInput): Promise<string | null> => {
  try {
    const response = await apiFetch(`${apiUrl}/file/${fileId}/facturacion`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) return null;
    const data = await response.json().catch(() => null);
    return data?.msg || "No se pudo guardar la facturación.";
  } catch {
    return "No se pudo guardar la facturación.";
  }
};

export const removeInvoice = async (fileId: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`${apiUrl}/file/${fileId}/facturacion`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
};

export interface iBalanceMonth {
  mes: string; // "2026-10"
  facturado: Record<string, number>;
  pagado: Record<string, number>;
}

export interface iToInvoice {
  id: string;
  numero?: number | null;
  anio?: number | null;
  destino: string;
  fechaSalida: string;
  pasajero: { firstname: string; lastname: string } | null;
  moneda: string;
  total: number;
}

// desde / hasta: "YYYY-MM" (ambos incluidos)
export const getBalance = async (
  desde: string,
  hasta: string
): Promise<{ meses: iBalanceMonth[]; porFacturar: iToInvoice[] } | null> => {
  try {
    const params = new URLSearchParams({ desde, hasta });
    const response = await apiFetch(`${apiUrl}/balance?${params}`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
};

// File encontrado para facturar: lo cobrado y si ya está facturado
export interface iFileToInvoice {
  id: string;
  numero?: number | null;
  anio?: number | null;
  destino: string;
  fechaSalida: string;
  pasajeros: { firstname: string; lastname: string }[];
  moneda: string | null;
  total: number;
  cobrado: number;
  falta: number;
  estado: string;
  facturadoAt: string | null;
  facturaNumero: string | null;
  facturaImporte: number | null;
  facturaMoneda: string | null;
}

export const searchFilesToInvoice = async (search: string): Promise<iFileToInvoice[]> => {
  try {
    const params = new URLSearchParams({ search });
    const response = await apiFetch(`${apiUrl}/balance/files?${params}`);
    if (!response.ok) return [];
    return (await response.json()).data;
  } catch {
    return [];
  }
};
