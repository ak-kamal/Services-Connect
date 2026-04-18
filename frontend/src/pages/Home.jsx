import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../utils';

import ProviderCard from '../components/ProviderCard';
import ChatWindow from '../components/ChatWindow';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';

function Home() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [role, setRole] = useState('');
  const [providers, setProviders] = useState([]);
  const [nearbyOnly, setNearbyOnly] = useState(false);

  const [activeView, setActiveView] = useState('home');
  const [myOffers, setMyOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [chatOffer, setChatOffer] = useState(null);

  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const storedName = localStorage.getItem('loggedInUser') || '';
    const storedRole = localStorage.getItem('role') || '';
    setLoggedInUser(storedName);
    setRole(storedRole);

    if (storedRole && storedRole !== 'customer') {
      navigate('/provider-profile');
    }
  }, [navigate]);

  const initial = useMemo(() => {
    return loggedInUser ? loggedInUser.charAt(0).toUpperCase() : '';
  }, [loggedInUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('role');
    handleSuccess('User logged out');

    setTimeout(() => {
      navigate('/');
      window.location.reload();
    }, 1000);
  };

  const categories = [
    { title: t('home.electricians'), role: 'electrician' },
    { title: t('home.plumbers'), role: 'plumber' },
    { title: t('home.carpenters'), role: 'carpenter' },
    { title: t('home.houseMaids'), role: 'house maid' },
  ];

  const fetchProviders = async (role) => {
    try {
      let url = `http://localhost:5000/api/providers?role=${role}`;

      if (nearbyOnly) {
        const user = JSON.parse(localStorage.getItem("userData"));

        if (!user?.location?.lat) {
          return handleError("Location not found. Please re-login.");
        }

        const { lat, lng } = user.location;
        url += `&lat=${lat}&lng=${lng}&radius=5`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProviders(data.providers);
      } else {
        handleError("Failed to fetch providers");
      }
    } catch (error) {
      handleError("Error fetching providers");
    }
  };

  const handleFindProviders = (role) => {
    fetchProviders(role);
  };

  const fetchMyOffers = async () => {
    const customerId = localStorage.getItem("userId");

    try {
      setLoadingOffers(true);

      const res = await fetch(
        `http://localhost:5000/api/customer-offers?customerId=${customerId}`
      );
      const data = await res.json();

      if (data.success) {
        setMyOffers(data.offers);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOffers(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">

      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-md px-6">
        {/* Left — brand */}
        <div className="navbar-start">
          <Link to="/" className="text-2xl font-bold text-primary">
            {t('nav.brand')}
          </Link>
        </div>

        {/* Center — language toggle */}
        <div className="navbar-center">
          <LanguageToggle />
        </div>

        {/* Right — actions */}
        <div className="navbar-end gap-2">
          {loggedInUser && role === 'customer' && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                setActiveView('requests');
                fetchMyOffers();
              }}
            >
              {t('nav.myRequests')}
            </button>
          )}

          {!loggedInUser ? (
            <Link to="/login" className="btn btn-primary">
              {t('nav.loginSignup')}
            </Link>
          ) : (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-circle avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-12">
                  <span className="text-lg font-bold">{initial}</span>
                </div>
              </div>

              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                <li className="px-2 py-1 font-semibold">{loggedInUser}</li>
                <li className="px-2 py-1 text-sm capitalize">{role}</li>
                <li><button onClick={handleLogout}>{t('common.logout')}</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* HOME VIEW */}
      {activeView === 'home' && (
        <>
          <section className="hero bg-base-200 py-16">
            <div className="hero-content text-center">
              <div className="max-w-3xl">
                <h1 className="text-5xl font-bold">{t('home.heroTitle')}</h1>
                <p className="py-6">{t('home.heroSub')}</p>
              </div>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-4 mb-6 flex items-center gap-3">
            <label className="label cursor-pointer gap-2">
              <span className="label-text font-semibold">{t('home.nearbyOnly')}</span>
              <input
                type="checkbox"
                className="toggle checked:bg-blue-500 checked:border-blue-500"
                checked={nearbyOnly}
                onChange={() => setNearbyOnly(!nearbyOnly)}
              />
            </label>
          </div>

          <section className="max-w-6xl mx-auto px-4 pb-16">
            <h2 className="text-3xl font-bold text-center mb-8">{t('home.exploreServices')}</h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((item, index) => (
                <div key={index} className="card bg-base-100 shadow-lg">
                  <div className="card-body">
                    <h3 className="card-title">{item.title}</h3>
                    <button
                      className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none"
                      onClick={() => handleFindProviders(item.role)}
                    >
                      {t('home.find')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {providers.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 pb-16">
              <h2 className="text-3xl font-bold text-center mb-8">{t('home.providers')}</h2>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {providers.map((provider, index) => (
                  <ProviderCard key={index} provider={provider} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* REQUESTS VIEW */}
      {activeView === 'requests' && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-3xl font-bold mb-6">{t('requests.title')}</h2>

          {loadingOffers ? (
            <p>{t('common.loading')}</p>
          ) : myOffers.length === 0 ? (
            <p>{t('requests.noRequests')}</p>
          ) : (
            <div className="space-y-4">
              {myOffers.map((offer) => (
                <div key={offer._id} className="p-4 border rounded-lg shadow">

                  <p><strong>{t('requests.provider')}:</strong> {offer.providerId?.name}</p>
                  <p><strong>{t('requests.role')}:</strong> {offer.providerId?.role}</p>
                  <p><strong>{t('requests.date')}:</strong> {new Date(offer.date).toLocaleDateString()}</p>
                  <p><strong>{t('requests.time')}:</strong> {offer.timeSlot}</p>
                  <p><strong>{t('requests.status')}:</strong> {offer.status}</p>

                  <p className="mt-2 font-semibold">
                    {offer.status === 'Pending' && t('requests.pending')}
                    {offer.status === 'Accepted' && t('requests.accepted', { name: offer.providerId?.name })}
                    {offer.status === 'Rejected' && t('requests.rejected')}
                  </p>

                  {offer.status !== 'Rejected' && (
                    <button
                      className="btn btn-sm btn-outline btn-primary mt-3"
                      onClick={() => setChatOffer(offer)}
                    >
                      {t('requests.chatWithProvider')}
                    </button>
                  )}

                </div>
              ))}
            </div>
          )}

          <button
            className="btn btn-primary mt-6"
            onClick={() => setActiveView('home')}
          >
            {t('common.back')}
          </button>
        </div>
      )}

      {chatOffer && (
        <ChatWindow
          offerId={chatOffer._id}
          offerDate={chatOffer.date}
          offerTimeSlot={chatOffer.timeSlot}
          otherPartyName={chatOffer.providerId?.name || 'Provider'}
          currentUserId={localStorage.getItem('userId')}
          token={localStorage.getItem('token')}
          onClose={() => setChatOffer(null)}
        />
      )}

      <ToastContainer />
    </div>
  );
}

export default Home;
