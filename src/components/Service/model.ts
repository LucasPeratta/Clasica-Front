import dayjs from "dayjs";

export interface iService {
  id: string;
  precioNeto: string;
  tarifa: string;
  currency: string;
  provider: string;
  obs: string;
  createdAt: null | dayjs.Dayjs;
  deleted_at: null | dayjs.Dayjs;
}
