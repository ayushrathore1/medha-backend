const User = require("../models/User");

/**
 * Admin middleware - only allows access for admin users
 */
const adminAuth = async (req, res, next) => {
  try {
    // userId should be set by the regular auth middleware
    if (!req.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.isAdmin = true;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = adminAuth;
