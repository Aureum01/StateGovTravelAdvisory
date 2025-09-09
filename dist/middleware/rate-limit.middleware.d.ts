export declare const standardRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const strictRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const createRateLimiters: () => {
    apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
    cacheLimiter: import("express-rate-limit").RateLimitRequestHandler;
};
//# sourceMappingURL=rate-limit.middleware.d.ts.map