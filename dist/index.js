"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./config/app");
const travel_advisory_routes_1 = __importDefault(require("./routes/travel-advisory.routes"));
const swagger_1 = require("./config/swagger");
const winston_1 = __importDefault(require("winston"));
// Configure Winston logger
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
        })
    ]
});
// Validate environment variables
const requiredEnvVars = ['PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
// Create Express application
const app = (0, app_1.createApp)();
// API Routes
app.use('/api', travel_advisory_routes_1.default);
// Swagger/OpenAPI documentation
(0, swagger_1.setupSwagger)(app);
// Setup global middleware (404, error handling)
(0, app_1.setupGlobalMiddleware)(app);
// Graceful shutdown handling
const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close((err) => {
        if (err) {
            logger.error('Error during server shutdown', err);
            process.exit(1);
        }
        logger.info('Server closed successfully');
        process.exit(0);
    });
    // Force shutdown after 30 seconds
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};
// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Start server
const server = app.listen(PORT, () => {
    logger.info(`🚀 Travel Advisory API server started`, {
        port: PORT,
        environment: NODE_ENV,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
    });
    logger.info(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    logger.info(`🌍 API Endpoints: http://localhost:${PORT}/api/advisories`);
});
// Export for testing
exports.default = app;
//# sourceMappingURL=index.js.map