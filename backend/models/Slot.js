// backend/models/Slot.js
import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the provider (User model)
    required: true,
  },
  time: {
    type: String, // Format: '8:00 AM - 12:00 PM'
    required: true,
  },
  booked: {
    type: Boolean,
    default: false, // Initially, slot is available
  },
}, { timestamps: true });

const Slot = mongoose.model('Slot', slotSchema);

export default Slot;