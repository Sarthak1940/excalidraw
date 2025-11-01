import rateLimit from 'express-rate-limit';
import { logger } from "@repo/backend-common/config";

// Custom handler for rate limit exceeded
const rateLimitHandler = (req: any, res: any) => {
  logger.warn('Rate limit exceeded', { 
    ip: req.ip, 
    path: req.path,
    userAgent: req.get('user-agent')
  });
  
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: res.getHeader('Retry-After')
  });
};

// Auth rate limiter: 5 requests per 15 minutes
// Protects login/signup endpoints from brute force attacks
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: rateLimitHandler,
  // Skip successful requests (count only failed attempts)
  skipSuccessfulRequests: false,
  // Skip failed requests (count all attempts)
  skipFailedRequests: false,
});

// Strict auth rate limiter: 3 requests per 5 minutes for very sensitive operations
export const strictAuthRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: 'Too many attempts, please try again after 5 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// API rate limiter: 100 requests per minute
// General rate limiter for all API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  // Skip successful requests for better UX
  skipSuccessfulRequests: false,
});

// Generous rate limiter: 1000 requests per 10 minutes
// For read-only operations that don't modify data
export const readRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1000,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Shape creation rate limiter: 200 per minute
// Prevents canvas spam but allows for normal drawing
export const shapeRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: 'Too many shapes created, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
