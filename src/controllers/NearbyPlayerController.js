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
        try {
          await sendNotification(player.email, {
            subject: `🏸 Let's play ${game}!`,
            text: `Hey ${player.username || ''}, a ${game} match is happening nearby!`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>🎮 Game Alert: ${game}</h2>
                <p>Hey ${player.username || ''},</p>
                <p>A new game session is scheduled near your location!</p>
                <ul>
                  <li><strong>Game:</strong> ${game}</li>
                  <li><strong>Time:</strong> ${time}</li>
                  <li><strong>Place:</strong> Shared location coordinates (${latitude}, ${longitude})</li>
                </ul>
                <p>Would you like to join?</p>
                <a href="https://yourappdomain.com/accept?email=${encodeURIComponent(player.email)}&game=${encodeURIComponent(game)}&time=${encodeURIComponent(time)}&lat=${latitude}&long=${longitude}"
                  style="display:inline-block; padding:10px 15px; background-color:#28a745; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">
                  ✅ Accept Invitation
                </a>
                <p>Happy playing! 🏆</p>
              </div>
            `
          });
        } catch (notificationError) {
          console.error(`Error sending notification to player ${player.email}:`, notificationError);
        }
      }

      // ✅ Respond after sending all notifications
      return res.status(200).json({
        message: `${nearbyPlayers.length} players found and notified.`,
        players: nearbyPlayers,
      });

    } else {
      // ⛔ No players found
      return res.status(404).json({ message: "No nearby players found." });
    }

  } catch (error) {
    console.error("Error finding and notifying nearby players:", error);
    res.status(500).json({ message: "Server error, could not notify players.", error: error.message });
  }
};

// Controller: Get all players

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
exports.acceptGameInvite = async (req, res) => {
  try {
    const { email, game, time, lat, long } = req.query;
    const acceptingPlayer = await User.findOne({ email });

    if (!acceptingPlayer) {
      return res.status(404).json({ message: "Accepting player not found" });
    }

    // Optionally: Find initiator if you track that
    const nearbyPlayers = await User.find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(long), parseFloat(lat)],
            0.1 / 3963.2 // e.g., within 100 meters for initiator
          ]
        }
      },
      favoriteGames: game,
    });

    const initiator = nearbyPlayers.find(p => p.email !== email);
    if (!initiator) {
      return res.status(404).json({ message: "No initiator found nearby to open a chat" });
    }

    // Check if chat room already exists
    let existingRoom = await ChatRoom.findOne({
      participants: { $all: [acceptingPlayer._id, initiator._id] },
      game,
    });

    if (!existingRoom) {
      existingRoom = await ChatRoom.create({
        participants: [acceptingPlayer._id, initiator._id],
        game,
        time,
        location: {
          type: "Point",
          coordinates: [parseFloat(long), parseFloat(lat)],
        },
      });
    }

    res.status(200).json({
      message: "Invitation accepted and chat room opened",
      chatRoom: existingRoom,
    });

  } catch (err) {
    console.error("Error accepting game invite:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
