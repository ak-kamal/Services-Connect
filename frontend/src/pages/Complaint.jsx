// /frontend/src/pages/Complaint.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Complaint() {
  const navigate = useNavigate();

  const [role, setRole] = useState('');
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [complaintDescription, setComplaintDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch providers when role changes
  const handleRoleChange = async (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setSelectedProvider(null);
    setProviders([]);

    if (!selectedRole) return;

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/providers?role=${selectedRole}`
      );
      const data = await res.json();

      setProviders(data.providers); // your backend returns array directly
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Submit Complaint
  const handleSubmit = async (e) => {
    e.preventDefault();

    const customerId = localStorage.getItem('userId');

    if (!role || !selectedProvider || !complaintDescription) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const formData = new FormData();

      formData.append('customerId', customerId);
      formData.append('providerId', selectedProvider._id);
      formData.append('providerName', selectedProvider.name);
      formData.append('providerRole', role);
      formData.append('complaintDescription', complaintDescription);

      if (file) {
        formData.append('file', file);
      }

      const res = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert('Complaint submitted successfully!');
        navigate('/');
      } else {
        alert('Failed to submit complaint');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting complaint');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Submit Complaint
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 🔹 Role Dropdown */}
          <select
            className="select select-bordered w-full"
            value={role}
            onChange={handleRoleChange}
          >
            <option value="">Select Provider Role</option>
            <option value="electrician">Electrician</option>
            <option value="plumber">Plumber</option>
            <option value="carpenter">Carpenter</option>
            <option value="house maid">House Maid</option>
            <option value="driver">Driver</option>
          </select>

          {/* 🔹 Provider Dropdown */}
          <select
            className="select select-bordered w-full"
            disabled={!role || loading}
            value={selectedProvider?._id || ''}
            onChange={(e) => {
              const provider = providers.find(
                (p) => p._id === e.target.value
              );
              setSelectedProvider(provider);
            }}
          >
            <option value="">
              {loading
                ? 'Loading providers...'
                : 'Select Provider'}
            </option>

            {providers.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* 🔹 Complaint Text */}
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Write your complaint..."
            value={complaintDescription}
            onChange={(e) => setComplaintDescription(e.target.value)}
          />

          {/* 🔹 File Upload */}
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {/* 🔹 Submit Button */}
          <button className="btn btn-error w-full text-black">
            Submit Complaint
          </button>

        </form>
      </div>
    </div>
  );
}

export default Complaint;