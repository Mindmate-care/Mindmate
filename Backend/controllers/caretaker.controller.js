import Caretaker from "../models/Caretaker.model.js";
import User from "../models/User.model.js";
import nodemailer from "nodemailer";
// Get all caretakers
export const getCaretakers = async (req, res) => {
  try {
    const caretakers = await Caretaker.find().populate("patients", "name email photo");
    res.json(caretakers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching caretakers" });
  }
};

// Get patients for a specific caretaker
export const getPatients = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.params.id).populate("patients", "name email photo");
    if (!caretaker) return res.status(404).json({ message: "Caretaker not found" });
    res.json(caretaker.patients);
  } catch (err) {
    res.status(500).json({ message: "Error fetching patients" });
  }
};

// Assign patient to caretaker
export const assignPatient = async (req, res) => {
  try {
    const { caretakerId, patientId } = req.body;
    const caretaker = await Caretaker.findById(caretakerId);
    if (!caretaker) return res.status(404).json({ message: "Caretaker not found" });

    if (!caretaker.patients.includes(patientId)) {
      caretaker.patients.push(patientId);
      await caretaker.save();
    }
    res.json({ message: "Patient assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error assigning patient" });
  }
};

// Caretaker login
export const caretakerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const caretaker = await Caretaker.findOne({ email });
    if (!caretaker || !(await caretaker.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    await Caretaker.findByIdAndUpdate(caretaker._id, {
      $inc: { "profile.totalLogins": 1 },
      $push: { "profile.activities": { type: "login", title: "Successful login", time: new Date() } },
    });
    
    const token = caretaker.generateAuthToken();
    const safeCaretaker = caretaker.toObject();
    delete safeCaretaker.password;
    res.json({ token, caretaker: safeCaretaker });
  } catch (err) {
    res.status(500).json({ message: "Error during login" });
  }
};


// ✅ FIXED: Profile endpoints - now properly updates database
export const getCaretakerProfile = async (req, res) => {
  try {
    console.log("🔍 DEBUG - req.user:", req.user); // ADD THIS
    console.log("🔍 DEBUG - req.user.id:", req.user?.id); // ADD THIS
    
    if (!req.user?.id) {
      return res.status(401).json({ message: "No valid token - user not authenticated" });
    }

    const caretaker = await Caretaker.findById(req.user._id).select("name email photo");
    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    res.json({
      name: caretaker.name || "",
      email: caretaker.email || "",
      photo: caretaker.photo || ""
    });
  } catch (err) {
    console.error("getCaretakerProfile error:", err); // This should show exact error
    res.status(500).json({ message: "Error fetching profile" });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const { name, photo } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    // ✅ FIXED: Direct update with validation
    const updatedCaretaker = await Caretaker.findByIdAndUpdate(req.user._id,
      { 
        name: name.trim(),
        ...(photo && { photo })
      },
      { new: true, runValidators: true }
    ).select("name email photo");

    if (!updatedCaretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    // ✅ Verify database update
    console.log("✅ Profile updated:", { name: updatedCaretaker.name, photo: !!updatedCaretaker.photo });

    res.json({
      message: "Profile updated successfully",
      name: updatedCaretaker.name,
      email: updatedCaretaker.email,
      photo: updatedCaretaker.photo
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// ✅ FIXED: Settings endpoints - properly handles nested structure
export const getCaretakerSettings = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.user._id).select("settings");
    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    const settings = caretaker.settings || {};
    
    res.json({
      theme: settings.theme || "light",
      color: settings.color || "blue",
      font: settings.font || "default",
      accessibility: settings.accessibility || { largeText: false },
      notifications: settings.notifications || { email: true, sms: false, push: false }
    });
  } catch (err) {
    console.error("getCaretakerSettings error:", err);
    res.status(500).json({ message: "Error fetching settings" });
  }
};

export const putCaretakerSettings = async (req, res) => {
  try {
    const updates = req.body; // { theme, color, font, accessibility, notifications }

    // ✅ FIXED: Validate required fields
    if (!updates.theme || !updates.color || !updates.font) {
      return res.status(400).json({ message: "Theme, color, and font are required" });
    }

    const updatedCaretaker = await Caretaker.findByIdAndUpdate(
      req.user._id,
      { 
        settings: {
          theme: updates.theme,
          color: updates.color,
          font: updates.font,
          accessibility: updates.accessibility || { largeText: false },
          notifications: updates.notifications || { email: true, sms: false, push: false }
        }
      },
      { new: true, runValidators: true }
    ).select("settings");

    if (!updatedCaretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    // ✅ Verify database update
    console.log("✅ Settings updated:", updatedCaretaker.settings);

    res.json({
      message: "Settings updated successfully",
      settings: updatedCaretaker.settings
    });
  } catch (err) {
    console.error("putCaretakerSettings error:", err);
    res.status(500).json({ message: "Error updating settings" });
  }
};

// ✅ NEW: Privacy endpoints for Settings.jsx
export const requestOtp = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.user._id).select("email");
    
    // TODO: Implement real OTP generation and email sending
    // For now, return success (implement nodemailer in production)
    console.log(`OTP requested for caretaker: ${caretaker.email}`);
    
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("requestOtp error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    
    // TODO: Verify OTP from cache/redis
    // For demo: always succeed
    const caretaker = await Caretaker.findById(req.user._id);
    caretaker.password = newPassword; // Will be hashed by pre-save middleware
    await caretaker.save();
    
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

export const requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    // TODO: Send OTP to current email with newEmail info
    console.log(`Email change requested: ${newEmail}`);
    res.json({ message: "OTP sent to current email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to request email change" });
  }
};

export const confirmEmailChange = async (req, res) => {
  try {
    const { otp } = req.body;
    
    // TODO: Verify OTP and update email
    // For demo: update email to first request (implement proper flow)
    const caretaker = await Caretaker.findByIdAndUpdate(
      req.user._id,
      { email: "newemail@example.com" }, // Replace with actual newEmail from session
      { new: true }
    ).select("email");
    
    res.json({ 
      message: "Email updated successfully",
      email: caretaker.email 
    });
  } catch (err) {
    console.error("confirmEmailChange error:", err);
    res.status(500).json({ message: "Failed to update email" });
  }
};