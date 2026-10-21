import dayjs from "dayjs";

export type ServiceType = "AEREO" | "HOTEL" | "EXCURSION" | "TRASLADO";

export interface iService {
  id: string;
  nombre: string;
  provider: string;
  precioNeto: string;
  tarifa: string;
  currency: string;
  type: ServiceType;
  localizador?: string;
  obs: string;
  fechaInicio: null | dayjs.Dayjs;
  fechaFin: null | dayjs.Dayjs;
  createdAt: null | dayjs.Dayjs;
  deleted_at: null | dayjs.Dayjs;
  // Enviado al mayorista para liquidar
  liquidado?: boolean;
  liquidadoAt?: string | null;
  // File al que pertenece (viene en el listado y en el detalle)
  File?: iServiceFile[];
}

export interface iServiceFile {
  id: string;
  numero?: number | null;
  anio?: number | null;
  destino: string;
}
