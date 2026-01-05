import express from "express";
import { submitAssessment } from "../controllers/assessment.controller.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// submit assessment
router.post("/submit", authMiddleware, submitAssessment);

export default router;
