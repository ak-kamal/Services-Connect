// frontend/src/pages/SearchProvider.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderCard from '../components/ProviderCard';
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'

function SearchProvider() {
  const [role, setRole] = useState('');
  const [category, setCategory] = useState('');
  const [tier, setTier] = useState('');
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [providers, setProviders] = useState([]);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [selectedTierData, setSelectedTierData] = useState(null);
  const navigate = useNavigate();

  const { t } = useLanguage()

  // Role, category, and tier data with descriptions
  const roles = [
    { value: 'electrician', label: t('common.electrician') },
    { value: 'plumber', label: t('common.plumber') },
    { value: 'carpenter', label: t('common.carpenter') },
    { value: 'housemaid', label: t('common.houseMaid') }
  ];
  
  const categories = {
    electrician: [
      { name: 'Installation', description: t('search.categoryDescriptions.electrician.Installation') },
      { name: 'Repair', description: t('search.categoryDescriptions.electrician.Repair') },
      { name: 'Inspection', description: t('search.categoryDescriptions.electrician.Inspection') }
    ],
    plumber: [
      { name: 'Installation', description: t('search.categoryDescriptions.plumber.Installation') },
      { name: 'Repair', description: t('search.categoryDescriptions.plumber.Repair') },
      { name: 'Cleaning', description: t('search.categoryDescriptions.plumber.Cleaning') }
    ],
    carpenter: [
      { name: 'Repair', description: t('search.categoryDescriptions.carpenter.Repair') },
      { name: 'Building', description: t('search.categoryDescriptions.carpenter.Building') },
      { name: 'Installation', description: t('search.categoryDescriptions.carpenter.Installation') }
    ],
    housemaid: [
      { name: 'Cleaning', description: t('search.categoryDescriptions.housemaid.Cleaning') },
      { name: 'Cooking', description: t('search.categoryDescriptions.housemaid.Cooking') },
      { name: 'Laundry', description: t('search.categoryDescriptions.housemaid.Laundry') }
    ],
  };
  
  const tiers = {
    // Electrician Categories
    'Installation': [
      { name: 'Basic', basePrice: 500, description: t('search.tierDescriptions.electrician.Installation.Basic') },
      { name: 'Standard', basePrice: 1000, description: t('search.tierDescriptions.electrician.Installation.Standard') },
      { name: 'Advanced', basePrice: 2000, description: t('search.tierDescriptions.electrician.Installation.Advanced') }
    ],
    'Repair': [
      { name: 'Basic', basePrice: 400, description: t('search.tierDescriptions.electrician.Repair.Basic') },
      { name: 'Standard', basePrice: 800, description: t('search.tierDescriptions.electrician.Repair.Standard') },
      { name: 'Advanced', basePrice: 1500, description: t('search.tierDescriptions.electrician.Repair.Advanced') }
    ],
    'Inspection': [
      { name: 'Basic', basePrice: 300, description: t('search.tierDescriptions.electrician.Inspection.Basic') },
      { name: 'Standard', basePrice: 600, description: t('search.tierDescriptions.electrician.Inspection.Standard') },
      { name: 'Advanced', basePrice: 1000, description: t('search.tierDescriptions.electrician.Inspection.Advanced') }
    ],
    
    // Plumber Categories
    'Cleaning': [
      { name: 'Basic', basePrice: 400, description: t('search.tierDescriptions.plumber.Cleaning.Basic') },
      { name: 'Standard', basePrice: 700, description: t('search.tierDescriptions.plumber.Cleaning.Standard') },
      { name: 'Advanced', basePrice: 1200, description: t('search.tierDescriptions.plumber.Cleaning.Advanced') }
    ],
    
    // Carpenter Categories
    'Building': [
      { name: 'Basic', basePrice: 800, description: t('search.tierDescriptions.carpenter.Building.Basic') },
      { name: 'Standard', basePrice: 1500, description: t('search.tierDescriptions.carpenter.Building.Standard') },
      { name: 'Advanced', basePrice: 3000, description: t('search.tierDescriptions.carpenter.Building.Advanced') }
    ],
    
    // Housemaid Categories
    'Cooking': [
      { name: 'Basic', basePrice: 300, description: t('search.tierDescriptions.housemaid.Cooking.Basic') },
      { name: 'Standard', basePrice: 600, description: t('search.tierDescriptions.housemaid.Cooking.Standard') },
      { name: 'Advanced', basePrice: 1000, description: t('search.tierDescriptions.housemaid.Cooking.Advanced') }
    ],
    'Laundry': [
      { name: 'Basic', basePrice: 200, description: t('search.tierDescriptions.housemaid.Laundry.Basic') },
      { name: 'Standard', basePrice: 400, description: t('search.tierDescriptions.housemaid.Laundry.Standard') },
      { name: 'Advanced', basePrice: 700, description: t('search.tierDescriptions.housemaid.Laundry.Advanced') }
    ],
  };

// Fetch providers based on the selected filters
  const fetchProviders = async () => {
  try {
    const selectedTier = tiers[category]?.find(t => t.name === tier);
    let url = `http://localhost:5000/api/providers?role=${role}&category=${category}&tier=${tier}&basePrice=${selectedTier.basePrice}`;

    
      const user = JSON.parse(localStorage.getItem("userData"));

      if (!user?.location?.lat) {
        alert(t('search.alerts.locationNotFound'));
        return;
      }

      const { lat, lng } = user.location;
      url += `&lat=${lat}&lng=${lng}&radius=5`;
    

    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {

      // Sort providers by recommendation score (already sorted in the backend)
      let sortedProviders = data.providers;


      // Filter providers by distance if nearbyOnly is true
      if (nearbyOnly) {
        const maxDistance = 5000; // 5km in meters

        sortedProviders = sortedProviders.filter(provider => 
            provider.distance !== null && provider.distance <= maxDistance
          );
        }

       // Sort providers by recommendation score (if not sorted already)
        sortedProviders.sort((a, b) => b.recommendationScore - a.recommendationScore);
     
        // Assign rank to each provider
        sortedProviders = sortedProviders.map((provider, index) => ({
          ...provider,
          rank: index + 1,  // Rank starts from 1
        }));

        setProviders(sortedProviders);

    } else {
      alert(t('search.alerts.fetchFailed'));
    }
  } catch (error) {
    alert(t('search.alerts.fetchError'));
  }
};

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setCategory(''); // Reset category
    setTier(''); // Reset tier
    setIsSubmitEnabled(false); // Disable submit button until all selections are made
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setTier(''); // Reset tier
    setIsSubmitEnabled(false); // Disable submit button until all selections are made
  };

  const handleTierChange = (e) => {
    setTier(e.target.value);
    const tierData = tiers[category]?.find(t => t.name === e.target.value);
    setSelectedTierData(tierData);
    setIsSubmitEnabled(true);
  };

  const handleSubmit = () => {
    fetchProviders();
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <LanguageToggle />
      </div>

  <div className="bg-base-100 shadow-xl rounded-2xl p-8 w-full max-w-md">
      <div className="mb-6 w-full max-w-md">
        <label htmlFor="role" className="block text-lg font-semibold mb-2">{t('search.selectRole')}</label>
        <select id="role" className="select select-bordered w-full" onChange={handleRoleChange} value={role}>
          <option value="">{t('search.selectRole')}</option>
          {roles.map((roleOption, index) => (
            <option key={index} value={roleOption.value}>
              {roleOption.label}
            </option>
          ))}
        </select>
      </div>

      {role && (
        <>
          <div className="mb-6 w-full max-w-md">
            <label htmlFor="category" className="block text-lg font-semibold mb-2">{t('search.selectCategory')}</label>
            <select id="category" className="select select-bordered w-full" onChange={handleCategoryChange} value={category}>
              <option value="">{t('search.selectCategory')}</option>
              {categories[role]?.map((categoryOption, index) => (
                <option key={index} value={categoryOption.name}>
                  {t(`categories.${categoryOption.name}`)} - {categoryOption.description}
                </option>
              ))}
            </select>
          </div>

          {category && (
            <>
              <div className="mb-6 w-full max-w-md">
                <label htmlFor="tier" className="block text-lg font-semibold mb-2">{t('search.selectTier')}</label>
                <select id="tier" className="select select-bordered w-full" onChange={handleTierChange} value={tier}>
                  <option value="">{t('search.selectTier')}</option>
                  {tiers[category]?.map((tierOption, index) => (
                    <option key={index} value={tierOption.name}>
                      {t(`tiers.${tierOption.name}`)} (BDT {tierOption.basePrice}) - {tierOption.description}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-sm text-base-content/60 mb-4">{t('search.additionalCharges')}</p>
            </>
          )}
        </>
      )}

    <div className="mb-6 w-full max-w-md">
    <label className="flex items-center gap-2 cursor-pointer">
        <input 
        type="checkbox" 
        className="toggle checked:bg-blue-500 checked:border-blue-500"
        checked={nearbyOnly}
        onChange={(e) => setNearbyOnly(e.target.checked)}
        />
        <span className="label-text">{t('search.nearbyOnly')}</span>
    </label>
    </div>

      {role && category && tier && (
        <button
          className={`btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none px-6 ${!isSubmitEnabled && 'btn-disabled'}`}
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
        >
          {t('search.findProviders')}
        </button>
      )}
      </div>

      {providers.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8 w-full">
          {providers.map((provider) => (
            <ProviderCard 
              key={provider._id} 
              provider={provider}
              category={category}
              tier={tier}
              distance={provider.distance}
              totalPrice={provider.totalPrice}
              recommendationScore={provider.recommendationScore} // Optional: Show score or rank
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchProvider;