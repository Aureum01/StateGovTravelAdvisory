import { ProcessedTravelAdvisory } from '../types';
export declare class CacheService {
    private cache;
    private readonly CACHE_TTL;
    private readonly ADVISORY_CACHE_KEY;
    private readonly LAST_UPDATED_KEY;
    constructor();
    /**
     * Gets cached travel advisories
     */
    getTravelAdvisories(): ProcessedTravelAdvisory[] | undefined;
    /**
     * Sets travel advisories in cache
     */
    setTravelAdvisories(advisories: ProcessedTravelAdvisory[]): void;
    /**
     * Gets the last updated timestamp
     */
    getLastUpdated(): string | undefined;
    /**
     * Clears all cached data
     */
    clearCache(): void;
    /**
     * Gets cache statistics
     */
    getCacheStats(): {
        keys: string[];
        hits: number;
        misses: number;
        ksize: number;
        vsize: number;
    };
    /**
     * Checks if data is stale (older than cache TTL)
     */
    isDataStale(): boolean;
    /**
     * Gets remaining TTL for cached data
     */
    getRemainingTTL(): number;
}
//# sourceMappingURL=cache.service.d.ts.map