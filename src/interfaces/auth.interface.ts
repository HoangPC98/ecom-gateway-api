import { EOtpType } from "src/enums/auth.enum";

export interface IGetOtpReq {
  usr: string;
  type: EOtpType;
}