"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const travel_advisory_controller_1 = require("../controllers/travel-advisory.controller");
const router = (0, express_1.Router)();
const controller = new travel_advisory_controller_1.TravelAdvisoryController();
/**
 * @swagger
 * /advisories:
 *   get:
 *     summary: Get all travel advisories
 *     description: Retrieve travel advisories with optional filtering, sorting, and pagination
 *     tags: [Travel Advisories]
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Filter by threat level (e.g., "Level 4", "Do Not Travel")
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country name
 *       - in: query
 *         name: countryCode
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 3
 *         description: Filter by country code (e.g., "US", "CA")
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of results to skip
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [pubDate, country, level]
 *           default: pubDate
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Successful response with paginated travel advisories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Bad request - validation error
 *       500:
 *         description: Internal server error
 */
router.get('/advisories', travel_advisory_controller_1.TravelAdvisoryController.validateGetAdvisories, controller.getTravelAdvisories.bind(controller));
/**
 * @swagger
 * /advisories/{country}:
 *   get:
 *     summary: Get travel advisory for a specific country
 *     description: Retrieve travel advisory information for a specific country by name or code
 *     tags: [Travel Advisories]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *         description: Country name or country code
 *         example: Armenia
 *     responses:
 *       200:
 *         description: Successful response with country-specific travel advisory
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Country not found
 *       400:
 *         description: Bad request - validation error
 *       500:
 *         description: Internal server error
 */
router.get('/advisories/:country', travel_advisory_controller_1.TravelAdvisoryController.validateGetByCountry, controller.getTravelAdvisoryByCountry.bind(controller));
/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Get all available countries
 *     description: Retrieve a list of all countries that have travel advisories with their codes and current advisory levels
 *     tags: [Travel Advisories]
 *     responses:
 *       200:
 *         description: Successful response with list of countries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     countries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Armenia"
 *                           code:
 *                             type: string
 *                             example: "AM"
 *                           level:
 *                             type: string
 *                             example: "Level 2: Exercise Increased Caution"
 *                 message:
 *                   type: string
 *                   example: "Found 195 countries with travel advisories"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 requestId:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/countries', controller.getAvailableCountries.bind(controller));
/**
 * @swagger
 * /raw:
 *   get:
 *     summary: Get raw travel advisory data
 *     description: Retrieve simplified travel advisory data for all countries with essential information only
 *     tags: [Travel Advisories]
 *     responses:
 *       200:
 *         description: Successful response with raw travel advisory data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       country:
 *                         type: string
 *                         example: "Armenia"
 *                       countryCode:
 *                         type: string
 *                         example: "AM"
 *                       level:
 *                         type: string
 *                         example: "Level 2: Exercise Increased Caution"
 *                       levelNumber:
 *                         type: integer
 *                         example: 2
 *                       title:
 *                         type: string
 *                         example: "Armenia - Level 2: Exercise Increased Caution"
 *                       summary:
 *                         type: string
 *                         example: "Exercise increased caution in Armenia due to areas of potential armed conflict."
 *                       restrictions:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["The border region with Azerbaijan"]
 *                       recommendations:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Enroll in the Smart Traveler Enrollment Program (STEP)"]
 *                       link:
 *                         type: string
 *                         format: uri
 *                         example: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/armenia-travel-advisory.html"
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                 message:
 *                   type: string
 *                   example: "Raw data for 195 countries"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 requestId:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/raw', controller.getRawData.bind(controller));
/**
 * @swagger
 * /advisories/level/{level}:
 *   get:
 *     summary: Get travel advisories by threat level
 *     description: Retrieve all travel advisories for a specific threat level
 *     tags: [Travel Advisories]
 *     parameters:
 *       - in: path
 *         name: level
 *         required: true
 *         schema:
 *           type: string
 *         description: Threat level (e.g., "4", "Do Not Travel", "Level 2")
 *         example: "4"
 *     responses:
 *       200:
 *         description: Successful response with travel advisories for the specified level
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request - validation error
 *       500:
 *         description: Internal server error
 */
router.get('/advisories/level/:level', travel_advisory_controller_1.TravelAdvisoryController.validateGetByLevel, controller.getTravelAdvisoriesByLevel.bind(controller));
/**
 * @swagger
 * /cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     description: Retrieve information about the current cache state and statistics
 *     tags: [Cache Management]
 *     responses:
 *       200:
 *         description: Successful response with cache statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/cache/stats', controller.getCacheStats.bind(controller));
/**
 * @swagger
 * /cache/refresh:
 *   post:
 *     summary: Refresh cache
 *     description: Force refresh the travel advisories cache by fetching fresh data from the RSS feed
 *     tags: [Cache Management]
 *     responses:
 *       200:
 *         description: Cache refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/cache/refresh', controller.refreshCache.bind(controller));
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running and healthy
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Travel Advisory API is healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 */
router.get('/health', controller.healthCheck.bind(controller));
exports.default = router;
//# sourceMappingURL=travel-advisory.routes.js.map