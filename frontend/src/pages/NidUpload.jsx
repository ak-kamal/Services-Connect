// src/pages/NidUpload.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Make sure axios is installed
import { useLanguage } from '../i18n/LanguageContext';
import LanguageToggle from '../components/LanguageToggle'

const NidUpload = () => {
  const [frontImage, setFrontImage] = useState(null);  // State for front image
  //const [backImage, setBackImage] = useState(null);    // State for back image
  const [loading, setLoading] = useState(false);       // Loading state to show the button as 'processing'
  const navigate = useNavigate();  // React Router for navigation
  const { t } = useLanguage();

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
      alert(t('nidUpload.alerts.uploadFrontRequired'));
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
        alert(t('nidUpload.alerts.extractionFailed'));
      }
    } catch (error) {
      console.error("Error:", error);
      alert(t('nidUpload.alerts.somethingWentWrong'));
    } finally {
      setLoading(false);  // Stop loading state
    }
  };

  return (
  <div className="min-h-screen bg-base-200 flex flex-col">
    {/* Fixed Language Toggle at top */}
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <LanguageToggle />
    </div>

    {/* Centered Card Content */}
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-base-100 shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">{t('nidUpload.title')}</h2>
        
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">{t('nidUpload.frontImageLabel')}</span>
            </label>
            <input
              type="file"
              name="front"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full"
              accept="image/*"
              required
            />
          </div>

          {/* <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">{t('nidUpload.backImageLabel')}</span>
            </label>
            <input
              type="file"
              name="back"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full"
              accept="image/*"
              required
            />
          </div> */}

          <button 
            type="submit" 
            className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none px-3 mx-auto block" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                {t('nidUpload.processing')}
              </>
            ) : (
              t('nidUpload.submit')
            )}
          </button>
        </form>
      </div>
    </div>
  </div>
);
};

export default NidUpload;