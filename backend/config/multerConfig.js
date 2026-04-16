// /config/multerConfig.js
import multer from 'multer';
import path from 'path';

// Set up storage for file uploads (store files locally)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Define the folder where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Set a unique filename
  }
});

// Initialize multer with the storage settings
const upload = multer({ storage: storage });

export default upload;