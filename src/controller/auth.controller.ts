import { NextFunction, Request, Response } from 'express';
import { CustomerClientService } from '../services/rpc_client_services/rpc-client-customer';
import { ICustomerAuth, ISessionLogin, IGetOtpReq, ILoginT1Res, ILoginT1Req, ISignUpT1Req } from '../interfaces/customer-service/auth.interface';
import { AuthService } from '../services/auth.service';
import HttpException from '../exceptions/common.exception';
import { Customer } from 'src/interfaces/customer-service/customer/customer';
import logger from "src/utils/logger";
import { RpcError } from 'src/interfaces/types/auth.type';
import { thowHttpException } from 'src/exceptions/throw-exeption';

const customerClientService = new CustomerClientService();
const authService = new AuthService();

export const login = async (req: Request, res: Response, next: NextFunction) => {
  customerClientService.clientRequest(
    { method: 'login', message: req.body as Customer.LoginT1Req },
    async (err: RpcError, data: any) => {
      if (err) {
        return res.status(err.code).json({ message: err.details });
      }
      else if (data) {
        logger.info('Data...', data);
        try {
          if (data.status == 200) {
            const tokens = await authService.handleLoginT1(req, data)
            return res.status(201).json({ data: tokens });
          }
        } catch (error) {
          return res.status(400).json({ message: "Bad request" });
        }
      }
    });
}

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  customerClientService.clientRequest(
    { method: 'signUp', message: req.body as Customer.SignUpT1Req },
    async (err: RpcError, data: any) => {
      logger.info('SignUp Request...', data, err)
      if (err) {
        return thowHttpException(err, res)
      }
      else if (data) {
        try {
          const tokens = await authService.handleSignUpT1(req, data)
          return res.status(201).json({ data: tokens });
        } catch (error) {
        return thowHttpException(err, res)

        }
      }
    }
  )
}

export const logOut = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (token) {
    try {
      await authService.handleLogout(token.split(' ')[1]);
      res.status(200).json({ message: 'Logout Successfully' })
    } catch (error: any) {
      res.status(401).json({ message: error.message })
    }
  }
}

export const getOtp = async (req: Request, res: Response) => {
  const pl: IGetOtpReq = req.body;
  const result = await authService.sendOtp(pl.usr, pl.type);
  res.status(200).json(result);
}

