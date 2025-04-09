import { RpcError } from "src/interfaces/types/auth.type";
import { Response } from 'express';

export const thowHttpException = (err: RpcError, res: Response) => {
  return res.status(err.code).json({ message: err.details });
}