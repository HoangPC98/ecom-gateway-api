import { Router } from "express";
import * as authController from "../controller/auth.controller";

const authRoute = Router();
authRoute.post("/login", authController.login);
authRoute.post('/sign-up', authController.signUp);
authRoute.post('/get-otp', authController.getOtp);
authRoute.get('/logout', authController.logOut)
export { authRoute };