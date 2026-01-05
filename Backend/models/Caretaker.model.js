import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const caretakerSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  role: { type: String },
  status: { type: String, default: "Available" },
  phone: { type: String, required: true },
  specialties: [{ type: String }],
  initials: { type: String },
  rating: { type: Number, default: 0 },
  experience: { type: String },
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  email: { type: String, unique: true, required: true },
  photo: { type: String },
  password: { type: String, required: true },
  profile: {
    totalLogins: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    chatMessages: { type: Number, default: 0 },
    activities: [{
      type: { type: String },
      time: { type: Date, default: Date.now },
      title: { type: String },
    }]
  },
  // ✅ FIXED: Ensure settings has proper defaults
  settings: {
    theme: { type: String, default: "light" },
    color: { type: String, default: "blue" },
    font: { type: String, default: "default" },
    accessibility: {
      largeText: { type: Boolean, default: false },
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },
  },
}, { timestamps: true });

// Password hash middleware
caretakerSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

caretakerSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password.startsWith("$2a$")) {
    return candidatePassword === this.password;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

caretakerSchema.methods.generateAuthToken = function () {
  const payload = { id: this._id, role: "caretaker" };
  const secret = process.env.JWT_SECRET || "changeme";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export default mongoose.model("Caretaker", caretakerSchema); // Collection: "caretakers"
