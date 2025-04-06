const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/userRoutes");

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

// Root route
app.get("/", (req, res) => {
  res.send("SPORTSCONNECT API is running...");
});

// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "An internal server error occurred" });
});

module.exports = app;