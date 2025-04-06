const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
    },
    specialization: {
      type: String, // Only required for coaches
    },
    experience: {
      type: String, // Only required for coaches
    },
    role: {
      type: String,
      enum: ["player", "coach", "admin"],
      default: "player", // Default role is player
    },
    coins: {
      type: Number,
      default: 0, // Default coins for leaderboard
    },
    achievements: {
      type: [String], // Array of achievements
      default: [],
    },
    favoriteGames: {
      type: [String], // Array of favorite games
      default: [],
    },
    profileImage: {
      type: String, // URL for the profile image
      default: null,
    },
    location: {
      type: String, // Location of the user
      default: "",
    },
    resetPasswordToken: {
      type: String, // Token for password reset
      default: null,
    },
    resetPasswordExpire: {
      type: Date, // Expiry time for the reset token
      default: null,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password for login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const crypto = require("crypto");
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash the token and set it to resetPasswordToken
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set token expiration time (e.g., 1 hour)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);