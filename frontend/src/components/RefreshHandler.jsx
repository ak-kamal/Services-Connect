import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function isTokenValid(token) {
  if (!token) return false

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp > currentTime
  } catch (error) {
    return false
  }
}

function RefreshHandler({ setIsAuthenticated }) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (token && isTokenValid(token)) {
      setIsAuthenticated(true)

      if (location.pathname === '/login' || location.pathname === '/signup') {
        if (role === 'customer') {
          navigate('/')
        } else {
          navigate('/provider-profile')
        }
      }
    } else {
      setIsAuthenticated(false)
      localStorage.removeItem('token')
      localStorage.removeItem('loggedInUser')
      localStorage.removeItem('role')

      if (location.pathname === '/provider-profile') {
        navigate('/login')
      }
    }
  }, [location.pathname, navigate, setIsAuthenticated])

  return null
}

export default RefreshHandler