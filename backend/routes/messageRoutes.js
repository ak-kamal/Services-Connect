import express from 'express';
import { ensureAuthenticated } from '../middlewares/AuthMiddleware.js';
import { getMessages } from '../controllers/MessageController.js';

const router = express.Router();

router.get('/messages/:offerId', ensureAuthenticated, getMessages);

export default router;
