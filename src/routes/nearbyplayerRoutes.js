const express = require("express");
const { findNearbyPlayersAndNotify } = require("../controllers/NearbyPlayerController");
const { protect } = require("../middleware/authMiddleware"); // Protect routes

const router = express.Router();

// Find nearby players and send notifications
router.post("/notify", protect, findNearbyPlayersAndNotify);

module.exports = router;