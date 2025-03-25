import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomerClientService } from './rpc_client_services/rpc-client-customer';

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

  public customerClientService: CustomerClientService;
  constructor() {
    this.accessTokenSecret = process.env.JWT_ATOKEN || 'access';
    this.refreshTokenSecret = process.env.JWT_RTOKEN || 'refresh';
    this.customerClientService = new CustomerClientService();
    console.log('Contructor AuthService ...', this.customerClientService);

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

    // console.log('thisUsers', this.users);
    // console.log('this.customerClientService', this.customerClientService);
    // const user = listUser.find(user => user.username === username);
    // if (!user) {
    //   res.status(400).send('Invalid username or password');
    //   return;
    // }

    // const customerClientService = new CustomerClientService();
    // const validPassword = bcrypt.compareSync(password, user.password);
    // if (!validPassword) {
    //   res.status(400).send('Invalid username or password');
    //   return;
    // }

    // const accessToken = this.generateAccessToken({ id: user.id, role: user.role });
    // const refreshToken = this.generateRefreshToken({ id: user.id, role: user.role });
    this.customerClientService.clientRequest({method: 'login',  message: {usr: 'hoangpc', password: '123'} }, (err: any, data: any) => {
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
}
