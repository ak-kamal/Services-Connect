// /routes/ComplaintRoutes.js
import express from 'express';
import { createComplaint } from '../controllers/ComplaintController.js';
import upload from '../config/multerConfig.js';

const ComplainRouter = express.Router();

// Route to create a complaint with or without file upload
ComplainRouter.post('/complaints', upload.single('file'), createComplaint);

export default ComplainRouter;