const Venue = require('../models/venue');

// Get all venues
exports.getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.status(200).json(venues);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single venue by ID
exports.getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.status(200).json(venue);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new venue
exports.createVenue = async (req, res) => {
  const { name, image, location, price, facilities, rating, reviews, availableSlots } = req.body;
  
  try {
    const newVenue = new Venue({
      name,
      image,
      location,
      price,
      facilities,
      rating,
      reviews,
      availableSlots
    });

    const savedVenue = await newVenue.save();
    res.status(201).json(savedVenue);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a venue by ID
exports.updateVenue = async (req, res) => {
  try {
    const updatedVenue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedVenue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.status(200).json(updatedVenue);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a venue by ID
exports.deleteVenue = async (req, res) => {
  try {
    const deletedVenue = await Venue.findByIdAndDelete(req.params.id);
    if (!deletedVenue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.status(200).json({ message: 'Venue deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Book a venue
exports.bookVenue = async (req, res) => {
  const { venueId, selectedTime } = req.body;
  
  try {
    // Find the venue by ID
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Check if the selected time slot is available
    if (!venue.availableSlots.includes(selectedTime)) {
      return res.status(400).json({ message: 'Selected time is not available' });
    }

    // Remove the selected time slot from available slots
    venue.availableSlots = venue.availableSlots.filter(slot => slot !== selectedTime);
    
    // Save the updated venue
    const updatedVenue = await venue.save();
    res.status(200).json({ message: 'Booking confirmed', venue: updatedVenue });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
