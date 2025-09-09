"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGlobalMiddleware = exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const createApp = () => {
    const app = (0, express_1.default)();
    // Security middleware
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }));
    // CORS configuration
    const corsOptions = {
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:8080'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
        exposedHeaders: ['X-Request-ID'],
        credentials: true,
        maxAge: 86400 // 24 hours
    };
    app.use((0, cors_1.default)(corsOptions));
    // Compression middleware
    app.use((0, compression_1.default)({
        level: 6, // Balanced compression
        threshold: 1024, // Only compress responses larger than 1KB
        filter: (req, res) => {
            // Don't compress responses with this request header
            if (req.headers['x-no-compression']) {
                return false;
            }
            // Use compression filter function
            return compression_1.default.filter(req, res);
        }
    }));
    // Body parsing middleware
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Request logging
    app.use(error_middleware_1.requestLogger);
    // Request timeout
    app.use(error_middleware_1.timeoutMiddleware);
    // Rate limiting
    const { apiLimiter, cacheLimiter } = (0, rate_limit_middleware_1.createRateLimiters)();
    app.use('/api/', apiLimiter);
    // Apply stricter rate limiting to cache endpoints
    app.use('/api/cache', cacheLimiter);
    // Health check (no rate limiting)
    app.get('/health', (req, res) => {
        res.json({
            success: true,
            message: 'API is healthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0'
        });
    });
    return app;
};
exports.createApp = createApp;
const setupGlobalMiddleware = (app) => {
    // 404 handler
    app.use(error_middleware_1.notFoundHandler);
    // Global error handler (must be last)
    app.use(error_middleware_1.errorHandler);
};
exports.setupGlobalMiddleware = setupGlobalMiddleware;
//# sourceMappingURL=app.js.map