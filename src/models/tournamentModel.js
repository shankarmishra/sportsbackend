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
      type: String, // Could be an image URL or base64
      required: [true, "Banner is required"],
    },
    hostedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming your coach model is named 'User'
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt fields
  }
);

module.exports = mongoose.model("Tournament", tournamentSchema);
