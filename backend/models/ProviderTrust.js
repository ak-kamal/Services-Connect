// models/ProviderTrust.js
import mongoose from 'mongoose';

const providerTrustSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming the provider is a User
    required: true,
    unique: true,
  },
  trustScore: {
    type: Number,
    default: 0, // Trust score starts at 0
    min: 0,
    max: 100,
  },
  reputation: {
    type: String,
    enum: ['New', 'Trusted', 'Highly Trusted'],
    default: 'New',
  },
  badges: [{
    type: String,
    enum: ['Top Provider', 'Fast Response', 'Highly Rated'],
  }],
  reviewsCount: {
    type: Number,
    default: 0,
  },
  ratingAverage: {
    type: Number,
    default: 0,
  },
});

const ProviderTrust = mongoose.model('ProviderTrust', providerTrustSchema);

export default ProviderTrust;