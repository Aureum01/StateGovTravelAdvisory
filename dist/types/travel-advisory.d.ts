export interface TravelAdvisoryCategory {
    domain: string;
    text: string;
}
export interface TravelAdvisoryItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
    categories: TravelAdvisoryCategory[];
    guid: string;
    dcIdentifier?: string;
}
export interface TravelAdvisoryChannel {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    dcDate?: string;
    items: TravelAdvisoryItem[];
}
export interface TravelAdvisoryFeed {
    rss: {
        channel: TravelAdvisoryChannel;
    };
}
export interface ProcessedTravelAdvisory {
    id: string;
    country: string;
    countryCode: string;
    title: string;
    level: string;
    levelNumber: number;
    link: string;
    pubDate: string;
    description: string;
    summary: string;
    restrictions: string[];
    recommendations: string[];
    lastUpdated: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
    requestId: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    timestamp: string;
    requestId: string;
}
export interface TravelAdvisoryFilters {
    level?: string;
    country?: string;
    countryCode?: string;
    limit?: number;
    offset?: number;
    page?: number;
    sortBy?: 'pubDate' | 'country' | 'level';
    sortOrder?: 'asc' | 'desc';
}
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    resetTime: number;
}
export interface ApiError {
    code: string;
    message: string;
    statusCode: number;
    details?: any;
}
//# sourceMappingURL=travel-advisory.d.ts.map