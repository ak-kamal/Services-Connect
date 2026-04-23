// /controllers/ComplaintController.js
import Complaint from '../models/Complaint.js';
import path from 'path';
import UserModel from '../models/User.js';

// Create a complaint with or without a file
export const createComplaint = async (req, res) => {
  const { customerId, providerName, providerRole, providerId, complaintDescription } = req.body;
  const file = req.file;  // Get the uploaded file (optional)

  // Prepare the file data (if available)
  let fileData = {};
  if (file) {
    fileData = {
      filename: file.filename,  // The name of the uploaded file
      path: path.join('uploads', file.filename),  // Path to the file
      size: file.size,  // File size
      mimeType: file.mimetype,  // MIME type
    };
  }

  const provider = await UserModel.findById(providerId);
  if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
  }
  provider.complaints += 1;
  await provider.save();
  // Save the complaint data in MongoDB
  const newComplaint = new Complaint({
    customerId,  // Link the complaint to the logged-in customer
    providerName,
    providerRole,
    providerId, 
    complaintDescription,
    file: fileData,  // Include the file data if a file was uploaded
    status: 'pending',
  });

  newComplaint
    .save()
    .then((complaint) => res.status(201).json({ message: 'Complaint created successfully', complaint }))
    .catch((err) => res.status(500).json({ error: 'Failed to save complaint', err }));
};


export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("customerId", "name") //  only get customer name
      .sort({ createdAt: -1 }); // latest first (optional)

    res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};