import { EOtpType } from "src/enums/auth.enum";

export type TOtpDto = {
  id: string;
  value?: string;
  key?: string;
  type?: string;
  wrong_count?: number;
  expried_in?: string;
};

