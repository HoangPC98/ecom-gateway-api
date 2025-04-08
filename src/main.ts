import { Server } from "http";
import express, { Express, NextFunction, Request, Response } from "express";
import { authRoute } from "./routes/authRoutes";
import { grpcToHttpErrorHandler } from "./middleware/exception.middleware";
import config from "./config/app.config";
import { authTokenMiddleware, publicRoutes } from "./middleware/auth.middlewate";
import { rateLimit } from 'express-rate-limit';
import { rateLimiter } from "./config/rate-limit.config";

let server: Server;
const app: Express = express();

function startServer() {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(grpcToHttpErrorHandler);

  
  
  app.use(rateLimiter);
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (publicRoutes.includes(req.path)) {
      return next();
    }
    else authTokenMiddleware(req, res, next);
  });
  
  app.use(authRoute);

  server = app.listen(config.APP_PORT, () => {
    console.log(`--> Http Server is running on port ${config.APP_PORT}`);
  });
}

const bootstrap = async () => {
  startServer();
}

bootstrap();

const unexpectedErrorHandler = (error: unknown) => {
  console.error(error);
  if (server) {
    server.close(() => {
      console.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);