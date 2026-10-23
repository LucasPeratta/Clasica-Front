import dayjs from "dayjs";
import { HabitacionTipo, iGrupoServicio } from "../model";

// Precio de un servicio del grupo para una reserva (la misma regla que el sistema):
// por pasajero (menores más baratos según la edad al salir), por reserva o según la habitación

const round2 = (n: number) => Math.round(n * 100) / 100;

// Habitación que corresponde a la cantidad de pasajeros
export const roomTypeFor = (pax: number): HabitacionTipo =>
  pax <= 1 ? "SINGLE" : pax === 2 ? "DOBLE" : pax === 3 ? "TRIPLE" : "CUADRUPLE";

type DateLike = string | Date | dayjs.Dayjs | null | undefined;

export const isChild = (s: iGrupoServicio, dob: DateLike, departure: DateLike) =>
  s.modoPrecio === "POR_PASAJERO" &&
  s.edadMenor !== null &&
  s.tarifaMenor !== null &&
  !!dob &&
  dayjs(departure).diff(dayjs(dob), "year") < s.edadMenor;

export const linePrice = (s: iGrupoServicio, pax: { dob?: DateLike }[], habitacionTipo: HabitacionTipo, departure: DateLike) => {
  if (s.modoPrecio === "POR_RESERVA") return { neto: s.netoPorPax, tarifa: s.tarifaPorPax, detalle: "precio por reserva" };

  if (s.modoPrecio === "POR_HABITACION") {
    const room = s.preciosHabitacion?.[habitacionTipo];
    const perPerson = room ?? { neto: s.netoPorPax, tarifa: s.tarifaPorPax };
    return {
      neto: round2(perPerson.neto * pax.length),
      tarifa: round2(perPerson.tarifa * pax.length),
      detalle: room ? `${pax.length} en ${habitacionTipo.toLowerCase()}` : `sin precio para ${habitacionTipo.toLowerCase()}: se usa el de lista`,
    };
  }

  const children = pax.filter((p) => isChild(s, p.dob, departure)).length;
  const adults = pax.length - children;
  return {
    neto: round2(adults * s.netoPorPax + children * (s.netoMenor ?? 0)),
    tarifa: round2(adults * s.tarifaPorPax + children * (s.tarifaMenor ?? 0)),
    detalle: children > 0 ? `${adults} adulto${adults === 1 ? "" : "s"} y ${children} menor${children === 1 ? "" : "es"}` : `${adults} pasajero${adults === 1 ? "" : "s"}`,
  };
};
