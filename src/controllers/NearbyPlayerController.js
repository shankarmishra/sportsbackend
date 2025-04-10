const User = require("../models/userModel");
const { sendNotification } = require("../utils/notificationUtils");
const mapServices = require("../../services/mapservices");

// Controller: Find nearby players and notify them
exports.findNearbyPlayersAndNotify = async (req, res) => {
  const { latitude, longitude, game, time, address } = req.body;

  try {
    // 1. Validate required inputs
    if (!latitude || !longitude || !game || !time || !address) {
      return res.status(400).json({
        message: "latitude, longitude, game, time, and address are required",
      });
    }

    // 2. Find nearby players using map service
    let nearbyPlayers = await mapServices.getNearbyUsers(latitude, longitude, 3, game);

    // 3. If none found within 3 km, expand to 7 km
    if (nearbyPlayers.length === 0) {
      console.log("No players within 3 km, expanding to 7 km...");
      nearbyPlayers = await mapServices.getNearbyUsers(latitude, longitude, 7, game);
    }

    // 4. If still none found
    if (nearbyPlayers.length === 0) {
      return res.status(404).json({
        message: "No players found within 7 km for this game",
      });
    }

    // 5. Send notifications
    await Promise.all(
      nearbyPlayers.map((player) =>
        sendNotification(player.email, {
          subject: `Game Invitation: ${game}`,
          text: `You're invited to play ${game} at ${time} near ${address}. Tap to join!`,
        })
      )
    );

    // 6. Respond with success
    res.status(200).json({
      message: `Notifications sent to ${nearbyPlayers.length} players.`,
      players: nearbyPlayers,
    });
  } catch (err) {
    console.error("Error in finding nearby players:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Controller: Get nearby players within a specified radius
exports.getNearbyPlayers = async (req, res) => {
  const { latitude, longitude, radius, game } = req.query;

  try {
    // Validate required inputs
    if (!latitude || !longitude || !radius || !game) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get players from map service
    const players = await mapServices.getNearbyUsers(latitude, longitude, radius, game);

    if (players.length === 0) {
      return res.status(404).json({
        message: `No players found within ${radius} km for ${game}`,
      });
    }

    res.status(200).json({
      message: `Found ${players.length} players.`,
      players,
    });
  } catch (err) {
    console.error("Error getting nearby players:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Controller: Update player location
exports.updatePlayerLocation = async (req, res) => {
  const { userId, latitude, longitude } = req.body;

  try {
    if (!userId || !latitude || !longitude) {
      return res.status(400).json({
        message: "User ID, latitude, and longitude are required",
      });
    }

    // Update player's location in the database
    const updatedPlayer = await User.findByIdAndUpdate(userId, { latitude, longitude }, { new: true });

    if (!updatedPlayer) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json({
      message: "Player location updated successfully",
      player: updatedPlayer,
    });
  } catch (err) {
    console.error("Error updating player location:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Controller: Get players by game type
exports.getPlayersByGame = async (req, res) => {
  const { gameType } = req.params;

  try {
    // Get players by game type
    const players = await User.find({ game: gameType });

    if (players.length === 0) {
      return res.status(404).json({
        message: `No players found for the game type: ${gameType}`,
      });
    }

    res.status(200).json({
      message: `Found ${players.length} players for ${gameType}`,
      players,
    });
  } catch (err) {
    console.error("Error fetching players by game type:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
