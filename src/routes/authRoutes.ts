import { Router } from "express";
import * as authController from "../controller/auth.controller";

const authRoute = Router();
authRoute.post("/login", authController.login);
authRoute.post('/get-otp', authController.getOtp)
export { authRoute };