import { Server, createServer } from "http";
import express, { Express, NextFunction, Request, Response } from "express";
import { authRoute } from "./routes/authRoute";
import { grpcToHttpErrorHandler } from "./middleware/exception.middleware";
import config from "./config/app.config";
import { authTokenMiddleware, publicRoutes } from "./middleware/auth.middlewate";
import { rateLimiter } from "./config/rate-limit.config";
import { messagingRoute } from "./routes/messageRoute";
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import { createProxyServer } from 'http-proxy';


const app: Express = express();
const server = createServer(app);
const CHAT_SERVICE_HOST = "http://localhost:9000";
const CHAT_SERVICE_PORT = 5173;

const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:5173"]
  }
});

function startServer() {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(grpcToHttpErrorHandler);
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(
    '/chat-http', // Example path for HTTP requests to chat service
    createProxyMiddleware({
      target: 'http://localhost:9000', // Target Chat Service HTTP port
      changeOrigin: true,
      pathRewrite: {
        '^/chat-http': '', // Remove the /chat-http prefix when forwarding
      },
    })
  );

  // app.use((req: Request, res: Response, next: NextFunction) => {
  //   if (req.headers['x-forwarded-proto'] === 'http') {
  //     req.headers['x-forwarded-proto'] = 'https';
  //   }
  //   if (req.headers['x-forwarded-host']) {
  //     req.headers['x-forwarded-host'] = config.APP_HOST;
  //   }
  //   next();
  // });

  io.on('connection', (socket) => {
    console.log('Client connected to Chat Service:', socket.id);

    // Lắng nghe sự kiện 'message'
    socket.on('message', (message: string) => {
      console.log(`[Chat Service] Received message from ${socket.id}: "${message}"`);
      // Phát lại tin nhắn đến tất cả các client đã kết nối
      io.emit('message', `[${socket.id.substring(0, 5)}] says: ${message}`);
    });

    // Lắng nghe sự kiện 'joinRoom'
    socket.on('joinRoom', (room: string) => {
      socket.join(room);
      console.log(`[Chat Service] Client ${socket.id} joined room: ${room}`);
      io.to(room).emit('roomMessage', `Client ${socket.id} has joined room: ${room}`);
    });

    // Lắng nghe sự kiện 'leaveRoom'
    socket.on('leaveRoom', (room: string) => {
      socket.leave(room);
      console.log(`[Chat Service] Client ${socket.id} left room: ${room}`);
      io.to(room).emit('roomMessage', `Client ${socket.id} has left room: ${room}`);
    });

    // Xử lý khi client ngắt kết nối
    socket.on('disconnect', () => {
      console.log('Client disconnected from Chat Service:', socket.id);
    });
  });

  // app.use(
  //   cors({
  //     origin: CHAT_SERVICE_URL,
  //     credentials: true,
  //   })
  // );
  
  // app.use(
  //   '/api/chat/connect',
  //   createProxyMiddleware({
  //     target: CHAT_SERVICE_URL,
  //     ws: true,
  //     changeOrigin: true,
  //   })
  // );

  const proxy = createProxyServer({
    target: CHAT_SERVICE_HOST,
    ws: true,
    changeOrigin: true
  });

  server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
  });

  const wsProxy = createProxyMiddleware({
    target: CHAT_SERVICE_HOST,
    ws: true, // Enable WebSocket proxy
    changeOrigin: true,
    // Optional: Path rewrite if your chat service expects a different path for websockets
    // pathRewrite: {
    //   '^/socket.io': '/socket.io',
    // },
  });
  
  // Apply the proxy to the HTTP server for WebSocket upgrades
  // This is crucial for socket.io's WebSocket transport
  server.on('upgrade', wsProxy.upgrade);
  
  // Optional: for health check
  app.get('/health', (_, res) => {
    res.send('Gateway is up');
  });
  

  app.use(rateLimiter);
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (publicRoutes.includes(req.path)) {
      return next();
    }
    else authTokenMiddleware(req, res, next);
  });

  app.use(authRoute);
  app.use(messagingRoute);

  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`🚀 API Gateway (WebSocket Proxy Only) is running on port ${PORT}`);
    console.log(`Clients should connect to ws://localhost:${PORT} or wss://localhost:${PORT}`);
  });

}

const bootstrap = async () => {
  startServer();
}

bootstrap();

const unexpectedErrorHandler = (error: unknown) => {
  // console.error(error);
  // if (server) {
  //   server.close(() => {
  //     console.info("Server closed");
  //     process.exit(1);
  //   });
  // } else {
  //   process.exit(1);
  // }
};
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);