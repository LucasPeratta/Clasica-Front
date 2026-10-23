import dayjs from "dayjs";

// Períodos para ver cuánto hay que pagar a mayoristas. Se guarda en la URL (?periodo=):
// un período fijo o "AAAA-MM-DD_AAAA-MM-DD" para fechas elegidas a mano.
export const PERIODS = [
  { value: "todo", label: "Todo" },
  { value: "vencidos", label: "Vencidos" },
  { value: "semana", label: "Esta semana" },
  { value: "proxima", label: "Semana que viene" },
  { value: "mes", label: "Este mes" },
] as const;

const ymd = (date: dayjs.Dayjs) => date.format("YYYY-MM-DD");
const short = (date: string) => dayjs(date).format("DD/MM");

// La semana va de lunes a domingo
const monday = (date: dayjs.Dayjs) => date.subtract((date.day() + 6) % 7, "day");

export const customPeriod = (desde: string, hasta: string) => `${desde}_${hasta}`;

// Fechas elegidas a mano ("_" = todavía sin elegir)
export const isCustomPeriod = (period: string) => period.includes("_");

/**
 * Rango de fechas de un período (ambos días incluidos; vacío = sin límite) y cómo se lee
 */
export const periodRange = (period: string): { desde: string; hasta: string; text: string } => {
  const today = dayjs().startOf("day");
  switch (period) {
    case "vencidos":
      return { desde: "", hasta: ymd(today.subtract(1, "day")), text: "ya vencido" };
    case "semana": {
      const end = monday(today).add(6, "day");
      return { desde: ymd(today), hasta: ymd(end), text: `esta semana (hasta el ${short(ymd(end))})` };
    }
    case "proxima": {
      const start = monday(today).add(7, "day");
      const end = start.add(6, "day");
      return { desde: ymd(start), hasta: ymd(end), text: `la semana que viene (del ${short(ymd(start))} al ${short(ymd(end))})` };
    }
    case "mes": {
      const end = today.endOf("month");
      return { desde: ymd(today), hasta: ymd(end), text: `este mes (hasta el ${short(ymd(end))})` };
    }
    default: {
      const match = period.match(/^(\d{4}-\d{2}-\d{2})?_(\d{4}-\d{2}-\d{2})?$/);
      if (!match) return { desde: "", hasta: "", text: "" };
      const [, desde = "", hasta = ""] = match;
      const text =
        desde && hasta ? `del ${short(desde)} al ${short(hasta)}` : desde ? `desde el ${short(desde)}` : hasta ? `hasta el ${short(hasta)}` : "";
      return { desde, hasta, text };
    }
  }
};
