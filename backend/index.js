import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import "./db.js";
import './cronJobs/slotCron.js';

import authRouter from "./routes/AuthRoutes.js";
import providerRouter from "./routes/providerRoutes.js";
import offerRouter from "./routes/offerRoutes.js";
import slotRouter from './routes/slotRoutes.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/auth', authRouter);
app.use('/api', providerRouter); // Add this line to use providerRouter for /api routes as well
app.use('/api', offerRouter);
app.use('/api', slotRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

// backend/index.js
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL (make sure it's correct)
}));
