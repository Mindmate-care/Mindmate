import express from "express";
import { getUsers, getMessages, sendMessage,updateProfile } from "../controllers/chat.controller.js";
import auth from "../middleware/auth.js";
import Chat from "../models/Chat.model.js";
import mongoose from "mongoose";

const router = express.Router();

// ✅ All routes are protected
router.get("/", auth, getUsers);
router.get("/messages/:receiverId", auth, getMessages);
router.post("/send", auth, sendMessage);
router.post("/updateProfile", auth, updateProfile);


// ✅ Count unique interactions (people this user has chatted with)
// ✅ Count total & today unique interactions

router.get("/interactions", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count total interactions (all messages sent or received)
    const totalInteractions = await Chat.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    // Count today's interactions
    const todayInteractions = await Chat.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      createdAt: { $gte: today },
    });

    res.json({
      totalInteractions,
      todayInteractions,
    });
  } catch (err) {
    console.error("Error counting interactions:", err);
    res.status(500).json({ error: "Server error counting interactions" });
  }
});

export default router;

