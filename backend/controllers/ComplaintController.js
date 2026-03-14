// /controllers/ComplaintController.js
import Complaint from '../models/Complaint.js';
import path from 'path';

// Create a complaint with or without a file
export const createComplaint = (req, res) => {
  const { customerId, providerName,providerRole, complaintDescription } = req.body;
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

  // Save the complaint data in MongoDB
  const newComplaint = new Complaint({
    customerId,  // Link the complaint to the logged-in customer
    providerName,
    providerRole,
    complaintDescription,
    file: fileData,  // Include the file data if a file was uploaded
    status: 'pending',
  });

  newComplaint
    .save()
    .then((complaint) => res.status(201).json({ message: 'Complaint created successfully', complaint }))
    .catch((err) => res.status(500).json({ error: 'Failed to save complaint', err }));
};