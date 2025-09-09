import { ProcessedTravelAdvisory, TravelAdvisoryFilters, PaginatedResponse, ApiResponse } from '../types';
export declare class TravelAdvisoryService {
    private rssParser;
    private cache;
    private logger;
    constructor();
    /**
     * Gets all travel advisories with optional filtering and pagination
     */
    getTravelAdvisories(filters?: TravelAdvisoryFilters): Promise<PaginatedResponse<ProcessedTravelAdvisory>>;
    /**
     * Gets a specific travel advisory by country with enhanced matching
     */
    getTravelAdvisoryByCountry(country: string): Promise<ApiResponse<ProcessedTravelAdvisory | null>>;
    /**
     * Gets travel advisories by threat level
     */
    getTravelAdvisoriesByLevel(level: string): Promise<ApiResponse<ProcessedTravelAdvisory[]>>;
    /**
     * Gets a list of all available countries with their codes
     */
    getAvailableCountries(): Promise<ApiResponse<{
        countries: Array<{
            name: string;
            code: string;
            level: string;
        }>;
    }>>;
    /**
     * Gets cache statistics
     */
    getCacheStats(): ApiResponse<any>;
    /**
     * Refreshes the cache by fetching fresh data from RSS feed
     */
    refreshCache(): Promise<ApiResponse<boolean>>;
    /**
     * Gets advisories data, using cache if available and not stale
     */
    private getAdvisoriesData;
    /**
     * Applies filters to the advisories array
     */
    private applyFilters;
    /**
     * Applies sorting to the advisories array
     */
    private applySorting;
    /**
     * Generates a unique request ID
     */
    private generateRequestId;
}
//# sourceMappingURL=travel-advisory.service.d.ts.map