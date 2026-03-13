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

export default providerRouter;