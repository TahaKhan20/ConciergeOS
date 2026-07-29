/**
 * Rate limiting middleware.
 * Prevents abuse by limiting requests per IP.
 */

const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute window
  max: 30,              // 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

module.exports = { apiLimiter };
