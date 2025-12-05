import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import cron from "node-cron";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import brevoPkg from "@getbrevo/brevo";

 // ✅ Brevo SDK

// Import Local Modules
import connectDB from "./config/db.js";
import auth from "./middleware/auth.js";
import Chat from "./models/Chat.model.js";
import User from "./models/User.model.js";
import gamesRouter from "./routes/games.route.js";
import authRouter from "./routes/auth.route.js";
import chatRouter from "./routes/chat.route.js";
import caretakerRouter from "./routes/caretaker.route.js";
import caretakerChatRouter from "./routes/caretaker.chatRoutes.js";

dotenv.config();

// ======================================================
// EXPRESS & SOCKET.IO SETUP
// ======================================================
const SibApiV3Sdk = brevoPkg;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://www.mindmates.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

app.use(express.json());
app.use(cors({
  origin: ["https://www.mindmates.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// app.use(cors());

// ======================================================
// DATABASE
// ======================================================
connectDB();

// ======================================================
// ROUTES
// ======================================================
app.get("/", (req, res) => res.send("🚀 MindMate Backend with Brevo running!"));
app.use("/api/games", gamesRouter);
app.use("/api/auth", authRouter);
app.use("/api/chat", auth, chatRouter);
app.use("/api/caretaker", caretakerRouter);
app.use("/api/caretaker/chat", caretakerChatRouter);

// ======================================================
// SOCKET.IO HANDLING
// ======================================================
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id || decoded._id;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.userId);
  socket.join(String(socket.userId));

  socket.on("send_message", async ({ receiver, receiverType, message }) => {
    try {
      if (!receiver || !message?.trim()) return;

      if (!mongoose.Types.ObjectId.isValid(receiver)) {
        console.log("❌ Invalid receiver ObjectId:", receiver);
        return;
      }

      const normalizedType = receiverType?.toLowerCase();
      const chat = await Chat.create({
        sender: socket.userId,
        receiver,
        receiverType: normalizedType,
        message,
      });

      io.to(String(receiver)).emit("receive_message", chat);
      io.to(String(socket.userId)).emit("receive_message", chat);
    } catch (err) {
      console.error("Socket send_message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.userId);
  });
});

// ======================================================
// BREVO EMAIL CONFIGURATION
// ======================================================
const sendBrevoEmail = async (to, subject, html) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "MindMate", email: "care.mindmate@gmail.com" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Brevo email sent to ${to}`, response.data);
  } catch (err) {
    console.error("❌ Brevo email failed:", err.response?.data || err.message);
  }
};

// ======================================================
// CONTACT FORM ROUTE (BREVO USED HERE)
// ======================================================
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ message: "All fields required" });

  try {
    // Admin Notification
    await sendBrevoEmail(
      "care.mindmate@gmail.com",
      `📩 New Contact Message from ${name}`,
      `<p><strong>Name:</strong> ${name}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Message:</strong> ${message}</p>`
    );

    // User Acknowledgment
    await sendBrevoEmail(
      email,
      "Thanks for contacting MindMate 💜",
      `<p>Hi ${name},</p>
       <p>Thank you for reaching out to <strong>MindMate</strong>. We’ve received your message and will reply shortly.</p>
       <p>Warm regards,<br/>MindMate Support Team</p>`
    );

    res.json({ message: "Contact message sent successfully!" });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ message: "Failed to send contact message" });
  }
});

// ======================================================
// DAILY EMAIL & PUSH NOTIFICATION (9 AM)
// ======================================================
const sendPushNotification = async (pushToken, message) => {
  try {
    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: pushToken,
      sound: "default",
      title: "🌞 Daily Reminder",
      body: message,
    });
    console.log(`📱 Push sent to ${pushToken}`);
  } catch (err) {
    console.error("Push send failed:", err.response?.data || err.message);
  }
};

cron.schedule("0 9 * * *", async () => {
  console.log("🕘 Running daily reminder task...");

  try {
    const users = await User.find({
      $or: [
        { "settings.notifications.email": true },
        { "settings.notifications.push": true },
      ],
    });

    for (const user of users) {
      const name = user.name || "MindMate User";
      const message = `Hello ${name}! 🌞 Don't forget to log in to MindMate today!`;

      if (user.settings?.notifications?.email)
        await sendBrevoEmail(user.email, "MindMate Daily Login Reminder 🌞", `<p>${message}</p>`);

      if (user.settings?.notifications?.push && user.pushToken)
        await sendPushNotification(user.pushToken, message);
    }

    console.log("✅ Daily reminders sent successfully!");
  } catch (err) {
    console.error("Error in daily cron job:", err);
  }
});

// ======================================================
// GEMINI AI CONFIGURATION
// ======================================================
let model;
let geminiAvailable = true;

if (process.env.GEMINI_API_KEY) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log("✅ Gemini AI initialized");
  } catch (err) {
    console.error("❌ Gemini AI init error:", err.message);
    geminiAvailable = false;
  }
} else {
  geminiAvailable = false;
  console.log("⚠️ Gemini API key not found");
}

// ======================================================
// AI CHAT ENDPOINT
// ======================================================
app.post("/api/chat", async (req, res) => {
  if (!geminiAvailable)
    return res.status(501).json({ error: "Gemini AI not available" });

  const { messages } = req.body;
  try {
    const content = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const result = await model.generateContent({ contents: content });
    const response = await result.response.text();

    res.json({ message: { role: "assistant", content: response } });
  } catch (err) {
    console.error("Gemini API error:", err.message || err);
    res.status(200).json({
      message: {
        role: "assistant",
        content: "I'm currently unable to process your request. Please try again later.",
      },
    });
  }
});

// ======================================================
// START SERVER
// ======================================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 MindMate Server (with Brevo + Gemini) running on port ${PORT}`)
);
