import dayjs from "dayjs";

export interface iPax {
  id: string;
  firstname: string;
  lastname: string;
  dni: string;
  dniVto: null | dayjs.Dayjs;
  passport: string;
  passportVto: null | dayjs.Dayjs;
  dob: null | dayjs.Dayjs;
  adress: string;
  email: string;
  phoneNumber: string;
  obs: string;
}
