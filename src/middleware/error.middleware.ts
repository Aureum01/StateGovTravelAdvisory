import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

// Create logger for errors
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // In production, you might want to add file logging
    // new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
    requestId: req.headers['x-request-id'] as string || 'unknown',
    statusCode,
    code
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid resource identifier';
  } else if (error.message.includes('rate limit')) {
    statusCode = 429;
    code = 'RATE_LIMIT_EXCEEDED';
  } else if (error.message.includes('RSS') || error.message.includes('fetch')) {
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
    requestId: req.headers['x-request-id'] as string || 'unknown',
    ...(isDevelopment && {
      stack: error.stack,
      details: error.details
    })
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    message: `The requested path ${req.path} does not exist`,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] as string || 'unknown'
  });
};

/**
 * Request timeout middleware
 */
export const timeoutMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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
        requestId: req.headers['x-request-id'] as string || 'unknown'
      });
    }
  }, timeout);

  res.on('finish', () => {
    clearTimeout(timer);
  });

  next();
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string ||
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
