const jwt = require("jsonwebtoken");
const Coach = require("../models/coachModel");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get coach from the token
      req.user = await Coach.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ message: "Coach not found" });
      }

      next();
    } catch (error) {
      console.error("Error in protect middleware:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};