import NodeCache from 'node-cache';
import { ProcessedTravelAdvisory } from '../types';

export class CacheService {
  private cache: NodeCache;
  private readonly CACHE_TTL = 30 * 60; // 30 minutes in seconds
  private readonly ADVISORY_CACHE_KEY = 'travel_advisories';
  private readonly LAST_UPDATED_KEY = 'last_updated';

  constructor() {
    this.cache = new NodeCache({
      stdTTL: this.CACHE_TTL,
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false
    });
  }

  /**
   * Gets cached travel advisories
   */
  getTravelAdvisories(): ProcessedTravelAdvisory[] | undefined {
    return this.cache.get(this.ADVISORY_CACHE_KEY);
  }

  /**
   * Sets travel advisories in cache
   */
  setTravelAdvisories(advisories: ProcessedTravelAdvisory[]): void {
    this.cache.set(this.ADVISORY_CACHE_KEY, advisories);
    this.cache.set(this.LAST_UPDATED_KEY, new Date().toISOString());
  }

  /**
   * Gets the last updated timestamp
   */
  getLastUpdated(): string | undefined {
    return this.cache.get(this.LAST_UPDATED_KEY);
  }

  /**
   * Clears all cached data
   */
  clearCache(): void {
    this.cache.del(this.ADVISORY_CACHE_KEY);
    this.cache.del(this.LAST_UPDATED_KEY);
  }

  /**
   * Gets cache statistics
   */
  getCacheStats(): {
    keys: string[];
    hits: number;
    misses: number;
    ksize: number;
    vsize: number;
  } {
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
  isDataStale(): boolean {
    const lastUpdated = this.getLastUpdated();
    if (!lastUpdated) return true;

    const lastUpdatedTime = new Date(lastUpdated).getTime();
    const now = Date.now();
    const age = (now - lastUpdatedTime) / 1000; // Age in seconds

    return age > this.CACHE_TTL;
  }

  /**
   * Gets remaining TTL for cached data
   */
  getRemainingTTL(): number {
    return this.cache.getTtl(this.ADVISORY_CACHE_KEY) || 0;
  }
}
