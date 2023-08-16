import dayjs from "dayjs";

export interface iFile {
  id: string;
  obs: string;
  precioNetoTotal: string;
  tarifaTotal: string;
  destino: string;
  fechaSalida: null | dayjs.Dayjs;
  clients: iPax[];
  services: iService[];
}

export interface iPax {
  id: string;
  firstname: string;
  lastname: string;
  dni: string;
  passport: string;
  dob: null | dayjs.Dayjs;
  adress: string;
  email: string;
  phoneNumber: string;
  obs: string;
}

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
