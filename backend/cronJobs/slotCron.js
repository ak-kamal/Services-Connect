// backend/cronJobs/slotCron.js
import cron from 'node-cron';
import Slot from '../models/Slot.js';
import UserModel from '../models/User.js';  // Use the UserModel to get all providers
import moment from 'moment';

// Schedule the task to run every day at midnight (BD Standard Time, UTC +6)
cron.schedule('0 0 * * *', async () => {
  console.log('Running cron job to update slots...');

  const today = moment().startOf('day').toDate();  // Get today's date (start of the day)
  const nextDay = moment().add(13, 'days').startOf('day').toDate();  // Get the 14th day from today (for future slots)

  try {
    // 1. Get all users with role other than 'customer' (i.e., providers)
    const providers = await UserModel.find({ role: { $ne: 'customer' } });

    // 2. Loop through each provider
    for (const provider of providers) {
      // 2.1. Delete the slots for the previous day for each provider
      await Slot.deleteMany({
        providerId: provider._id,
        date: { $lt: today },  // Delete slots that are before today
      });
      console.log(`Deleted slots for provider ${provider.name} on the previous day`);

      // 2.2. Create 3 new slots for the next (14th) day for each provider
      const slots = [
        { time: '8:00 AM - 12:00 PM' },
        { time: '12:00 PM - 4:00 PM' },
        { time: '4:00 PM - 8:00 PM' }
      ];

      // Create new slots for the provider for the 14th day
      for (const slot of slots) {
        await Slot.create({
          providerId: provider._id,
          date: nextDay,  // Set the date to the 14th day
          time: slot.time,
          booked: false,  // Initially, the slot is unbooked
        });
      }
      console.log(`Created 3 new slots for provider ${provider.name} on the 14th day`);
    }

    console.log('Cron job completed successfully');
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});