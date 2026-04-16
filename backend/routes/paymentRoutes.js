import express from 'express';
import { createCheckoutSession, stripeWebhook } from '../controllers/PaymentController.js';

const router = express.Router();

router.post('/create-checkout-session', createCheckoutSession);

// IMPORTANT → raw body for webhook
router.post('/webhook', stripeWebhook);

export default router;