// src/pages/Signup.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from "../utils";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../i18n/LanguageContext";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const Signup = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    //address: "",
    email: "",
    password: "",
    role: "customer",
    nidImageUrl: "",
    nidImagePublicId: "",
    location: {
    lat: null,
    lng: null,
    address: "",
  },
  });

  const [location, setLocation] = useState({
  lat: null,
  lng: null,
  address: "",
  });

  const navigate = useNavigate();

  // Fetch the extracted data from sessionStorage and prefill the form
  useEffect(() => {
    const extractedData = JSON.parse(sessionStorage.getItem("nidData"));
    
    if (extractedData) {
      console.log(extractedData.dateOfBirth, extractedData.name);
      setFormData({
        name: extractedData.name,
        dateOfBirth: extractedData.dateOfBirth,
        //address: extractedData.address,
        email: "", // User will enter email
        password: "",
        role: "customer", // Default role, you can change it if needed
        nidImageUrl: extractedData.nidImageUrl,
        nidImagePublicId: extractedData.nidImagePublicId,
      });
    } else {
      navigate("/nid-upload");  // If there's no NID data, redirect to NID upload
    }
  }, [navigate]);

  const LocationMarker = () => {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;

      // Reverse geocoding (Nominatim)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();

      const address = data.display_name;

      setLocation({ lat, lng, address });

      // also update formData
      setFormData((prev) => ({
        ...prev,
        location: { lat, lng, address },
      }));
    },
  });

  return location.lat ? <Marker position={[location.lat, location.lng]} /> : null;
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (!formData.location.lat) {
    return handleError(t('signup.pickLocation'));
  }

    e.preventDefault();

    // Send final data to the backend for signup
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    const { success, message } = result;

    if (success) {
      handleSuccess(message || t('signup.success'));
      setTimeout(() => {
          navigate("/login");
        }, 1000)
    } else {
      handleError(message || t('login.loginFailed'));
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl">{t('signup.title')}</h2>
        <LanguageToggle />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="form-control">
          <label className="label">{t('common.name')}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t('signup.namePlaceholder')}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">{t('signup.dobPlaceholder')}</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
  <label className="label">{t('signup.pickLocation')}</label>

  <MapContainer
    center={[23.8103, 90.4125]}
    zoom={13}
    style={{ height: "300px", width: "100%" }}
  >
    <TileLayer
      attribution="&copy; OpenStreetMap contributors"
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <LocationMarker />
  </MapContainer>

  {location.address && (
    <div className="mt-2 p-2 bg-gray-100 rounded">
      <p className="text-sm">
        <strong>{t('signup.addressLabel')}:</strong> {location.address}
      </p>
    </div>
  )}
</div>

        <div className="form-control">
          <label className="label">{t('common.email')}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('signup.emailPlaceholder')}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">{t('common.password')}</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t('signup.passwordPlaceholder')}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">{t('common.role')}</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="customer">{t('common.customer')}</option>
            <option value="electrician">{t('home.categoryElectricians')}</option>
            <option value="plumber">{t('home.categoryPlumbers')}</option>
            <option value="carpenter">{t('home.categoryCarpenters')}</option>
            <option value="driver">{t('home.categoryHouseMaids')}</option>
          </select>
        </div>

        <button type="submit" className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none">
          {t('common.signup')}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Signup;