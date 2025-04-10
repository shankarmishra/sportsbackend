const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header is provided with Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from Authorization header
      token = req.headers.authorization.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the decoded token ID and exclude the password
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error("Error in protect middleware:", error);

      // Improved error message with status 401 for token verification failure
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    // If there's no token in the header
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
