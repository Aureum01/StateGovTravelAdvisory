"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimiters = exports.strictRateLimit = exports.standardRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const winston_1 = __importDefault(require("winston"));
// Create logger for rate limiting
const logger = winston_1.default.createLogger({
    level: 'warn',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
        })
    ]
});
// Standard rate limiter for general API endpoints
exports.standardRateLimit = (0, express_rate_limit_1.default)({
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
    handler: (req, res) => {
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
            requestId: req.headers['x-request-id'] || 'rate_limited'
        });
    },
    skip: (req) => {
        // Skip rate limiting for health checks and documentation
        return req.path === '/health' || req.path.startsWith('/api-docs');
    }
});
// Stricter rate limiter for cache refresh endpoint
exports.strictRateLimit = (0, express_rate_limit_1.default)({
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
    handler: (req, res) => {
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
            requestId: req.headers['x-request-id'] || 'cache_refresh_rate_limited'
        });
    }
});
// Create different rate limiters for different endpoints
const createRateLimiters = () => {
    // General API rate limiter
    const apiLimiter = (0, express_rate_limit_1.default)({
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
        handler: (req, res) => {
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
                requestId: req.headers['x-request-id'] || 'api_rate_limited'
            });
        },
        skip: (req) => {
            return req.path === '/health' || req.path.startsWith('/api-docs');
        }
    });
    // Cache management rate limiter
    const cacheLimiter = (0, express_rate_limit_1.default)({
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
        handler: (req, res) => {
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
                requestId: req.headers['x-request-id'] || 'cache_rate_limited'
            });
        }
    });
    return {
        apiLimiter,
        cacheLimiter
    };
};
exports.createRateLimiters = createRateLimiters;
//# sourceMappingURL=rate-limit.middleware.js.map