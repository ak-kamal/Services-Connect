// frontend/src/pages/Home.jsx

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '../utils';

function Home() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [role, setRole] = useState('');
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

      {/* Home View */}
      <section className="hero bg-base-200 py-16">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold">Book trusted home service providers</h1>
            <p className="py-6">Find electricians, plumbers, carpenters, and more.</p>
            <Link to="/search-provider" className="btn btn-lg btn-primary">
              Find Providers
            </Link>
          </div>
        </div>
      </section>

      <ToastContainer />
    </div>
  );
}

export default Home;