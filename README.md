# Travel Advisory API

A professional REST API that provides access to U.S. Department of State Travel Advisories with comprehensive documentation, rate limiting, and caching capabilities.

## 🚀 Features

- **Real-time Data**: Fetches live travel advisory data from the official U.S. Department of State RSS feed
- **Rate Limiting**: Configurable rate limiting to prevent abuse
- **Caching**: Intelligent caching system to reduce external API calls and improve performance
- **Professional Documentation**: Complete OpenAPI/Swagger documentation
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Robust error handling with detailed logging
- **Security**: Helmet.js security headers, CORS configuration, and input validation
- **Health Monitoring**: Built-in health check endpoints
- **Pagination**: Efficient pagination for large datasets

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [PowerShell Usage Examples](#powershell-usage-examples)
- [Configuration](#configuration)
- [Rate Limiting](#rate-limiting)
- [Caching](#caching)
- [Error Handling](#error-handling)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Quick Reference](#quick-reference)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- TypeScript 5.0+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd travel-advisory-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

## 📖 API Documentation

### Interactive Documentation

Visit `http://localhost:3000/api-docs` for the complete interactive API documentation powered by Swagger UI.

### Health Check

```bash
GET /health
```

Returns the health status of the API.

**Response:**
```json
{
  "success": true,
  "message": "Travel Advisory API is healthy",
  "timestamp": "2025-09-09T00:15:28.100Z",
  "version": "1.0.0",
  "uptime": 123.45,
  "requestId": "req_1634567890123_abc123"
}
```

## 🔗 API Endpoints

### System Endpoints

#### Health Check
```http
GET /health
```

Returns the health status of the API including uptime and version information.

**Example:**
```bash
curl -X GET "http://localhost:3000/health"
```

### Travel Advisories

#### Get All Countries List
```http
GET /api/countries
```

Returns a comprehensive list of all countries with their codes and current advisory levels.

**Response:**
```json
{
  "success": true,
  "data": {
    "countries": [
      {
        "name": "Armenia",
        "code": "AM",
        "level": "Level 2: Exercise Increased Caution"
      },
      {
        "name": "Belarus",
        "code": "BY",
        "level": "Level 4: Do Not Travel"
      }
    ]
  },
  "message": "Found 211 countries with travel advisories",
  "timestamp": "2025-09-09T00:15:28.100Z",
  "requestId": "req_1634567890123_abc123"
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/countries"
```

#### Get Raw Travel Data
```http
GET /api/raw
```

Returns simplified travel advisory data for all countries with essential information only.

**Query Parameters:**
- `limit` (integer): Number of results (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "country": "Armenia",
      "countryCode": "AM",
      "level": "Level 2: Exercise Increased Caution",
      "levelNumber": 2,
      "title": "Armenia - Level 2: Exercise Increased Caution",
      "summary": "Exercise increased caution in Armenia due to areas of potential armed conflict.",
      "restrictions": [],
      "recommendations": [
        "Enroll in the Smart Traveler Enrollment Program (STEP)",
        "Review the Country Security Report"
      ],
      "link": "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/armenia-travel-advisory.html",
      "lastUpdated": "2025-09-08T23:30:08.000Z"
    }
  ],
  "message": "Raw data for 211 countries",
  "timestamp": "2025-09-09T00:15:28.100Z",
  "requestId": "req_1634567890123_abc123"
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/raw?limit=50"
```

#### Get All Advisories
```http
GET /api/advisories
```

Returns all travel advisories with optional filtering, sorting, and pagination.

**Query Parameters:**
- `level` (string): Filter by threat level (e.g., "4", "Level 2", "Do Not Travel")
- `country` (string): Filter by country name
- `countryCode` (string): Filter by country code (e.g., "US", "CA")
- `limit` (integer): Number of results (default: 50, max: 100)
- `offset` (integer): Pagination offset (default: 0)
- `sortBy` (string): Sort field (`pubDate`, `country`, `level`) - default: `pubDate`
- `sortOrder` (string): Sort order (`asc`, `desc`) - default: `desc`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123def456",
      "country": "Armenia",
      "countryCode": "AM",
      "title": "Armenia - Level 2: Exercise Increased Caution",
      "level": "Level 2: Exercise Increased Caution",
      "levelNumber": 2,
      "link": "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/armenia-travel-advisory.html",
      "pubDate": "2025-09-08T23:30:08.000Z",
      "description": "Full HTML description...",
      "summary": "Brief summary...",
      "restrictions": ["Border region restrictions"],
      "recommendations": ["STEP enrollment", "Security report review"],
      "lastUpdated": "2025-09-08T23:30:08.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 211,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2025-09-09T00:15:28.100Z",
  "requestId": "req_1634567890123_abc123"
}
```

**Examples:**
```bash
# Get all advisories
curl -X GET "http://localhost:3000/api/advisories"

# Filter by threat level 4
curl -X GET "http://localhost:3000/api/advisories?level=4"

# Filter by country and limit results
curl -X GET "http://localhost:3000/api/advisories?country=Armenia&limit=1"

# Sort by country name
curl -X GET "http://localhost:3000/api/advisories?sortBy=country&sortOrder=asc"
```

#### Get Advisory by Country
```http
GET /api/advisories/{country}
```

Returns travel advisory information for a specific country.

**Path Parameters:**
- `country` (string): Country name or country code (case-insensitive)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "country": "Armenia",
    "countryCode": "AM",
    "title": "Armenia - Level 2: Exercise Increased Caution",
    "level": "Level 2: Exercise Increased Caution",
    "levelNumber": 2,
    "link": "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/armenia-travel-advisory.html",
    "pubDate": "2025-09-08T23:30:08.000Z",
    "description": "Full HTML description...",
    "summary": "Brief summary...",
    "restrictions": ["Border region restrictions"],
    "recommendations": ["STEP enrollment", "Security report review"],
    "lastUpdated": "2025-09-08T23:30:08.000Z"
  },
  "message": "Advisory found for Armenia",
  "timestamp": "2025-09-09T00:15:28.100Z",
  "requestId": "req_1634567890123_abc123"
}
```

**Examples:**
```bash
# By country name
curl -X GET "http://localhost:3000/api/advisories/Armenia"

# By country code
curl -X GET "http://localhost:3000/api/advisories/US"

# Case insensitive
curl -X GET "http://localhost:3000/api/advisories/armenia"
```

#### Get Advisories by Threat Level
```http
GET /api/advisories/level/{level}
```

Returns all travel advisories for a specific threat level.

**Path Parameters:**
- `level` (string): Threat level number (1-4) or description

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123def456",
      "country": "Armenia",
      "countryCode": "AM",
      "title": "Armenia - Level 2: Exercise Increased Caution",
      "level": "Level 2: Exercise Increased Caution",
      "levelNumber": 2,
      "link": "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/armenia-travel-advisory.html",
      "pubDate": "2025-09-08T23:30:08.000Z",
      "description": "Full HTML description...",
      "summary": "Brief summary...",
      "restrictions": ["Border region restrictions"],
      "recommendations": ["STEP enrollment", "Security report review"],
      "lastUpdated": "2025-09-08T23:30:08.000Z"
    }
  ],
  "message": "Found 45 advisories with level containing '2'",
  "timestamp": "2025-09-09T00:15:28.100Z",
  "requestId": "req_1634567890123_abc123"
}
```

**Examples:**
```bash
# By level number
curl -X GET "http://localhost:3000/api/advisories/level/4"

# By level description
curl -X GET "http://localhost:3000/api/advisories/level/Do%20Not%20Travel"
```

### Cache Management

#### Get Cache Statistics
```http
GET /api/cache/stats
```

Returns information about the current cache state and performance statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "keys": ["travel_advisories", "last_updated"],
    "hits": 150,
    "misses": 5,
    "ksize": 2,
    "vsize": 45632,
    "lastUpdated": "2025-09-08T23:30:08.000Z",
    "remainingTTL": 1800,
    "isDataStale": false
  },
  "message": "Cache statistics retrieved successfully",
  "timestamp": "2025-09-09T00:15:28.100Z",
  "requestId": "req_1634567890123_abc123"
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/cache/stats"
```

#### Refresh Cache
```http
POST /api/cache/refresh
```

Forces a refresh of the travel advisory cache by fetching fresh data from the RSS feed.

**Response:**
```json
{
  "success": true,
  "data": true,
  "message": "Cache refreshed successfully with 211 advisories",
  "timestamp": "2025-09-09T00:15:28.100Z",
  "requestId": "req_1634567890123_abc123"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/cache/refresh"
```

### Documentation Endpoints

#### Swagger UI Documentation
```http
GET /api-docs
```

Interactive API documentation powered by Swagger UI.

#### OpenAPI JSON Specification
```http
GET /api-docs.json
```

Returns the OpenAPI specification in JSON format.

## 🪟 PowerShell Usage Examples

Since this API is often used in Windows environments, here are PowerShell examples for common operations:

### Get All Countries
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/countries" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | Select-Object -ExpandProperty data | Select-Object -ExpandProperty countries
```

### Get Specific Country Data
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/advisories/Armenia" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | Select-Object -ExpandProperty data
```

### Filter by Threat Level
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/advisories?level=4&limit=5" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | Select-Object -ExpandProperty data
```

### Get Raw Data for Custom Processing
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/raw?limit=10" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | Select-Object -ExpandProperty data | Select-Object country, level, levelNumber
```

### Get Cache Statistics
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/cache/stats" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | Select-Object -ExpandProperty data
```

### Refresh Cache Data
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/cache/refresh" -Method POST -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

### Advanced: Get Countries by Level with Formatting
```powershell
$advisories = Invoke-WebRequest -Uri "http://localhost:3000/api/advisories" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
$advisories.data | Where-Object { $_.levelNumber -eq 4 } | Select-Object country, level | Format-Table -AutoSize
```

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window in milliseconds (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `CACHE_RATE_LIMIT_MAX` | `10` | Max cache refresh requests per hour |
| `CORS_ORIGIN` | `http://localhost:3000,http://localhost:8080` | Allowed CORS origins |
| `LOG_LEVEL` | `info` | Logging level |
| `REQUEST_TIMEOUT` | `30000` | Request timeout in milliseconds |

### Sample .env file:

```env
PORT=3000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_RATE_LIMIT_MAX=10
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
LOG_LEVEL=info
REQUEST_TIMEOUT=30000
```

## 🛡️ Rate Limiting

The API implements multiple layers of rate limiting:

### General API Rate Limiting
- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Headers**: Includes `X-RateLimit-*` headers

### Cache Management Rate Limiting
- **Window**: 1 hour
- **Max Requests**: 10 per IP
- **Endpoints**: `/api/cache/*`

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1634567890
```

## 💾 Caching

The API uses an intelligent caching system:

- **Cache Duration**: 30 minutes
- **Auto-refresh**: Automatically fetches fresh data when cache expires
- **Memory-based**: Uses Node.js memory for fast access
- **Statistics**: Available via `/api/cache/stats`

### Cache Response Example:

```json
{
  "success": true,
  "data": {
    "keys": ["travel_advisories", "last_updated"],
    "hits": 150,
    "misses": 5,
    "ksize": 2,
    "vsize": 45632,
    "lastUpdated": "2025-09-08T23:30:08.000Z",
    "remainingTTL": 1800,
    "isDataStale": false
  }
}
```

## 🚨 Error Handling

The API provides comprehensive error handling:

### Error Response Format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-09-08T23:30:08.000Z",
  "requestId": "req_1634567890123_abc123"
}
```

### Common Error Codes:

- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `EXTERNAL_SERVICE_ERROR`: RSS feed unavailable
- `INTERNAL_ERROR`: Internal server error

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Utilities
npm run lint        # Type check with TypeScript
npm run clean       # Clean build directory
```

### Project Structure

```
src/
├── config/          # Application configuration
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/          # API route definitions
├── services/        # Business logic services
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting (configured via tsconfig)
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# With coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/           # Unit tests
└── integration/   # Integration tests
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "start"]
```

### Build Commands

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database/redis if used
3. Set appropriate CORS origins
4. Configure logging for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Use conventional commits
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please contact:
- **Email**: support@travel-advisory-api.com
- **Documentation**: [API Docs](http://localhost:3000/api-docs)
- **Issues**: [GitHub Issues](https://github.com/username/travel-advisory-api/issues)

## 🙏 Acknowledgments

- U.S. Department of State for providing the travel advisory data
- Express.js team for the excellent web framework
- Swagger/OpenAPI for API documentation standards

---

## 📚 Quick Reference

| Endpoint | Method | Purpose | Example |
|----------|--------|---------|---------|
| `/health` | GET | API health check | `GET /health` |
| `/api/countries` | GET | List all countries | `GET /api/countries` |
| `/api/raw` | GET | Simplified data for all countries | `GET /api/raw?limit=50` |
| `/api/advisories` | GET | All advisories with filtering | `GET /api/advisories?level=4` |
| `/api/advisories/{country}` | GET | Specific country advisory | `GET /api/advisories/Armenia` |
| `/api/advisories/level/{level}` | GET | Advisories by threat level | `GET /api/advisories/level/4` |
| `/api/cache/stats` | GET | Cache statistics | `GET /api/cache/stats` |
| `/api/cache/refresh` | POST | Force cache refresh | `POST /api/cache/refresh` |
| `/api-docs` | GET | Interactive documentation | Visit in browser |

### Response Format

All API responses follow this consistent structure:

```json
{
  "success": true|false,
  "data": { ... } | [ ... ] | null,
  "message": "Human-readable message",
  "timestamp": "ISO 8601 timestamp",
  "requestId": "Unique request identifier"
}
```

### Threat Levels

- **Level 1**: Exercise Normal Precautions
- **Level 2**: Exercise Increased Caution
- **Level 3**: Reconsider Travel
- **Level 4**: Do Not Travel

### Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `country` | string | Country name |
| `countryCode` | string | ISO country code (2-3 characters) |
| `level` | string | Full threat level description |
| `levelNumber` | number | Numeric threat level (1-4) |
| `title` | string | Advisory title |
| `summary` | string | Brief summary (may be "No summary available") |
| `restrictions` | array | List of travel restrictions |
| `recommendations` | array | List of travel recommendations |
| `link` | string | Link to official advisory |
| `lastUpdated` | string | Last update timestamp |

---

**Made with ❤️ for safe travels worldwide**
