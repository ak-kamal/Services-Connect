import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./db.js";
import './cronJobs/slotCron.js';

import authRouter from "./routes/AuthRoutes.js";
import providerRouter from "./routes/ProviderRoutes.js";
import offerRouter from "./routes/offerRoutes.js";
import slotRouter from './routes/slotRoutes.js';
import chatRouter from "./routes/chatRoutes.js";
import providerTrustRouter from "./routes/providerTrustRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/api', providerRouter); // Add this line to use providerRouter for /api routes as well
app.use('/api', offerRouter);
app.use('/api', slotRouter);
app.use("/api", chatRouter);
app.use('/api/trust', providerTrustRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

