// frontend/src/components/ProviderCard.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ProviderCard({ provider, category, tier, distance, totalPrice }) {
  console.log({ category, tier, distance, totalPrice });
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token') !== null;

  const handleCheckAvailability = () => {
    if (isLoggedIn) {
      navigate(`/provider-booking/${provider._id}`, {
  state: {
    category,
    tier,
    distance,
    totalPrice
  }
});
    } else {
      navigate('/login');
    }
  };

  // Add this before the return in ProviderCard
  console.log('Provider data:', provider);
  console.log('Total price type:', typeof provider.totalPrice, provider.totalPrice);
  console.log('Availability:', provider.isAvailable);

return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center">
          <div className="avatar">
            <div className="w-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <span className="text-lg font-bold">{provider.name.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="card-title">{provider.name}</h3>
            <p className="text-sm text-base-content/60">Role: {provider.role}</p>
            <p className="text-sm text-base-content/60">Rating: {provider.rating}/5</p>
            <p className="mt-2">Completed Jobs: {provider.completedJobs}</p>
            {provider.distance && (
              <p className="mt-2">Distance: {(provider.distance / 1000).toFixed(2)} km</p>
            )}
            <p className="mt-2 font-semibold">Price: {JSON.stringify(provider.totalPrice)} BDT</p>
          </div>
        </div>
        <div className="card-actions justify-end mt-4">
          <button
            className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none px-6"
            onClick={handleCheckAvailability}
          >
            Check Availability
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProviderCard;