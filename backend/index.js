import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./db.js";

import authRouter from "./routes/AuthRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})