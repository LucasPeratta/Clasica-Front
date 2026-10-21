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
  tarifaAlternativa?: string;
  destino: string;
  fechaSalida: null | dayjs.Dayjs;
  clients: iPax[];
  services: iService[];
}
