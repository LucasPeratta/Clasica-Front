import dayjs from "dayjs";
import type { Workbook } from "exceljs";
import { iGrupo, iGrupoPax, ROOM_TYPES } from "../model";

const date = (value: string | null) => (value ? dayjs(value).format("DD/MM/YYYY") : "");

const COLUMNS = [
  { header: "Hab.", width: 7 },
  { header: "Tipo", width: 12 },
  { header: "Apellido", width: 20 },
  { header: "Nombre", width: 20 },
  { header: "Fecha de nac.", width: 14 },
  { header: "DNI", width: 13 },
  { header: "Vto. DNI", width: 12 },
  { header: "Pasaporte", width: 14 },
  { header: "Vto. pasaporte", width: 14 },
  { header: "Reserva", width: 22 },
  { header: "Observaciones", width: 24 },
];

const paxCells = (p: iGrupoPax) => [p.lastname, p.firstname, date(p.dob), p.dni ?? "", date(p.dniVto), p.passport ?? "", date(p.passportVto)];

/**
 * Arma el rooming del grupo en Excel (habitación por habitación) y lo descarga
 */
export const downloadRooming = async (grupo: iGrupo) => {
  // La librería se carga recién al descargar (es pesada)
  const ExcelJS = (await import("exceljs")).default;
  const workbook: Workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Rooming", { pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 } });
  sheet.columns = COLUMNS.map((c) => ({ width: c.width }));

  const reservaOf = new Map(grupo.pasajeros.map((p) => [p.id, p.reserva ?? ""]));

  // Encabezado
  sheet.addRow([`Rooming · ${grupo.titulo}`]).font = { bold: true, size: 14 };
  sheet.addRow([
    `${grupo.destino} · Salida ${date(grupo.fechaSalida)}${grupo.fechaRegreso ? ` · Regreso ${date(grupo.fechaRegreso)}` : ""} · ${grupo.habitaciones.length} habitaciones · ${grupo.pasajeros.length} pasajeros`,
  ]).font = { color: { argb: "FF555555" } };
  sheet.addRow([]);
  const header = sheet.addRow(COLUMNS.map((c) => c.header));
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D5B75" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  const border = { style: "thin" as const, color: { argb: "FFBBBBBB" } };
  grupo.habitaciones.forEach((room, index) => {
    const first = sheet.rowCount + 1;
    const tipo = ROOM_TYPES.find((t) => t.value === room.tipo)?.label ?? room.tipo;
    room.pasajeros.forEach((p) => {
      const row = sheet.addRow([index + 1, tipo, ...paxCells(p), reservaOf.get(p.id) ?? "", room.obs ?? ""]);
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = { top: border, bottom: border, left: border, right: border };
        cell.alignment = { vertical: "middle" };
      });
      // Una habitación sí y otra no, con fondo, para leerla de un vistazo
      if (index % 2 === 1) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF5F8" } };
        });
      }
    });
    // La habitación, el tipo y las observaciones van una sola vez por habitación
    const last = sheet.rowCount;
    if (last > first) {
      sheet.mergeCells(first, 1, last, 1);
      sheet.mergeCells(first, 2, last, 2);
      sheet.mergeCells(first, 11, last, 11);
    }
    sheet.getCell(first, 1).alignment = { vertical: "middle", horizontal: "center" };
    sheet.getCell(first, 1).font = { bold: true };
    sheet.getCell(first, 2).font = { bold: true };
  });

  if (grupo.sinHabitacion.length > 0) {
    sheet.addRow([]);
    sheet.addRow(["Sin habitación asignada"]).font = { bold: true, color: { argb: "FFC62828" } };
    grupo.sinHabitacion.forEach((p) => sheet.addRow(["", "", ...paxCells(p), p.reserva ?? ""]));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Rooming ${grupo.titulo}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
