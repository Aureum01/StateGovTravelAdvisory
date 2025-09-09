"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.timeoutMiddleware = exports.notFoundHandler = exports.errorHandler = void 0;
const winston_1 = __importDefault(require("winston"));
// Create logger for errors
const logger = winston_1.default.createLogger({
    level: 'error',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
        }),
        // In production, you might want to add file logging
        // new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});
/**
 * Global error handling middleware
 */
const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    let code = error.code || 'INTERNAL_ERROR';
    // Log the error
    logger.error('API Error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.headers['x-request-id'] || 'unknown',
        statusCode,
        code
    });
    // Handle specific error types
    if (error.name === 'ValidationError') {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = 'Request validation failed';
    }
    else if (error.name === 'CastError') {
        statusCode = 400;
        code = 'INVALID_ID';
        message = 'Invalid resource identifier';
    }
    else if (error.message.includes('rate limit')) {
        statusCode = 429;
        code = 'RATE_LIMIT_EXCEEDED';
    }
    else if (error.message.includes('RSS') || error.message.includes('fetch')) {
        statusCode = 503;
        code = 'EXTERNAL_SERVICE_ERROR';
        message = 'Unable to fetch travel advisory data. Please try again later.';
    }
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse = {
        success: false,
        error: message,
        code,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        ...(isDevelopment && {
            stack: error.stack,
            details: error.details
        })
    };
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        code: 'NOT_FOUND',
        message: `The requested path ${req.path} does not exist`,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
    });
};
exports.notFoundHandler = notFoundHandler;
/**
 * Request timeout middleware
 */
const timeoutMiddleware = (req, res, next) => {
    // Set timeout for requests (30 seconds)
    const timeout = parseInt(process.env.REQUEST_TIMEOUT || '30000');
    const timer = setTimeout(() => {
        if (!res.headersSent) {
            res.status(408).json({
                success: false,
                error: 'Request timeout',
                code: 'REQUEST_TIMEOUT',
                message: 'The request took too long to process',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown'
            });
        }
    }, timeout);
    res.on('finish', () => {
        clearTimeout(timer);
    });
    next();
};
exports.timeoutMiddleware = timeoutMiddleware;
/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] ||
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Add request ID to headers if not present
    if (!req.headers['x-request-id']) {
        req.headers['x-request-id'] = requestId;
    }
    // Log request
    logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId
    });
    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
        logger.log(logLevel, 'Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            requestId
        });
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=error.middleware.js.map