// /models/Complaint.js
import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // Reference to the User collection (customer)
    required: true 
  },
  providerName: { 
    type: String, 
    required: true 
  },
  providerRole: {
  type: String,
  required: true
},
  complaintDescription: { 
    type: String, 
    required: true 
  },
  file: {
    filename: { type: String, default: null },  // Optional: file name
    path: { type: String, default: null },  // Optional: file path
    size: { type: Number, default: null },  // Optional: file size
    mimeType: { type: String, default: null },  // Optional: file MIME type
  },
  status: { 
    type: String, 
    default: 'pending' 
  },
}, { timestamps: true });  // Automatically adds createdAt and updatedAt fields

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;