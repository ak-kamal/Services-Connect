// /routes/ComplaintRoutes.js
import express from 'express';
import { createComplaint, getAllComplaints } from '../controllers/ComplaintController.js';
import upload from '../config/multerConfig.js';

import { ensureAuthenticated } from '../middlewares/AuthMiddleware.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const ComplainRouter = express.Router();

// Route to create a complaint with or without file upload
ComplainRouter.post('/complaints', upload.single('file'), createComplaint);

//ComplainRouter.get('/complaints', getAllComplaints);

ComplainRouter.get(
  '/complaints',
  ensureAuthenticated,
  isAdmin,
  getAllComplaints
);

export default ComplainRouter;