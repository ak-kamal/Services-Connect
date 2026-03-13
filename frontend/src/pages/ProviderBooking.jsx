// frontend/src/pages/ProviderBooking.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';

function ProviderBooking() {
  const { providerId } = useParams();  // Get the providerId from the URL
  const [provider, setProvider] = useState(null);  // To store provider details
  const [slots, setSlots] = useState([]);
  const [dates, setDates] = useState([]); // Store the dates for the next 14 days
  const navigate = useNavigate();

  // Fetch provider details (profile, name, role) and slots for the next 14 days
  useEffect(() => {
    const fetchProviderAndSlots = async () => {
      try {
        // Fetch provider details
        const providerResponse = await fetch(`http://localhost:5000/api/providers/${providerId}`);
        const providerData = await providerResponse.json();

        if (providerData.success) {
          setProvider(providerData.provider);
        } else {
          console.error('Provider not found');
        }

        // Fetch available slots for the provider
        const slotsResponse = await fetch(`http://localhost:5000/api/slots?providerId=${providerId}`);
        const slotsData = await slotsResponse.json();

        if (slotsData.success) {
          setSlots(slotsData.availableSlots);
        } else {
          console.error('Failed to fetch slots');
        }

        // Extract unique dates from slots
        const uniqueDates = [...new Set(slotsData.availableSlots.map(slot => moment(slot.date).format('YYYY-MM-DD')))];
        setDates(uniqueDates);

      } catch (error) {
        console.error('Error fetching provider or slots:', error);
      }
    };

    fetchProviderAndSlots();
  }, [providerId]);

  // Handle slot booking
  const handleBookSlot = async (slotId, timeSlot, date) => {
    const customerId = localStorage.getItem('userId');  // Assuming userId is stored in localStorage

    // Validate that customerId exists before making the request
    if (!customerId) {
      toast.error('Please log in to book a slot');
      return;
    }

    const response = await fetch('http://localhost:5000/api/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId,
        customerId,
        timeSlot,
        date,  // Pass the correct date to the backend
      }),
    });

    const data = await response.json();
    if (data.success) {
      toast.success("Offer sent to the service provider");
      // Refresh slots after booking
      setSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot._id === slotId ? { ...slot, booked: true } : slot
        )
      );
    } else {
      toast.error('Failed to send offer');
    }
  };

  return (
    <div className="provider-booking">
      {provider && (
        <div className="provider-info">
          <div className="avatar">
            <img src={provider.profileIcon} alt="Provider" />
          </div>
          <h3>{provider.name}</h3>
          <p>{provider.role}</p>
        </div>
      )}

      <div className="slots-table">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="p-2">Time</th>
              {dates.map((date, index) => (
                <th key={index} className="p-2 text-center">{moment(date).format('DD MMM')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['8:00 AM - 12:00 PM', '12:00 PM - 4:00 PM', '4:00 PM - 8:00 PM'].map((timeSlot) => (
              <tr key={timeSlot}>
                <td className="p-2">{timeSlot}</td>
                {dates.map((date, index) => {
                  const slot = slots.find((s) => s.time === timeSlot && moment(s.date).format('YYYY-MM-DD') === date);
                  return (
                    <td key={index} className="p-2 text-center">
                      <button
                        className={`btn ${slot && slot.booked ? 'btn-warning' : 'btn-success'} btn-sm`}
                        disabled={slot && slot.booked}
                        onClick={() => handleBookSlot(slot?._id, timeSlot, date)}  // Pass the correct date
                      >
                        {slot && slot.booked ? 'Booked' : 'Available'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ToastContainer />
    </div>
  );
}

export default ProviderBooking;