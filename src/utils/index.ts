import bcrypt from "bcryptjs";
import { UsrLoginType } from "../enums/auth.enum";

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    statusCode: number,
    message: string | undefined,
    isOperational = true,
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const encryptPassword = async (password: string) => {
  const encryptedPassword = await bcrypt.hash(password, 12);
  return encryptedPassword;
};

export const isPasswordMatch = async (password: string, userPassword: string) => {
  const result = await bcrypt.compare(password, userPassword);
  return result;
};


export const checkPhoneOrEmail = (usr: string) => {
  const isPhoneNumber =
    usr.match(new RegExp('^[0-9]*$')) && ((usr[0] == '+' && usr.length) == 12 || (usr[0] == '0' && usr.length == 10));
  if (isPhoneNumber) return UsrLoginType.PHONE;
  else if (usr.includes('@')) return UsrLoginType.EMAIL;
  else return UsrLoginType.PHONE;
};

