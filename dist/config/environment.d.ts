export declare const config: {
    server: {
        port: number;
        nodeEnv: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
        cacheMaxRequests: number;
    };
    cors: {
        origin: string[];
    };
    logging: {
        level: string;
    };
    request: {
        timeout: number;
    };
    api: {
        title: string;
        description: string;
        version: string;
    };
};
export default config;
//# sourceMappingURL=environment.d.ts.map