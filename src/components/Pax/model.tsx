import dayjs from "dayjs";

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
