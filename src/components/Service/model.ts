import dayjs from "dayjs";

export interface iService {
  id: string;
  nombre: string;
  provider: string;
  precioNeto: string;
  tarifa: string;
  currency: string;
  localizador?: string;
  obs: string;
  createdAt: null | dayjs.Dayjs;
  deleted_at: null | dayjs.Dayjs;
}
