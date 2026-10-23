import dayjs from "dayjs";

export interface iPax {
  id: string;
  firstname: string;
  lastname: string;
  dni: string;
  dniVto: null | dayjs.Dayjs;
  passport: string;
  passportVto: null | dayjs.Dayjs;
  // Visa de EE.UU. (número y vencimiento)
  visaUsa?: string | null;
  visaUsaVto?: null | dayjs.Dayjs;
  dob: null | dayjs.Dayjs;
  adress: string;
  email: string;
  phoneNumber: string;
  obs: string;
  // Próximos viajes (viene en el listado y en el perfil), para avisar de documentos que vencen antes
  File?: iPaxUpcomingFile[];
}

export interface iPaxUpcomingFile {
  id: string;
  numero?: number | null;
  anio?: number | null;
  destino: string;
  fechaSalida: string;
}
