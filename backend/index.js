import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./db.js";

import authRouter from "./routes/AuthRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//app.use('/auth', authRouter);
app.use("/auth", authRouter);
//app.use("/api/auth", authRouter);
app.use("/payments", paymentRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

// backend/index.js
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL (make sure it's correct)
}));