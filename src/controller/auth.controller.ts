import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomerClientService } from '../services/rpc_client_services/rpc-client-customer';
import { ICustomerAuth, SessionLogin, IGetOtpReq } from '../interfaces/customer-service/auth.interface';
import { v1 as uuidv1 } from 'uuid';
import { AuthService } from '../services/auth.service';
import { plainToClass, plainToInstance } from 'class-transformer';

const accessTokenSecret = process.env.JWT_ATOKEN || 'access';
const refreshTokenSecret = process.env.JWT_RTOKEN || 'refresh';
const customerClientService = new CustomerClientService();
const authService = new AuthService();

export const login =  async (req: Request, res: Response) => {
  customerClientService.clientRequest({ method: 'login', message: { usr: 'hoangpc', password: '123' } }, async (err: any, data: any) => {
    console.log('GET clientRequest', data, err)
    if (err) {
      console.log('Error', err);
    }
    console.log('Data...', data);
   
    console.log('header...', req.headers['x-forwarded-for']);
    console.log('ipa..', req.socket.remoteAddress)
    const tokens = await authService.handleLogin(data, req)
    res.status(201).json({ data: tokens });
  });
}

export const getOtp = async(req: Request, res: Response) => {
  const pl: IGetOtpReq = req.body;
  const result = await authService.sendOtp(pl.usr, pl.type);
  res.status(200).json(result);
}

