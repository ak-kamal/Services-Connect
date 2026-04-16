import { Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProviderProfile from './pages/ProviderProfile';
import NidUpload from './pages/NidUpload';
import ProviderBooking from './pages/ProviderBooking';
import SearchProvider from './pages/SearchProvider'; // Add this import
import RefreshHandler from './components/RefreshHandler';
import ChatWidget from "./components/ChatWidget";
import PaymentSuccess from './pages/PaymentSuccess';
import Complaint from './pages/Complaint';
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <div className="min-h-screen bg-base-200">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/nid-upload" element={<NidUpload />} />
        <Route path="/search-provider" element={<SearchProvider />}  />
        
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route
          path="/provider-profile"
          element={<PrivateRoute element={<ProviderProfile />} />}
        />
        <Route path="/provider-booking/:providerId" element={<PrivateRoute element={<ProviderBooking />} />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/complaint" element={<Complaint />} />      
      </Routes>

      <ChatWidget />
    </div>
  );
}

export default App;