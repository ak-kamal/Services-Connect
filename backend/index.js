import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import jwt from "jsonwebtoken";

import "./db.js";
import "./cronJobs/slotCron.js";

import authRouter from "./routes/AuthRoutes.js";
import providerRouter from "./routes/ProviderRoutes.js";
import offerRouter from "./routes/offerRoutes.js";
import slotRouter from "./routes/slotRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

import User from "./models/User.js";
import Message from "./models/Message.js";
import Offer from "./models/Offer.js";

import chatRouter from "./routes/chatRoutes.js";
import providerTrustRouter from "./routes/providerTrustRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
//  1. RAW webhook FIRST (only this route)
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

//  2. JSON parser for everything else
app.use(express.json());

//  3. Now register routes
app.use('/api/payment', paymentRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/auth", authRouter);
app.use("/api", providerRouter);
app.use("/api", offerRouter);
app.use("/api", slotRouter);
app.use("/api", messageRouter);
app.use("/api", chatRouter);
// ─── Socket.io ────────────────────────────────────────────────────────────────

// Auth middleware: verify JWT and attach user info to socket
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).select("name email role");
    if (!user) return next(new Error("User not found"));

    socket.user = {
      _id: decoded._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  // Join the room for a specific offer conversation
  socket.on("join_room", (offerId) => {
    socket.join(offerId);
  });

  // Leave the room when chat is closed
  socket.on("leave_room", (offerId) => {
    socket.leave(offerId);
  });

  // Handle incoming messages
  socket.on("send_message", async ({ offerId, content }) => {
    try {
      if (!content?.trim()) return;

      // Security: only participants of the offer can send messages
      const offer = await Offer.findById(offerId);
      if (!offer) return;

      const isParticipant =
        offer.customerId.toString() === socket.user._id ||
        offer.providerId.toString() === socket.user._id;

      if (!isParticipant) return;

      const message = await Message.create({
        offerId,
        senderId: socket.user._id,
        senderName: socket.user.name,
        content: content.trim(),
      });

      // Broadcast to everyone in the room (including sender so their UI updates)
      io.to(offerId).emit("receive_message", {
        _id: message._id,
        senderId: socket.user._id,
        senderName: socket.user.name,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error("send_message error:", err.message);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});