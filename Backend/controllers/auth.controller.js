// Backend/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Otp from "../models/Otp.model.js";
import { sendMail } from "../config/emailservice.js";

const JWT_SECRET = process.env.JWT_SECRET || "mysecretdevkey";

// ---------------- EXISTING AUTH FUNCTIONS ----------------
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const googleRegister = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: "Email is required" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ message: "Google registration/login successful", token, user });
  } catch (err) {
    console.error("Google registration error:", err);
    res.status(500).json({ message: "Server error during Google registration" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials (user not found)" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials (wrong password)" });

    try {
      await User.findByIdAndUpdate(user._id, {
        $inc: { "profile.totalLogins": 1, "profile.points": 2 },
        $push: {
          "profile.activities": {
            type: "login",
            title: "Successful login",
            time: new Date().toISOString(),
            points: 2,
          },
        },
      });
    } catch (e) {
      console.error("Failed to update login stats:", e);
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    const updatedUser = await User.findById(user._id).select("-password");
    res.json({ token, user: updatedUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};
// POST /auth/logout
const logout = async (req, res) => {
  try {
    // Optionally, you could store blacklisted tokens in DB here
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("logout error:", err);
    res.status(500).json({ message: "Failed to logout" });
  }
};

// Legacy (currentPassword) changePassword kept intact
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ message: "Password changed Successfully" });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
};

// PUT /auth/update-basic
const updateBasicProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware
    const { name, photo } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: name, 
          photo: photo,
        },
      },
      { new: true } // return updated values
    ).select("-password");

    return res.json({
      success: true,
      message: "Profile updated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update basic profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// Settings/profile functions (kept)
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings");
    res.json(user.settings || {});
  } catch (err) {
    console.error("getSettings error:", err);
    res.status(500).json({ message: "Error fetching settings" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { settings: req.body }, { new: true, select: "settings" });
    res.json(user.settings);
  } catch (err) {
    console.error("updateSettings error:", err);
    res.status(500).json({ message: "Error updating settings" });
  }
};

const changeUserName = async (req, res) => {
  try {
    const { newUserName } = req.body;
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, { name: newUserName }, { new: true });
    res.status(200).json({ message: "Username changed successfully" });
  } catch (err) {
    console.error("changeUserName error:", err);
    res.status(500).json({ message: "Something is wrong" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("profile");
    res.json(user.profile || {});
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { profile: req.body }, { new: true, select: "profile" });
    res.json(user.profile);
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// ---------------- NEW: OTP / privacy endpoints ----------------

// generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /auth/privacy/request-otp  (password change OTP)
const requestPasswordOtp = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await Otp.create({ user: user._id, type: "password", otp: otpCode, expiresAt });

    const subject = "Your password change OTP";
    const text = `Your OTP for password change is: ${otpCode}. It expires in 15 minutes. If you didn't request this, ignore this email.`;
    await sendMail({ to: user.email, subject, text });

    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("requestPasswordOtp error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// POST /auth/privacy/reset  (body: { otp, newPassword })
const resetPasswordWithOtp = async (req, res) => {
  try {
    const user = req.user;
    const { otp, newPassword } = req.body;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!otp || !newPassword) return res.status(400).json({ message: "OTP and newPassword required" });
    if (typeof newPassword !== "string" || newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const record = await Otp.findOne({ user: user._id, otp, type: "password", used: false }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: "OTP has expired" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashed });

    record.used = true;
    await record.save();

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("resetPasswordWithOtp error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// POST /auth/privacy/request-email-change  (body: { newEmail })
const requestEmailChangeOtp = async (req, res) => {
  try {
    const user = req.user;
    const { newEmail } = req.body;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) return res.status(400).json({ message: "Enter a valid new email address." });

    const existing = await User.findOne({ email: newEmail.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await Otp.create({ user: user._id, type: "emailChange", otp: otpCode, data: { newEmail: newEmail.toLowerCase() }, expiresAt });

    const subject = "Confirm your email change - OTP";
    const text = `You requested to change your account email to ${newEmail}. Use this OTP to confirm the change: ${otpCode}. Expires in 15 minutes.`;
    await sendMail({ to: user.email, subject, text });

    res.json({ message: "OTP sent to your current email." });
  } catch (err) {
    console.error("requestEmailChangeOtp error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// POST /auth/privacy/confirm-email  (body: { otp })
const confirmEmailChange = async (req, res) => {
  try {
    const user = req.user;
    const { otp } = req.body;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!otp) return res.status(400).json({ message: "OTP required" });

    const record = await Otp.findOne({ user: user._id, otp, type: "emailChange", used: false }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: "OTP has expired" });

    const newEmail = (record.data && record.data.newEmail) || null;
    if (!newEmail) return res.status(400).json({ message: "No new email attached to OTP" });

    const existing = await User.findOne({ email: newEmail });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    await User.findByIdAndUpdate(user._id, { email: newEmail });

    record.used = true;
    await record.save();

    res.json({ message: "Email changed successfully.", email: newEmail });
  } catch (err) {
    console.error("confirmEmailChange error:", err);
    res.status(500).json({ message: "Failed to confirm email change" });
  }
};

// export
export default {
  register,
  login,
  googleRegister,
  changePassword,
  changeUserName,
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
  // privacy OTP endpoints:
  requestPasswordOtp,
  resetPasswordWithOtp,
  requestEmailChangeOtp,
  confirmEmailChange,
  logout,
  updateBasicProfile,

};
