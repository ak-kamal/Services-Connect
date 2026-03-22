import express from 'express';
//import Provider from '../models/Provider.js';
import UserModel from '../models/User.js';
import multer from "multer";
import path from "path";
import fs from "fs";
import { ensureAuthenticated } from "../middlewares/AuthMiddleware.js";
import { getProviderProfile, uploadCertification } from "../controllers/ProviderController.js";

const providerRouter = express.Router();

// GET /api/providers?role=electrician
providerRouter.get('/providers', async (req, res) => {
  const { role } = req.query;

  try {
    const providers = await UserModel.find({ role });
    res.status(200).json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch providers', error });
  }
});

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

export default providerRouter;