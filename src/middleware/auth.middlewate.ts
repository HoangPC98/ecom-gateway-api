
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ICustomerAuth } from 'src/interfaces/customer-service/auth.interface';
interface AuthenticatedRequest extends Request {
  user?: any;
}
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

const authTokenMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required.....' });
  }
  try {
    // Verify the token
    const decoded = jwt.verify(token, accessTokenSecret);
    req.user = decoded;  // Attach the decoded user to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const publicRoutes = ['/auth/login', '/auth/sign-up', '/auth/get-otp', '/auth/verify-otp',];

export {publicRoutes, generateTokens, verifyToken, authTokenMiddleware };
