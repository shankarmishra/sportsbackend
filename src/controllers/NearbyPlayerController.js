const User = require("../models/userModel");
const { sendNotification } = require("../utils/notificationUtils");

// Helper: Haversine formula to calculate distance between two lat/lon points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Controller: Find nearby players and notify them
exports.findNearbyPlayersAndNotify = async (req, res) => {
  const { latitude, longitude, game, time, address } = req.body;

  try {
    // Validate required fields
    if (!latitude || !longitude || !game || !time || !address) {
      return res.status(400).json({
        message: "latitude, longitude, game, time, and address are required",
      });
    }

    // Find users with matching favorite games
    const users = await User.find({
      favoriteGames: { $in: [game] },
    });

    // Function to filter users within a given radius
    const filterNearbyPlayers = (radius) => {
      return users.filter((user) => {
        if (!user.location || !user.location.coordinates) return false;
        const [userLat, userLon] = user.location.coordinates; // Assumes format [lat, lon]
        const distance = calculateDistance(latitude, longitude, userLat, userLon);
        return distance <= radius;
      });
    };

    // First attempt: Find players within 3 km
    let nearbyPlayers = filterNearbyPlayers(3);

    // If no players found, increase the radius to 7 km
    if (nearbyPlayers.length === 0) {
      console.log("No players found within 3 km. Increasing radius to 7 km...");
      nearbyPlayers = filterNearbyPlayers(7);
    }

    if (nearbyPlayers.length === 0) {
      return res.status(404).json({
        message: "No players found within 7 km for this game",
      });
    }

    // Send notifications to matched players
    await Promise.all(
      nearbyPlayers.map((player) =>
        sendNotification(player.email, {
          subject: `Game Invitation: ${game}`,
          text: `You're invited to play ${game} at ${time} near ${address}!`,
        })
      )
    );

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
