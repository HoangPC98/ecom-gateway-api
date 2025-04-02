import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomerClientService } from '../services/rpc_client_services/rpc-client-customer';
import { ICustomerAuth, ISessionLogin, IGetOtpReq, ILoginT1Res, ILoginT1Req, ISignUpT1Req } from '../interfaces/customer-service/auth.interface';
import { AuthService } from '../services/auth.service';

const accessTokenSecret = process.env.JWT_ATOKEN || 'access';
const refreshTokenSecret = process.env.JWT_RTOKEN || 'refresh';
const customerClientService = new CustomerClientService();
const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
  customerClientService.clientRequest(
    { method: 'login', message: req.body as ILoginT1Req },
    async (err: any, data: any) => {
      console.log('GET clientRequest', data, err)
      if (err) {
        console.log('Error', err);
      }
      console.log('Data...', data);

      const tokens = await authService.handleLoginT1(req, data)
      res.status(201).json({ data: tokens });
    });
}

export const signUp = async (req: Request, res: Response) => {
  customerClientService.clientRequest(
    { method: 'signUp', message: req.body as ISignUpT1Req },
    async (err: any, data: any) => {
      console.log('SignUp Request...', data, err)
      if (err) {
        console.log('Error SignUp...', err);
      }
      console.log('Data...', data);

      const tokens = await authService.handleSignUpT1(req, data)
      res.status(201).json({ data: tokens });
    }
  )
}

export const getOtp = async (req: Request, res: Response) => {
  const pl: IGetOtpReq = req.body;
  const result = await authService.sendOtp(pl.usr, pl.type);
  res.status(200).json(result);
}

