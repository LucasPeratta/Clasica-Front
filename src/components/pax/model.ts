import dayjs from "dayjs";

export interface IPax {
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
