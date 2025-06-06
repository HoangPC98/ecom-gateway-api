import { Server, createServer } from "http";
import express, { Express, NextFunction, Request, Response } from "express";
import { authRoute } from "./routes/authRoute";
import { grpcToHttpErrorHandler } from "./middleware/exception.middleware";
import config from "./config/app.config";
import { authTokenMiddleware, publicRoutes } from "./middleware/auth.middlewate";
import { rateLimiter } from "./config/rate-limit.config";
import { messagingRoute } from "./routes/messageRoute";
import { createProxyMiddleware } from 'http-proxy-middleware';

let server: Server;
const app: Express = express();
const httpServer = createServer(app);
const CHAT_SERVICE_URL = 'http://localhost:9000';



function startServer() {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(grpcToHttpErrorHandler);


  // app.use((req: Request, res: Response, next: NextFunction) => {
  //   if (req.headers['x-forwarded-proto'] === 'http') {
  //     req.headers['x-forwarded-proto'] = 'https';
  //   }
  //   if (req.headers['x-forwarded-host']) {
  //     req.headers['x-forwarded-host'] = config.APP_HOST;
  //   }
  //   next();
  // });


  app.use(
    '/api/chat/connect',
    createProxyMiddleware({
      target: CHAT_SERVICE_URL,
      ws: true,
      changeOrigin: true,
    })
  );

  app.use(rateLimiter);
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (publicRoutes.includes(req.path)) {
      return next();
    }
    else authTokenMiddleware(req, res, next);
  });

  app.use(authRoute);
  app.use(messagingRoute);

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 API Gateway (WebSocket Proxy Only) is running on port ${PORT}`);
    console.log(`Clients should connect to ws://localhost:${PORT} or wss://localhost:${PORT}`);
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