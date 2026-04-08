// backend/models/Payment.js
import mongoose from "mongoose";

// Define the Payment schema
const paymentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (the customer)
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (the provider)
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentTime: {
    type: Date,
    default: Date.now // Automatically set the current date/time
  }
});

// Create the Payment model
const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;