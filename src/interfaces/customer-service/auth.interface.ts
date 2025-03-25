import { ECustomerRole } from "src/enums/common.enum";

export interface ICustomerAuth {
  id: string;
  email: string;
  role: ECustomerRole;
}