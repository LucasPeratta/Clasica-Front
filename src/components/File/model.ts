import dayjs from "dayjs";
import { iPax } from "../Pax/model";
import { iService } from "../Service/model";

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
