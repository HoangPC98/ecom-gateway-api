import { Router } from "express";
import * as authController from "../controller/auth.controller";

const userRouter = Router();
userRouter.post("/login", authController.login);

export { userRouter };