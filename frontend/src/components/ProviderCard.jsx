import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

function ProviderCard({ provider }) {
  const [isAvailable, setIsAvailable] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Check if the user is logged in by checking for a token in localStorage
  const isLoggedIn = localStorage.getItem('token') !== null;

  const handleCheckAvailability = () => {
    console.log(`Checking availability for ${provider.name}`);

    // If user is logged in, redirect to provider booking page
    if (isLoggedIn) {
      navigate(`/provider-booking/${provider._id}`);
    } else {
      // If user is not logged in, redirect to login page
      navigate('/login');
    }
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
            {isAvailable ? t('provider.checkAvailability') : t('provider.noSlots')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProviderCard;