// Backend/models/Otp.model.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["password", "emailChange"], required: true },
  otp: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // e.g. { newEmail: "..." }
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Optional TTL index (Mongo will remove expired docs)
// NOTE: If you prefer not to auto-delete, remove this index.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);
