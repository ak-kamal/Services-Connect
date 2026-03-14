// frontend/src/App.jsx
import { Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProviderProfile from './pages/ProviderProfile'
import ProviderBooking from './pages/ProviderBooking'  // Import the new ProviderBooking page
import RefreshHandler from './components/RefreshHandler'
import ChatWidget from "./components/ChatWidget";

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
        <Route path="/provider-profile" element={<PrivateRoute element={<ProviderProfile />} />} />
        <Route path="/provider-booking/:providerId" element={<PrivateRoute element={<ProviderBooking />} />} /> {/* Add the new route */}
      </Routes>

      <ChatWidget />
    </div>
  )
}

export default App