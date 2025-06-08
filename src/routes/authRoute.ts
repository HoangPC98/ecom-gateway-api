import { Router } from "express";
import * as authController from "../controller/auth.controller";
import { authTokenMiddleware } from "src/middleware/auth.middlewate";

const authRoute = Router();
authRoute.post("/auth/login", authController.login);
authRoute.post('/auth/sign-up', authController.signUp);
authRoute.post('/auth/get-otp', authController.getOtp);
authRoute.get('/auth/logout', authController.logOut)
export { authRoute };