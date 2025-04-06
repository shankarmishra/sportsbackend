const express = require("express");
const {
  createTournament,
  getAllTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
} = require("../controllers/tournamentController");
const { protect } = require("../middleware/coachMiddleware"); // Ensure this path is correct

const router = express.Router();

// Create a tournament (protected)
router.post("/", protect, createTournament);

// Get all tournaments
router.get("/", getAllTournaments);

// Get a tournament by ID
router.get("/:id", getTournamentById);

// Update a tournament (protected)
router.put("/:id", protect, updateTournament);

// Delete a tournament (protected)
router.delete("/:id", protect, deleteTournament);

module.exports = router;