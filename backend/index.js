import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./db.js";

import authRouter from "./routes/AuthRoutes.js";
import providerRouter from "./routes/ProviderRoutes.js";
import offerRouter from "./routes/offerRoutes.js";
import slotRouter from './routes/slotRoutes.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/api', providerRouter); // Add this line to use providerRouter for /api routes as well
app.use('/api', offerRouter);
app.use('/api', slotRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

