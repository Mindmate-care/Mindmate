// ...existing code...
import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    date: String,
    earned: Boolean,
    progress: Number,
    icon: String,
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    name: String,
    level: Number,
    maxLevel: Number,
    progress: Number,
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    type: String,
    title: String,
    time: String,
    points: Number,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: { type: String, default: "User" },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  level: { type: Number, default: 1 },
  photo: { type: String },
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
  profile: {
    achievements: { type: [achievementSchema], default: [] },
    points: { type: Number, default: 0 },
    skills: { type: [skillSchema], default: [] },
    activities: { type: [activitySchema], default: [] },
    // added counters
    totalLogins: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    chatMessages: { type: Number, default: 0 },
  },
});

const User = mongoose.model("User", userSchema);
export default User;
// ...existing code...