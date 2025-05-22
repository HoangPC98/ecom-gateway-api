import { Router } from "express";
import * as authController from "../controller/auth.controller";
import { authTokenMiddleware } from "src/middleware/auth.middlewate";

const authRoute = Router();
authRoute.post('/get-user-online', authController.login);
authRoute.post('/get-message-chatbox', authController.signUp);
authRoute.post('/send-message', authController.getOtp);
authRoute.get('/', authController.logOut)
export { authRoute };