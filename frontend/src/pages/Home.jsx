// frontend/src/pages/Home.jsx

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../utils';
import ChatWindow from '../components/ChatWindow';
import LanguageToggle from '../components/LanguageToggle';
import { useLanguage } from '../i18n/LanguageContext';

function Home() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('home');
  const [myOffers, setMyOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [chatOffer, setChatOffer] = useState(null);
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});

  const { t } = useLanguage();

  useEffect(() => {
    const storedName = localStorage.getItem('loggedInUser') || '';
    const storedRole = localStorage.getItem('role') || '';
    setLoggedInUser(storedName);
    setRole(storedRole);

    if (storedRole === 'admin') {
      navigate('/admin-dashboard', { replace: true });
    } 
    else if (
      storedRole === 'electrician' ||
      storedRole === 'plumber' ||
      storedRole === 'carpenter' ||
      storedRole === 'housemaid'
    ) {
      navigate('/provider-profile', { replace: true });
    }}, [navigate]);

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

  const handleRating = (offerId, value) => {
  setRatings(prev => ({ ...prev, [offerId]: value }));
};

const handleReview = (offerId, value) => {
  setReviews(prev => ({ ...prev, [offerId]: value }));
};

  const handlePayment = async (offerId) => {
  try {
    const rating = ratings[offerId];
    const review = reviews[offerId];

    if (!rating) {
      return handleError("Please select rating");
    }

    // Save rating first
    await fetch(`http://localhost:5000/api/offer/${offerId}/add-review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ rating, review }),
    });

    // Create Stripe session
    const res = await fetch(`http://localhost:5000/api/payment/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId })
    });

    const data = await res.json();

    if (data.url) {
  window.location.href = data.url;
} else {
  console.error(data);
  handleError("Failed to start payment");
}

  } catch (err) {
    handleError("Payment error");
  }
};

  //offer checking by customer
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

  const pastOffers = myOffers.filter(
    (o) => o.status === 'Accepted' && new Date(o.date) < new Date()
  );

//handle workDOne email
const handleWorkDone = async (offerId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/offer/${offerId}/complete`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Use token if required
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      // Update the offer status in the state (optimistic update)
      setMyOffers((prevOffers) =>
        prevOffers.map((offer) =>
          offer._id === offerId ? { ...offer, status: 'Completed' } : offer
        )
      );
      handleSuccess('Work marked completed. Please rate before payment');
    } else {
      handleError('Failed to mark work as completed');
    }
  } catch (error) {
    handleError('Error completing work');
  }
};


return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-md px-6">
        <div className="flex-1">
          <Link to="/" className="text-2xl font-bold text-primary">
            {t('nav.brand')}
          </Link>
        </div>

        <div className="flex-none gap-1">
          <LanguageToggle />

        {loggedInUser && role === 'customer' && (

          <>

            {/*  Complaint Button */}
            <button
              className="btn btn-sm btn-error mr-3"
              onClick={() => navigate('/complaint')}
            >
              Complaint
            </button>

            {/*  My Requests Button */}
            <button
              className="btn btn-sm btn-primary mr-3"
              onClick={() => {
                setActiveView('requests');
                fetchMyOffers();
              }}
            >
              {t('nav.myRequests')}
            </button>

          </>
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
                <h1 className="text-5xl font-bold">Book trusted home service providers</h1>
                <p className="py-6">Find electricians, plumbers, carpenters and more.</p>
                <Link to="/search-provider" className="btn btn-lg text-white btn-primary">
                Find Providers
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/*  REQUESTS VIEW */}
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

                  <p><strong>Provider:</strong> {offer.providerId?.name}</p>
                  <p><strong>Role:</strong> {offer.providerId?.role}</p>
                  <p><strong>Date:</strong> {new Date(offer.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {offer.timeSlot}</p>
                  <p><strong>Category:</strong> {offer.category} </p>
                  <p><strong>Tier:</strong> {offer.tier} </p>
                  <p><strong>Total Price:</strong> {offer.totalPrice} BDT</p>
                  <p><strong>Status:</strong> {offer.status}</p>

                  <p className="mt-2 font-semibold">
                    {offer.status === 'Pending' && t('requests.pending')}
                    {offer.status === 'Accepted' && t('requests.accepted', { name: offer.providerId?.name })}
                    {offer.status === 'Rejected' && t('requests.rejected')}
                  </p>

                  {/* Chat button: show for Pending or Accepted */}
{(offer.status === 'Pending' || offer.status === 'Accepted' || offer.status === 'Completed') && (
  <button
    className="btn btn-sm bg-blue-500 text-white mt-3 mr-2 px-2"
    onClick={() => setChatOffer(offer)}
  >
    💬 Chat with Provider
  </button>
)}

{/* Work Done button: ONLY for Accepted */}
{offer.status === 'Accepted' && (
  <button
    className="btn btn-sm bg-blue-500 text-white mt-3 px-2"
    onClick={() => handleWorkDone(offer._id)}
  >
    Work Done
  </button>

)}

{offer.status === 'Completed' && (
  <div className="mt-3">

    {/* ⭐ Stars */}
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          onClick={() => handleRating(offer._id, star)}
          className={`cursor-pointer text-2xl ${
            star <= (ratings[offer._id] || 0)
              ? 'text-yellow-400'
              : 'text-gray-400'
          }`}
        >
          ★
        </span>
      ))}
    </div>

    {/* Review */}
    <textarea
      className="textarea textarea-bordered w-full mt-2"
      placeholder="Optional review"
      onChange={(e) => handleReview(offer._id, e.target.value)}
    />

    {/* Proceed button */}
    {ratings[offer._id] && (
      <button
        className="btn btn-success mt-2"
        onClick={() => handlePayment(offer._id)}
      >
        Proceed to Payment
      </button>
    )}
  </div>
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

      {/* PAST SERVICES VIEW */}
      {activeView === 'past' && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-3xl font-bold mb-6">Past Services</h2>

          {loadingOffers ? (
            <p>Loading...</p>
          ) : pastOffers.length === 0 ? (
            <p>No past services found</p>
          ) : (
            <div className="space-y-4">
              {pastOffers.map((offer) => (
                <div key={offer._id} className="p-4 border rounded-lg shadow">
                  <p><strong>Provider:</strong> {offer.providerId?.name}</p>
                  <p><strong>Role:</strong> {offer.providerId?.role}</p>
                  <p><strong>Date:</strong> {new Date(offer.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {offer.timeSlot}</p>
                  <p><strong>Status:</strong> {offer.status}</p>

                  <button
                    className="btn btn-sm btn-outline btn-success mt-3"
                    onClick={() => navigate(`/provider-booking/${offer.providerId?._id}`)}
                  >
                     Book Again
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn btn-primary mt-6"
            onClick={() => setActiveView('home')}
          >
            Back
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
