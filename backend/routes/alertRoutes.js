import express from "express";
import Alert from "../models/Alert.js";

const alertRouter = express.Router();

// GET all alerts (newest first)
alertRouter.get("/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch alerts" });
  }
});

// Mark alert as read
alertRouter.put("/alerts/:alertId/read", async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.alertId, { read: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default alertRouter;