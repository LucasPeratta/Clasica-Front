import { ServiceType } from "../Service/model";
import { PaymentsStatus } from "../File/paymentsHandler";

export type HabitacionTipo = "SINGLE" | "DOBLE" | "TRIPLE" | "CUADRUPLE";

export const ROOM_TYPES: { value: HabitacionTipo; label: string; size: number }[] = [
  { value: "SINGLE", label: "Single", size: 1 },
  { value: "DOBLE", label: "Doble", size: 2 },
  { value: "TRIPLE", label: "Triple", size: 3 },
  { value: "CUADRUPLE", label: "Cuádruple", size: 4 },
];

// Lo vendido, el costo, lo cobrado y lo que falta, en una moneda
export interface iGrupoDinero {
  moneda: string;
  total: number;
  neto: number;
  cobrado: number;
  falta: number;
  ganancia: number;
}

// Salida grupal en la lista
export interface iGrupoListItem {
  id: string;
  titulo: string;
  destino: string;
  fechaSalida: string;
  fechaRegreso: string | null;
  cupo: number | null;
  reservas: number;
  pasajeros: number;
  dinero: iGrupoDinero[];
  estado: PaymentsStatus;
}

// Servicio del itinerario con su precio de lista por pasajero
export interface iGrupoServicio {
  id: string;
  type: ServiceType;
  nombre: string;
  provider: string;
  currency: string;
  netoPorPax: number;
  tarifaPorPax: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  fechaLiquidacion: string | null;
}

export interface iPlanCuota {
  concepto: string;
  // null = el saldo (lo que falta)
  porcentaje: number | null;
  vencimiento: string;
}

export interface iGrupoPlan {
  id: string;
  nombre: string;
  cuotas: iPlanCuota[];
}

export interface iGrupoPax {
  id: string;
  firstname: string;
  lastname: string;
  dni: string | null;
  dniVto: string | null;
  passport: string | null;
  passportVto: string | null;
  dob: string | null;
}

export interface iReserva {
  id: string;
  nombre: string | null;
  planId: string | null;
  pasajeros: iGrupoPax[];
  servicios: number;
  estado: PaymentsStatus;
  proximoVencimiento: { concepto: string; falta: number; vencimiento: string; diasParaVencer: number; moneda?: string | null } | null;
  porMoneda: { moneda: string; total: number; cobrado: number; falta: number }[];
  facturado: boolean;
}

export interface iHabitacion {
  id: string;
  tipo: HabitacionTipo;
  obs: string | null;
  pasajeros: iGrupoPax[];
}

// Pasajero del grupo con su reserva
export type iGrupoPasajero = iGrupoPax & { reservaId: string; reserva: string | null };

export interface iGrupo {
  id: string;
  titulo: string;
  destino: string;
  fechaSalida: string;
  fechaRegreso: string | null;
  cupo: number | null;
  obs: string | null;
  servicios: iGrupoServicio[];
  planes: iGrupoPlan[];
  reservas: iReserva[];
  habitaciones: iHabitacion[];
  pasajeros: iGrupoPasajero[];
  sinHabitacion: iGrupoPasajero[];
  resumen: { reservas: number; pasajeros: number; lugaresLibres: number | null; dinero: iGrupoDinero[] };
}
