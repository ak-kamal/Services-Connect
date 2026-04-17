// backend/routes/ProviderStatsRoutes.js

import express from 'express';
import mongoose from 'mongoose';
import Offer from '../models/Offer.js';

const router = express.Router();

// Endpoint: Total Earnings and Jobs Completed (using providerEarnings after commission)
router.get('/analytics/:providerId', async (req, res) => {
  const providerId = req.params.providerId;
  console.log(providerId);

  try {
    const analyticsData = await Offer.aggregate([
      { 
        $match: { 
          providerId: new mongoose.Types.ObjectId(providerId),
          status: { $in: ['Paid'] }
        }
      },
      { 
        $group: { 
          _id: "$providerId", 
          totalEarnings: { $sum: "$providerEarnings" }, // Changed from totalPrice to providerEarnings
          totalJobs: { $sum: 1 }
        }
      }
    ]);

    res.json(analyticsData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

// Endpoint: Rating Progression (each job with provider's current average rating)
router.get('/rating-progression/:providerId', async (req, res) => {
  const providerId = req.params.providerId;

  try {
    // Get all paid/completed jobs with their currentRatingOfProvider, sorted by date
    const ratingProgression = await Offer.aggregate([
      { 
        $match: { 
          providerId: new mongoose.Types.ObjectId(providerId),
          status: { $in: ['Paid', 'Completed'] }
        }
      },
      { 
        $sort: { date: 1 } // Sort by date ascending (oldest first)
      },
      { 
        $project: {
          currentRatingOfProvider: 1,
          date: 1,
          _id: 1,
          category: 1,
          providerEarnings: 1 // Changed from totalPrice to providerEarnings
        }
      }
    ]);

    // Add sequential job numbers and format the response
    const result = ratingProgression.map((job, index) => ({
      jobNumber: index + 1,
      rating: job.currentRatingOfProvider,
      date: job.date,
      offerId: job._id,
      category: job.category,
      providerEarnings: job.providerEarnings // Changed from totalPrice to providerEarnings
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching rating progression data' });
  }
});

// Endpoint: Average Distance Traveled
router.get('/average-distance/:providerId', async (req, res) => {
  const providerId = req.params.providerId;

  try {
    const avgDistance = await Offer.aggregate([
      { 
        $match: { 
          providerId: new mongoose.Types.ObjectId(providerId), 
          status: { $in: ['Paid', 'Completed'] }
        }
      },
      { 
        $group: { 
          _id: "$providerId", 
          averageDistance: { $avg: "$distance" } 
        }
      }
    ]);

    res.json(avgDistance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching average distance data' });
  }
});

// Endpoint: Earnings Trend Over Time (by Month) - Using providerEarnings
router.get('/earnings-trend/:providerId', async (req, res) => {
  const providerId = req.params.providerId;

  try {
    const earningsTrend = await Offer.aggregate([
      { 
        $match: { 
          providerId: new mongoose.Types.ObjectId(providerId), 
          status: { $in: ["Paid"] }
        }
      },
      { 
        $project: { 
          providerEarnings: 1, // Changed from totalPrice to providerEarnings
          month: { $month: "$date" },
          year: { $year: "$date" }
        }
      },
      { 
        $group: { 
          _id: { year: "$year", month: "$month" }, 
          totalEarnings: { $sum: "$providerEarnings" } // Changed from totalPrice to providerEarnings
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json(earningsTrend);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching earnings trend data' });
  }
});

// Endpoint: Category-wise Average Rating
router.get('/category-avg-rating/:providerId', async (req, res) => {
  const providerId = req.params.providerId;

  try {
    const categoryAvgRating = await Offer.aggregate([
      { 
        $match: { 
          providerId: new mongoose.Types.ObjectId(providerId), 
          status: { $in: ['Paid', 'Completed'] },
          rating: { $gte: 1 } // Only include rated jobs
        }
      },
      { 
        $group: { 
          _id: "$category", 
          averageRating: { $avg: "$rating" }
        }
      },
      { $sort: { "_id": 1 } } // Sort alphabetically by category name
    ]);

    res.json(categoryAvgRating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching category average rating data' });
  }
});

// Endpoint: Job Category Breakdown (Bar Chart)
router.get('/category-breakdown/:providerId', async (req, res) => {
  const providerId = req.params.providerId;

  try {
    const categoryBreakdown = await Offer.aggregate([
      { 
        $match: { 
          providerId: new mongoose.Types.ObjectId(providerId), 
          status: { $in: ['Paid', 'Completed'] }
        }
      },
      { 
        $group: { 
          _id: "$category", 
          jobsCompleted: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } } // Sort alphabetically by category name
    ]);

    res.json(categoryBreakdown);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching category breakdown data' });
  }
});

export default router;