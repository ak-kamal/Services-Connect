import express from 'express';
import Slot from '../models/Slot.js';

const slotRouter = express.Router();

// GET /api/slots?providerId=<providerId> - Fetch available slots for a specific provider
slotRouter.get('/slots', async (req, res) => {
  const { providerId } = req.query;

  try {
    const availableSlots = await Slot.find({ providerId, booked: false });
    
    if (availableSlots.length === 0) {
      return res.status(404).json({ success: false, message: 'No available slots' });
    }

    res.status(200).json({ success: true, availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch available slots', error });
  }
});

// PUT /api/slots/:slotId/book - Book a slot
slotRouter.put('/slots/:slotId/book', async (req, res) => {
  const { slotId } = req.params;

  try {
    const slot = await Slot.findById(slotId);
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    if (slot.booked) {
      return res.status(400).json({ success: false, message: 'Slot already booked' });
    }

    // Mark the slot as booked
    slot.booked = true;
    await slot.save();

    res.status(200).json({ success: true, message: 'Slot booked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to book slot', error });
  }
});

export default slotRouter;