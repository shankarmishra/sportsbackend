const User = require("../models/userModel");
const { sendNotification } = require("../utils/notificationUtils");
const mapServices = require("../../services/mapservices");

// Controller: Find nearby players and notify them
exports.findNearbyPlayersAndNotify = async (req, res) => {
  try {
    const { latitude, longitude } = req.body.location;
    const time = req.body.time;
    const game = req.body.game;

    // Validate required fields
    if (!latitude || !longitude || !game) {
      return res.status(400).json({ message: "Missing required fields (latitude, longitude, or game)." });
    }

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    console.log("Game:", game);

    // Find players within a specific radius (e.g., 10 km)
    const nearbyPlayers = await User.find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [longitude, latitude],
            10 / 3963.2 // 10 kilometers radius
          ]
        }
      },
      favoriteGames: game,
    });

    if (nearbyPlayers.length > 0) {
      // Send notification to each player found
      for (let player of nearbyPlayers) {
        await sendNotification(player.email, {
          subject: "Nearby players found for your game!",
          text: `Hey, there are players nearby who play ${game}.`,
          html: `<p>Hey, there are players nearby who play <strong>${game}</strong>.</p>`
        });
      }

      return res.status(200).json({
        message: `${nearbyPlayers.length} players found and notified.`,
        players: nearbyPlayers,
      });
    } else {
      return res.status(404).json({ message: "No nearby players found." });
    }
  } catch (error) {
    console.error("Error finding and notifying nearby players:", error);
    res.status(500).json({ message: "Server error, could not notify players." });
  }
};

// Controller: Get nearby players within a specified radius
exports.getNearbyPlayers = async (req, res) => {
  const { latitude, longitude, radius, game } = req.query;

  try {
    // Validate required inputs
    if (!latitude || !longitude || !radius || !game) {
      return res.status(400).json({ message: "Missing required fields (latitude, longitude, radius, or game)." });
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
    // Validate required fields
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
    const players = await User.find({ favoriteGames: gameType });

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
