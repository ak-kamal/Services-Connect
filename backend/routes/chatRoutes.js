import express from "express";
import { chatWithBot } from "../controllers/ChatController.js";

const router = express.Router();

router.post("/chat", chatWithBot);

export default router;