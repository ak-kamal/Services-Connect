// backend/controllers/PaymentController.js
import Payment from "../models/Payment.js";

// Create a new payment
export const createPayment = async (req, res) => {
  try {
    const { customerId, providerId, amount } = req.body;

    // Validate the request data
    if (!customerId || !providerId || !amount) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create a new payment
    const newPayment = new Payment({
      customerId,
      providerId,
      amount,
      paymentTime: new Date() // Set the payment time to the current date and time
    });

    // Save the payment to the database
    await newPayment.save();

    // Respond with a success message and the payment data
    return res.status(201).json({
      message: "Payment successful",
      payment: newPayment
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};