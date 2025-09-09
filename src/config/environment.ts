import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'environment.config' });

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    cacheMaxRequests: parseInt(process.env.CACHE_RATE_LIMIT_MAX || '10', 10)
  },

  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:8080']
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },

  request: {
    timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10) // 30 seconds
  },

  api: {
    title: process.env.API_TITLE || 'Travel Advisory API',
    description: process.env.API_DESCRIPTION || 'Professional API for U.S. Department of State Travel Advisories',
    version: process.env.API_VERSION || '1.0.0'
  }
};

// Validate required configuration
const requiredConfig = ['server.port'];
const missingConfig = requiredConfig.filter(key => {
  const keys = key.split('.');
  let value: any = config;

  for (const k of keys) {
    value = value[k];
  }

  return value === undefined || value === null;
});

if (missingConfig.length > 0) {
  throw new Error(`Missing required configuration: ${missingConfig.join(', ')}`);
}

export default config;
