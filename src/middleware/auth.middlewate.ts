
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ICustomerAuth } from 'src/interfaces/customer-service/auth.interface';

const accessTokenSecret: string = process.env.JWT_ATOKEN_SECRET || 'access';
const refreshTokenSecret: string = process.env.JWT_RTOKEN_SECRET || 'refresh';


const generateTokens = (user: ICustomerAuth): { accessToken: string; refreshToken: string } => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

const verifyToken = (token: string, type: 'access' | 'refresh' = 'access'): ICustomerAuth | null => {
  const secret = type === 'access' ? accessTokenSecret : refreshTokenSecret;
  try {
    return jwt.verify(token, secret) as ICustomerAuth;
  } catch (err) {
    return null;
  }
}

export { generateTokens, verifyToken };
