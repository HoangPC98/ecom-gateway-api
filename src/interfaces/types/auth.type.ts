import { EOtpType } from "src/enums/auth.enum";

export type TOtpDto = {
  id: string;
  value?: string;
  to_number?: string;
  type?: string;
  wrong_count?: number;
  expried_in?: string;
};

export type RpcError = {
  code: number;
  details: string;
};
     
