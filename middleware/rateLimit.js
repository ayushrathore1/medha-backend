/**
 * Rate Limiting Middleware for MEDHA
 * Protects against brute force attacks and API abuse
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Production limit: Generous enough for power users, blocks abuse
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health check
  skip: (req) => req.path === '/health' || req.path === '/',
  handler: (req, res, next, options) => {
    console.log(`[RATE LIMIT] IP ${req.ip} exceeded limit on ${req.path}`);
    res.status(429).json(options.message);
  }
});

// Strict rate limiter for authentication routes - 10 requests per 15 minutes
// Prevents brute force password attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Production limit: Allow 50 attempts/15min (approx 3/min)
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    console.log(`[AUTH RATE LIMIT] IP ${req.ip} - Possible brute force attempt on ${req.path}`);
    res.status(429).json(options.message);
  }
});

// Strict rate limiter for AI/resource-intensive endpoints - 20 requests per 15 minutes
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Production limit: Support active study sessions (approx 6-7 chats/min)
  message: {
    success: false,
    message: 'AI request limit reached. Please try again after 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    console.log(`[AI RATE LIMIT] IP ${req.ip} exceeded AI limit on ${req.path}`);
    res.status(429).json(options.message);
  }
});

// Password reset limiter - 5 requests per hour
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
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
