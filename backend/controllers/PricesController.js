import UserModel from "../models/User.js"; // Import the User model to query the database

// Fetch the maximum completed jobs and pending offers from the database
export const getMaxJobData = async () => {
  try {
    const maxCompletedJobs = await UserModel.aggregate([
      { $group: { _id: null, maxCompletedJobs: { $max: "$completedJobs" } } }
    ]);
    const maxPendingOffers = await UserModel.aggregate([
      { $group: { _id: null, maxPendingOffers: { $max: "$pendingOffers" } } }
    ]);

    return {
      maxCompletedJobs: maxCompletedJobs[0]?.maxCompletedJobs || 0,
      maxPendingOffers: maxPendingOffers[0]?.maxPendingOffers || 0
    };
  } catch (error) {
    console.error("Error fetching max job data:", error);
    return { maxCompletedJobs: 0, maxPendingOffers: 0 }; // Return default values in case of error
  }
};

// Fetch the base price for the given role, category, and tier
export const getBasePrice = (role, category, tier) => {
  const basePrices = {
    electrician: {
      installation: { basic: 300, standard: 600, advanced: 1200 },
      repair: { basic: 300, standard: 700, advanced: 1500 },
      inspection: { basic: 200, standard: 400, advanced: 800 }
    },
    plumber: {
      installation: { basic: 300, standard: 700, advanced: 1500 },
      repair: { basic: 300, standard: 800, advanced: 1600 },
      cleaning: { basic: 250, standard: 600, advanced: 1200 }
    },
    carpenter: {
      repair: { basic: 400, standard: 900, advanced: 1800 },
      building: { basic: 800, standard: 2000, advanced: 4000 },
      installation: { basic: 400, standard: 1000, advanced: 2000 }
    },
    housemaid: {
      cleaning: { basic: 300, standard: 600, advanced: 1200 },
      cooking: { basic: 400, standard: 800, advanced: 1500 },
      laundry: { basic: 200, standard: 500, advanced: 900 }
    }
  };

  return basePrices[role]?.[category]?.[tier] || 0; // Return base price for the given role, category, tier
};

// Calculate the total price based on role, category, and tier, including adjustments
export const calculateProviderPrice = async (provider, basePrice) => {
  // Fetch max completed jobs and max pending offers from the database
  const { maxCompletedJobs, maxPendingOffers } = await getMaxJobData();

  const BasePrice = Number(basePrice);
  console.log('base price:', BasePrice, typeof BasePrice);
  // Adjust price based on provider's performance
  const ratingAdjustment = (provider.rating / 5) * 50;
  
  // Declare variables outside the if/else blocks
  let jobsAdjustment;
  let pendingAdjustment;
  
  // Adjust based on max completed jobs
  if (maxCompletedJobs == 0) {
    jobsAdjustment = 0;
  } else {
    jobsAdjustment = (provider.completedJobs / maxCompletedJobs) * 100;
  }
  
  // Adjust based on max pending offers
  if (maxPendingOffers == 0) {
    pendingAdjustment = 0;
  } else {
    pendingAdjustment = (provider.pendingOffers / maxPendingOffers) * 100;
  }
  const distanceAdjustment = provider.distance * 0.02;
  // Calculate the final total price (use let since you're modifying it)
  let totalPrice = BasePrice + ratingAdjustment + pendingAdjustment + distanceAdjustment;
  console.log(1, totalPrice);
  if (provider.completedJobs > 20) {
    totalPrice = totalPrice + jobsAdjustment;
  } else {
    totalPrice = totalPrice - jobsAdjustment;
  }
  return Number(totalPrice.toFixed(2));
};