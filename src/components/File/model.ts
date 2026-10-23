import dayjs from "dayjs";
import { iPax } from "../Pax/model";
import { iService } from "../Service/model";

export interface iFile {
  id: string;
  // Número automático por año de creación (se muestra como "55-2026")
  numero?: number | null;
  anio?: number | null;
  // Referencia libre y opcional
  nro?: string;
  obs: string;
  precioNetoTotal: string;
  tarifaTotal: string;
  // Lo que efectivamente se le cobra al pasajero, en una sola moneda
  tarifaAlternativa?: string;
  tarifaAlternativaMoneda?: string | null;
  destino: string;
  fechaSalida: null | dayjs.Dayjs;
  clients: iPax[];
  services: iService[];
  // Facturado al pasajero (el file entero, de una vez)
  facturadoAt?: string | null;
  facturaNumero?: string | null;
  facturaImporte?: string | number | null;
  facturaMoneda?: string | null;
  // Reserva de una salida grupal (sin número de file): su grupo, su nombre y su plan
  grupoId?: string | null;
  reservaNombre?: string | null;
  grupoPlanId?: string | null;
  habitacionTipo?: string | null;
  grupo?: { id: string; titulo: string; planes: { id: string; nombre: string }[] } | null;
  // En el detalle: cuántos pagos del pasajero tiene
  _count?: { pagos: number };
  // Solo en el listado: estado de los cobros al pasajero
  cobro?: {
    estado: "SIN_PLAN" | "PAGADO" | "VENCIDO" | "POR_VENCER" | "AL_DIA";
    moneda: string | null;
    falta: number;
    cobrado: number;
    total: number;
  };
}
