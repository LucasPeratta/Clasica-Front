import dayjs from "dayjs";

type DateLike = string | Date | dayjs.Dayjs | null | undefined;

export interface iDocumentAlert {
  level: "error" | "warning";
  // Texto corto para etiquetas, ej. "Pasaporte vencido"
  short: string;
  // Explicación completa
  detail: string;
}

// Muchos países piden que el pasaporte tenga al menos 6 meses de validez al ingresar
const PASSPORT_MIN_MONTHS = 6;
// Avisar de documentos que vencen dentro de este plazo, aunque no haya viajes cargados
const EXPIRING_SOON_MONTHS = 6;

/**
 * Avisos sobre el DNI y el pasaporte de un pasajero:
 * - vencido (rojo)
 * - vence antes de alguno de sus próximos viajes (rojo)
 * - pasaporte con menos de 6 meses de validez después de un viaje (naranja)
 * - vence dentro de los próximos 6 meses (naranja)
 * Si no tiene cargada la fecha de vencimiento, no se avisa nada.
 */
export function getDocumentAlerts(
  pax: { dniVto?: DateLike; passportVto?: DateLike },
  departures: DateLike[] = []
): iDocumentAlert[] {
  const today = dayjs().startOf("day");
  const trips = departures
    .filter(Boolean)
    .map((d) => dayjs(d))
    .filter((d) => d.isValid() && !d.isBefore(today, "day"))
    .sort((a, b) => a.valueOf() - b.valueOf());

  const documents = [
    { name: "DNI", expiry: pax.dniVto, isPassport: false },
    { name: "Pasaporte", expiry: pax.passportVto, isPassport: true },
  ];

  const alerts: iDocumentAlert[] = [];

  for (const doc of documents) {
    if (!doc.expiry) continue;
    const expiry = dayjs(doc.expiry);
    if (!expiry.isValid()) continue;
    const expiryText = expiry.format("DD/MM/YYYY");

    if (expiry.isBefore(today, "day")) {
      alerts.push({
        level: "error",
        short: `${doc.name} vencido`,
        detail: `El ${doc.name} venció el ${expiryText}.`,
      });
      continue;
    }

    const tripAfterExpiry = trips.find((trip) => expiry.isBefore(trip, "day"));
    if (tripAfterExpiry) {
      alerts.push({
        level: "error",
        short: `${doc.name} vence antes del viaje`,
        detail: `El ${doc.name} vence el ${expiryText}, antes del viaje del ${tripAfterExpiry.format("DD/MM/YYYY")}.`,
      });
      continue;
    }

    if (doc.isPassport) {
      const tightTrip = trips.find((trip) =>
        expiry.isBefore(trip.add(PASSPORT_MIN_MONTHS, "month"), "day")
      );
      if (tightTrip) {
        alerts.push({
          level: "warning",
          short: "Pasaporte: menos de 6 meses",
          detail: `El pasaporte vence el ${expiryText}, menos de 6 meses después del viaje del ${tightTrip.format("DD/MM/YYYY")}. Muchos destinos piden 6 meses de validez.`,
        });
        continue;
      }
    }

    // Por vencer: dentro de los próximos 6 meses, tenga o no viajes cargados
    const daysLeft = expiry.diff(today, "day");
    if (expiry.isBefore(today.add(EXPIRING_SOON_MONTHS, "month"), "day")) {
      const when =
        daysLeft < 31
          ? `${daysLeft} día${daysLeft === 1 ? "" : "s"}`
          : `${Math.floor(daysLeft / 30)} mes${Math.floor(daysLeft / 30) === 1 ? "" : "es"}`;
      alerts.push({
        level: "warning",
        short: `${doc.name} vence en ${when}`,
        detail: `El ${doc.name} vence el ${expiryText}.`,
      });
    }
  }

  return alerts;
}
