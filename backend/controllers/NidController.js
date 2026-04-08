// controllers/NidController.js
import tesseract from 'tesseract.js';
import preprocessImage from './preprocessImage.js';  // Correct import path
import parseNidText from './parseNidText.js';       // Correct import path
import uploadBufferToCloudinary from './CloudinaryUpload.js';  // Correct import path

export const extractNidDetails = async (req, res) => {
  try {
    // Ensure the front image is present
    const { nidFront } = req.files;
    if (!nidFront) {
      return res.status(400).json({ success: false, message: 'Please upload the front image of the NID.' });
    }

    const originalBuffer = nidFront[0].buffer;

    // Upload original image to Cloudinary
    const cloudinaryResult = await uploadBufferToCloudinary(originalBuffer);

    // Preprocess images
    const frontImageBuffer = await preprocessImage(nidFront[0].buffer);

    // Perform OCR using Tesseract.js
    const frontText = await tesseract.recognize(frontImageBuffer, 'eng', { logger: (m) => console.log(m) });

    // Log OCR output (optional)
    console.log("Front OCR Text:", frontText.data.text);

    // Parse the text for name, dob, and address
    const extractedData = parseNidText(frontText.data.text);

    const responsePayload = {
  success: true,
  message: "NID details extracted successfully",
  data: {
    ...extractedData,
    nidImageUrl: cloudinaryResult.secure_url,
    nidImagePublicId: cloudinaryResult.public_id,
  },
};

console.log(responsePayload.data); // logs only the data field

return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error during NID extraction process:", error);
    return res.status(500).json({
      success: false,
      message: 'Error processing NID extraction. Please try again.',
    });
  }
};