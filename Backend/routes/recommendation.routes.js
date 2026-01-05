import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import recommendationController from "../controllers/recommendation.controller.js";

const router = express.Router();

router.get(
  "/games",
  verifyToken,
  recommendationController.getRecommendedGames
);

export default router;
