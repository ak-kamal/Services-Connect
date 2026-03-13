// src/pages/Signup.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    address: "",
    email: "",
    password: "",
    role: "customer",
  });

  const navigate = useNavigate();

  // Fetch the extracted data from sessionStorage and prefill the form
  useEffect(() => {
    const extractedData = JSON.parse(sessionStorage.getItem("nidData"));
    
    if (extractedData) {
      console.log(extractedData.formattedDate, extractedData.name);
      setFormData({
        name: extractedData.name,
        dateOfBirth: extractedData.formattedDate,
        address: extractedData.address,
        email: "", // User will enter email
        password: "",
        role: "customer", // Default role, you can change it if needed
      });
    } else {
      navigate("/nid-upload");  // If there's no NID data, redirect to NID upload
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
      alert(message);
      // You can add redirection or further steps here (like navigating to dashboard)
    } else {
      alert(message || "Signup failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h2 className="text-xl mb-4">Signup</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="form-control">
          <label className="label">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">Date of Birth</label>
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
          <label className="label">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">Role</label>
          <select
            name="role"
            value={formData.role}
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
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;