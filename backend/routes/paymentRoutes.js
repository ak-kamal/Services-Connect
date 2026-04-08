import express from "express";
import { createPayment } from "../controllers/PaymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/createPayment", createPayment);

export default paymentRouter;