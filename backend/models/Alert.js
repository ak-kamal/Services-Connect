import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["1", "2"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  details: {
    type: Object,
    default: {},
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Alert = mongoose.model("Alert", alertSchema);
export default Alert;