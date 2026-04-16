// backend/models/Offer.js
import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  providerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // Reference to the provider (User model)
    required: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // Reference to the customer (User model)
    required: true 
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Paid'],  // Added 'Completed' and 'Paid' here
    default: 'Pending' 
  },
  category: { type: String },
tier: { type: String },
distance: { type: Number },
totalPrice: { type: Number },

// Rating
rating: { type: Number, min: 1, max: 5 },
review: { type: String },
}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;