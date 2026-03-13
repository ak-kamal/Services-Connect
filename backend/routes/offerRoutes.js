// backend/routes/offerRoutes.js
import express from 'express';
import UserModel from '../models/User.js';
import Offer from '../models/Offer.js';
import Slot from '../models/Slot.js';  // Import Slot model to get the slot details

const offerRouter = express.Router(); //previous

// POST /api/offer - Create an offer from customer to provider
offerRouter.post('/offer', async (req, res) => {
  const { providerId, customerId, timeSlot, date } = req.body;

  try {
    // Ensure customer and provider exist
    const provider = await UserModel.findById(providerId);
    const customer = await UserModel.findById(customerId);

    if (!provider || !customer) {
      return res.status(404).json({ success: false, message: 'Provider or Customer not found' });
    }

    // Check if the slot is available (unbooked)
    const slot = await Slot.findOne({ providerId, time: timeSlot, date });
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    if (slot.booked) {
      return res.status(400).json({ success: false, message: 'Slot is already booked' });
    }

    // Create a new offer
    const newOffer = new Offer({
      providerId,
      customerId,
      timeSlot,
      date,
      status: 'Pending',
    });

    // Save the offer
    await newOffer.save();

    // Update the slot to booked
    slot.booked = true;
    await slot.save();

    res.status(200).json({ success: true, message: 'Offer sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send offer', error });
  }
});

// PUT /api/offer/:offerId/accept - Accept the offer and book the slot
offerRouter.put('/offer/:offerId/accept', async (req, res) => {
  const { offerId } = req.params;

  try {
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Check if the provider exists and update the offer status
    const provider = await UserModel.findById(offer.providerId);
    if (!provider || provider.role !== 'electrician') {
      return res.status(404).json({ success: false, message: 'Provider not found or invalid role' });
    }

    offer.status = 'Accepted';
    await offer.save();

    res.status(200).json({ success: true, message: 'Offer accepted and slot booked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to accept offer', error });
  }
});

// PUT /api/offer/:offerId/reject - Reject an offer
offerRouter.put('/offer/:offerId/reject', async (req, res) => {
  const { offerId } = req.params;

  try {
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    offer.status = 'Rejected';
    await offer.save();

    res.status(200).json({ success: true, message: 'Offer rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to reject offer', error });
  }
});

// GET /api/offers?providerId=<providerId> - Fetch all offers for a specific provider
offerRouter.get('/offers', async (req, res) => {
  const { providerId } = req.query;

  try {
    // Fetch all offers for the specific provider
    const offers = await Offer.find({ providerId });

    res.status(200).json({ success: true, offers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch offers', error });
  }
});

export default offerRouter;