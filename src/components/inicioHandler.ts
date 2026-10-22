import { apiFetch } from "./common/apiFetch";
import { iCobranza } from "./File/paymentsHandler";
import { iServiceToPay } from "./Pagos/mayoristasHandler";
import { ServiceType } from "./Service/model";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

interface iFileRef {
  id: string;
  numero?: number | null;
  anio?: number | null;
  destino: string;
  fechaSalida: string;
}

// Todo lo que el inicio muestra, en una sola consulta
export interface iHome {
  proximasSalidas: (iFileRef & {
    diasParaSalida: number;
    pasajeros: number;
    primerPasajero: { firstname: string; lastname: string } | null;
    sinLiquidar: number;
  })[];
  cobros: { vencidos: number; semana: number; items: iCobranza[] };
  // Próximos pagos a mayoristas (vencidos primero), uno por file y mayorista
  mayoristas: {
    vencidos: number;
    semana: number;
    items: {
      id: string;
      mayorista: string;
      currency: string;
      falta: number;
      servicios: number;
      diasParaVencer: number | null;
      vencimiento: string | null;
      file: iServiceToPay["file"];
    }[];
  };
  sinLiquidar: {
    total: number;
    items: { id: string; nombre: string; type: ServiceType; provider: string; file: iFileRef; diasParaSalida: number }[];
  };
  documentos: {
    total: number;
    items: {
      paxId: string;
      pasajero: string;
      documento: string;
      vencimiento: string;
      diasParaVencer: number;
      // Si afecta a un viaje próximo, el detalle; si no, null (solo "por vencer")
      problema: string | null;
    }[];
  };
}

export const getHome = async (): Promise<iHome | null> => {
  try {
    const response = await apiFetch(`${apiUrl}/inicio`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};
