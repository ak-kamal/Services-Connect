import UserModel from '../models/User.js';

const calculateTrustScore = async (provider) => {
  if (!provider) {
    throw new Error('Provider not found');
  }

  const {
    rating,
    completedJobs,
    complaints,
    certification,
    totalEarnings,
  } = provider;

  const topEarner = await UserModel.findOne()
  .sort({ totalEarnings: -1 })
  .select('totalEarnings');

  const maxEarnings = topEarner?.totalEarnings || 0;

  const topCompleter = await UserModel.findOne()
  .sort({ completedJobs: -1 })
  .select('completedJobs');

  const maxCompletedJobs = topCompleter?.completedJobs || 0;

  const score =
    (rating * 6) +               // scaled to 30
    (completedJobs / maxCompletedJobs * 25) +
    (totalEarnings / maxEarnings * 15) -
    (complaints * 10) +
    (certification.verified ? 20 : 0);

  const finalScore = Math.max(0, Math.min(100, score));

  if (finalScore >= 80) {
    provider.badge = "expert";
  } else if (finalScore >= 60) {
    provider.badge = "trusted";
  } else if (finalScore >= 40) {
    provider.badge = "rising star";
  } else {
    provider.badge = "newbie";
  }

  await provider.save();
};

export default calculateTrustScore;