const Coach = require("../models/coachModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register Coach
exports.registerCoach = async (req, res) => {
  const { name, email, password, phone, specialization, experience } = req.body;

  try {
    const coachExists = await Coach.findOne({ email });
    if (coachExists) {
      return res.status(400).json({ message: "Coach already exists" });
    }

    const coach = await Coach.create({
      name,
      email,
      password,
      phone,
      specialization,
      experience,
    });

    if (coach) {
      res.status(201).json({
        _id: coach.id,
        name: coach.name,
        email: coach.email,
        specialization: coach.specialization,
        experience: coach.experience,
        token: generateToken(coach.id),
      });
    } else {
      res.status(400).json({ message: "Invalid coach data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error registering coach", error: error.message });
  }
};

// Login Coach
exports.loginCoach = async (req, res) => {
  const { email, password } = req.body;

  try {
    const coach = await Coach.findOne({ email });
    if (coach && (await bcrypt.compare(password, coach.password))) {
      res.status(200).json({
        _id: coach.id,
        name: coach.name,
        email: coach.email,
        specialization: coach.specialization,
        experience: coach.experience,
        token: generateToken(coach.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Get Coach Profile
exports.getCoachProfile = async (req, res) => {
  try {
    const coach = req.user; // Populated by the protect middleware

    res.status(200).json({
      name: coach.name,
      email: coach.email,
      phone: coach.phone,
      specialization: coach.specialization,
      experience: coach.experience,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

// Update Coach Profile
exports.updateCoachProfile = async (req, res) => {
  try {
    const coach = await Coach.findById(req.user.id);
    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    const { name, email, phone, specialization, experience } = req.body;

    coach.name = name || coach.name;
    coach.email = email || coach.email;
    coach.phone = phone || coach.phone;
    coach.specialization = specialization || coach.specialization;
    coach.experience = experience || coach.experience;

    const updatedCoach = await coach.save();

    res.status(200).json(updatedCoach);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};