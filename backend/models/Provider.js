import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['electrician', 'plumber', 'carpenter', 'house maid'] },
  profileIcon: { type: String },
  available: { type: Boolean, default: true },
});

const Provider = mongoose.model('Provider', providerSchema);

export default Provider;