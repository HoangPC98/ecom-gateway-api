import { ECustomerRole } from "src/enums/common.enum";
import { EOtpType } from "src/enums/auth.enum";

export interface ICustomerAuth {
  id: string;
  email: string;
  role: ECustomerRole;
}

export interface ISessionLogin {
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

export interface ILoginT1Req {
  usr: string;
  password: string;
}
export interface ILoginT1Res {
  access_token: string;
  refresh_token: string;
  type: string;
}

export interface ISignUpT1Req {
  usr: string;
  password: string;
  otp_id: string;
  otp_code: string;
}
export interface IGetOtpReq {
  usr: string;
  type: EOtpType;
}