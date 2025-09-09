"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSSParserService = void 0;
const rss_parser_1 = __importDefault(require("rss-parser"));
class RSSParserService {
    constructor() {
        this.RSS_URL = 'https://travel.state.gov/_res/rss/TAsTWs.xml';
        this.parser = new rss_parser_1.default({
            customFields: {
                item: [
                    ['category', 'categories', { keepArray: true }],
                    ['dc:identifier', 'dcIdentifier']
                ]
            }
        });
    }
    /**
     * Fetches and parses the travel advisory RSS feed
     */
    async fetchTravelAdvisories() {
        try {
            const feed = await this.parser.parseURL(this.RSS_URL);
            // The rss-parser library returns a flat structure
            // We need to wrap it in the expected TravelAdvisoryFeed format
            const result = {
                rss: {
                    channel: {
                        title: feed.title || 'Travel Advisories',
                        link: feed.link || 'https://travel.state.gov',
                        description: feed.description || 'Travel Advisories from U.S. Department of State',
                        pubDate: feed.pubDate || new Date().toISOString(),
                        dcDate: feed.dcDate,
                        items: Array.isArray(feed.items) ? feed.items : []
                    }
                }
            };
            return result;
        }
        catch (error) {
            console.error('RSS Parser Error:', error);
            throw new Error(`Failed to fetch RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Processes raw RSS items into structured travel advisory objects
     */
    processAdvisoryItems(items) {
        return items.map(item => this.processAdvisoryItem(item));
    }
    /**
     * Processes a single advisory item
     */
    processAdvisoryItem(item) {
        const categories = this.parseCategories(item.categories);
        const { country, countryCode } = this.extractCountryInfo(item.title);
        const { level, levelNumber } = this.extractThreatLevel(categories.threatLevel);
        const description = item.description || '';
        const { restrictions, recommendations } = this.parseDescription(description);
        return {
            id: this.generateId(item.guid),
            country,
            countryCode,
            title: item.title,
            level: categories.threatLevel || 'Unknown',
            levelNumber,
            link: item.link,
            pubDate: item.pubDate,
            description: this.cleanHtmlDescription(item.description),
            summary: this.extractSummary(item.description),
            restrictions,
            recommendations,
            lastUpdated: new Date(item.pubDate)
        };
    }
    /**
     * Parses categories from RSS item
     */
    parseCategories(categories) {
        const result = {
            threatLevel: '',
            countryTag: '',
            keywords: []
        };
        if (!Array.isArray(categories))
            return result;
        categories.forEach(cat => {
            const category = typeof cat === 'string' ? { domain: 'Keyword', _: cat } : cat;
            // Handle the rss-parser library's category structure
            const domain = category.$?.domain || category.domain;
            const text = category._ || category.text || '';
            switch (domain) {
                case 'Threat-Level':
                    result.threatLevel = text;
                    break;
                case 'Country-Tag':
                    result.countryTag = text;
                    break;
                case 'Keyword':
                    result.keywords.push(text);
                    break;
            }
        });
        return result;
    }
    /**
     * Extracts country name and code from title
     */
    extractCountryInfo(title) {
        // Pattern: "Country Name - Level X: Description"
        const match = title.match(/^(.+?)\s*-\s*Level\s+\d+:/);
        if (match) {
            const country = match[1].trim();
            // Simple country code extraction - could be enhanced with a lookup table
            const countryCode = this.countryToCode(country);
            return { country, countryCode };
        }
        // Fallback: try to extract just the country name
        const fallbackMatch = title.match(/^([^-\n]+)/);
        if (fallbackMatch) {
            const country = fallbackMatch[1].trim();
            const countryCode = this.countryToCode(country);
            return { country, countryCode };
        }
        return { country: title, countryCode: 'XX' };
    }
    /**
     * Comprehensive country to code mapping
     */
    countryToCode(country) {
        const countryMap = {
            // Common countries from travel advisories
            'Afghanistan': 'AF',
            'Albania': 'AL',
            'Algeria': 'DZ',
            'Argentina': 'AR',
            'Armenia': 'AM',
            'Australia': 'AU',
            'Austria': 'AT',
            'Azerbaijan': 'AZ',
            'Bahamas': 'BS',
            'Bahrain': 'BH',
            'Bangladesh': 'BD',
            'Barbados': 'BB',
            'Belarus': 'BY',
            'Belgium': 'BE',
            'Belize': 'BZ',
            'Benin': 'BJ',
            'Bhutan': 'BT',
            'Bolivia': 'BO',
            'Botswana': 'BW',
            'Brazil': 'BR',
            'Brunei': 'BN',
            'Bulgaria': 'BG',
            'Burkina Faso': 'BF',
            'Burundi': 'BI',
            'Cabo Verde': 'CV',
            'Cambodia': 'KH',
            'Cameroon': 'CM',
            'Canada': 'CA',
            'Central African Republic': 'CF',
            'Chad': 'TD',
            'Chile': 'CL',
            'China': 'CN',
            'Colombia': 'CO',
            'Comoros': 'KM',
            'Congo': 'CG',
            'Costa Rica': 'CR',
            'Cote d\'Ivoire': 'CI',
            'Croatia': 'HR',
            'Cuba': 'CU',
            'Cyprus': 'CY',
            'Czech Republic': 'CZ',
            'Democratic Republic of the Congo': 'CD',
            'Denmark': 'DK',
            'Djibouti': 'DJ',
            'Dominican Republic': 'DO',
            'Ecuador': 'EC',
            'Egypt': 'EG',
            'El Salvador': 'SV',
            'Equatorial Guinea': 'GQ',
            'Eritrea': 'ER',
            'Estonia': 'EE',
            'Eswatini': 'SZ',
            'Ethiopia': 'ET',
            'Fiji': 'FJ',
            'Finland': 'FI',
            'France': 'FR',
            'Gabon': 'GA',
            'Gambia': 'GM',
            'Georgia': 'GE',
            'Germany': 'DE',
            'Ghana': 'GH',
            'Greece': 'GR',
            'Guatemala': 'GT',
            'Guinea': 'GN',
            'Guinea-Bissau': 'GW',
            'Guyana': 'GY',
            'Haiti': 'HT',
            'Honduras': 'HN',
            'Hungary': 'HU',
            'Iceland': 'IS',
            'India': 'IN',
            'Indonesia': 'ID',
            'Iran': 'IR',
            'Iraq': 'IQ',
            'Ireland': 'IE',
            'Israel': 'IL',
            'Italy': 'IT',
            'Jamaica': 'JM',
            'Japan': 'JP',
            'Jordan': 'JO',
            'Kazakhstan': 'KZ',
            'Kenya': 'KE',
            'Kiribati': 'KI',
            'Kosovo': 'XK',
            'Kuwait': 'KW',
            'Kyrgyzstan': 'KG',
            'Laos': 'LA',
            'Latvia': 'LV',
            'Lebanon': 'LB',
            'Lesotho': 'LS',
            'Liberia': 'LR',
            'Libya': 'LY',
            'Liechtenstein': 'LI',
            'Lithuania': 'LT',
            'Luxembourg': 'LU',
            'Madagascar': 'MG',
            'Malawi': 'MW',
            'Malaysia': 'MY',
            'Maldives': 'MV',
            'Mali': 'ML',
            'Malta': 'MT',
            'Marshall Islands': 'MH',
            'Mauritania': 'MR',
            'Mauritius': 'MU',
            'Mexico': 'MX',
            'Micronesia': 'FM',
            'Moldova': 'MD',
            'Monaco': 'MC',
            'Mongolia': 'MN',
            'Montenegro': 'ME',
            'Morocco': 'MA',
            'Mozambique': 'MZ',
            'Myanmar': 'MM',
            'Namibia': 'NA',
            'Nauru': 'NR',
            'Nepal': 'NP',
            'Netherlands': 'NL',
            'New Caledonia': 'NC',
            'New Zealand': 'NZ',
            'Nicaragua': 'NI',
            'Niger': 'NE',
            'Nigeria': 'NG',
            'North Korea': 'KP',
            'North Macedonia': 'MK',
            'Norway': 'NO',
            'Oman': 'OM',
            'Pakistan': 'PK',
            'Palau': 'PW',
            'Panama': 'PA',
            'Papua New Guinea': 'PG',
            'Paraguay': 'PY',
            'Peru': 'PE',
            'Philippines': 'PH',
            'Poland': 'PL',
            'Portugal': 'PT',
            'Qatar': 'QA',
            'Romania': 'RO',
            'Russia': 'RU',
            'Rwanda': 'RW',
            'Saint Kitts and Nevis': 'KN',
            'Saint Lucia': 'LC',
            'Saint Vincent and the Grenadines': 'VC',
            'Samoa': 'WS',
            'San Marino': 'SM',
            'Sao Tome and Principe': 'ST',
            'Saudi Arabia': 'SA',
            'Senegal': 'SN',
            'Serbia': 'RS',
            'Seychelles': 'SC',
            'Sierra Leone': 'SL',
            'Singapore': 'SG',
            'Slovakia': 'SK',
            'Slovenia': 'SI',
            'Solomon Islands': 'SB',
            'Somalia': 'SO',
            'South Africa': 'ZA',
            'South Korea': 'KR',
            'South Sudan': 'SS',
            'Spain': 'ES',
            'Sri Lanka': 'LK',
            'Sudan': 'SD',
            'Suriname': 'SR',
            'Sweden': 'SE',
            'Switzerland': 'CH',
            'Syria': 'SY',
            'Taiwan': 'TW',
            'Tajikistan': 'TJ',
            'Tanzania': 'TZ',
            'Thailand': 'TH',
            'Timor-Leste': 'TL',
            'Togo': 'TG',
            'Tonga': 'TO',
            'Trinidad and Tobago': 'TT',
            'Tunisia': 'TN',
            'Turkey': 'TR',
            'Turkmenistan': 'TM',
            'Tuvalu': 'TV',
            'Uganda': 'UG',
            'Ukraine': 'UA',
            'United Arab Emirates': 'AE',
            'United Kingdom': 'GB',
            'United States': 'US',
            'Uruguay': 'UY',
            'Uzbekistan': 'UZ',
            'Vanuatu': 'VU',
            'Vatican City': 'VA',
            'Venezuela': 'VE',
            'Vietnam': 'VN',
            'Yemen': 'YE',
            'Zambia': 'ZM',
            'Zimbabwe': 'ZW'
        };
        // Handle case-insensitive matching
        const normalizedCountry = country.toLowerCase().trim();
        for (const [countryName, code] of Object.entries(countryMap)) {
            if (countryName.toLowerCase() === normalizedCountry) {
                return code;
            }
        }
        return 'XX';
    }
    /**
     * Extracts threat level number from level string
     */
    extractThreatLevel(level) {
        const match = level.match(/Level (\d+)/);
        const levelNumber = match ? parseInt(match[1], 10) : 0;
        return {
            level,
            levelNumber
        };
    }
    /**
     * Parses HTML description to extract restrictions and recommendations
     */
    parseDescription(description) {
        const restrictions = [];
        const recommendations = [];
        // Handle empty or undefined descriptions
        if (!description || typeof description !== 'string') {
            return { restrictions, recommendations };
        }
        try {
            // Extract "Do Not Travel To" sections
            const doNotTravelMatch = description.match(/<b>Do Not Travel To These Areas for Any Reason:<\/b>(.*?)<\/ul>/s);
            if (doNotTravelMatch) {
                const listItems = doNotTravelMatch[1].match(/<li>(.*?)<\/li>/g);
                if (listItems) {
                    restrictions.push(...listItems.map(item => this.stripHtml(item)));
                }
            }
            // Extract "U.S. Embassy employees..." sections
            const embassyMatch = description.match(/<p>U\.S\. Embassy employees.*?<\/p>(.*?)(?=<p>|$)/s);
            if (embassyMatch) {
                const listItems = embassyMatch[1].match(/<li>(.*?)<\/li>/g);
                if (listItems) {
                    restrictions.push(...listItems.map(item => this.stripHtml(item)));
                }
            }
            // Extract recommendations from bullet points
            const recommendationMatches = description.match(/<ul>(.*?)<\/ul>/gs);
            if (recommendationMatches) {
                recommendationMatches.forEach(match => {
                    const listItems = match.match(/<li>(.*?)<\/li>/g);
                    if (listItems) {
                        recommendations.push(...listItems.map(item => this.stripHtml(item)));
                    }
                });
            }
        }
        catch (error) {
            console.warn('Error parsing description:', error);
            // Return empty arrays if parsing fails
        }
        return { restrictions, recommendations };
    }
    /**
     * Extracts a brief summary from the description
     */
    extractSummary(description) {
        // Handle empty or undefined descriptions
        if (!description || typeof description !== 'string') {
            return 'No summary available';
        }
        try {
            // Try to find the country summary section
            const summaryMatch = description.match(/<b>Country Summary:<\/b>(.*?)<\/p>/s);
            if (summaryMatch) {
                return this.stripHtml(summaryMatch[1]).trim();
            }
            // Fallback: take first paragraph
            const firstParagraph = description.match(/<p>(.*?)<\/p>/s);
            if (firstParagraph) {
                return this.stripHtml(firstParagraph[1]).trim();
            }
        }
        catch (error) {
            console.warn('Error extracting summary:', error);
        }
        return 'No summary available';
    }
    /**
     * Cleans HTML from description text
     */
    cleanHtmlDescription(description) {
        if (!description || typeof description !== 'string') {
            return '';
        }
        return this.stripHtml(description).replace(/\s+/g, ' ').trim();
    }
    /**
     * Strips HTML tags from text
     */
    stripHtml(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&[#\w]+;/g, ' ');
    }
    /**
     * Generates a unique ID from GUID
     */
    generateId(guid) {
        if (!guid || typeof guid !== 'string') {
            return 'unknown_' + Date.now().toString().substr(-8);
        }
        try {
            return Buffer.from(guid).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substr(0, 12);
        }
        catch (error) {
            return 'error_' + Date.now().toString().substr(-8);
        }
    }
}
exports.RSSParserService = RSSParserService;
//# sourceMappingURL=rss-parser.service.js.map