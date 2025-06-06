import { NextFunction, Request, Response } from 'express';
import { MessagingClientService } from '../services/rpc_client_services/rpc-client-messaging';
import { ICustomerAuth, ISessionLogin, IGetOtpReq, ILoginT1Res, ILoginT1Req, ISignUpT1Req } from '../interfaces/customer-service/auth.interface';
import { AuthService } from '../services/auth.service';
import HttpException from '../exceptions/common.exception';
import { Customer } from 'src/interfaces/customer-service/customer/customer';
import { Messaging } from 'src/interfaces/messaging-service/chat/messaging/messaging';

const messagingClientService = new MessagingClientService();
const authService = new AuthService();

export const initializeSocketConnection = async (req: Request, res: Response, next: NextFunction) => {
  messagingClientService.clientRequest(
    { method: 'connectSocket', message: { userId: req.body.user_id } as Messaging.ConnectSocketReq },
    async (err: any, data: any) => {
      if (err) {
        next(err);
      }
      else if (data) {
        console.log('Data...', data);
        try {
          if (data.status == 200) {
            const tokens = await authService.handleLoginT1(req, data)
            return res.status(201).json({ data: tokens });
          }
        } catch (error) {
          throw new HttpException(err.code, err.detail)
        }
      }
    });
}
