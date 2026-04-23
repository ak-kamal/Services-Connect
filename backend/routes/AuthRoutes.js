// backend/routes/AuthRoutes.js
import express from "express";
import { loginValidation, signupValidation } from "../middlewares/AuthValidation.js";
import { login, signup } from "../controllers/AuthController.js";
import { extractNidDetails } from '../controllers/NidController.js';  // Ensure .js is added here
import uploadNid from '../middlewares/uploadNid.js';

const authRouter = express.Router();

// Define routes
authRouter.post('/signup', signupValidation, signup);
authRouter.post('/login', loginValidation, login);
authRouter.post('/extract-nid', uploadNid, extractNidDetails);

export default authRouter;