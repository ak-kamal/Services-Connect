import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from '../utils'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: '',
  })

  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const { t } = useLanguage()

  const handleChange = (e) => {
    const { name, value } = e.target
    setLoginInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    const { email, password } = loginInfo

    if (!email || !password) {
      return handleError('Email and password are required')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginInfo),
      })

      const result = await response.json()
      const { success, message, jwtToken, name, role, userId, location, error } = result

      if (success) {
        handleSuccess(message)
        localStorage.setItem('token', jwtToken)
        localStorage.setItem('loggedInUser', name)
        localStorage.setItem('role', role)
        localStorage.setItem("userId", userId);
        localStorage.setItem("location", JSON.stringify(location));
        localStorage.setItem("userData", JSON.stringify({ name, role, userId, location }))

        setTimeout(() => {
          if (role === 'customer') {
            navigate('/')
          } else {
            navigate('/provider-profile')
          }
        }, 1000)
      } else if (error) {
        const details = error?.details?.[0]?.message || 'Something went wrong'
        handleError(details)
      } else {
        handleError(message || 'Login failed')
      }
    } catch (err) {
      handleError(err.message || 'Server error')
    }
  }

  return (
    <div className="hero min-h-screen bg-base-200 px-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="hero-content w-full max-w-6xl flex-col lg:flex-row-reverse gap-10">
        <div className="text-center lg:text-left max-w-lg">
          <h1 className="text-5xl font-bold text-primary">{t('nav.brand')}</h1>
          <p className="py-4 text-base-content/80">{t('login.tagline')}</p>
        </div>

        <div className="card w-full max-w-md bg-base-100 shadow-2xl">
          <div className="card-body">
            <h2 className="card-title text-3xl justify-center">{t('login.title')}</h2>

            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('login.email')}</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={loginInfo.email}
                  onChange={handleChange}
                  placeholder={t('login.emailPlaceholder')}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('login.password')}</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={loginInfo.password}
                  onChange={handleChange}
                  placeholder={t('login.passwordPlaceholder')}
                  className="input input-bordered w-full"
                />
              </div>

              <button type="submit" className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none">
                {t('login.loginBtn')}
              </button>

              <p className="text-center text-sm">
                {t('login.noAccount')}{' '}
                <Link to="/signup" className="link link-primary font-semibold">
                  {t('common.signup')}
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

export default Login
