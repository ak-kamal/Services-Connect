import express from "express";
import { loginValidation, signupValidation } from "../middlewares/AuthValidation.js";
import { login, signup } from "../controllers/AuthController.js";

const authRouter = express.Router();

authRouter.post('/signup', signupValidation, signup);
authRouter.post('/login', loginValidation, login);

export default authRouter;