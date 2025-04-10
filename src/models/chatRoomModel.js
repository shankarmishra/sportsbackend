const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  game: { type: String, required: true },
  time: { type: String },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
  },
}, { timestamps: true });

chatRoomSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
