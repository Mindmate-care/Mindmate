import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Caretaker from "../models/Caretaker.model.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user
    let user = await User.findById(decoded.id).select("-password");
    if (!user) {
      // Try to find caretaker
      user = await Caretaker.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User or Caretaker not found" });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default auth;
