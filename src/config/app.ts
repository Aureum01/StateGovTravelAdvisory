import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createRateLimiters } from '../middleware/rate-limit.middleware';
import {
  errorHandler,
  notFoundHandler,
  timeoutMiddleware,
  requestLogger
} from '../middleware/error.middleware';

export const createApp = () => {
  const app = express();

  // Security middleware
  app.use(helmet({
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

  app.use(cors(corsOptions));

  // Compression middleware
  app.use(compression({
    level: 6, // Balanced compression
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      // Don't compress responses with this request header
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use compression filter function
      return compression.filter(req, res);
    }
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLogger);

  // Request timeout
  app.use(timeoutMiddleware);

  // Rate limiting
  const { apiLimiter, cacheLimiter } = createRateLimiters();
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

export const setupGlobalMiddleware = (app: express.Application) => {
  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);
};
