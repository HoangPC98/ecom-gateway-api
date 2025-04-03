import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ApiError } from "../utils";
import HttpException from "src/exceptions/common.exception";

export const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode ||
      (error instanceof Error
        ? 400
        : 500);
    const message =
      error.message ||
      (statusCode === 400 ? "Bad Request" : "Internal Server Error");
    error = new ApiError(statusCode, message, false);
  }
  next(error);
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (process.env.NODE_ENV === "production" && !err.isOperational) {
    statusCode = 500;
    message = "Internal Server Error";
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).json(response);
  next();
};

export const grpcToHttpErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.code
  const message = err.details || 'Unknown Error';
  const response = {
    code: status,
    message,
    ...(process.env.NODE_ENV == 'develop' && { stack: err.stack }),
  };
  res.status(status).json(response)
}
