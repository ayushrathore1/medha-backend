const User = require("../models/User");

// Middleware to check if user has team or admin privileges
const teamAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is an admin or a team member
    // Also support legacy isAdmin flag
    if (user.role === "team" || user.role === "admin" || user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Team member privileges required." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = teamAuth;
