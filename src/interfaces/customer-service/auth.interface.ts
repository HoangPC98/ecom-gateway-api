import { ECustomerRole } from "src/enums/common.enum";
import { EOtpType } from "src/enums/auth.enum";

export interface ICustomerAuth {
  id: string;
  email: string;
  role: ECustomerRole;
}

export interface SessionLogin {
  id: string;
  usr: string;
  refresh_token: string;
  fcm_token: string;
  device_id: string;
  device_info: string;
  ip_address: string | any;
  last_login_at: string;
  expried_at: string;
}

export interface LoginT1Res {
  access_token: string;
  refresh_token: string;
  type: string;
}

export interface IGetOtpReq {
  usr: string;
  type: EOtpType;
}