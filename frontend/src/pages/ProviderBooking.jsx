import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';
import { useLanguage } from '../i18n/LanguageContext';

function ProviderBooking() {
  const { providerId } = useParams();
  const location = useLocation();
  const { category, tier, distance, totalPrice } = location.state || {};

  const [provider, setProvider] = useState(null);
  const [slots, setSlots] = useState([]);
  const [dates, setDates] = useState([]);
  const [slotOffers, setSlotOffers] = useState([]);

  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const providerRes = await fetch(`http://localhost:5000/api/providers/${providerId}`);
        const providerData = await providerRes.json();
        if (providerData.success) setProvider(providerData.provider);

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
        address: customerLocation.address,
        category,
  tier,
  distance,
  totalPrice
      }),
    });

    const data = await response.json();

    if (data.success) {
      toast.success("Offer sent");

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
            <th>{t('booking.time')}</th>
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
                        ? t('booking.booked')
                        : status === 'requested'
                        ? t('booking.requested')
                        : t('booking.available')}
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
