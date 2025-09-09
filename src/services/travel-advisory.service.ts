import { RSSParserService } from './rss-parser.service';
import { CacheService } from './cache.service';
import {
  ProcessedTravelAdvisory,
  TravelAdvisoryFilters,
  PaginatedResponse,
  ApiResponse
} from '../types';
import winston from 'winston';

export class TravelAdvisoryService {
  private rssParser: RSSParserService;
  private cache: CacheService;
  private logger: winston.Logger;

  constructor() {
    this.rssParser = new RSSParserService();
    this.cache = new CacheService();

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  /**
   * Gets all travel advisories with optional filtering and pagination
   */
  async getTravelAdvisories(filters: TravelAdvisoryFilters = {}): Promise<PaginatedResponse<ProcessedTravelAdvisory>> {
    try {
      let advisories = await this.getAdvisoriesData();

      // Apply filters
      advisories = this.applyFilters(advisories, filters);

      // Apply sorting
      advisories = this.applySorting(advisories, filters);

      // Apply pagination
      const { page = 1, limit = 50 } = filters;
      const offset = (page - 1) * limit;
      const paginatedData = advisories.slice(offset, offset + limit);

      return {
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: advisories.length,
          totalPages: Math.ceil(advisories.length / limit),
          hasNext: offset + limit < advisories.length,
          hasPrev: page > 1
        },
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      };
    } catch (error) {
      this.logger.error('Error fetching travel advisories', { error });
      throw error;
    }
  }

  /**
   * Gets a specific travel advisory by country with enhanced matching
   */
  async getTravelAdvisoryByCountry(country: string): Promise<ApiResponse<ProcessedTravelAdvisory | null>> {
    try {
      const advisories = await this.getAdvisoriesData();

      // Enhanced country matching - try multiple approaches
      let advisory = advisories.find(
        adv => adv.country.toLowerCase() === country.toLowerCase() ||
               adv.countryCode.toLowerCase() === country.toLowerCase()
      );

      // If not found, try partial matching
      if (!advisory) {
        advisory = advisories.find(
          adv => adv.country.toLowerCase().includes(country.toLowerCase()) ||
                 country.toLowerCase().includes(adv.country.toLowerCase()) ||
                 adv.countryCode.toLowerCase() === country.toLowerCase()
        );
      }

      // If still not found, try fuzzy matching for common variations
      if (!advisory) {
        const normalizedInput = country.toLowerCase().trim();
        advisory = advisories.find(adv => {
          const normalizedCountry = adv.country.toLowerCase().trim();
          // Handle special cases like "Cote d'Ivoire" vs "Ivory Coast"
          if (normalizedInput.includes('ivory') && normalizedCountry.includes('ivoire')) return true;
          if (normalizedInput.includes('ivoire') && normalizedCountry.includes('ivory')) return true;
          return false;
        });
      }

      return {
        success: true,
        data: advisory || null,
        message: advisory ? `Advisory found for ${advisory.country}` : `No advisory found for "${country}". Please check the country name or try searching for similar names.`,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      };
    } catch (error) {
      this.logger.error('Error fetching travel advisory by country', { country, error });
      throw error;
    }
  }

  /**
   * Gets travel advisories by threat level
   */
  async getTravelAdvisoriesByLevel(level: string): Promise<ApiResponse<ProcessedTravelAdvisory[]>> {
    try {
      const advisories = await this.getAdvisoriesData();
      const filteredAdvisories = advisories.filter(
        adv => adv.level.toLowerCase().includes(level.toLowerCase())
      );

      return {
        success: true,
        data: filteredAdvisories,
        message: `Found ${filteredAdvisories.length} advisories with level containing "${level}"`,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      };
    } catch (error) {
      this.logger.error('Error fetching travel advisories by level', { level, error });
      throw error;
    }
  }

  /**
   * Gets a list of all available countries with their codes
   */
  async getAvailableCountries(): Promise<ApiResponse<{ countries: Array<{ name: string; code: string; level: string }> }>> {
    try {
      const advisories = await this.getAdvisoriesData();

      const countries = advisories.map(adv => ({
        name: adv.country,
        code: adv.countryCode,
        level: adv.level
      })).sort((a, b) => a.name.localeCompare(b.name));

      return {
        success: true,
        data: { countries },
        message: `Found ${countries.length} countries with travel advisories`,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      };
    } catch (error) {
      this.logger.error('Error fetching available countries', { error });
      throw error;
    }
  }

  /**
   * Gets cache statistics
   */
  getCacheStats(): ApiResponse<any> {
    const stats = this.cache.getCacheStats();
    const lastUpdated = this.cache.getLastUpdated();
    const remainingTTL = this.cache.getRemainingTTL();

    return {
      success: true,
      data: {
        ...stats,
        lastUpdated,
        remainingTTL,
        isDataStale: this.cache.isDataStale()
      },
      message: 'Cache statistics retrieved successfully',
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    };
  }

  /**
   * Refreshes the cache by fetching fresh data from RSS feed
   */
  async refreshCache(): Promise<ApiResponse<boolean>> {
    try {
      this.logger.info('Refreshing travel advisory cache');
      this.cache.clearCache();

      const feed = await this.rssParser.fetchTravelAdvisories();

      // Handle potential undefined channel
      if (!feed.rss || !feed.rss.channel || !Array.isArray(feed.rss.channel.items)) {
        throw new Error('Invalid RSS feed structure: missing or invalid items array');
      }

      const processedAdvisories = this.rssParser.processAdvisoryItems(feed.rss.channel.items);

      this.cache.setTravelAdvisories(processedAdvisories);

      this.logger.info(`Cache refreshed with ${processedAdvisories.length} advisories`);

      return {
        success: true,
        data: true,
        message: `Cache refreshed successfully with ${processedAdvisories.length} advisories`,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      };
    } catch (error) {
      this.logger.error('Error refreshing cache', { error });
      throw error;
    }
  }

  /**
   * Gets advisories data, using cache if available and not stale
   */
  private async getAdvisoriesData(): Promise<ProcessedTravelAdvisory[]> {
    let advisories = this.cache.getTravelAdvisories();

    if (!advisories || this.cache.isDataStale()) {
      this.logger.info('Cache miss or stale data, fetching from RSS feed');
      await this.refreshCache();
      advisories = this.cache.getTravelAdvisories();
    }

    return advisories || [];
  }

  /**
   * Applies filters to the advisories array
   */
  private applyFilters(advisories: ProcessedTravelAdvisory[], filters: TravelAdvisoryFilters): ProcessedTravelAdvisory[] {
    let filtered = [...advisories];

    if (filters.level) {
      filtered = filtered.filter(adv =>
        adv.level.toLowerCase().includes(filters.level!.toLowerCase())
      );
    }

    if (filters.country) {
      filtered = filtered.filter(adv =>
        adv.country.toLowerCase().includes(filters.country!.toLowerCase())
      );
    }

    if (filters.countryCode) {
      filtered = filtered.filter(adv =>
        adv.countryCode.toLowerCase() === filters.countryCode!.toLowerCase()
      );
    }

    return filtered;
  }

  /**
   * Applies sorting to the advisories array
   */
  private applySorting(advisories: ProcessedTravelAdvisory[], filters: TravelAdvisoryFilters): ProcessedTravelAdvisory[] {
    const { sortBy = 'pubDate', sortOrder = 'desc' } = filters;
    const sorted = [...advisories];

    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'country':
          aValue = a.country.toLowerCase();
          bValue = b.country.toLowerCase();
          break;
        case 'level':
          aValue = a.levelNumber;
          bValue = b.levelNumber;
          break;
        case 'pubDate':
        default:
          aValue = new Date(a.pubDate).getTime();
          bValue = new Date(b.pubDate).getTime();
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  /**
   * Generates a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
