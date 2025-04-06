const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  googleLogin,
  getUserProfile,
  updateUserProfile,
  getLeaderboard,
} = require("../controllers/userController");

const router = express.Router();

// User registration
router.post("/register", registerUser);

// User login
router.post("/login", loginUser);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password/:token", resetPassword);

// Google login
router.post("/google-login", googleLogin);

// Get user profile
router.get("/profile", getUserProfile);

// Update user profile
router.put("/profile", updateUserProfile);

// Get leaderboard
router.get("/leaderboard", getLeaderboard);

module.exports = router;