const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: String, required: true },
  facilities: { type: [String], required: true },
  rating: { type: Number, required: true },
  reviews: { type: [String], required: true },
  availableSlots: { type: [String], required: true },
});

const Venue = mongoose.model('Venue', venueSchema);

module.exports = Venue;
