import express from "express";
import { chatWithAI } from "../controllers/ChatController.js";

const chatRouter = express.Router();

chatRouter.post("/chat", chatWithAI);

export default chatRouter;
