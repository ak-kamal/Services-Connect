// controllers/preprocessImage.js
import sharp from 'sharp';  // Importing sharp for image processing

// Preprocess the image: resize, grayscale, and normalize
const preprocessImage = async (imageBuffer) => {
  try {
    const processedImage = await sharp(imageBuffer)
      .resize(1000)  // Resize the image width to 1000px, maintaining aspect ratio
      .grayscale()   // Convert the image to grayscale for better OCR accuracy
      .normalize()   // Normalize the image (adjusts brightness and contrast)
      .toBuffer();   // Convert the image to buffer and return

    return processedImage;
  } catch (error) {
    throw new Error('Error during image preprocessing: ' + error.message);
  }
};

export default preprocessImage;