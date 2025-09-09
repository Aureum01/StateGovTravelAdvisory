"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const environment_1 = __importDefault(require("./environment"));
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: environment_1.default.api.title,
        version: environment_1.default.api.version,
        description: environment_1.default.api.description,
        contact: {
            name: 'API Support',
            email: 'support@travel-advisory-api.com'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        }
    },
    servers: [
        {
            url: `http://localhost:${environment_1.default.server.port}/api`,
            description: 'Development server'
        },
        {
            url: 'https://api.travel-advisory.com/api',
            description: 'Production server'
        }
    ],
    components: {
        schemas: {
            ProcessedTravelAdvisory: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'Unique identifier for the travel advisory',
                        example: 'abc123def456'
                    },
                    country: {
                        type: 'string',
                        description: 'Country name',
                        example: 'Armenia'
                    },
                    countryCode: {
                        type: 'string',
                        description: 'ISO country code',
                        example: 'AM'
                    },
                    title: {
                        type: 'string',
                        description: 'Travel advisory title',
                        example: 'Armenia - Level 2: Exercise Increased Caution'
                    },
                    level: {
                        type: 'string',
                        description: 'Threat level description',
                        example: 'Level 2: Exercise Increased Caution'
                    },
                    levelNumber: {
                        type: 'integer',
                        description: 'Numeric threat level (1-4)',
                        example: 2,
                        minimum: 1,
                        maximum: 4
                    },
                    link: {
                        type: 'string',
                        format: 'uri',
                        description: 'Link to official travel advisory page',
                        example: 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/armenia-travel-advisory.html'
                    },
                    pubDate: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Publication date of the advisory',
                        example: '2025-09-05T00:00:00.000Z'
                    },
                    description: {
                        type: 'string',
                        description: 'Full description of the advisory (cleaned HTML)',
                        example: 'Exercise increased caution in Armenia due to areas of potential armed conflict...'
                    },
                    summary: {
                        type: 'string',
                        description: 'Brief summary of the advisory',
                        example: 'U.S. citizens should exercise increased caution in Armenia...'
                    },
                    restrictions: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        description: 'List of travel restrictions',
                        example: ['The border region with Azerbaijan', 'Gegharkunik region east of Vardenis']
                    },
                    recommendations: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        description: 'List of travel recommendations',
                        example: ['Enroll in the Smart Traveler Enrollment Program (STEP)', 'Review the Country Security Report']
                    },
                    lastUpdated: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Last update timestamp',
                        example: '2025-09-08T23:30:08.000Z'
                    }
                },
                required: ['id', 'country', 'title', 'level', 'link', 'pubDate']
            },
            ApiResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        description: 'Indicates if the request was successful',
                        example: true
                    },
                    data: {
                        description: 'Response data (varies by endpoint)',
                        oneOf: [
                            { $ref: '#/components/schemas/ProcessedTravelAdvisory' },
                            {
                                type: 'array',
                                items: { $ref: '#/components/schemas/ProcessedTravelAdvisory' }
                            },
                            { type: 'object' }
                        ]
                    },
                    error: {
                        type: 'string',
                        description: 'Error message (only present if success is false)',
                        example: 'Country not found'
                    },
                    message: {
                        type: 'string',
                        description: 'Additional information message',
                        example: 'Advisory found'
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Response timestamp',
                        example: '2025-09-08T23:30:08.000Z'
                    },
                    requestId: {
                        type: 'string',
                        description: 'Unique request identifier for tracking',
                        example: 'req_1725839408123_abc123def'
                    }
                },
                required: ['success', 'timestamp', 'requestId']
            },
            PaginatedResponse: {
                type: 'object',
                properties: {
                    data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ProcessedTravelAdvisory' },
                        description: 'Array of travel advisories'
                    },
                    pagination: {
                        type: 'object',
                        properties: {
                            page: {
                                type: 'integer',
                                description: 'Current page number',
                                example: 1
                            },
                            limit: {
                                type: 'integer',
                                description: 'Number of items per page',
                                example: 50
                            },
                            total: {
                                type: 'integer',
                                description: 'Total number of items',
                                example: 195
                            },
                            totalPages: {
                                type: 'integer',
                                description: 'Total number of pages',
                                example: 4
                            },
                            hasNext: {
                                type: 'boolean',
                                description: 'Whether there is a next page',
                                example: true
                            },
                            hasPrev: {
                                type: 'boolean',
                                description: 'Whether there is a previous page',
                                example: false
                            }
                        },
                        required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev']
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Response timestamp'
                    },
                    requestId: {
                        type: 'string',
                        description: 'Unique request identifier'
                    }
                },
                required: ['data', 'pagination', 'timestamp', 'requestId']
            },
            Error: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false
                    },
                    error: {
                        type: 'string',
                        description: 'Error message',
                        example: 'Country not found'
                    },
                    code: {
                        type: 'string',
                        description: 'Error code for programmatic handling',
                        example: 'NOT_FOUND'
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Error timestamp'
                    },
                    requestId: {
                        type: 'string',
                        description: 'Unique request identifier'
                    }
                },
                required: ['success', 'error', 'code', 'timestamp', 'requestId']
            }
        },
        securitySchemes: {
            ApiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'X-API-Key',
                description: 'API key for authentication (if required)'
            }
        }
    },
    security: [
        {
            ApiKeyAuth: []
        }
    ],
    tags: [
        {
            name: 'Travel Advisories',
            description: 'Endpoints for retrieving travel advisory information'
        },
        {
            name: 'Cache Management',
            description: 'Endpoints for managing the API cache'
        },
        {
            name: 'System',
            description: 'System health and information endpoints'
        }
    ]
};
const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'] // Paths to files containing OpenAPI definitions
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    // Swagger page
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
        explorer: true,
        swaggerOptions: {
            docExpansion: 'list',
            filter: true,
            showRequestDuration: true,
            syntaxHighlight: {
                activate: true,
                theme: 'arta'
            },
            tryItOutEnabled: true,
            requestInterceptor: (req) => {
                req.headers['X-Request-ID'] = `swagger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                return req;
            }
        },
        customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50 }
      .swagger-ui .scheme-container { background: #f8f9fa }
    `,
        customSiteTitle: `${environment_1.default.api.title} - API Documentation`,
        customfavIcon: '/favicon.ico'
    }));
    // Swagger JSON endpoint
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};
exports.setupSwagger = setupSwagger;
exports.default = swaggerSpec;
//# sourceMappingURL=swagger.js.map