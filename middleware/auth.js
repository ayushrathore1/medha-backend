const jwt = require("jsonwebtoken");

// JWT secret MUST be set in environment variables for security
// Note: Check at request time instead of module load to prevent
// the server from crashing on startup (important for Hostinger deployment)
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ CRITICAL: JWT_SECRET environment variable is not set!");
  }
  return secret;
};

const auth = (req, res, next) => {
  const JWT_SECRET = getJwtSecret();
  if (!JWT_SECRET) {
    return res.status(500).json({ message: "Server configuration error: JWT_SECRET not set" });
  }
  // Get token from Authorization header: "Bearer <token>"
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach user to request (ensure both id and userId for compatibility)
    req.user = {
      _id: decoded.userId, // Mongoose ObjectId for use in models
      id: decoded.userId, // Generic use in app
      userId: decoded.userId, // For full compatibility with all routes/controllers
      email: decoded.email, // Attach email (if needed downstream)
    };
    req.userId = decoded.userId; // Set directly for controllers accessing req.userId
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
