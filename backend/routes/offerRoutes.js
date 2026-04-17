// backend/routes/offerRoutes.js
import express from 'express';
import moment from 'moment';
import UserModel from '../models/User.js';
import Offer from '../models/Offer.js';
import Slot from '../models/Slot.js';

const offerRouter = express.Router();


// -------------------- POST OFFER --------------------
offerRouter.post('/offer', async (req, res) => {
  const { providerId, customerId, timeSlot, date, address } = req.body;

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

    const newOffer = new Offer({
      providerId,
      customerId,
      timeSlot,
      date,
      address,
      status: 'Pending',
    });

    await newOffer.save();

    res.status(200).json({ success: true, message: 'Offer sent successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send offer', error });
  }
});


// -------------------- ACCEPT OFFER --------------------
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
    await offer.save();

    res.status(200).json({ success: true, message: 'Offer rejected' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to reject offer', error });
  }
});


// -------------------- PROVIDER OFFERS --------------------
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


// -------------------- CUSTOMER OFFERS --------------------
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


// 🔥🔥🔥 NEW ROUTE (IMPORTANT)
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


// -------------------- RECURRING BOOKING --------------------
// Bulk-creates multiple offers following a weekly / biweekly / monthly pattern.
// Skips dates where no slot exists yet, the slot is already booked, or an offer
// already exists for that date/time. Returns a per-occurrence report.
offerRouter.post('/recurring-booking', async (req, res) => {
  const {
    providerId,
    customerId,
    timeSlot,
    startDate,
    frequency,    // 'weekly' | 'biweekly' | 'monthly'
    occurrences,  // how many bookings to create (1..12)
    address,
  } = req.body;

  try {
    if (!providerId || !customerId || !timeSlot || !startDate || !frequency || !occurrences) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const stepDays = frequency === 'weekly' ? 7 : frequency === 'biweekly' ? 14 : 30;
    const count = Math.min(Math.max(parseInt(occurrences, 10), 1), 12);

    const created = [];
    const skipped = [];

    for (let i = 0; i < count; i++) {
      const targetDate = moment(startDate).startOf('day').add(i * stepDays, 'days').toDate();
      const nextDay = moment(targetDate).add(1, 'day').toDate();
      const dateLabel = moment(targetDate).format('YYYY-MM-DD');

      const slot = await Slot.findOne({
        providerId,
        time: timeSlot,
        date: { $gte: targetDate, $lt: nextDay },
      });

      if (!slot) {
        skipped.push({ date: dateLabel, reason: 'no slot available' });
        continue;
      }

      if (slot.booked) {
        skipped.push({ date: dateLabel, reason: 'slot already booked' });
        continue;
      }

      const existing = await Offer.findOne({
        providerId,
        timeSlot,
        date: { $gte: targetDate, $lt: nextDay },
        status: { $in: ['Pending', 'Accepted'] },
      });

      if (existing) {
        skipped.push({ date: dateLabel, reason: 'offer already exists' });
        continue;
      }

      const offer = await Offer.create({
        providerId,
        customerId,
        timeSlot,
        date: targetDate,
        address,
        status: 'Pending',
      });

      created.push({ date: dateLabel, offerId: offer._id });
    }

    res.status(200).json({
      success: true,
      message: `Created ${created.length} booking(s), skipped ${skipped.length}`,
      created,
      skipped,
    });
  } catch (error) {
    console.error('recurring-booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create recurring booking' });
  }
});


export default offerRouter;