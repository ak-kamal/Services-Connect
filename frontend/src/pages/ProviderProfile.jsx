import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleSuccess } from '../utils'

function ProviderProfile() {
  const [loggedInUser, setLoggedInUser] = useState('')
  const [role, setRole] = useState('')
  const navigate = useNavigate()

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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('loggedInUser')
    localStorage.removeItem('role')
    handleSuccess('User logged out')

    setTimeout(() => {
      navigate('/login')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md px-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Provider Profile</h1>
        </div>

        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-circle avatar"
            >
              <div className="w-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <span className="text-lg font-bold leading-none">{initial}</span>
              </div>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="px-2 py-1 font-semibold text-base-content/80">
                {loggedInUser}
              </li>
              <li className="px-2 py-1 text-sm text-base-content/60 capitalize">
                {formattedRole}
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-3xl">Welcome, {loggedInUser}</h2>
            <p className="text-lg">
              Role: <span className="font-semibold">{formattedRole}</span>
            </p>
            <p className="text-base-content/70">
              This is your provider dashboard/profile page. Later, you can add:
              services, pricing, availability, booking requests and reviews.
            </p>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}

export default ProviderProfile