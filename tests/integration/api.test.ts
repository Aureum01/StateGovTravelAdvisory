import request from 'supertest';
import app from '../../src/index';

describe('API Integration Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'API is healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/advisories', () => {
    it('should return travel advisories with default pagination', async () => {
      const response = await request(app)
        .get('/api/advisories')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('requestId');

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 50);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should support filtering by country', async () => {
      const response = await request(app)
        .get('/api/advisories?country=Armenia')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        expect(response.body.data[0].country.toLowerCase()).toContain('armenia');
      }
    });

    it('should support filtering by threat level', async () => {
      const response = await request(app)
        .get('/api/advisories?level=4')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      response.body.data.forEach((advisory: any) => {
        expect(advisory.level).toContain('4');
      });
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/advisories?limit=5&offset=0')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/advisories?limit=150') // Exceeds max limit
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/advisories/:country', () => {
    it('should return advisory for valid country', async () => {
      const response = await request(app)
        .get('/api/advisories/Armenia')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.country.toLowerCase()).toContain('armenia');
    });

    it('should return 404 for non-existent country', async () => {
      const response = await request(app)
        .get('/api/advisories/NonExistentCountry')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No advisory found');
    });

    it('should validate country parameter', async () => {
      const response = await request(app)
        .get('/api/advisories/')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/advisories/level/:level', () => {
    it('should return advisories for threat level', async () => {
      const response = await request(app)
        .get('/api/advisories/level/4')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        response.body.data.forEach((advisory: any) => {
          expect(advisory.level).toContain('4');
        });
      }
    });

    it('should validate level parameter', async () => {
      const response = await request(app)
        .get('/api/advisories/level/')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/cache/stats', () => {
    it('should return cache statistics', async () => {
      const response = await request(app)
        .get('/api/cache/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('keys');
      expect(response.body.data).toHaveProperty('hits');
      expect(response.body.data).toHaveProperty('misses');
      expect(response.body.data).toHaveProperty('lastUpdated');
      expect(response.body.data).toHaveProperty('remainingTTL');
    });
  });

  describe('POST /api/cache/refresh', () => {
    it('should refresh cache successfully', async () => {
      const response = await request(app)
        .post('/api/cache/refresh')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Cache refreshed successfully');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting gracefully', async () => {
      // This test would need to be configured with a very low rate limit for testing
      // For now, just verify the headers are present
      const response = await request(app)
        .get('/api/advisories')
        .expect(200);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error', 'Endpoint not found');
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/cache/refresh')
        .set('Content-Type', 'application/json')
        .send('{invalid json}')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/advisories')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });
  });
});
