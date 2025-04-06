const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    banner: {
      type: String, // URL for the banner image
      required: [true, "Banner is required"],
    },
    hostedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Tournament", tournamentSchema);