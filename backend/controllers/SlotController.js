import Slot from '../models/Slot.js';
import moment from 'moment';

const createProviderSlots = async (providerId) => {
  const slots = [
    { time: '8:00 AM - 12:00 PM' },
    { time: '12:00 PM - 4:00 PM' },
    { time: '4:00 PM - 8:00 PM' }
  ];

  const currentDate = moment().startOf('day');

  for (let i = 0; i < 14; i++) {

    const date = currentDate.clone().add(i, 'days').toDate();
    console.log(date);

    for (const slot of slots) {
      await Slot.create({
        providerId,
        date,
        time: slot.time,
        booked: false,
      });
    }
  }

  console.log('Slots created for the next 14 days');
};

export default createProviderSlots;