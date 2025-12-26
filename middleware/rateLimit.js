/**
 * Rate Limiting Middleware for MEDHA
 * Protects against brute force attacks and API abuse
 * 
 * IMPORTANT: Uses a combination of IP and user ID to prevent
 * users on shared networks (college/university) from blocking each other
 */

const rateLimit = require('express-rate-limit');

// Helper function to generate rate limit key
// Uses user ID when authenticated, falls back to IP
const getKeyGenerator = (prefix = '') => (req) => {
  // Try to extract user ID from JWT token for authenticated requests
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      // Decode JWT payload (middle part) without verification - just for key generation
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      if (payload.userId) {
        return `${prefix}user_${payload.userId}`;
      }
    } catch (e) {
      // If token parsing fails, fall back to IP
    }
  }
  // For unauthenticated requests, use IP
  return `${prefix}ip_${req.ip}`;
};

// General API rate limiter - 2000 requests per 15 minutes (very generous)
// This allows heavy use while still preventing abuse
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // ~133 requests per minute - very generous for normal usage
  keyGenerator: getKeyGenerator('general_'),
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again in a few minutes.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health check
  skip: (req) => req.path === '/health' || req.path === '/',
  handler: (req, res, next, options) => {
    console.log(`[RATE LIMIT] Key ${getKeyGenerator('general_')(req)} exceeded limit on ${req.path}`);
    res.status(429).json(options.message);
  }
});

// Auth rate limiter - 100 requests per 15 minutes
// More generous to support users who might be having trouble logging in
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // ~6-7 attempts per minute - allows retries without being too strict
  keyGenerator: (req) => `auth_ip_${req.ip}`, // Auth must use IP since user isn't authenticated yet
  message: {
    success: false,
    message: 'Too many login attempts. Please wait a few minutes before trying again.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful logins from counting
  skipSuccessfulRequests: true,
  handler: (req, res, next, options) => {
    console.log(`[AUTH RATE LIMIT] IP ${req.ip} - Excessive auth attempts on ${req.path}`);
    res.status(429).json(options.message);
  }
});

// AI/resource-intensive endpoints - 200 requests per 15 minutes
// Generous enough for active study sessions
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // ~13 requests per minute - good for active chatting/studying
  keyGenerator: getKeyGenerator('ai_'),
  message: {
    success: false,
    message: 'AI request limit reached. Please wait a few minutes before continuing.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    console.log(`[AI RATE LIMIT] Key ${getKeyGenerator('ai_')(req)} exceeded AI limit on ${req.path}`);
    res.status(429).json(options.message);
  }
});

// Password reset limiter - 10 requests per hour (per IP)
// Slightly more generous for users who might be struggling
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => `reset_ip_${req.ip}`,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after an hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  authLimiter,
  aiLimiter,
  passwordResetLimiter
};

