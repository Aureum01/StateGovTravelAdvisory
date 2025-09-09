"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelAdvisoryController = void 0;
const services_1 = require("../services");
const express_validator_1 = require("express-validator");
class TravelAdvisoryController {
    constructor() {
        this.service = new services_1.TravelAdvisoryService();
    }
    /**
     * GET /advisories - Get all travel advisories with optional filtering and pagination
     */
    async getTravelAdvisories(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array(),
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown'
                });
                return;
            }
            const filters = {
                level: req.query.level,
                country: req.query.country,
                countryCode: req.query.countryCode,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                offset: req.query.offset ? parseInt(req.query.offset, 10) : undefined,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder
            };
            const result = await this.service.getTravelAdvisories(filters);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /advisories/:country - Get travel advisory for a specific country
     */
    async getTravelAdvisoryByCountry(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array(),
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown'
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
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /advisories/level/:level - Get travel advisories by threat level
     */
    async getTravelAdvisoriesByLevel(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array(),
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown'
                });
                return;
            }
            const { level } = req.params;
            const result = await this.service.getTravelAdvisoriesByLevel(level);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /cache/stats - Get cache statistics
     */
    async getCacheStats(req, res, next) {
        try {
            const result = this.service.getCacheStats();
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /cache/refresh - Refresh the cache
     */
    async refreshCache(req, res, next) {
        try {
            const result = await this.service.refreshCache();
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /countries - Get all available countries
     */
    async getAvailableCountries(req, res, next) {
        try {
            const result = await this.service.getAvailableCountries();
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /raw - Get raw travel advisory data
     */
    async getRawData(req, res, next) {
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
                requestId: req.headers['x-request-id'] || 'unknown'
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /health - Health check endpoint
     */
    async healthCheck(req, res) {
        res.json({
            success: true,
            message: 'Travel Advisory API is healthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            uptime: process.uptime(),
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }
}
exports.TravelAdvisoryController = TravelAdvisoryController;
// Validation middleware
TravelAdvisoryController.validateGetAdvisories = [
    (0, express_validator_1.query)('level').optional().isString().withMessage('Level must be a string'),
    (0, express_validator_1.query)('country').optional().isString().withMessage('Country must be a string'),
    (0, express_validator_1.query)('countryCode').optional().isLength({ min: 2, max: 3 }).withMessage('Country code must be 2-3 characters'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
    (0, express_validator_1.query)('sortBy').optional().isIn(['pubDate', 'country', 'level']).withMessage('Sort by must be one of: pubDate, country, level'),
    (0, express_validator_1.query)('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];
TravelAdvisoryController.validateGetByCountry = [
    (0, express_validator_1.param)('country').isString().notEmpty().withMessage('Country parameter is required')
];
TravelAdvisoryController.validateGetByLevel = [
    (0, express_validator_1.param)('level').isString().notEmpty().withMessage('Level parameter is required')
];
//# sourceMappingURL=travel-advisory.controller.js.map