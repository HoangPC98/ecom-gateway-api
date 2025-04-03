import { NextFunction, Request, Response } from 'express';

import { CustomerClientService } from '../services/rpc_client_services/rpc-client-customer';
import { ICustomerAuth, ISessionLogin, IGetOtpReq, ILoginT1Res, ILoginT1Req, ISignUpT1Req } from '../interfaces/customer-service/auth.interface';
import { AuthService } from '../services/auth.service';
import HttpException from '../exceptions/common.exception';
import * as GRPC from '@grpc/grpc-js'
import { Customer } from 'src/interfaces/customer-service/customer/customer';

const accessTokenSecret = process.env.JWT_ATOKEN || 'access';
const refreshTokenSecret = process.env.JWT_RTOKEN || 'refresh';
const customerClientService = new CustomerClientService();
const authService = new AuthService();

export const login = async (req: Request, res: Response, next: NextFunction) => {
  customerClientService.clientRequest(
    { method: 'login', message: req.body as Customer.LoginT1Req },
    async (err: any, data: any) => {
      if (err) {
        next(err);
      }
      else if (data) {
        console.log('Data...', data);
        try {
          if(data.status == 200){
            const tokens = await authService.handleLoginT1(req, data)
            return res.status(201).json({ data: tokens });
          }

        } catch (error) {
          throw new HttpException(err.code, err.detail)
        }
      }
    });
}

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  customerClientService.clientRequest(
    { method: 'signUp', message: req.body as ISignUpT1Req },
    async (err: any, data: any) => {
      console.log('SignUp Request...', data, err)
      if (err) {
        next(err)
      }
      else if (data) {
        console.log('Data...', data);
        try {
          const tokens = await authService.handleSignUpT1(req, data)
          return res.status(201).json({ data: tokens });
        } catch (error) {
          throw new HttpException(err.code, err.detail)
        }
      }
    }
  )
}

export const logOut = async(req: Request, res: Response, next: NextFunction) =>{
  const token = req.headers.authorization;
  if(token){
    try {
      authService.validateAccessToken(token.split(' ')[1]);
      res.status(200).json({message: 'Logout Successfully'})
    } catch (error) {
      res.status(401).json({message: 'Unauthorized'})
    }
  }
 
}

export const getOtp = async (req: Request, res: Response) => {
  const pl: IGetOtpReq = req.body;
  const result = await authService.sendOtp(pl.usr, pl.type);
  res.status(200).json(result);
}

