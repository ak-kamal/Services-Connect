// frontend/src/pages/SearchProvider.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderCard from '../components/ProviderCard';

function SearchProvider() {
  const [role, setRole] = useState('');
  const [category, setCategory] = useState('');
  const [tier, setTier] = useState('');
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [providers, setProviders] = useState([]);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [selectedTierData, setSelectedTierData] = useState(null);
  const navigate = useNavigate();

  // Role, category, and tier data with descriptions
  const roles = [
  { value: 'electrician', label: 'Electrician' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'carpenter', label: 'Carpenter' },
  { value: 'housemaid', label: 'House maid' }
];
  
  const categories = {
    electrician: [
      { name: 'Installation', description: 'Setup of new electrical fixtures and wiring' },
      { name: 'Repair', description: 'Fix faulty wiring, outlets, and electrical issues' },
      { name: 'Inspection', description: 'Safety check and diagnostics of electrical systems' }
    ],
    plumber: [
      { name: 'Installation', description: 'Setup of pipes, fixtures, and water systems' },
      { name: 'Repair', description: 'Fix leaks, clogs, and damaged plumbing' },
      { name: 'Cleaning', description: 'Drain cleaning and pipe maintenance' }
    ],
    carpenter: [
      { name: 'Repair', description: 'Fix broken furniture, doors, and wooden structures' },
      { name: 'Building', description: 'Custom furniture and wooden structure construction' },
      { name: 'Installation', description: 'Install cabinets, shelves, and wooden fixtures' }
    ],
    housemaid: [
      { name: 'Cleaning', description: 'General house cleaning and tidying' },
      { name: 'Cooking', description: 'Meal preparation and kitchen duties' },
      { name: 'Laundry', description: 'Washing, drying, and folding clothes' }
    ],
  };
  
  const tiers = {
    // Electrician Categories
    'Installation': [
      { name: 'Basic', basePrice: 500, description: 'Single fixture/outlet installation' },
      { name: 'Standard', basePrice: 1000, description: 'Multiple fixtures with basic wiring' },
      { name: 'Advanced', basePrice: 2000, description: 'Complex installation with circuit setup' }
    ],
    'Repair': [
      { name: 'Basic', basePrice: 400, description: 'Minor fixes like switch/outlet replacement' },
      { name: 'Standard', basePrice: 800, description: 'Circuit troubleshooting and wire repair' },
      { name: 'Advanced', basePrice: 1500, description: 'Major electrical system repairs' }
    ],
    'Inspection': [
      { name: 'Basic', basePrice: 300, description: 'Visual inspection of visible wiring' },
      { name: 'Standard', basePrice: 600, description: 'Detailed inspection with basic testing' },
      { name: 'Advanced', basePrice: 1000, description: 'Full system diagnostics with report' }
    ],
    
    // Plumber Categories
    'Cleaning': [
      { name: 'Basic', basePrice: 400, description: 'Single drain or fixture cleaning' },
      { name: 'Standard', basePrice: 700, description: 'Multiple drains with basic tools' },
      { name: 'Advanced', basePrice: 1200, description: 'Deep cleaning with specialized equipment' }
    ],
    
    // Carpenter Categories
    'Building': [
      { name: 'Basic', basePrice: 800, description: 'Simple furniture assembly' },
      { name: 'Standard', basePrice: 1500, description: 'Custom furniture construction' },
      { name: 'Advanced', basePrice: 3000, description: 'Complex woodworking projects' }
    ],
    
    // Housemaid Categories
    'Cooking': [
      { name: 'Basic', basePrice: 300, description: 'Simple meal preparation (1-2 dishes)' },
      { name: 'Standard', basePrice: 600, description: 'Full meal with multiple dishes' },
      { name: 'Advanced', basePrice: 1000, description: 'Gourmet cooking with meal planning' }
    ],
    'Laundry': [
      { name: 'Basic', basePrice: 200, description: 'Machine wash and dry (up to 5kg)' },
      { name: 'Standard', basePrice: 400, description: 'Wash, dry, and fold (up to 10kg)' },
      { name: 'Advanced', basePrice: 700, description: 'Full service with ironing and sorting' }
    ],
  };

// Fetch providers based on the selected filters
  const fetchProviders = async () => {
  try {
    const selectedTier = tiers[category]?.find(t => t.name === tier);
    let url = `http://localhost:5000/api/providers?role=${role}&category=${category}&tier=${tier}&basePrice=${selectedTier.basePrice}`;

    
      const user = JSON.parse(localStorage.getItem("userData"));

      if (!user?.location?.lat) {
        alert("Location not found. Please re-login.");
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
      alert("Failed to fetch providers");
    }
  } catch (error) {
    alert("Error fetching providers");
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

  <div className="bg-base-100 shadow-xl rounded-2xl p-8 w-full max-w-md">
      <div className="mb-6 w-full max-w-md">
        <label htmlFor="role" className="block text-lg font-semibold mb-2">Select Role</label>
        <select id="role" className="select select-bordered w-full" onChange={handleRoleChange} value={role}>
          <option value="">Select Role</option>
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
            <label htmlFor="category" className="block text-lg font-semibold mb-2">Select Category</label>
            <select id="category" className="select select-bordered w-full" onChange={handleCategoryChange} value={category}>
              <option value="">Select Category</option>
              {categories[role].map((categoryOption, index) => (
                <option key={index} value={categoryOption.name}>
                  {categoryOption.name} - {categoryOption.description}
                </option>
              ))}
            </select>
          </div>

          {category && (
            <>
              <div className="mb-6 w-full max-w-md">
                <label htmlFor="tier" className="block text-lg font-semibold mb-2">Select Tier</label>
                <select id="tier" className="select select-bordered w-full" onChange={handleTierChange} value={tier}>
                  <option value="">Select Tier</option>
                  {tiers[category]?.map((tierOption, index) => (
                    <option key={index} value={tierOption.name}>
                      {tierOption.name} (BDT {tierOption.basePrice}) - {tierOption.description}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-sm text-base-content/60 mb-4">*Additional charges will apply based on provider's skills and distance from you.</p>
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
        <span className="label-text">Show nearby providers only (within 5km)</span>
    </label>
    </div>

      {role && category && tier && (
        <button
          className={`btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none px-6 ${!isSubmitEnabled && 'btn-disabled'}`}
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
        >
          Find Providers
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