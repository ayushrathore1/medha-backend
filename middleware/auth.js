const jwt = require("jsonwebtoken");

// JWT secret MUST be set in environment variables for security
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ CRITICAL: JWT_SECRET environment variable is not set!");
  console.error("Please set JWT_SECRET in your .env file");
  process.exit(1);
}

const auth = (req, res, next) => {
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
