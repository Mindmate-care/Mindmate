import express from "express";
import Chat from "../models/Chat.model.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /caretaker/chat/interactions
 * @desc    Get count of unique users who interacted (chatted) with this caretaker
 * @access  Private (Caretaker only)
 */
router.get("/interactions", auth, async (req, res) => {
  try {
    const caretakerId = req.user._id; // Use _id instead of id

    // Aggregate unique users who chatted with caretaker
    const uniqueUsers = await Chat.aggregate([
      {
        $match: {
          $or: [
            { sender: caretakerId },
            { receiver: caretakerId },
          ],
        },
      },
      {
        $project: {
          user: {
            $cond: [
              { $eq: ["$sender", caretakerId] },
              "$receiver",
              "$sender",
            ],
          },
        },
      },
      {
        $group: { _id: "$user" },
      },
    ]);

    // Return count of unique chat partners
    return res.status(200).json({ count: uniqueUsers.length });
  } catch (err) {
    console.error("Error fetching caretaker interactions:", err.message);
    res.status(500).json({ message: "Server error while fetching interactions" });
  }
});

// Get total chat messages count for caretaker
router.get("/messages/count", auth, async (req, res) => {
  try {
    const caretakerId = req.user._id;
    
    // Count all messages where caretaker is sender
    const totalMessages = await Chat.countDocuments({ sender: caretakerId });
    
    res.json({ count: totalMessages });
  } catch (err) {
    console.error("Error fetching caretaker message count:", err.message);
    res.status(500).json({ message: "Server error while fetching message count" });
  }
});

// New route: interactions for today only
router.get("/interactions/today", auth, async (req, res) => {
  try {
    const caretakerId = req.user._id; // Use _id instead of id
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueUsersToday = await Chat.aggregate([
      {
        $match: {
          $or: [
            { sender: caretakerId },
            { receiver: caretakerId },
          ],
          createdAt: { $gte: today }, // only chats created today
        },
      },
      {
        $project: {
          user: {
            $cond: [
              { $eq: ["$sender", caretakerId] },
              "$receiver",
              "$sender",
            ],
          },
        },
      },
      { $group: { _id: "$user" } },
    ]);

    res.json({ count: uniqueUsersToday.length });
  } catch (err) {
    console.error("Error fetching today's interactions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/interactions/today/users", auth, async (req, res) => {
  try {
    const caretakerId = req.user._id; // Use _id instead of id
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const chatsToday = await Chat.aggregate([
      {
        $match: {
          $or: [
            { sender: caretakerId },
            { receiver: caretakerId },
          ],
          createdAt: { $gte: today },
        },
      },
      {
        $project: {
          user: {
            $cond: [
              { $eq: ["$sender", caretakerId] },
              "$receiver",
              "$sender",
            ],
          },
        },
      },
      { $group: { _id: "$user" } },
    ]);
    // Return array of patient user IDs chatted today
    res.json({ userIds: chatsToday.map(u => u._id) });
  } catch (err) {
    console.error("Error fetching today's chatted patient IDs:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;