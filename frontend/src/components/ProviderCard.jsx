// frontend/src/components/ProviderCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

function ProviderCard({ provider }) {
  const [isAvailable, setIsAvailable] = useState(true);

  const handleCheckAvailability = () => {
    console.log(`Checking availability for ${provider.name}`);
    // You can implement navigation to provider profile here
  };

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
            <p className="text-sm text-base-content/60">{provider.role}</p>
          </div>
        </div>
        <div className="card-actions justify-end mt-4">
          <button
            className={`btn btn-sm ${isAvailable ? 'btn-outline btn-primary' : 'btn-disabled'}`}
            onClick={handleCheckAvailability}
          >
            {isAvailable ? 'Check Availability' : 'No slots available'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProviderCard;