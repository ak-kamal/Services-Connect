import { Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProviderProfile from './pages/ProviderProfile'
import RefreshHandler from './components/RefreshHandler'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />
  }

  return (
    <div className="min-h-screen bg-base-200">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/provider-profile"
          element={<PrivateRoute element={<ProviderProfile />} />}
        />
      </Routes>
    </div>
  )
}

export default App