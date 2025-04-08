const express = require("express");
const {
  createTournament,
  getAllTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  getCoachTournaments, // 👈 Include the new function
} = require("../controllers/tournamentController");

const { protect } = require("../middleware/coachMiddleware");

const router = express.Router();

// Create a tournament (protected)
router.post("/", protect, createTournament);

// Get all tournaments (public)
router.get("/", getAllTournaments);

// ✅ Get tournaments hosted by the logged-in coach (protected)
router.get("/my/tournaments", protect, getCoachTournaments);

// Get a tournament by ID
router.get("/:id", getTournamentById);

// Update a tournament (protected)
router.put("/:id", protect, updateTournament);

// Delete a tournament (protected)
router.delete("/:id", protect, deleteTournament);

module.exports = router;
