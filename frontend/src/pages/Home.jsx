import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../utils';

import ProviderCard from '../components/ProviderCard';

function Home() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [role, setRole] = useState('');
  const [providers, setProviders] = useState([]);
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
    {
      title: 'Electricians',
      description: 'Electrical repairs, wiring, switches, lights and installations.',
      role: 'electrician',
    },
    {
      title: 'Plumbers',
      description: 'Pipe leaks, water line repair, fittings and maintenance.',
      role: 'plumber',
    },
    {
      title: 'Carpenters',
      description: 'Furniture work, wood repairs, shelves and custom fittings.',
      role: 'carpenter',
    },
    {
      title: 'House Maids',
      description: 'House cleaning, laundry, cooking and more.',
      role: 'house maid', // Change "driver" to "house maid"
    },
  ];

  // const fetchProviders = async (role) => {
  //   try {
      
  //     const response = await fetch(`/api/providers?role=${role}`);
      

  //     const text = await response.text();
  //     console.log(text);
  //     //const data = await response.json();
  //     //console.log(data);

  //     if (data.success) {
  //       setProviders(data.providers);
  //     } else {
  //       handleError('Failed to fetch providers');
  //     }
  //   } catch (error) {
  //     handleError('Error fetching providers');
  //   }
  // };
const fetchProviders = async (role) => {
  try {

    const response = await fetch(`http://localhost:5000/api/providers?role=${role}`);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    console.log("API data:", data);

    if (data.success) {
      setProviders(data.providers);
    } else {
      handleError("Failed to fetch providers");
    }

  } catch (error) {
    console.error("Error fetching providers:", error);
    handleError("Error fetching providers");
  }
};
  const handleFindProviders = (role) => {
    fetchProviders(role);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md px-6">
        <div className="flex-1">
          <Link to="/" className="text-2xl font-bold text-primary">
            Services Connect
          </Link>
        </div>

        <div className="flex-none">
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

              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li className="px-2 py-1 font-semibold text-base-content/80">{loggedInUser}</li>
                <li className="px-2 py-1 text-sm text-base-content/60 capitalize">{role}</li>
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <section className="hero bg-base-200 py-16">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold">Book trusted home service providers with ease</h1>
            <p className="py-6 text-base-content/80">
              Services Connect helps you find reliable electricians, plumbers, carpenters, and house maids whenever you need them.
            </p>

            {!loggedInUser ? (
              <Link to="/login" className="btn btn-primary btn-wide">
                Get Started
              </Link>
            ) : (
              <button className="btn btn-success btn-wide">
                Welcome back, {loggedInUser}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Explore Popular Services</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((item, index) => (
            <div key={index} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">{item.title}</h3>
                <p>{item.description}</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-outline btn-primary btn-sm" onClick={() => handleFindProviders(item.role)}>
                    Find
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {providers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Available Providers</h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {providers.map((provider, index) => (
              <ProviderCard key={index} provider={provider} />
            ))}
          </div>
        </section>
      )}

      <ToastContainer />
    </div>
  );
}

export default Home;