import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';
import { useLanguage } from '../i18n/LanguageContext';

const TIME_SLOTS = ['8:00 AM - 12:00 PM', '12:00 PM - 4:00 PM', '4:00 PM - 8:00 PM'];

function ProviderBooking() {
  const { providerId } = useParams();
  const location = useLocation();
  const { category, tier, distance, totalPrice } = location.state || {};

  const [provider, setProvider] = useState(null);
  const [slots, setSlots] = useState([]);
  const [dates, setDates] = useState([]);
  const [slotOffers, setSlotOffers] = useState([]);

  const { t } = useLanguage();
  // Recurring modal state
  const [recurringModal, setRecurringModal] = useState(null); // { timeSlot, date }
  const [frequency, setFrequency] = useState('weekly');
  const [occurrences, setOccurrences] = useState(4);

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
            ...new Set(slotsData.availableSlots.map(s => moment(s.date).format('YYYY-MM-DD'))),
          ];
          setDates(uniqueDates);
        }

        const offersRes = await fetch(
          `http://localhost:5000/api/provider-slot-offers?providerId=${providerId}`
        );
        const offersData = await offersRes.json();
        if (offersData.success) setSlotOffers(offersData.offers);
      } catch (error) {
        console.error(error);
        toast.error(t('booking.fetchError'));
      }
    };

    fetchData();
  }, [providerId, t]);

  const refreshOffers = async () => {
    const res = await fetch(`http://localhost:5000/api/provider-slot-offers?providerId=${providerId}`);
    const data = await res.json();
    if (data.success) setSlotOffers(data.offers);
  };

  const getSlotStatus = (timeSlot, date) => {
    const matched = slotOffers.find(
      (o) => o.timeSlot === timeSlot && moment(o.date).format('YYYY-MM-DD') === date
    );
    if (matched) {
      if (matched.status === 'Accepted') return 'booked';
      if (matched.status === 'Pending') return 'requested';
    }
    return 'available';
  };

  const handleBookSlot = async (timeSlot, date) => {
    const customerId = localStorage.getItem('userId');
    const userData = JSON.parse(localStorage.getItem('userData'));
    const customerLocation = userData?.location;
    
    if (!customerId) { 
      toast.error(t('booking.loginRequired')); 
      return; 
    }
    
    if (!customerLocation?.address) {
      toast.error(t('booking.locationRequired'));
      return;
    }

    // Check if all required pricing info is available
    if (!category || !tier || !totalPrice) {
      toast.error(t('booking.missingPricingInfo'));
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          customerId,
          timeSlot,
          date: moment(date).startOf('day').toISOString(),
          address: customerLocation.address,
          category,
          tier,
          distance,
          totalPrice
        }),
      });
      
      const data = await res.json();
      if (data.success) { 
        toast.success(t('booking.offerSent')); 
        await refreshOffers(); 
      } else {
        toast.error(data.message || t('booking.offerFailed'));
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(t('booking.networkError'));
    }
  };

  const handleBookRecurring = async () => {
    const customerId = localStorage.getItem('userId');
    const userData = JSON.parse(localStorage.getItem('userData'));
    const customerLocation = userData?.location;
    
    if (!customerId) { 
      toast.error(t('booking.loginRequired')); 
      return; 
    }
    
    if (!customerLocation?.address) {
      toast.error(t('booking.locationRequired'));
      return;
    }

    // Check if all required pricing info is available
    if (!category || !tier || !totalPrice) {
      toast.error(t('booking.missingPricingInfo'));
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/recurring-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          customerId,
          timeSlot: recurringModal.timeSlot,
          startDate: moment(recurringModal.date).startOf('day').toISOString(),
          frequency,
          occurrences: Math.min(Math.max(parseInt(occurrences, 10), 1), 12),
          address: customerLocation.address,
          category,
          tier,
          distance,
          totalPrice
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(t('booking.recurringSuccess', { created: data.created?.length || 0, skipped: data.skipped?.length || 0 }));
        setRecurringModal(null);
        await refreshOffers();
      } else {
        toast.error(data.message || t('booking.recurringFailed'));
      }
    } catch (error) {
      console.error('Recurring booking error:', error);
      toast.error(t('booking.networkError'));
    }
  };

  return (
    <div className="provider-booking p-6">
      {provider && (
        <div className="mb-4">
          <h3 className="text-2xl font-bold">{provider.name}</h3>
          <p className="capitalize text-gray-500">{provider.role}</p>
        </div>
      )}

      {(!category || !tier || !totalPrice) && (
        <div className="alert alert-warning mb-4">
          <span>{t('booking.missingPricingWarning')}</span>
        </div>
      )}

      <p className="text-sm text-gray-400 mb-3">{t('booking.rightClickHint')}</p>

      <div className="overflow-x-auto">
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
            {TIME_SLOTS.map((timeSlot) => (
              <tr key={timeSlot}>
                <td className="font-medium">{timeSlot}</td>
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
                        onClick={() => handleBookSlot(timeSlot, date)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (status === 'available') {
                            setFrequency('weekly');
                            setOccurrences(4);
                            setRecurringModal({ timeSlot, date });
                          }
                        }}
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
      </div>

      {/* Recurring Booking Modal */}
      {recurringModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">{t('booking.recurringModalTitle')}</h3>

            <p className="mb-3 text-sm text-gray-600">
              {t('booking.startingDate')}: <strong>{moment(recurringModal.date).format('DD MMM YYYY')}</strong> &mdash; {recurringModal.timeSlot}
            </p>

            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">{t('booking.frequency')}</span>
              </label>
              <select
                className="select select-bordered"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="weekly">{t('booking.weekly')}</option>
                <option value="biweekly">{t('booking.biweekly')}</option>
                <option value="monthly">{t('booking.monthly')}</option>
              </select>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('booking.occurrences')} (1–12)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                min={1}
                max={12}
                value={occurrences}
                onChange={(e) => setOccurrences(e.target.value)}
              />
            </div>

            <div className="modal-action">
              <button className="btn btn-success" onClick={handleBookRecurring}>
                {t('booking.confirm')}
              </button>
              <button className="btn" onClick={() => setRecurringModal(null)}>
                {t('booking.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default ProviderBooking;