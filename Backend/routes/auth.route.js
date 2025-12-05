// Backend/routes/auth.route.js
import express from "express";
import authController from "../controllers/auth.controller.js";
import auth from "../middleware/auth.js";
import verifyToken from "../middleware/verifyToken.js";

const authrouter = express.Router();

authrouter.post("/register", authController.register);
authrouter.post("/login", authController.login);
authrouter.post("/googleRegister", authController.googleRegister);
authrouter.post("/changeUserName", auth, authController.changeUserName);
authrouter.post("/changePassword", auth, authController.changePassword);

// SETTINGS ROUTES
authrouter.get("/settings", verifyToken, authController.getSettings);
authrouter.put("/settings", verifyToken, authController.updateSettings);


// Profiles
authrouter.get("/profile", auth, authController.getProfile);
authrouter.put("/profile", auth, authController.updateProfile);

// ---------- Privacy / OTP endpoints used by frontend ----------
authrouter.post("/privacy/request-otp", auth, authController.requestPasswordOtp);
authrouter.post("/privacy/reset", auth, authController.resetPasswordWithOtp);

authrouter.post("/privacy/request-email-change", auth, authController.requestEmailChangeOtp);
authrouter.post("/privacy/confirm-email", auth, authController.confirmEmailChange);

authrouter.put("/update-basic",auth, authController.updateBasicProfile);


export default authrouter;
