// backend/routes/offerRoutes.js
import express from 'express';
import UserModel from '../models/User.js';
import Offer from '../models/Offer.js';
import Slot from '../models/Slot.js';

import sendWorkDoneEmail from '../utils/nodemailer.js';  // Import Nodemailer utility


const offerRouter = express.Router();


// POST OFFER 
offerRouter.post('/offer', async (req, res) => {
  const {
  providerId,
  customerId,
  timeSlot,
  date,
  address,

  category,
  tier,
  distance,
  totalPrice
} = req.body;

  try {
    const provider = await UserModel.findById(providerId);
    const customer = await UserModel.findById(customerId);

    if (!provider || !customer) {
      return res.status(404).json({ success: false, message: 'Provider or Customer not found' });
    }

    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const slot = await Slot.findOne({
      providerId,
      time: timeSlot,
      date: { $gte: start, $lt: end }
    });

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    if (slot.booked) {
      return res.status(400).json({ success: false, message: 'Slot is already booked' });
    }

    const offer = new Offer({
  providerId,
  customerId,
  timeSlot,
  date,
  address,
  category,
  tier,
  distance,
  totalPrice,
  commission: Number((totalPrice * 0.15).toFixed(2)),  // 15% commission
  providerEarnings: Number((totalPrice * 0.85).toFixed(2))  // 85% goes to provider
//  currentRatingOfProvider : provider.rating
});

    await offer.save();
    provider.pendingOffers += 1;

    res.status(200).json({ success: true, message: 'Offer sent successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send offer', error });
  }
});


// Update OFFER 
offerRouter.put('/offer/:offerId/accept', async (req, res) => {
  const { offerId } = req.params;

  try {
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const provider = await UserModel.findById(offer.providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const start = new Date(offer.date);
    const end = new Date(offer.date);
    end.setDate(end.getDate() + 1);

    const slot = await Slot.findOne({
      providerId: offer.providerId,
      time: offer.timeSlot,
      date: { $gte: start, $lt: end }
    });

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    if (slot.booked) {
      return res.status(400).json({ success: false, message: 'Slot already booked' });
    }

    // Accept offer
    offer.status = 'Accepted';
    //const provider = await UserModel.findById(offer.providerId);
    provider.pendingOffers -= 1;
    await offer.save();

    // Book slot
    slot.booked = true;
    await slot.save();

    // Reject other offers
    await Offer.updateMany(
      {
        _id: { $ne: offerId },
        providerId: offer.providerId,
        timeSlot: offer.timeSlot,
        date: offer.date,
        status: 'Pending'
      },
      { status: 'Rejected' }
    );






    

    res.status(200).json({ success: true, message: 'Offer accepted and slot booked' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to accept offer', error });
  }
});


// -------------------- REJECT OFFER --------------------
offerRouter.put('/offer/:offerId/reject', async (req, res) => {
  const { offerId } = req.params;

  try {
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    offer.status = 'Rejected';
    const provider = await UserModel.findById(offer.providerId);
    provider.pendingOffers -= 1;
    await offer.save();

    res.status(200).json({ success: true, message: 'Offer rejected' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to reject offer', error });
  }
});


//  PROVIDER OFFERS 
offerRouter.get('/offers', async (req, res) => {
  const { providerId } = req.query;

  try {
    const offers = await Offer.find({ providerId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, offers });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch offers', error });
  }
});


// CUSTOMER OFFERS
offerRouter.get('/customer-offers', async (req, res) => {
  const { customerId } = req.query;

  try {
    const offers = await Offer.find({ customerId })
      .populate('providerId', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, offers });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer offers' });
  }
});



offerRouter.get('/provider-slot-offers', async (req, res) => {
  const { providerId } = req.query;

  try {
    const offers = await Offer.find({
      providerId,
      status: { $in: ['Pending', 'Accepted'] }
    });

    res.status(200).json({ success: true, offers });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch slot offers' });
  }
});



// New route for marking offer as completed
offerRouter.put('/offer/:offerId/complete', async (req, res) => {
  const { offerId } = req.params;

  try {
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Update status to "Completed"
    offer.status = 'Completed';
    await offer.save();

    // Fetch provider and customer details
    const provider = await UserModel.findById(offer.providerId);
    const customer = await UserModel.findById(offer.customerId);

    // Send email to both customer and provider
    await sendWorkDoneEmail(provider, customer, offer);  // Call the email function

    res.status(200).json({ success: true, message: 'Offer marked as completed and email sent' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to mark offer as completed', error });
  }
});

offerRouter.put('/offer/:offerId/add-review', async (req, res) => {
  try {
    const { rating, review } = req.body;
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Save rating + review
    offer.rating = rating;
    offer.review = review;

    await offer.save();

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

export default offerRouter;