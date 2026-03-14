// src/pages/NidUpload.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Make sure axios is installed

const NidUpload = () => {
  const [frontImage, setFrontImage] = useState(null);  // State for front image
  //const [backImage, setBackImage] = useState(null);    // State for back image
  const [loading, setLoading] = useState(false);       // Loading state to show the button as 'processing'
  const navigate = useNavigate();  // React Router for navigation

  // Handle file input changes (when user selects a file)
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'front') {
      setFrontImage(files[0]);  // Set the front image file
    } else if (name === 'back') {
      setBackImage(files[0]);   // Set the back image file
    }
  };

  // Handle the form submission (send the images to the backend)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that both images are uploaded
    if (!frontImage) {
      alert("Please upload the front image of the NID.");
      return;
    }

    // Create FormData object to send files as multipart/form-data
    const formData = new FormData();
    formData.append("nidFront", frontImage); // Add front image
    //formData.append("nidBack", backImage);   // Add back image

    try {
      setLoading(true);  // Show loading state (e.g., disable button)

      // Send the files to the backend for processing using axios
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/extract-nid`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // If the response is successful, store extracted data and navigate to Signup page
      if (response.data.success) {

  const data = response.data.data;
  console.log("Extracted Data:", data); // Log the extracted data for debugging

  sessionStorage.setItem(
    "nidData",
    JSON.stringify({
      name: data.name,
      dateOfBirth: data.dateOfBirth,
      nidImageUrl: data.nidImageUrl,
      nidImagePublicId: data.nidImagePublicId,
    })
  );

  navigate("/signup");  // Navigate to the Signup page after successful extraction
} else {
        alert("Failed to extract NID details. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);  // Stop loading state
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h2 className="text-xl mb-4">Upload NID Image</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="label">NID Front Image</label>
          <input
            type="file"
            name="front"
            onChange={handleFileChange}
            className="input input-bordered w-full"
            accept="image/*"
            required
          />
        </div>

        {/* <div className="mb-4">
          <label className="label">NID Back Image</label>
          <input
            type="file"
            name="back"
            onChange={handleFileChange}
            className="input input-bordered w-full"
            accept="image/*"
            required
          />
        </div> */}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default NidUpload;