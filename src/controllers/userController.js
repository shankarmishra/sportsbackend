const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register User
exports.registerUser = async (req, res) => {
  const { name, email, password, phone, specialization, experience, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      specialization,
      experience,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `${req.protocol}://${req.get("host")}/api/users/reset-password/${resetToken}`;

    // Send email with resetUrl (use a library like nodemailer)
    res.status(200).json({ message: `Password reset link sent to ${email}`, resetUrl });
  } catch (error) {
    res.status(500).json({ message: "Error processing request", error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error processing request", error: error.message });
  }
};

// Google Login
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password: "google-auth", role: "player" });
    }

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(400).json({ message: "Google login failed", error: error.message });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = req.user; // Populated by the protect middleware

    res.status(200).json({
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      favoriteGames: user.favoriteGames,
      skillLevel: user.skillLevel,
      achievements: user.achievements,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, profileImage, favoriteGames, achievements } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.profileImage = profileImage || user.profileImage;
    user.favoriteGames = favoriteGames || user.favoriteGames;
    user.achievements = achievements || user.achievements;

    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

// Get Leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find().sort({ coins: -1 }).limit(30); // Top 30 users by coins

    // Calculate topDays for each user
    const leaderboard = users.map((user) => {
      const today = new Date();
      const topSince = user.topSince || today; // Assume today if no topSince date
      const topDays = Math.floor((today - topSince) / (1000 * 60 * 60 * 24)); // Calculate days

      return {
        id: user._id,
        name: user.name,
        coins: user.coins,
        topDays: topDays,
      };
    });

    // Find the logged-in user's rank
    const currentUserId = req.user._id.toString();
    const userRankIndex = users.findIndex((user) => user._id.toString() === currentUserId);

    let userRank = null;
    if (userRankIndex !== -1) {
      const user = users[userRankIndex];
      const today = new Date();
      const topSince = user.topSince || today;
      const topDays = Math.floor((today - topSince) / (1000 * 60 * 60 * 24));

      userRank = {
        rank: userRankIndex + 1,
        id: user._id,
        name: user.name,
        coins: user.coins,
        topDays,
      };
    }

    // Respond with the leaderboard and the logged-in user's rank
    res.status(200).json({ leaderboard, userRank });
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
  }
};
