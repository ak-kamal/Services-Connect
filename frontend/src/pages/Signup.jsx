import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from '../utils'

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  })

  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const handleChange = (e) => {
    const { name, value } = e.target
    setSignupInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()

    const { name, email, password, role } = signupInfo

    if (!name || !email || !password || !role) {
      return handleError('Name, email, password and role are required')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupInfo),
      })

      const result = await response.json()
      const { success, message, error } = result

      if (success) {
        handleSuccess(message)
        setTimeout(() => {
          navigate('/login')
        }, 1000)
      } else if (error) {
        const details = error?.details?.[0]?.message || 'Something went wrong'
        handleError(details)
      } else {
        handleError(message || 'Signup failed')
      }
    } catch (err) {
      handleError(err.message || 'Server error')
    }
  }

  return (
    <div className="hero min-h-screen bg-base-200 px-4">
      <div className="hero-content w-full max-w-6xl flex-col lg:flex-row gap-10">
        <div className="text-center lg:text-left max-w-lg">
          <h1 className="text-5xl font-bold text-primary">Create Account</h1>
          <p className="py-4 text-base-content/80">
            Join Services Connect as a customer or service provider.
          </p>
        </div>

        <div className="card w-full max-w-md bg-base-100 shadow-2xl">
          <div className="card-body">
            <h2 className="card-title text-3xl justify-center">Signup</h2>

            <form onSubmit={handleSignup} className="space-y-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={signupInfo.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={signupInfo.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={signupInfo.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Select Role</span>
                </label>
                <select
                  name="role"
                  value={signupInfo.role}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="customer">Customer</option>
                  <option value="electrician">Electrician</option>
                  <option value="plumber">Plumber</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="driver">Driver</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Signup
              </button>

              <p className="text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className="link link-primary font-semibold">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}

export default Signup