import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import winston from 'winston';

// Create logger for rate limiting
const logger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Standard rate limiter for general API endpoints
export const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
    timestamp: new Date().toISOString(),
    requestId: 'rate_limited'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent')
    });

    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'rate_limited'
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks and documentation
    return req.path === '/health' || req.path.startsWith('/api-docs');
  }
});

// Stricter rate limiter for cache refresh endpoint
export const strictRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour for cache refresh
  message: {
    success: false,
    error: 'Cache refresh rate limit exceeded. Try again in 1 hour.',
    retryAfter: '1 hour',
    timestamp: new Date().toISOString(),
    requestId: 'cache_refresh_rate_limited'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Cache refresh rate limit exceeded', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent')
    });

    res.status(429).json({
      success: false,
      error: 'Cache refresh rate limit exceeded. Try again in 1 hour.',
      retryAfter: '1 hour',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'cache_refresh_rate_limited'
    });
  }
});

// Create different rate limiters for different endpoints
export const createRateLimiters = () => {
  // General API rate limiter
  const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests default
    message: {
      success: false,
      error: 'API rate limit exceeded',
      retryAfter: `${Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 60000)} minutes`,
      timestamp: new Date().toISOString(),
      requestId: 'api_rate_limited'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('API rate limit exceeded', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent'),
        windowMs: process.env.RATE_LIMIT_WINDOW_MS,
        maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS
      });

      res.status(429).json({
        success: false,
        error: 'API rate limit exceeded',
        retryAfter: `${Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 60000)} minutes`,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'api_rate_limited'
      });
    },
    skip: (req: Request) => {
      return req.path === '/health' || req.path.startsWith('/api-docs');
    }
  });

  // Cache management rate limiter
  const cacheLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: parseInt(process.env.CACHE_RATE_LIMIT_MAX || '10'), // 10 requests per hour default
    message: {
      success: false,
      error: 'Cache management rate limit exceeded',
      retryAfter: '1 hour',
      timestamp: new Date().toISOString(),
      requestId: 'cache_rate_limited'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Cache management rate limit exceeded', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent')
      });

      res.status(429).json({
        success: false,
        error: 'Cache management rate limit exceeded',
        retryAfter: '1 hour',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'cache_rate_limited'
      });
    }
  });

  return {
    apiLimiter,
    cacheLimiter
  };
};
