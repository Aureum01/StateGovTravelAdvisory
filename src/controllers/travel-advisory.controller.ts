import { Request, Response, NextFunction } from 'express';
import { TravelAdvisoryService } from '../services';
import { TravelAdvisoryFilters, ApiResponse } from '../types';
import { body, param, query, validationResult } from 'express-validator';

export class TravelAdvisoryController {
  private service: TravelAdvisoryService;

  constructor() {
    this.service = new TravelAdvisoryService();
  }

  /**
   * GET /advisories - Get all travel advisories with optional filtering and pagination
   */
  async getTravelAdvisories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown'
        });
        return;
      }

      const filters: TravelAdvisoryFilters = {
        level: req.query.level as string,
        country: req.query.country as string,
        countryCode: req.query.countryCode as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
        sortBy: req.query.sortBy as 'pubDate' | 'country' | 'level',
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await this.service.getTravelAdvisories(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /advisories/:country - Get travel advisory for a specific country
   */
  async getTravelAdvisoryByCountry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown'
        });
        return;
      }

      const { country } = req.params;
      const result = await this.service.getTravelAdvisoryByCountry(country);

      if (!result.data) {
        res.status(404).json(result);
        return;
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /advisories/level/:level - Get travel advisories by threat level
   */
  async getTravelAdvisoriesByLevel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown'
        });
        return;
      }

      const { level } = req.params;
      const result = await this.service.getTravelAdvisoriesByLevel(level);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /cache/stats - Get cache statistics
   */
  async getCacheStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = this.service.getCacheStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /cache/refresh - Refresh the cache
   */
  async refreshCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.service.refreshCache();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /countries - Get all available countries
   */
  async getAvailableCountries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.service.getAvailableCountries();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /raw - Get raw travel advisory data
   */
  async getRawData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const advisories = await this.service.getTravelAdvisories({ limit: 100 });
      const rawData = advisories.data.map(adv => ({
        country: adv.country,
        countryCode: adv.countryCode,
        level: adv.level,
        levelNumber: adv.levelNumber,
        title: adv.title,
        summary: adv.summary,
        restrictions: adv.restrictions,
        recommendations: adv.recommendations.slice(0, 5), // Limit recommendations
        link: adv.link,
        lastUpdated: adv.lastUpdated
      }));
      res.json({
        success: true,
        data: rawData,
        message: `Raw data for ${rawData.length} countries`,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /health - Health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Travel Advisory API is healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    });
  }

  // Validation middleware
  static validateGetAdvisories = [
    query('level').optional().isString().withMessage('Level must be a string'),
    query('country').optional().isString().withMessage('Country must be a string'),
    query('countryCode').optional().isLength({ min: 2, max: 3 }).withMessage('Country code must be 2-3 characters'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
    query('sortBy').optional().isIn(['pubDate', 'country', 'level']).withMessage('Sort by must be one of: pubDate, country, level'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
  ];

  static validateGetByCountry = [
    param('country').isString().notEmpty().withMessage('Country parameter is required')
  ];

  static validateGetByLevel = [
    param('level').isString().notEmpty().withMessage('Level parameter is required')
  ];
}
