// assessment.controller.js
import User from "../models/User.model.js";

export const submitAssessment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id;
    const { scores } = req.body;

    if (!scores) {
      return res.status(400).json({ message: "Scores are required" });
    }

    // ✅ compute lowest score categories only
    const entries = Object.entries(scores); // [ ['brain', 40], ... ]
    const minScore = Math.min(...entries.map(([, v]) => v));
    let weakAreas = entries
      .filter(([, v]) => v === minScore) // only categories with min score
      .map(([k]) => k);

    // fallback if all 0 (or any edge case)
    if (weakAreas.length === 0) {
      weakAreas = ["logic"];
    }

    const totalPoints = Object.values(scores).reduce(
      (sum, val) => sum + val,
      0
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isAssessmentCompleted: true,
          weakAreas: weakAreas,
          "profile.points": totalPoints,
          "assessment.brain": scores.brain,
          "assessment.math": scores.math,
          "assessment.logic": scores.logic,
          "assessment.puzzle": scores.puzzle,
          "assessment.concentration": scores.concentration,
        },
        $push: {
          assessmentHistory: {
            scores: {
              brain: scores.brain,
              math: scores.math,
              logic: scores.logic,
              puzzle: scores.puzzle,
              concentration: scores.concentration,
            },
            weakAreas: weakAreas,
          },
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Assessment submitted successfully",
      user: updatedUser, // ✅ contains isAssessmentCompleted: true
    });
  } catch (err) {
    console.error("Assessment submit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
