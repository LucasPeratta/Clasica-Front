import { jsPDF } from "jspdf";
import dayjs from "dayjs";

// Datos de la agencia que van en cada recibo
const AGENCY = {
  razonSocial: "SARTORI CARAMELLI SOCIEDAD DE HECHO",
  lineas: ["Legajo 14783", "Zelarrayán 193 P. 1 Of. 2", "Bahía Blanca", "2914494646", "administracion@agenciaclasica.com.ar"],
  iibb: "30-71168659-9",
  inicioActividades: "01/01/2011",
  cuit: "30-71168659-9",
  iva: "IVA RESPONSABLE INSCRIPTO",
  leyenda:
    "El pago efectuado mediante el presente recibo, implica el conocimiento y aceptación de las CONDICIONES GENERALES",
};

export interface iReceipt {
  numero: number;
  fecha: string;
  importe: number;
  moneda: string;
  tipoCambio: number | null;
  medio: "EFECTIVO" | "TRANSFERENCIA";
  nota: string | null;
  pasajero: { nombre: string; documento: string | null } | null;
  file: { numero: number | null; anio: number | null; destino: string };
}

const CURRENCY_TEXT: Record<string, { simbolo: string; nombre: string }> = {
  PESOS: { simbolo: "$", nombre: "pesos" },
  USD: { simbolo: "U$D", nombre: "dólares" },
  EURO: { simbolo: "€", nombre: "euros" },
};

const amountText = (importe: number, moneda: string) =>
  `${CURRENCY_TEXT[moneda]?.simbolo ?? moneda} ${importe.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;

// Una copia del recibo (original o duplicado), a partir de la altura "top" en mm
const drawCopy = (doc: jsPDF, receipt: iReceipt, top: number, copy: string, logo: string | null) => {
  const left = 20;
  const width = 170;
  const right = left + width;
  const textLeft = 26;

  doc.setDrawColor(90);
  doc.setLineWidth(0.25);
  doc.rect(left, top, width, 112);

  // Agencia
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(AGENCY.razonSocial, textLeft, top + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  AGENCY.lineas.forEach((line, i) => doc.text(line, textLeft, top + 10 + i * 3.6));

  // "X" - documento no válido como factura
  doc.rect(100, top + 3, 9, 8.5);
  doc.setFontSize(20);
  doc.text("X", 104.5, top + 10.2, { align: "center" });
  doc.setFontSize(5.5);
  doc.text("Documento no", 104.5, top + 14, { align: "center" });
  doc.text("válido como Factura", 104.5, top + 16.3, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(copy, 104.5, top + 21, { align: "center" });

  if (logo) doc.addImage(logo, "JPEG", 150, top + 2, 35, 16);

  // Pasajero
  doc.rect(textLeft, top + 26, 107, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text((receipt.pasajero?.nombre ?? "").toUpperCase(), textLeft + 5, top + 33);
  doc.setFontSize(8.5);
  doc.text(`CUIT/L/Documento Nº  ${receipt.pasajero?.documento ?? ""}`, textLeft + 3, top + 41);

  // Datos del recibo y de la agencia
  const infoLeft = 137;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`Recibo: Nº ${String(receipt.numero).padStart(6, "0")}`, infoLeft, top + 28);
  doc.text("Fecha:", infoLeft, top + 31.5);
  doc.setFont("helvetica", "normal");
  doc.text(dayjs(receipt.fecha).format("DD/MM/YYYY"), infoLeft + 9.5, top + 31.5);
  doc.setFontSize(7.5);
  [`Nro. IIBB: ${AGENCY.iibb}`, `Inicio Act.: ${AGENCY.inicioActividades}`, `CUIT: ${AGENCY.cuit}`, AGENCY.iva].forEach((line, i) =>
    doc.text(line, infoLeft, top + 35.5 + i * 3)
  );

  doc.setFontSize(9);
  doc.text(`Cotización U$D: ${receipt.tipoCambio ? receipt.tipoCambio.toLocaleString("es-AR") : ""}`, textLeft + 1, top + 51);

  // Forma de pago
  doc.line(left, top + 57, right, top + 57);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Formas de Pago:", textLeft + 1, top + 64);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const medio = receipt.medio === "EFECTIVO" ? "Efectivo" : "Transferencia";
  doc.text(`${medio} en ${CURRENCY_TEXT[receipt.moneda]?.nombre ?? receipt.moneda}`, textLeft + 31, top + 64);
  doc.line(left, top + 68, right, top + 68);

  // Detalle: a qué file corresponde
  doc.setFontSize(9);
  doc.setTextColor(90);
  const fileNumber = receipt.file.numero && receipt.file.anio ? `File ${String(receipt.file.numero).padStart(2, "0")}-${receipt.file.anio} · ` : "";
  doc.text(`${fileNumber}${receipt.file.destino}`, textLeft + 1, top + 75);
  doc.setTextColor(0);

  // Observaciones
  doc.line(left, top + 88, right, top + 88);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Observaciones:", textLeft + 1, top + 95);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const observaciones = doc.splitTextToSize(receipt.nota || receipt.file.destino, right - (textLeft + 27) - 4);
  doc.text(observaciones.slice(0, 2), textLeft + 27, top + 95);

  // Total
  doc.line(left, top + 104, right, top + 104);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL", 133, top + 109.5, { align: "right" });
  doc.rect(136, top + 105.5, 50, 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(amountText(receipt.importe, receipt.moneda), 138, top + 110);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(AGENCY.leyenda, 105, top + 116, { align: "center" });
};

/**
 * PDF del recibo: original y duplicado en una hoja A4. logo: imagen JPEG como data URL (o null)
 */
export const buildReceiptPdf = (receipt: iReceipt, logo: string | null) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawCopy(doc, receipt, 12, "ORIGINAL", logo);
  drawCopy(doc, receipt, 152, "DUPLICADO", logo);
  return doc;
};
