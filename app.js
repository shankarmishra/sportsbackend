const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/userRoutes");
const nearbyPlayerRoutes = require("./src/routes/nearbyplayerRoutes"); // Import Nearby Player routes
const coachRoutes = require("./src/routes/coachRoutes"); // Import Coach routes
const tournamentRoutes = require("./src/routes/tournamentRoutes"); // Import Tournament routes
const { protect } = require("./src/middleware/authMiddleware"); // Import the protect middleware

dotenv.config(); // Load environment variables

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies
app.use(morgan("dev")); // Log HTTP requests

// Routes
app.use("/api/users", userRoutes);
app.use("/api/nearby-players", nearbyPlayerRoutes); // Add Nearby Player routes
app.use("/api/coaches", coachRoutes); // Add Coach routes
app.use("/api/tournaments", tournamentRoutes); // Add Tournament routes

// Root route
app.get("/", (req, res) => {
  res.send("SPORTSCONNECT API is running...");
});

// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware for invalid JSON payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Invalid JSON:", err.message);
    return res.status(400).json({ message: "Invalid JSON payload" });
  }
  next(err);
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "An internal server error occurred" });
});

module.exports = app;