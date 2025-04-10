const express = require("express");
const {
  findNearbyPlayersAndNotify,
  getNearbyPlayers,
  updatePlayerLocation,
  getPlayersByGame,
} = require("../controllers/NearbyPlayerController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Route to find nearby players and send notifications
router.post("/notify", protect, findNearbyPlayersAndNotify);

// Route to get nearby players within a specified radius
router.get("/nearby", protect, getNearbyPlayers);

// Route to update player's location
router.put("/location", protect, updatePlayerLocation);

// Route to get players by game type
router.get("/game/:gameType", protect, getPlayersByGame);

module.exports = router;
