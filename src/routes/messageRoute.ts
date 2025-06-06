import { Router } from "express";
import * as messagingController from "../controller/messaging.controller";
import { authTokenMiddleware } from "src/middleware/auth.middlewate";

const messagingRoute = Router();
// authRoute.post('/get-user-online', messagingController.login);
// authRoute.post('/get-message-chatbox', messagingController.signUp);
// authRoute.post('/send-message', messagingController.getOtp);
messagingRoute.get('/messaging/chat/connect', messagingController.initializeSocketConnection)
export { messagingRoute };