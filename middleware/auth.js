const jwt = require("jsonwebtoken");

// Use your JWT secret from environment variables for security
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "853f32a2825ea94c1586147858f09663a1fcc51d926d7cbfc5440d67fbe80dc30ac1f805ef9bcf8699dffbc31e4505bcb345543c771e0272eabd0a4d011216ec";

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
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
