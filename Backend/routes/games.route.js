import express from "express";
import gamesController from "../controllers/games.controller.js";
import auth from "../middleware/auth.js";
const gamesrouter = express.Router();

gamesrouter.get("/all", gamesController.getAllGames);
gamesrouter.get("/:id", gamesController.getGameById);
// record play (protected)
gamesrouter.post("/:id/play", auth, gamesController.playGame);

export default gamesrouter;