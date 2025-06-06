import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomerClientService } from './rpc_client_services/rpc-client-customer';
import { v1 as uuidv1 } from 'uuid';
import { ILoginT1Res, ISessionLogin } from '../interfaces/customer-service/auth.interface';
import CacheService from './infrastructure/cache.service';
import { EOtpType, UsrLoginType } from '../enums/auth.enum';
import { checkPhoneOrEmail } from '../utils';
import { TOtpDto } from '../interfaces/types/auth.type';
import { RmqPubService } from './infrastructure/message-queue.service';
import { OtpService } from './otp.service';
import { Customer } from 'src/interfaces/customer-service/customer/customer';
import HttpException from '../exceptions/common.exception';
interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

interface UserPayload {
  id: number;
  usr: string;
  role: string;
}

export class AuthService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;

  protected cacheService: CacheService;
  protected rmqPubService: RmqPubService;
  protected otpService: OtpService;
  public customerClientService: CustomerClientService;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ATOKEN_SECRET || 'access';
    this.refreshTokenSecret = process.env.JWT_RTOKEN_SECRET || 'refresh';
    this.customerClientService = new CustomerClientService();
    this.cacheService = new CacheService();
    this.rmqPubService = new RmqPubService();
    this.otpService = new OtpService();
  }

  public generateAccessToken(user: UserPayload): string {
    return jwt.sign(user, this.accessTokenSecret, { expiresIn: '15m' });
  }

  public generateRefreshToken(user: UserPayload): string {
    return jwt.sign(user, this.refreshTokenSecret, { expiresIn: '7d' });
  }

  async handleLoginT1(req: Request, loginRes: Customer.LoginT1Res): Promise<ILoginT1Res> {
    const tokenPayload = { id: loginRes.uid || 0, usr: loginRes.usr || '', role: loginRes.role || 'user' };
    const tokens = {
      access_token: this.generateAccessToken(tokenPayload),
      refresh_token: this.generateRefreshToken(tokenPayload)
    }
    const { device_id, device_info } = req.headers;
    const { usr, password } = req.body;
    const newSession: ISessionLogin = {
      id: uuidv1(),
      usr: usr,
      refresh_token: this.generateRefreshToken(tokenPayload),
      fcm_token: loginRes.fcmToken || '',
      device_id: device_id ? String(device_id) : '',
      device_info: device_info ? String(device_info) : '',
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      last_login_at: new Date().toISOString(),
      expried_at: ''
    }
    const ckey = `sid_usr:${usr}`
    const sid_usr = await this.cacheService.get(ckey);
    if (!sid_usr)
      await this.cacheService.set(ckey, newSession, 3600);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      type: 'Bearer'
    }
  }

  async handleSignUpT1(req: Request, signUpRes: any) {
    const tokens = {
      access_token: this.generateAccessToken(signUpRes),
      refresh_token: this.generateAccessToken(signUpRes)
    }
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      type: 'Bearer'
    }
  }

  async sendOtp(usr: string, type: EOtpType): Promise<any> {
    const userType = checkPhoneOrEmail(usr);
    let otpSend: TOtpDto;

    if (userType == UsrLoginType.EMAIL) {
      return await this.sendOtpByEmail(usr, type);
    } else if (userType == UsrLoginType.PHONE) {
      otpSend = await this.sendOtpBySms(usr, type);
      return otpSend;
    }
    else
      return 1;
  }

  async sendOtpByEmail(email: string, type: EOtpType) { }

  async sendOtpBySms(phoneNumber: string, type: EOtpType): Promise<TOtpDto> {
    const otpSend = await this.otpService.generateOtpCode(phoneNumber, type);
    this.rmqPubService.publishSMS('send_sms_sign_up', otpSend)
    return {
      id: otpSend.id,
      expried_in: otpSend.expried_in,
      value: otpSend.value,
    };
  }

  async handleLogout(token: string) {
    try {
      const user = this.validateAccessToken(token);
      const sid = await this.cacheService.get(`sid_usr:${user.usr}`);
      if (!sid) throw new HttpException(401, 'Token is invalid');
      this.cacheService.del(`sid_usr:${user.usr}`);
    }
    catch (err) {
      throw new HttpException(401, 'Token is invalid');
    }
  }

  validateAccessToken(atoken: string): UserPayload {
    try {
      console.log('Token', atoken)
      const result = jwt.verify(atoken, String(this.accessTokenSecret));
      console.log('REsult...', result)
      return result as UserPayload;
    } catch (error) {
      throw new HttpException(401, 'Token is invalid');
    }

  }
}
