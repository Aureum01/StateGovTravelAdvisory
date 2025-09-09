import { Request, Response, NextFunction } from 'express';
export declare class TravelAdvisoryController {
    private service;
    constructor();
    /**
     * GET /advisories - Get all travel advisories with optional filtering and pagination
     */
    getTravelAdvisories(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /advisories/:country - Get travel advisory for a specific country
     */
    getTravelAdvisoryByCountry(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /advisories/level/:level - Get travel advisories by threat level
     */
    getTravelAdvisoriesByLevel(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /cache/stats - Get cache statistics
     */
    getCacheStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /cache/refresh - Refresh the cache
     */
    refreshCache(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /countries - Get all available countries
     */
    getAvailableCountries(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /raw - Get raw travel advisory data
     */
    getRawData(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /health - Health check endpoint
     */
    healthCheck(req: Request, res: Response): Promise<void>;
    static validateGetAdvisories: import("express-validator").ValidationChain[];
    static validateGetByCountry: import("express-validator").ValidationChain[];
    static validateGetByLevel: import("express-validator").ValidationChain[];
}
//# sourceMappingURL=travel-advisory.controller.d.ts.map