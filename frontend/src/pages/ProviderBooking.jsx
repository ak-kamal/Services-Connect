import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const TIME_SLOTS = ['8:00 AM - 12:00 PM', '12:00 PM - 4:00 PM', '4:00 PM - 8:00 PM'];

function ProviderBooking() {
  const { t } = useLanguage();
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [dates, setDates] = useState([]);
  const [slotOffers, setSlotOffers] = useState([]);

  // Recurring modal state
  const [recurringModal, setRecurringModal] = useState(null); // { date, timeSlot } | null
  const [frequency, setFrequency] = useState('weekly');
  const [occurrences, setOccurrences] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  // ---------------- FETCH ----------------
  const fetchAllData = async () => {
    try {
      const [providerRes, slotsRes, offersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/providers/${providerId}`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/api/slots?providerId=${providerId}`).then((r) => r.json()),
        fetch(`${API_BASE_URL}/api/provider-slot-offers?providerId=${providerId}`).then((r) => r.json()),
      ]);

      if (providerRes.success) setProvider(providerRes.provider);

      if (slotsRes.success) {
        const uniqueDates = [
          ...new Set(
            slotsRes.availableSlots.map((slot) => moment(slot.date).format('YYYY-MM-DD'))
          ),
        ].sort();
        setDates(uniqueDates);
      }

      if (offersRes.success) setSlotOffers(offersRes.offers);
    } catch (error) {
      console.error(error);
      toast.error(t('common.serverError'));
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ---------------- BOOK (SINGLE) ----------------
  const handleBookSlot = async (timeSlot, date) => {
    const customerId = localStorage.getItem('userId');
    const location = JSON.parse(localStorage.getItem('location') || 'null');

    if (!customerId) {
      toast.error(t('booking.loginFirst'));
      return;
    }
    if (!location?.address) {
      toast.error(t('booking.missingAddress'));
      return;
    }

    const formattedDate = moment(date).startOf('day').toISOString();

    try {
      const response = await fetch(`${API_BASE_URL}/api/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          customerId,
          timeSlot,
          date: formattedDate,
          address: location.address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('booking.requestSent'));
        fetchAllData();
      } else {
        toast.error(data.message || t('booking.requestFailed'));
      }
    } catch {
      toast.error(t('common.serverError'));
    }
  };

  // ---------------- BOOK (RECURRING) ----------------
  const handleBookRecurring = async () => {
    if (!recurringModal) return;

    const customerId = localStorage.getItem('userId');
    const location = JSON.parse(localStorage.getItem('location') || 'null');

    if (!customerId || !location?.address) {
      toast.error(t('booking.loginFirst'));
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/recurring-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          customerId,
          timeSlot: recurringModal.timeSlot,
          startDate: moment(recurringModal.date).startOf('day').toISOString(),
          frequency,
          occurrences,
          address: location.address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.created.length === 0) {
          toast.warn(t('booking.noneCreated'));
        } else if (data.skipped.length === 0) {
          toast.success(t('booking.allCreated', { count: data.created.length }));
        } else {
          toast.success(
            t('booking.someSkipped', { created: data.created.length, skipped: data.skipped.length })
          );
        }
        setRecurringModal(null);
        fetchAllData();
      } else {
        toast.error(data.message || t('booking.requestFailed'));
      }
    } catch {
      toast.error(t('common.serverError'));
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-md px-6">
        <div className="flex-1">
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            ← {t('common.back')}
          </button>
        </div>
        <LanguageToggle />
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {provider && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{provider.name}</h1>
            <p className="capitalize text-base-content/70">{provider.role}</p>
          </div>
        )}

        <div className="mb-4 flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-green-500 rounded" /> {t('booking.legendAvailable')}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-blue-400 rounded" /> {t('booking.legendRequested')}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-yellow-400 rounded" /> {t('booking.legendBooked')}
          </span>
          <span className="ml-auto text-base-content/60">
            {t('booking.recurringTip')}
          </span>
        </div>

        <div className="overflow-x-auto bg-base-100 shadow rounded-lg">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className="bg-base-200">{t('common.time')}</th>
                {dates.map((date) => (
                  <th key={date} className="bg-base-200 text-center">
                    {moment(date).format('DD MMM')}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {TIME_SLOTS.map((timeSlot) => (
                <tr key={timeSlot}>
                  <td className="font-semibold whitespace-nowrap">{timeSlot}</td>

                  {dates.map((date) => {
                    const status = getSlotStatus(timeSlot, date);
                    const btnClass =
                      status === 'booked'
                        ? 'btn-warning'
                        : status === 'requested'
                        ? 'btn-info'
                        : 'btn-success';
                    const label =
                      status === 'booked' ? t('booking.booked') : status === 'requested' ? t('booking.requested') : t('booking.available');

                    return (
                      <td key={date} className="text-center">
                        <button
                          className={`btn btn-xs ${btnClass} text-white`}
                          disabled={status !== 'available'}
                          onClick={() => handleBookSlot(timeSlot, date)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (status === 'available') {
                              setRecurringModal({ date, timeSlot });
                            }
                          }}
                        >
                          {label}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recurring booking modal */}
      {recurringModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-2">{t('booking.recurringTitle')}</h3>

            <p className="text-sm mb-4 opacity-70">
              {t('booking.startFrom')} <strong>{moment(recurringModal.date).format('DD MMM YYYY')}</strong> {t('booking.at')}{' '}
              <strong>{recurringModal.timeSlot}</strong>
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
                <option value="weekly">{t('booking.frequencyWeekly')}</option>
                <option value="biweekly">{t('booking.frequencyBiweekly')}</option>
                <option value="monthly">{t('booking.frequencyMonthly')}</option>
              </select>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">{t('booking.occurrences')}</span>
              </label>
              <input
                type="number"
                min={1}
                max={12}
                className="input input-bordered"
                value={occurrences}
                onChange={(e) => setOccurrences(parseInt(e.target.value, 10) || 1)}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  {t('booking.skipNote')}
                </span>
              </label>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setRecurringModal(null)}
                disabled={submitting}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBookRecurring}
                disabled={submitting}
              >
                {submitting ? t('booking.booking') : t('booking.book')}
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
