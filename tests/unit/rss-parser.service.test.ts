import { RSSParserService } from '../../src/services/rss-parser.service';
import { TravelAdvisoryItem } from '../../src/types';

describe('RSSParserService', () => {
  let service: RSSParserService;

  beforeEach(() => {
    service = new RSSParserService();
  });

  describe('processAdvisoryItem', () => {
    it('should process a valid advisory item correctly', () => {
      const mockItem: TravelAdvisoryItem = {
        title: 'Armenia - Level 2: Exercise Increased Caution',
        link: 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/armenia-travel-advisory.html',
        pubDate: 'Fri, 05 Sep 2025',
        description: '<p>Exercise increased caution in Armenia due to areas of potential armed conflict.</p>',
        categories: [
          { domain: 'Threat-Level', text: 'Level 2: Exercise Increased Caution' },
          { domain: 'Country-Tag', text: 'AM' },
          { domain: 'Keyword', text: 'advisory' }
        ],
        guid: 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/armenia-travel-advisory.html',
        dcIdentifier: 'AM,advisory'
      };

      const result = service.processAdvisoryItem(mockItem);

      expect(result).toEqual({
        id: expect.any(String),
        country: 'Armenia',
        countryCode: 'AM',
        title: 'Armenia - Level 2: Exercise Increased Caution',
        level: 'Level 2: Exercise Increased Caution',
        levelNumber: 2,
        link: 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/armenia-travel-advisory.html',
        pubDate: 'Fri, 05 Sep 2025',
        description: 'Exercise increased caution in Armenia due to areas of potential armed conflict.',
        summary: 'Exercise increased caution in Armenia due to areas of potential armed conflict.',
        restrictions: [],
        recommendations: [],
        lastUpdated: expect.any(Date)
      });
    });

    it('should extract restrictions from HTML description', () => {
      const mockItem: TravelAdvisoryItem = {
        title: 'Test Country - Level 4: Do Not Travel',
        link: 'https://example.com',
        pubDate: 'Mon, 08 Sep 2025',
        description: `
          <p><b>Do not travel to Test Country due to:</b></p>
          <ul>
            <li>The risk of terrorism.</li>
            <li>Civil unrest.</li>
          </ul>
          <p><b>Country Summary:</b></p>
          <p>High risk of terrorist attacks.</p>
        `,
        categories: [
          { domain: 'Threat-Level', text: 'Level 4: Do Not Travel' },
          { domain: 'Country-Tag', text: 'TC' }
        ],
        guid: 'https://example.com',
        dcIdentifier: 'TC,advisory'
      };

      const result = service.processAdvisoryItem(mockItem);

      expect(result.restrictions).toEqual([
        'The risk of terrorism.',
        'Civil unrest.'
      ]);
      expect(result.summary).toBe('High risk of terrorist attacks.');
    });

    it('should handle unknown country codes', () => {
      const mockItem: TravelAdvisoryItem = {
        title: 'Unknown Country - Level 1: Exercise Normal Precautions',
        link: 'https://example.com',
        pubDate: 'Mon, 08 Sep 2025',
        description: '<p>Normal precautions recommended.</p>',
        categories: [
          { domain: 'Threat-Level', text: 'Level 1: Exercise Normal Precautions' }
        ],
        guid: 'https://example.com'
      };

      const result = service.processAdvisoryItem(mockItem);

      expect(result.countryCode).toBe('XX');
      expect(result.levelNumber).toBe(1);
    });
  });

  describe('extractCountryInfo', () => {
    it('should extract country name and code correctly', () => {
      const title = 'France - Level 1: Exercise Normal Precautions';
      const result = (service as any).extractCountryInfo(title);

      expect(result).toEqual({
        country: 'France',
        countryCode: 'XX' // Would be mapped if in the country map
      });
    });
  });

  describe('extractThreatLevel', () => {
    it('should extract threat level number', () => {
      const level = 'Level 3: Reconsider Travel';
      const result = (service as any).extractThreatLevel(level);

      expect(result).toEqual({
        level: 'Level 3: Reconsider Travel',
        levelNumber: 3
      });
    });

    it('should handle non-standard level formats', () => {
      const level = 'Do Not Travel';
      const result = (service as any).extractThreatLevel(level);

      expect(result).toEqual({
        level: 'Do Not Travel',
        levelNumber: 0
      });
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags and clean text', () => {
      const html = '<p>Hello <strong>world</strong>!</p><br>&nbsp;';
      const result = (service as any).stripHtml(html);

      expect(result).toBe('Hello world! ');
    });
  });

  describe('generateId', () => {
    it('should generate consistent IDs from GUIDs', () => {
      const guid = 'https://travel.state.gov/test-guid';
      const result1 = (service as any).generateId(guid);
      const result2 = (service as any).generateId(guid);

      expect(result1).toBe(result2);
      expect(result1).toHaveLength(12);
    });
  });
});
