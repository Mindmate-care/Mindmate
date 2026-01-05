import mongoose from "mongoose";
import Games from "../models/games.model.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken"
/**
 * GET /api/games/all
 */
export const getAllGames = async (req, res) => {
  try {
    const games = await Games.find({});
    res.status(200).json(games);
  } catch (err) {
    console.error("Error fetching games:", err);
    res.status(500).json({ message: "Server error fetching games" });
  }
};

/**
 * GET /api/games/:id
 * Accepts Mongo _id or numeric/string id field
 */
export const getGameById = async (req, res) => {
  const { id } = req.params;
  try {
    let game = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      game = await Games.findById(id);
    }
    if (!game) {
      game = await Games.findOne({ id: id });
    }
    if (!game) return res.status(404).json({ message: "Game not found" });
    res.status(200).json(game);
  } catch (err) {
    console.error("Error fetching game by ID:", err);
    res.status(500).json({ message: "Server error fetching game by ID" });
  }
};

// ...existing exports...

export const playGame = async (req, res) => {
  try {
    console.log("Recording game play:", req.params.id, req.body);
    const gameId = req.params.id;
    const userId = req.user && (req.user._id || req.user.id) ? (req.user._id || req.user.id) : null;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const minutes = Math.max(0, Math.floor(Number(req.body?.minutes) || 0));

    // get difficulty: prefer client value, else read from DB and extract number from strings like "6/10"
    let difficulty = null;
    if (req.body?.difficulty != null && !Number.isNaN(Number(req.body.difficulty))) {
      difficulty = Number(req.body.difficulty);
    } else {
      const game = mongoose.Types.ObjectId.isValid(gameId) ? await Games.findById(gameId) : await Games.findOne({ id: gameId });
      const raw = game?.difficulty;
      if (raw != null) {
        if (typeof raw === "number") difficulty = Number(raw);
        else if (typeof raw === "string") {
          const m = raw.match(/(\d+(\.\d+)?)/);
          difficulty = m ? Number(m[1]) : 1;
        }
      }
    }
    if (difficulty == null || Number.isNaN(difficulty)) difficulty = 1;
    difficulty = Math.max(0, Math.min(1000, Number(difficulty))); // clamp sensible upper bound

    // compute points: difficulty * minutes (simple spec)
    const computedPoints = Math.round(difficulty * (minutes || 0));

    const activity = {
      type: "game",
      title: req.body?.title || `Played game ${gameId}`,
      time: new Date().toISOString(),
      points: computedPoints,
    };

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          "profile.gamesPlayed": 1,
          "profile.points": computedPoints,
        },
        $push: { "profile.activities": activity },
      },
      { new: true, select: "profile" }
    );

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Play recorded", profile: updated.profile, awarded: computedPoints });
  } catch (err) {
    console.error("Error recording play:", err);
    res.status(500).json({ message: "Server error recording play" });
  }
};

export default { getAllGames, getGameById, playGame };






// ...existing code...

