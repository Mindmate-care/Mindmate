import express from "express";
import { 
  getCaretakers, 
  getPatients, 
  assignPatient, 
  caretakerLogin, 
  getCaretakerProfile, 
  updateProfile, 
  getCaretakerSettings, 
  putCaretakerSettings,
  // ✅ ADDED: Privacy endpoints
  requestOtp, 
  resetPassword, 
  requestEmailChange, 
  confirmEmailChange 
} from "../controllers/caretaker.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", caretakerLogin);

// Protected routes
router.get("/", auth, getCaretakers);
router.get("/:id/patients", auth, getPatients);
router.post("/assign", auth, assignPatient);

// ✅ FIXED: Profile routes (matches frontend)
router.get("/profile", auth, getCaretakerProfile);
router.post("/updateProfile", auth, updateProfile);

// ✅ FIXED: Settings routes (no duplicates)
router.get("/settings", auth, getCaretakerSettings);
router.put("/settings", auth, putCaretakerSettings);

// ✅ NEW: Privacy routes (for Settings.jsx OTP flows)
router.post("/privacy/request-otp", auth, requestOtp);
router.post("/privacy/reset", auth, resetPassword);
router.post("/privacy/request-email-change", auth, requestEmailChange);
router.post("/privacy/confirm-email", auth, confirmEmailChange);

export default router;
