// frontend/src/pages/Home.jsx

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../utils';

function Home() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('home');
  const [myOffers, setMyOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

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
      handleSuccess('Work marked as completed!');
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
            Services Connect
          </Link>
        </div>

        <div className="flex-none">

          {loggedInUser && role === 'customer' && (

            <button
              className="btn btn-sm btn-primary mr-3"
              onClick={() => {
                setActiveView('requests');
                fetchMyOffers();
              }}
            >
              My Requests
            </button>


          )}

          {!loggedInUser ? (
            <Link to="/login" className="btn btn-primary">
              Login / Signup
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
                <li><button onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 🔥 HOME VIEW */}
      {activeView === 'home' && (
        <>
          <section className="hero bg-base-200 py-16">
            <div className="hero-content text-center">
              <div className="max-w-3xl">
                <h1 className="text-5xl font-bold">Book trusted home service providers</h1>
                <p className="py-6">Find electricians, plumbers, carpenters and more.</p>
                <Link to="/search-provider" className="btn btn-lg btn-primary">
                Find Providers
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 🔥 REQUESTS VIEW */}
      {activeView === 'requests' && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-3xl font-bold mb-6">My Requests</h2>

          {loadingOffers ? (
            <p>Loading...</p>
          ) : myOffers.length === 0 ? (
            <p>No booking requests yet</p>
          ) : (
            <div className="space-y-4">
              {myOffers.map((offer) => (
                <div key={offer._id} className="p-4 border rounded-lg shadow">

                  <p><strong>Provider:</strong> {offer.providerId?.name}</p>
                  <p><strong>Role:</strong> {offer.providerId?.role}</p>
                  <p><strong>Date:</strong> {new Date(offer.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {offer.timeSlot}</p>
                  <p><strong>Status:</strong> {offer.status}</p>

                  <p className="mt-2 font-semibold">
                    {offer.status === 'Pending' && '⏳ Waiting for provider...'}
                    {offer.status === 'Accepted' && `✅ ${offer.providerId?.name} accepted your request`}
                    {offer.status === 'Rejected' && '❌ Request rejected'}
                  </p>

                  {/* Show "Work Done" button if the status is "Accepted" */}
                  {offer.status === 'Accepted' && (
                    <button
                      className="btn btn-sm bg-blue-500 text-white mt-2"
                      onClick={() => handleWorkDone(offer._id)}
                    >
                      Work Done
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
            Back
          </button>
        </div>
    
        )}
      <ToastContainer />
    </div>
  );
}

export default Home;