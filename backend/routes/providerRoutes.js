import express from 'express';
//import Provider from '../models/Provider.js';
import UserModel from '../models/User.js';
import multer from "multer";
import path from "path";
import fs from "fs";
import { ensureAuthenticated } from "../middlewares/AuthMiddleware.js";
import { getProviderProfile, uploadCertification } from "../controllers/ProviderController.js";

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a =
    Math.sin(Δφ/2) * Math.sin(Δφ/2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ/2) * Math.sin(Δλ/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // distance in meters
}

const providerRouter = express.Router();

const uploadDirectory = path.join(process.cwd(), "uploads", "certifications");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        cb(null, fileName);
    }
});

const fileFilter = (_req, file, cb) => {
    const allowedMimeTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg"
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("Only PDF, PNG and JPG files are allowed"));
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

providerRouter.get("/profile", ensureAuthenticated, getProviderProfile);

providerRouter.post(
    "/certification",
    ensureAuthenticated,
    (req, res, next) => {
        upload.single("certification")(req, res, (error) => {
            if (!error) {
                return next();
            }

            if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "File size must be less than 5MB"
                });
            }

            return res.status(400).json({
                success: false,
                message: error.message || "Invalid file upload"
            });
        });
    },
    uploadCertification
);

// GET /api/providers?role=electrician
providerRouter.get('/providers', async (req, res) => {
  const { role, lat, lng, radius } = req.query;

  try {
    // 🔥 Normal fetch (no filter)
    if (!lat || !lng) {
      const providers = await UserModel.find({ role });
      return res.status(200).json({ success: true, providers });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxDistance = (parseFloat(radius) || 5) * 1000; // km → meters

    // 🔥 Geo query
    const providers = await UserModel.find({
      role,
      "location.lat": { $exists: true },
      "location.lng": { $exists: true },
    });

    // 🔥 Manual filtering (simple version)
    const filteredProviders = providers.filter((provider) => {
      const pLat = provider.location.lat;
      const pLng = provider.location.lng;

      const distance = getDistance(userLat, userLng, pLat, pLng);
      return distance <= maxDistance;
    });

    res.status(200).json({
      success: true,
      providers: filteredProviders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch providers',
      error,
    });
  }
});

// GET /api/providers/:providerId - Fetch provider details by providerId
providerRouter.get('/providers/:providerId', async (req, res) => {
  const { providerId } = req.params;

  try {
    const provider = await UserModel.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.status(200).json({ success: true, provider });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching provider', error });
  }
});

export default providerRouter; 