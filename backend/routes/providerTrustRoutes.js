// routes/providerTrustRoutes.js
import express from 'express';
import { getProviderTrust, updateProviderTrust, addReviewAndUpdateTrust } from '../controllers/ProviderTrustController.js';

const providerTrustRouter = express.Router();

// Fetch trust info for a provider
providerTrustRouter.get('/provider/:providerId', getProviderTrust);

// Update provider trust info (this could be triggered by admin)
providerTrustRouter.put('/provider/:providerId', updateProviderTrust);

// Add a rating and update trust score
providerTrustRouter.put('/provider/:providerId/review', addReviewAndUpdateTrust);

export default providerTrustRouter;