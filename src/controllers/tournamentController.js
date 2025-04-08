const Tournament = require("../models/tournamentModel");

// Create a Tournament
exports.createTournament = async (req, res) => {
  const { title, description, location, date, banner } = req.body;

  try {
    if (!title || !description || !location || !date || !banner) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const tournament = await Tournament.create({
      title,
      description,
      location,
      date,
      banner,
      hostedBy: req.user.id,
    });

    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ message: "Error creating tournament", error: error.message });
  }
};

// Get All Tournaments
exports.getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ date: 1 });
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tournaments", error: error.message });
  }
};

// Get Tournament by ID
exports.getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tournament", error: error.message });
  }
};

// Update Tournament
exports.updateTournament = async (req, res) => {
  const { title, description, location, date, banner } = req.body;

  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.hostedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this tournament" });
    }

    tournament.title = title || tournament.title;
    tournament.description = description || tournament.description;
    tournament.location = location || tournament.location;
    tournament.date = date || tournament.date;
    tournament.banner = banner || tournament.banner;

    const updatedTournament = await tournament.save();
    res.status(200).json(updatedTournament);
  } catch (error) {
    res.status(500).json({ message: "Error updating tournament", error: error.message });
  }
};

// Delete Tournament
exports.deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.hostedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this tournament" });
    }

    await tournament.remove();
    res.status(200).json({ message: "Tournament deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting tournament", error: error.message });
  }
};

// Get Tournaments Hosted by Current Coach
exports.getCoachTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ hostedBy: req.user.id }).sort({ date: 1 });
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tournaments", error: error.message });
  }
};
