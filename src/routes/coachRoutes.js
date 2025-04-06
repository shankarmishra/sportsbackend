const express = require("express");
const {
  registerCoach,
  loginCoach,
  getCoachProfile,
  updateCoachProfile,
} = require("../controllers/coachController");
const { protect } = require("../middleware/authMiddleware"); // Protect routes

const router = express.Router();

// Coach registration
router.post("/register", registerCoach);

// Coach login
router.post("/login", loginCoach);

// Get coach profile (protected)
router.get("/profile", protect, getCoachProfile);

// Update coach profile (protected)
router.put("/profile", protect, updateCoachProfile);

module.exports = router;