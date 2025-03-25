import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomerClientService } from '../services/rpc_client_services/rpc-client-customer';
import { ICustomerAuth } from 'src/interfaces/customer-service/auth.interface';

const accessTokenSecret = process.env.JWT_ATOKEN || 'access';
const refreshTokenSecret = process.env.JWT_RTOKEN || 'refresh';
const customerClientService = new CustomerClientService();

export const login = (req: Request, res: Response) => {
 
  console.log('this.customerClientService', this);
  console.log('thisaccessTokenSecret', accessTokenSecret);
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
  customerClientService.clientRequest({ method: 'login', message: { usr: 'hoangpc', password: '123' } }, (err: any, data: any) => {
    console.log('GET clientRequest', data, err)
    if (err) {
      console.log('Error', err);
    }
    console.log('Data...', data)
    res.json({ users: data });
  });
}


const generateAccessToken = (user: ICustomerAuth): string => {
  return jwt.sign(user, accessTokenSecret, { expiresIn: '15m' });
}

const generateRefreshToken = (user: ICustomerAuth): string => {
  return jwt.sign(user, refreshTokenSecret, { expiresIn: '7d' });
}
