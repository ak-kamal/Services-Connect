// backend/controllers/ProviderController.js (hypothetical controller)
import Slot from '../models/Slot.js';
import UserModel from '../models/User.js';

const createProviderSlots = async (providerId) => {
  const slots = [
    { time: '8:00 AM - 12:00 PM' },
    { time: '12:00 PM - 4:00 PM' },
    { time: '4:00 PM - 8:00 PM' }
  ];

  // Create slots for the provider
  for (const slot of slots) {
    await Slot.create({
      providerId,
      time: slot.time,
      booked: false, // Initially available
    });
  }
};

// Inside your provider creation logic, you can call this function to seed the slots:
const createProvider = async (req, res) => {
  const { name, role, profileIcon } = req.body;

  try {
    const newProvider = await UserModel.create({ name, role, profileIcon });
    
    // Create default slots for the new provider
    await createProviderSlots(newProvider._id);
    
    res.status(201).json({ success: true, message: 'Provider created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create provider', error });
  }
};