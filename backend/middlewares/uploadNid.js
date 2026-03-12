// middlewares/uploadNid.js
import multer from 'multer';  // Using ES Module import

// Set up file storage (in memory for easier processing)
const storage = multer.memoryStorage();

// Set up multer with file filter and size limit (max 5MB for each file)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.mimetype);
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});

// Export to use in routes
export default upload.fields([{ name: 'nidFront', maxCount: 1 }, { name: 'nidBack', maxCount: 1 }]);