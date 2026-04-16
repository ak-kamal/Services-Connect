// controllers/ProviderTrustController.js
import mongoose from 'mongoose';
import ProviderTrust from '../models/ProviderTrust.js';

// Get the provider's trust information
export const getProviderTrust = async (req, res) => {
  try {
    const providerTrust = await ProviderTrust.findOne({ providerId: req.params.providerId });

    if (!providerTrust) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json(providerTrust);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update the provider's trust score
export const updateProviderTrust = async (req, res) => {
  try {
    console.log(1)
    const { trustScore, reputation, badges, reviewsCount, ratingAverage } = req.body;
    const providerId = req.params.providerId;

    let providerTrust = await ProviderTrust.findOne({ providerId });

    if (!providerTrust) {
      providerTrust = new ProviderTrust({
        providerId,
        trustScore,
        reputation,
        badges,
        reviewsCount,
        ratingAverage,
      });
    } else {
      // Update trust score, reputation, badges, etc.
      providerTrust.trustScore = trustScore;
      providerTrust.reputation = reputation;
      providerTrust.badges = badges;
      providerTrust.reviewsCount = reviewsCount;
      providerTrust.ratingAverage = ratingAverage;
    }

    await providerTrust.save();

    res.json({ message: 'Provider trust information updated', providerTrust });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Add a new rating and update the trust score accordingly
export const addReviewAndUpdateTrust = async (req, res) => {
  try {
    const { rating } = req.body;
    const { providerId } = req.params; // Fetch providerId from URL parameters

    // Ensure providerId is being cast to ObjectID

    const objectIdProviderId = new mongoose.Types.ObjectId(providerId);

    // Fetch the provider's trust data by using the ObjectId for providerId
    const providerTrust = await ProviderTrust.findOne({ providerId: objectIdProviderId });

    if (!providerTrust) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Update review count and recalculate the average rating
    providerTrust.reviewsCount += 1;
    providerTrust.ratingAverage = ((providerTrust.ratingAverage * (providerTrust.reviewsCount - 1)) + rating) / providerTrust.reviewsCount;

    // Recalculate trust score based on the rating
    const newTrustScore = Math.min(100, providerTrust.ratingAverage * 10);
    providerTrust.trustScore = newTrustScore;

    // Update the reputation based on the trust score
    if (providerTrust.trustScore >= 80) {
      providerTrust.reputation = 'Highly Trusted';
    } else if (providerTrust.trustScore >= 50) {
      providerTrust.reputation = 'Trusted';
    } else {
      providerTrust.reputation = 'New';
    }

    // Add badges based on reviews
    if (providerTrust.reviewsCount >= 50) {
      providerTrust.badges.push('Top Provider');
    }
    if (providerTrust.ratingAverage >= 4.5) {
      providerTrust.badges.push('Highly Rated');
    }

    await providerTrust.save();

    res.json({ message: 'Review added and trust score updated', providerTrust });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};