import Games from "../models/games.model.js";
import User from "../models/User.model.js";

const getRecommendedGames = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const weakAreas = user.weakAreas || [];

    let recommendedGames = [];

    if (weakAreas.length > 0) {
      recommendedGames = await Games.find({
        category: { $in: weakAreas },
      }).sort({ rating: -1 });
    }

    const otherGames = await Games.find({
      category: { $nin: weakAreas },
    });

    res.json({
      recommended: recommendedGames,
      others: otherGames,
    });
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
};

export default { getRecommendedGames };
