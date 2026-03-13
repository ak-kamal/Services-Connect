import express from 'express';
//import Provider from '../models/Provider.js';
import UserModel from '../models/User.js';

const providerRouter = express.Router();

// GET /api/providers?role=electrician
providerRouter.get('/providers', async (req, res) => {
  const { role } = req.query;

  try {
    const providers = await UserModel.find({ role });
    res.status(200).json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch providers', error });
  }
});

// GET /api/providers/:providerId - Fetch provider details by providerId
providerRouter.get('/providers/:providerId', async (req, res) => {
  const { providerId } = req.params;

  try {
    const provider = await UserModel.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.status(200).json({ success: true, provider });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching provider', error });
  }
});

export default providerRouter; 