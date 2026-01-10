const User = require("../models/User");

/**
 * Admin middleware - only allows access for admin users
 */
const adminAuth = async (req, res, next) => {
  try {
    // userId should be set by the regular auth middleware
    if (!req.userId) {
      console.log("AdminAuth: No userId found in request");
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      console.log("AdminAuth: User not found for ID:", req.userId);
      return res.status(401).json({ error: "User not found" });
    }

    if (!user.isAdmin && user.role !== 'team') {
      console.log("AdminAuth: User is not admin/team:", user.email, "role:", user.role);
      return res.status(403).json({ error: "Admin/Team access required" });
    }

    console.log("AdminAuth: Access granted for admin:", user.email);
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = adminAuth;
