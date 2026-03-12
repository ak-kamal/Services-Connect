// controllers/NidController.js
import tesseract from 'tesseract.js';
import preprocessImage from './preprocessImage.js';  // Correct import path
import parseNidText from './parseNidText.js';       // Correct import path

export const extractNidDetails = async (req, res) => {
  try {
    // Ensure the front image is present
    const { nidFront } = req.files;
    if (!nidFront) {
      return res.status(400).json({ success: false, message: 'Please upload the front image of the NID.' });
    }

    // Preprocess images
    const frontImageBuffer = await preprocessImage(nidFront[0].buffer);
    // const backImageBuffer = await preprocessImage(nidBack[0].buffer);

    // Perform OCR using Tesseract.js
    const frontText = await tesseract.recognize(frontImageBuffer, 'eng', { logger: (m) => console.log(m) });
    // const backText = await tesseract.recognize(backImageBuffer, 'ben+eng', { logger: (m) => console.log(m) });

    // Log OCR output (optional)
    console.log("Front OCR Text:", frontText.data.text);
    //console.log("Back OCR Text:", backText.data.text);

    // Parse the text for name, dob, and address
    const extractedData = parseNidText(frontText.data.text);

    // Send back the extracted data
    return res.status(200).json({
      success: true,
      message: 'NID details extracted successfully',
      data: extractedData
    });
  } catch (error) {
    console.error("Error during NID extraction process:", error);
    return res.status(500).json({
      success: false,
      message: 'Error processing NID extraction. Please try again.',
    });
  }
};