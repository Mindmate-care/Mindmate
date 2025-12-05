import User from "../models/User.model.js";
import Chats from "../models/Chat.model.js";

// ✅ Get all users except current one
export const getUsers = async (req, res) => {
  try {
    // Always use _id, not id
    const excludeId = req.user._id;
    const users = await User.find({ _id: { $ne: excludeId } }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get messages between current user and another user
export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const messages = await Chats.find({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id },
      ],
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Send a new message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, message, receiverType } = req.body; // ✅ include receiverType

    if (!receiverId || !message || !receiverType) {
      return res.status(400).json({ message: "receiverId, message, and receiverType are required" });
    }

    const chatMessage = await Chats.create({
      sender: senderId,
      receiver: receiverId,
      receiverType,
      message,
    });

    res.json(chatMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: error.message });
  }
};


// ✅ Update user profile (e.g., increment points, add activity)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { "profile.points": 1 },
        $push: {
          "profile.activities": {
            type: "message_sent",
            title: "Message sent",
            time: new Date(),
          },
        },
      },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
