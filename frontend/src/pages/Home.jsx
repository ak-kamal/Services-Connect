import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../utils';

import ProviderCard from '../components/ProviderCard';

function Home() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [role, setRole] = useState('');
  const [providers, setProviders] = useState([]);

  // 🔥 NEW STATES
  const [activeView, setActiveView] = useState('home');
  const [myOffers, setMyOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  const navigate = useNavigate();

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
    { title: 'Electricians', description: 'Electrical repairs...', role: 'electrician' },
    { title: 'Plumbers', description: 'Pipe leaks...', role: 'plumber' },
    { title: 'Carpenters', description: 'Furniture work...', role: 'carpenter' },
    { title: 'House Maids', description: 'Cleaning...', role: 'house maid' },
  ];

  const fetchProviders = async (role) => {
    try {
      const response = await fetch(`http://localhost:5000/api/providers?role=${role}`);
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

  // 🔥 NEW FUNCTION
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

      {/* 🔹 Navbar */}
      <div className="navbar bg-base-100 shadow-md px-6">
        <div className="flex-1">
          <Link to="/" className="text-2xl font-bold text-primary">
            Services Connect
          </Link>
        </div>

        <div className="flex-none">

          {/* 🔥 NEW BUTTON */}
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
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-4 pb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Explore Services</h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((item, index) => (
                <div key={index} className="card bg-base-100 shadow-lg">
                  <div className="card-body">
                    <h3 className="card-title">{item.title}</h3>
                    <button className="btn btn-primary btn-sm" onClick={() => handleFindProviders(item.role)}>
                      Find
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {providers.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 pb-16">
              <h2 className="text-3xl font-bold text-center mb-8">Providers</h2>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {providers.map((provider, index) => (
                  <ProviderCard key={index} provider={provider} />
                ))}
              </div>
            </section>
          )}
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
                  <p><strong>Date:</strong> {new Date(offer.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {offer.timeSlot}</p>
                  <p><strong>Status:</strong> {offer.status}</p>

                  <p className="mt-2 font-semibold">
                    {offer.status === 'Pending' && '⏳ Waiting for provider...'}
                    {offer.status === 'Accepted' && `✅ ${offer.providerId?.role} accepted your request`}
                    {offer.status === 'Rejected' && '❌ Request rejected'}
                  </p>

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