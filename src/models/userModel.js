const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

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

    // Coach-specific fields
    specialization: {
      type: String,
    },
    experience: {
      type: String,
    },

    // Role
    role: {
      type: String,
      enum: ["player", "coach", "admin"],
      default: "player",
    },

    // Gamification & profile
    coins: {
      type: Number,
      default: 0,
    },
    achievements: {
      type: [String],
      default: [],
    },
    favoriteGames: {
      type: [String],
      default: [],
    },
    profileImage: {
      type: String,
      default: null,
    },

    // Location (for nearby player search)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    // Password reset
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },

    // Leaderboard top user tracker
    topSince: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Index location for geospatial queries
userSchema.index({ location: "2dsphere" });

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Match password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔁 Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

  return resetToken;
};

// ✅ Optional: check if user is a coach
userSchema.methods.isCoach = function () {
  return this.role === "coach";
};

module.exports = mongoose.model("User", userSchema);
