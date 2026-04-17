import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, TrendingUp, ShieldCheck, Zap } from 'lucide-react'; // Add this import
import { useLanguage } from '../i18n/LanguageContext';

function ProviderCard({ provider, category, tier, distance, totalPrice, recommendationScore }) {
  console.log({ category, tier, distance, totalPrice });
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Check if the user is logged in by checking for a token in localStorage
  const isLoggedIn = localStorage.getItem('token') !== null;

  // badge mapping function
  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'expert':
        return { icon: Zap, color: 'text-yellow-500', label: 'Expert' };
      case 'trusted':
        return { icon: ShieldCheck, color: 'text-blue-500', label: 'Trusted' };
      case 'rising star':
        return { icon: TrendingUp, color: 'text-green-500', label: 'Rising Star' };
      case 'newbie':
        return { icon: Sprout, color: 'text-emerald-500', label: 'Newbie' };
      default:
        return { icon: Sprout, color: 'text-emerald-500', label: 'Newbie' };
    }
  };

  const badgeInfo = getBadgeIcon(provider.badge);
  const BadgeIcon = badgeInfo.icon;

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
    <div className="card bg-base-100 shadow-lg relative">
      <div className="card-body">
        {/* Rank Display: Top right corner */}
        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-lg font-bold">
          Rank: {provider.rank}
        </div>

        <div className="flex items-center">
          <div className="avatar">
            <div className="w-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <span className="text-lg font-bold">{provider.name.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div className="ml-4">
            {/* Updated name section with badge */}
            <div className="flex items-center gap-2">
  <h3 className="card-title">{provider.name}</h3>
  <div className="relative group">
    <BadgeIcon size={18} className={badgeInfo.color} />
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {badgeInfo.label}
    </span>
  </div>
</div>
            <p className="text-sm text-base-content/60">Role: {provider.role}</p>
            <p className="text-sm text-base-content/60">Rating: {provider.rating}/5</p>
            <p className="mt-2">Completed Jobs: {provider.completedJobs}</p>
            {provider.distance && (
              <p className="mt-2">Distance: {(provider.distance / 1000).toFixed(2)} km</p>
            )}
            <p className="mt-2 font-semibold">Price: {JSON.stringify(provider.totalPrice)} BDT</p>
            <p className="mt-2 text-lg font-semibold">Recommendation Score: {recommendationScore.toFixed(2)}</p>
          </div>
        </div>
        <div className="card-actions justify-end mt-4">
          <button
            className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none px-6"
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