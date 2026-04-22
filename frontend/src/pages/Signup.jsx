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
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    email: "",
    password: "",
    role: "customer",
    nidImageUrl: "",
    nidImagePublicId: "",
    location: { lat: null, lng: null, address: "" },
  });

  const [location, setLocation] = useState({ lat: null, lng: null, address: "" });

  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const extractedData = JSON.parse(sessionStorage.getItem("nidData"));

    if (extractedData) {
      setFormData({
        name: extractedData.name,
        dateOfBirth: extractedData.dateOfBirth,
        email: "",
        password: "",
        role: "customer",
        nidImageUrl: extractedData.nidImageUrl,
        nidImagePublicId: extractedData.nidImagePublicId,
      });
    } else {
      navigate("/nid-upload");
    }
  }, [navigate]);

  const LocationMarker = () => {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        const address = data.display_name;

        setLocation({ lat, lng, address });
        setFormData((prev) => ({ ...prev, location: { lat, lng, address } }));
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
      return handleError(t('signup.alerts.selectAddressRequired'));
    }

    e.preventDefault();

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    const { success, message } = result;

    if (success) {
      handleSuccess(message);
      setTimeout(() => navigate("/login"), 1000);
    } else {
      handleError(t('signup.alerts.signupFailed'));
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl">{t('signup.title')}</h2>
      </div>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <LanguageToggle />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="form-control">
          <label className="label">{t('signup.fullName')}</label>
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
          <label className="label">{t('signup.dateOfBirth')}</label>
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
          <label className="label">{t('signup.selectAddress')}</label>

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
                <strong>{t('signup.selectedAddress')}:</strong> {location.address}
              </p>
            </div>
          )}
        </div>

        <div className="form-control">
          <label className="label">{t('signup.email')}</label>
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
          <label className="label">{t('signup.password')}</label>
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
          <label className="label">{t('signup.role')}</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="customer">{t('common.customer')}</option>
            <option value="electrician">{t('common.electrician')}</option>
            <option value="plumber">{t('common.plumber')}</option>
            <option value="carpenter">{t('common.carpenter')}</option>
            <option value="house maid">{t('common.houseMaid')}</option>
          </select>
        </div>

        <button type="submit" className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none px-3 mx-auto block">
          {t('signup.signUpBtn')}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Signup;