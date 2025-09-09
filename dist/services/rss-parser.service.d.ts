import { TravelAdvisoryFeed, TravelAdvisoryItem, ProcessedTravelAdvisory } from '../types';
export declare class RSSParserService {
    private parser;
    private readonly RSS_URL;
    constructor();
    /**
     * Fetches and parses the travel advisory RSS feed
     */
    fetchTravelAdvisories(): Promise<TravelAdvisoryFeed>;
    /**
     * Processes raw RSS items into structured travel advisory objects
     */
    processAdvisoryItems(items: TravelAdvisoryItem[]): ProcessedTravelAdvisory[];
    /**
     * Processes a single advisory item
     */
    private processAdvisoryItem;
    /**
     * Parses categories from RSS item
     */
    private parseCategories;
    /**
     * Extracts country name and code from title
     */
    private extractCountryInfo;
    /**
     * Comprehensive country to code mapping
     */
    private countryToCode;
    /**
     * Extracts threat level number from level string
     */
    private extractThreatLevel;
    /**
     * Parses HTML description to extract restrictions and recommendations
     */
    private parseDescription;
    /**
     * Extracts a brief summary from the description
     */
    private extractSummary;
    /**
     * Cleans HTML from description text
     */
    private cleanHtmlDescription;
    /**
     * Strips HTML tags from text
     */
    private stripHtml;
    /**
     * Generates a unique ID from GUID
     */
    private generateId;
}
//# sourceMappingURL=rss-parser.service.d.ts.map