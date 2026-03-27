import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';

function ProviderBooking() {
  const { providerId } = useParams();

  const [provider, setProvider] = useState(null);
  const [slots, setSlots] = useState([]);
  const [dates, setDates] = useState([]);

  // NEW STATE
  const [slotOffers, setSlotOffers] = useState([]);

  // ---------------- FETCH ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Provider
        const providerRes = await fetch(`http://localhost:5000/api/providers/${providerId}`);
        const providerData = await providerRes.json();
        if (providerData.success) setProvider(providerData.provider);

        // Slots
        const slotsRes = await fetch(`http://localhost:5000/api/slots?providerId=${providerId}`);
        const slotsData = await slotsRes.json();
        if (slotsData.success) {
          setSlots(slotsData.availableSlots);

          const uniqueDates = [
            ...new Set(
              slotsData.availableSlots.map(slot =>
                moment(slot.date).format('YYYY-MM-DD')
              )
            ),
          ];
          setDates(uniqueDates);
        }

        // Fetch slot offers
        const offersRes = await fetch(
          `http://localhost:5000/api/provider-slot-offers?providerId=${providerId}`
        );
        const offersData = await offersRes.json();

        if (offersData.success) {
          setSlotOffers(offersData.offers);
        }

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [providerId]);

  // ---------------- HELPER ----------------
  const getSlotStatus = (timeSlot, date) => {
    const matchedOffer = slotOffers.find(
      (offer) =>
        offer.timeSlot === timeSlot &&
        moment(offer.date).format('YYYY-MM-DD') === date
    );

    if (matchedOffer) {
      if (matchedOffer.status === 'Accepted') return 'booked';
      if (matchedOffer.status === 'Pending') return 'requested';
    }

    return 'available';
  };

  // ---------------- BOOK ----------------
  const handleBookSlot = async (slotId, timeSlot, date) => {
    const customerId = localStorage.getItem('userId');
    const customerLocation = JSON.parse(localStorage.getItem('location'));

    if (!customerId) {
      toast.error('Please log in to book a slot');
      return;
    }

    const formattedDate = moment(date).startOf('day').toISOString();

    const response = await fetch('http://localhost:5000/api/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId,
        customerId,
        timeSlot,
        date: formattedDate,
        address: customerLocation.address
      }),
    });

    const data = await response.json();

    if (data.success) {
      toast.success("Offer sent");

      // refresh slot offers
      const offersRes = await fetch(
        `http://localhost:5000/api/provider-slot-offers?providerId=${providerId}`
      );
      const offersData = await offersRes.json();

      if (offersData.success) {
        setSlotOffers(offersData.offers);
      }

    } else {
      toast.error('Failed to send offer');
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="provider-booking">
      {provider && (
        <div>
          <h3>{provider.name}</h3>
          <p>{provider.role}</p>
        </div>
      )}

      <table className="table-auto w-full">
        <thead>
          <tr>
            <th>Time</th>
            {dates.map((date, i) => (
              <th key={i}>{moment(date).format('DD MMM')}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {['8:00 AM - 12:00 PM', '12:00 PM - 4:00 PM', '4:00 PM - 8:00 PM'].map((timeSlot) => (
            <tr key={timeSlot}>
              <td>{timeSlot}</td>

              {dates.map((date, i) => {
                const status = getSlotStatus(timeSlot, date);

                return (
                  <td key={i}>
                    <button
                      className={`btn btn-sm ${
                        status === 'booked'
                          ? 'btn-warning'
                          : status === 'requested'
                          ? 'btn-info'
                          : 'btn-success'
                      }`}
                      disabled={status !== 'available'}
                      onClick={() => handleBookSlot(null, timeSlot, date)}
                    >
                      {status === 'booked'
                        ? 'Booked'
                        : status === 'requested'
                        ? 'Requested'
                        : 'Available'}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <ToastContainer />
    </div>
  );
}

export default ProviderBooking;