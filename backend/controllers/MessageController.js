import Message from '../models/Message.js';
import Offer from '../models/Offer.js';

// GET /api/messages/:offerId
// Returns full message history for an offer. Only the two participants can access it.
export const getMessages = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user._id.toString();

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const isParticipant =
      offer.customerId.toString() === userId ||
      offer.providerId.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await Message.find({ offerId }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
