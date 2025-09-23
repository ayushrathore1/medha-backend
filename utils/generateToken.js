const jwt = require("jsonwebtoken");

// Default expiry: 7 days
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * Generates a JWT token for a user.
 * @param {Object} payload - Any data you want to encode (e.g., { userId, email })
 * @param {Object} [options] - Extra options (overrides default expiry)
 * @returns {string} - Signed JWT token
 */
function generateToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: options.expiresIn || EXPIRES_IN,
    ...options,
  });
}

module.exports = generateToken;
