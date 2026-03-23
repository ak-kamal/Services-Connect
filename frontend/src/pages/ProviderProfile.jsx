import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleSuccess } from '../utils'

function ProviderProfile() {
  const [loggedInUser, setLoggedInUser] = useState('')
  const [role, setRole] = useState('')
  const [activeView, setActiveView] = useState('profile')

  const [offers, setOffers] = useState([])
  const [loadingOffers, setLoadingOffers] = useState(false)

  const navigate = useNavigate()

  // 🔐 Auth check
  useEffect(() => {
    const storedName = localStorage.getItem('loggedInUser') || ''
    const storedRole = localStorage.getItem('role') || ''
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    if (storedRole === 'customer') {
      navigate('/')
      return
    }

    setLoggedInUser(storedName)
    setRole(storedRole)
  }, [navigate])

  const initial = useMemo(() => {
    return loggedInUser ? loggedInUser.charAt(0).toUpperCase() : ''
  }, [loggedInUser])

  const formattedRole = useMemo(() => {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : ''
  }, [role])

  // 🚪 Logout
  const handleLogout = () => {
    console.log("Logout clicked") // debug

    localStorage.clear() // 🔥 cleaner way

    handleSuccess('User logged out')

    // instant redirect (no delay needed)
    navigate('/login')
  }

  // 🔥 Fetch Offers
  const fetchOffers = async () => {
    const providerId = localStorage.getItem('userId')

    try {
      setLoadingOffers(true)

      const res = await fetch(
        `http://localhost:5000/api/offers?providerId=${providerId}`
      )
      const data = await res.json()

      if (data.success) {
        setOffers(data.offers)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingOffers(false)
    }
  }

  // ✅ Accept Offer
  const handleAccept = async (offerId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/offer/${offerId}/accept`,
        {
          method: 'PUT',
        }
      )

      const data = await res.json()

      if (data.success) {
        fetchOffers()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // ❌ Reject Offer
  const handleReject = async (offerId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/offer/${offerId}/reject`,
        {
          method: 'PUT',
        }
      )

      const data = await res.json()

      if (data.success) {
        fetchOffers()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* 🔹 Navbar */}
      <div className="navbar bg-base-100 shadow-md px-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">
            Provider Profile
          </h1>
        </div>

        <div className="flex-none">
          <div className="dropdown dropdown-end">

            {/* ✅ FIXED DROPDOWN BUTTON */}
            <div
              tabIndex={0}
              role="button"
              className="btn btn-circle avatar"
            >
              <div className="w-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <span className="text-lg font-bold">{initial}</span>
              </div>
            </div>

            {/* ✅ FIXED MENU */}
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="px-2 py-1 font-semibold">
                {loggedInUser}
              </li>
              <li className="px-2 py-1 text-sm capitalize">
                {formattedRole}
              </li>
              <li>
                <button onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>

          </div>
        </div>
      </div>

      {/* 🔹 Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">

            {/* 🔹 Switch Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActiveView('profile')}
              >
                Profile
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setActiveView('offers')
                  fetchOffers()
                }}
              >
                Offers
              </button>
            </div>

            {/* 🔹 PROFILE VIEW */}
            {activeView === 'profile' && (
              <>
                <h2 className="card-title text-3xl">
                  Welcome, {loggedInUser}
                </h2>
                <p className="text-lg">
                  Role:{' '}
                  <span className="font-semibold">
                    {formattedRole}
                  </span>
                </p>
                <p className="text-base-content/70">
                  This is your provider dashboard/profile page.
                </p>
              </>
            )}

            {/* 🔹 OFFERS VIEW */}
            {activeView === 'offers' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Booking Requests
                </h2>

                {loadingOffers ? (
                  <p>Loading...</p>
                ) : offers.length === 0 ? (
                  <p>No offers have been placed yet</p>
                ) : (
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <div
                        key={offer._id}
                        className="p-4 border rounded-lg shadow"
                      >
                          <p>
                          <strong>Customer:</strong>{' '}
                          {offer.customerId?.name || 'Unknown'}
                        </p>
                        <p>
                          <strong>Date:</strong>{' '}
                          {new Date(
                            offer.date
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Time:</strong>{' '}
                          {offer.timeSlot}
                        </p>
                        <p>
                          <strong>Status:</strong>{' '}
                          {offer.status}
                        </p>

                        {offer.status === 'Pending' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() =>
                                handleAccept(offer._id)
                              }
                            >
                              Accept
                            </button>

                            <button
                              className="btn btn-error btn-sm"
                              onClick={() =>
                                handleReject(offer._id)
                              }
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}

export default ProviderProfile