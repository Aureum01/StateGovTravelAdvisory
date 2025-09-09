"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
class CacheService {
    constructor() {
        this.CACHE_TTL = 30 * 60; // 30 minutes in seconds
        this.ADVISORY_CACHE_KEY = 'travel_advisories';
        this.LAST_UPDATED_KEY = 'last_updated';
        this.cache = new node_cache_1.default({
            stdTTL: this.CACHE_TTL,
            checkperiod: 60, // Check for expired keys every 60 seconds
            useClones: false
        });
    }
    /**
     * Gets cached travel advisories
     */
    getTravelAdvisories() {
        return this.cache.get(this.ADVISORY_CACHE_KEY);
    }
    /**
     * Sets travel advisories in cache
     */
    setTravelAdvisories(advisories) {
        this.cache.set(this.ADVISORY_CACHE_KEY, advisories);
        this.cache.set(this.LAST_UPDATED_KEY, new Date().toISOString());
    }
    /**
     * Gets the last updated timestamp
     */
    getLastUpdated() {
        return this.cache.get(this.LAST_UPDATED_KEY);
    }
    /**
     * Clears all cached data
     */
    clearCache() {
        this.cache.del(this.ADVISORY_CACHE_KEY);
        this.cache.del(this.LAST_UPDATED_KEY);
    }
    /**
     * Gets cache statistics
     */
    getCacheStats() {
        const stats = this.cache.getStats();
        return {
            keys: Object.keys(stats),
            hits: stats.hits,
            misses: stats.misses,
            ksize: stats.ksize,
            vsize: stats.vsize
        };
    }
    /**
     * Checks if data is stale (older than cache TTL)
     */
    isDataStale() {
        const lastUpdated = this.getLastUpdated();
        if (!lastUpdated)
            return true;
        const lastUpdatedTime = new Date(lastUpdated).getTime();
        const now = Date.now();
        const age = (now - lastUpdatedTime) / 1000; // Age in seconds
        return age > this.CACHE_TTL;
    }
    /**
     * Gets remaining TTL for cached data
     */
    getRemainingTTL() {
        return this.cache.getTtl(this.ADVISORY_CACHE_KEY) || 0;
    }
}
exports.CacheService = CacheService;
//# sourceMappingURL=cache.service.js.map