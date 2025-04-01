import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomerClientService } from './rpc_client_services/rpc-client-customer';
import { v1 as uuidv1 } from 'uuid';
import { LoginT1Res, SessionLogin } from '../interfaces/customer-service/auth.interface';
import CacheService from './infrastructure/cache.service';
import { EOtpType, UsrLoginType } from '../enums/auth.enum';
import { checkPhoneOrEmail } from '../utils';
import { TOtpDto } from '../interfaces/types/auth.type';
import { RmqPubService } from './infrastructure/message-queue.service';
import { OtpService } from './otp.service';
interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

interface UserPayload {
  id: number;
  role: string;
}

export class AuthService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private users: User[] = [
    { id: 1, username: 'admin', password: bcrypt.hashSync('admin', 10), role: 'admin' },
    { id: 2, username: 'user', password: bcrypt.hashSync('user', 10), role: 'user' },
  ];

  protected cacheService: CacheService;
  protected rmqPubService: RmqPubService;
  protected otpService: OtpService;
  public customerClientService: CustomerClientService;
  
  constructor() {
    this.accessTokenSecret = process.env.JWT_ATOKEN || 'access';
    this.refreshTokenSecret = process.env.JWT_RTOKEN || 'refresh';
    this.customerClientService = new CustomerClientService();
    this.cacheService = new CacheService();
    this.rmqPubService = new RmqPubService();
    this.otpService = new OtpService();
  }

  public signUp(req: Request, res: Response) {
    const { username, password, role } = req.body;
    console.log('thisUsers', this.users);
    const userExists = this.users.find(user => user.username === username);
    if (userExists) {
      res.status(400).send('User already exists');
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser: User = { id: this.users.length + 1, username, password: hashedPassword, role };
    return res.status(201).send('User created successfully');
  }

  login(req: Request, res: Response) {
    const { username, password } = req.body;
    console.log('this.customerClientService', this);
    console.log('thisaccessTokenSecret', this.accessTokenSecret);
    const listUser = [
      { id: 1, username: 'admin', password: bcrypt.hashSync('admin', 10), role: 'admin' },
      { id: 2, username: 'user', password: bcrypt.hashSync('user', 10), role: 'user' },
    ];

    this.customerClientService.clientRequest({ method: 'login', message: { usr: 'hoangpc', password: '123' } }, (err: any, data: any) => {
      console.log('GET clientRequest', data, err)
      if (err) {
        console.log('Error', err);
      }
      res.json({ users: data });
    });
  }

  public resetPassword(req: Request, res: Response): void {
    const { username, newPassword } = req.body;
    const user = this.users.find(user => user.username === username);
    if (!user) {
      res.status(400).send('User not found');
      return;
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    res.send('Password reset successfully');
  }

  public generateAccessToken(user: UserPayload): string {
    return jwt.sign(user, this.accessTokenSecret, { expiresIn: '15m' });
  }

  public generateRefreshToken(user: UserPayload): string {
    return jwt.sign(user, this.refreshTokenSecret, { expiresIn: '7d' });
  }

  async handleLogin(loginRes: any, req: Request): Promise<LoginT1Res> {
    const tokens = {
      access_token: this.generateAccessToken(loginRes),
      refresh_token: this.generateAccessToken(loginRes)
    }
    const { device_id, device_info } = req.headers;
    const { usr, password } = req.body;
    const newSession: SessionLogin = {
      id: uuidv1(),
      usr: usr,
      refresh_token: this.generateRefreshToken(loginRes),
      fcm_token: loginRes.fcm_token || null,
      device_id: device_id ? String(device_id) : '',
      device_info: device_info ? String(device_info) : '',
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      last_login_at: new Date().toISOString(),
      expried_at: ''
    }
    const ckey = `usr:${usr}_sid:${newSession.device_id}`
    const checkSid = await this.cacheService.get(ckey);
    if (!checkSid)
      await this.cacheService.set(ckey, newSession, 3600);
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.access_token,
      type: 'Bearer'
    }
  }

  async sendOtp(usr: string, type: EOtpType): Promise<any> {
    const userType = checkPhoneOrEmail(usr);
    let otpSend: TOtpDto;

    // this.channel.sendToQueue(
    //   'MESSSAGE_SERVICE_QUEUE',
    //   Buffer.from(JSON.stringify({ msg })),
    //   {
    //     persistent: true  // make sure msg won't be lost even RMQ restart (RMQ will save msg to disk in advanced)
    //   }
    // );
    if (userType == UsrLoginType.EMAIL) {
      return await this.sendOtpByEmail(usr, type);
    } else if(userType == UsrLoginType.PHONE) {
      otpSend = await this.sendOtpBySms(usr, type);
      return otpSend;
    }
    else
     return 1;
  }

  async sendOtpByEmail(email: string, type: EOtpType) {}

  async sendOtpBySms(phoneNumber: string, type: EOtpType): Promise<TOtpDto> {
    const otpSend = await this.otpService.generateOtpCode(phoneNumber, type);
    this.rmqPubService.publishSMS('send_sms_sign_up', otpSend)
    return {
      id: otpSend.id,
      expried_in: otpSend.expried_in,
      value: otpSend.value,
    };
  }
}
