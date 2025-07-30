# Keep Rates - USD/LKR Exchange Rate Tracker

## Project Overview

Keep Rates is a web application that tracks USD/LKR exchange rates from major Sri Lankan banks, providing users with real-time rate information, historical data analysis, and email subscription services for daily rate updates.

## Core Features

### 1. Exchange Rate Data Collection
- **Web Scraping System**: Automated periodic scraping of USD/LKR rates from:
  - Commercial Bank of Ceylon: [Exchange Rates Page](https://www.combank.lk/rates-tariff#exchange-rates)
  - National Development Bank (NDB): [Exchange Rates Page](https://www.ndbbank.com/rates/exchange-rates)
  - Sampath Bank: [Exchange Rates Page](https://www.sampath.lk/rates-and-charges?activeTab=exchange-rates)
  - Central Bank of Sri Lanka (CBSL): [USD/LKR Indicative Rates](https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates/usd-lkr-Indicative-rate-chart)
- **Data Storage**: Store rates with timestamps in PostgreSQL database
- **Scraping Schedule**: External cron service triggers via API (hourly calls)
- **Rate Limiting**: API endpoint with strict hourly rate limits to prevent abuse
- **External Trigger**: Single API endpoint (`/api/scrape/trigger`) for all scraping jobs
- **Error Handling**: Robust error handling for failed scrapes with retry mechanisms
- **Data Validation**: Ensure scraped data integrity and format consistency

### 2. Public Rate Display
- **Homepage**: 
  - Average USD/LKR rate across all banks
  - Quick overview of current market trends
  - Last updated timestamp
  - Rate comparison cards for all banks
- **Individual Bank Pages**:
  - Current buying and selling rates
  - Historical rate charts (daily, weekly, monthly views)
  - Rate volatility indicators
  - Min/Max rates for different time periods
- **Rate Comparison**: Side-by-side comparison of all banks' rates

### 3. Data Analytics & Visualization
- **Interactive Charts**: Rate trends over time using Chart.js or similar
- **Statistical Analysis**:
  - Daily/Weekly/Monthly rate volatility
  - Minimum and maximum rates for different periods
  - Average rate calculations
  - Rate change percentages
- **Market Insights**:
  - Rate movement predictions (basic trend analysis)
  - Best rates highlighting
  - Rate alerts for significant changes

### 3.1. Tax Year Summary Tables
- **Tax Year Periods**: Financial year from April to March (e.g., 2024-25, 2025-26)
- **Year Selection**: Dropdown to select specific tax years
- **Monthly Summary Table**: For each selected tax year, display:
  - Each month (April to March)
  - Minimum rate for the month
  - Maximum rate for the month
  - Average rate for the month
  - Specific date rate (user selectable)
- **Date-Specific Analysis**: 
  - User can select a specific date (1-31)
  - Show rates for that date across all months in the tax year
  - Handle month-end variations (e.g., 31st for months with 30 days)
- **Export Functionality**: 
  - Export table data to CSV/PDF for tax filing purposes
  - Include metadata (bank name, tax year, date criteria)
- **Multi-Bank Support**: 
  - Display separate tables for each bank
  - Option to view consolidated average across all banks
- **Data Validation**: 
  - Handle missing data gracefully (show "N/A" for unavailable dates)
  - Indicate data confidence levels based on scraping success

### 4. User Authentication & Management
- **NextAuth.js Integration**: Social login (Google, GitHub)
- **User Profiles**: Basic user information management
- **Authentication States**: Public access vs. authenticated user features
- **Session Management**: Secure session handling with JWT

### 5. Email Subscription System
- **Daily Rate Digest**: Email summaries of current rates and changes
- **Subscription Management**: Users can subscribe/unsubscribe from email notifications

### 6. Rate Monitoring & Alerts
- **Rate Change Alerts**: Notify users of significant rate changes (>X% change)
- **Best Rate Notifications**: Alert when a bank offers the best rate
- **Custom Thresholds**: Users can set custom rate thresholds for alerts
- **Multiple Notification Channels**: Email and in-app notifications

## Technical Requirements

### 7. Backend Architecture
- **Framework**: Next.js 15 with App Router
- **API Layer**: tRPC for type-safe API calls
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **Caching**: Redis or in-memory caching for frequently accessed data
- **Rate Limiting**: API rate limiting to prevent abuse
- **Tax Year API Endpoints**:
  - `getTaxYearSummary(year, bankId?, date?)` - Get monthly summary for tax year
  - `getAvailableTaxYears()` - Get list of years with available data
  - `exportTaxYearData(year, format)` - Export data in CSV/PDF format
  - `getTaxYearComparison(years[])` - Compare multiple tax years

### 7.1. External Scraping API
- **Trigger Endpoint**: `POST /api/scrape/trigger` - Single endpoint to initiate all scraping jobs
- **Authentication**: API key-based authentication for external cron services
- **Rate Limiting**: 
  - Maximum 1 call per hour per API key
  - 429 Too Many Requests for excess calls
  - Redis-based rate limiting with sliding window
- **Response Format**: JSON with job status and execution details
- **Async Processing**: Non-blocking response with job queue processing
- **Webhook Support**: Optional webhook callbacks for job completion status

### 8. Frontend Requirements
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS with modern, responsive design
- **State Management**: TanStack Query for server state
- **Charts**: Chart.js or Recharts for data visualization
- **UI Components**: Headless UI or similar for accessible components
- **Mobile Responsive**: Full mobile responsiveness

### 9. Web Scraping Infrastructure
- **Scraping Library**: Puppeteer or Playwright for dynamic content
- **External Scheduling**: External cron services (GitHub Actions, cron-job.org, etc.)
- **API Rate Limiting**: Strict hourly limits on scraping trigger endpoint
- **Error Monitoring**: Comprehensive logging and error tracking
- **Scraping Rate Limiting**: Respectful scraping with appropriate delays between requests
- **User Agent Rotation**: Avoid blocking with varied user agents
- **Proxy Support**: Optional proxy rotation for reliability

### 10. Data Management
- **Database Schema**:
  ```sql
  -- Banks table
  banks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL, -- 'combank', 'ndb', 'sampath', 'cbsl'
    display_name VARCHAR(255) NOT NULL,
    website_url TEXT,
    scrape_config JSONB, -- Store scraping selectors and configuration
    is_active BOOLEAN DEFAULT true,
    bank_type VARCHAR(20) DEFAULT 'commercial', -- 'commercial', 'central'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  
  -- Exchange rates table
  exchange_rates (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER REFERENCES banks(id),
    buying_rate DECIMAL(10,4), -- Can be NULL for CBSL (indicative rate only)
    selling_rate DECIMAL(10,4), -- Can be NULL for CBSL
    indicative_rate DECIMAL(10,4), -- For CBSL and reference purposes
    currency_pair VARCHAR(10) DEFAULT 'USD/LKR',
    scraped_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_valid BOOLEAN DEFAULT true -- Data validation flag
  )
  
  -- User subscriptions
  user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    subscription_type VARCHAR(50), -- 'daily_digest', 'rate_alerts'
    is_active BOOLEAN DEFAULT true,
    preferences JSONB, -- Email frequency, threshold settings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  
  -- Email logs
  email_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    email_type VARCHAR(50),
    subject VARCHAR(255),
    sent_at TIMESTAMP,
    status VARCHAR(20), -- 'sent', 'failed', 'bounced'
    error_message TEXT
  )
  
  -- System logs
  scrape_logs (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER REFERENCES banks(id),
    status VARCHAR(20), -- 'success', 'failed', 'partial'
    rates_found INTEGER DEFAULT 0,
    error_message TEXT,
    execution_time_ms INTEGER,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  
  -- Indexes for performance
  CREATE INDEX idx_exchange_rates_bank_scraped ON exchange_rates(bank_id, scraped_at DESC);
  CREATE INDEX idx_exchange_rates_scraped_at ON exchange_rates(scraped_at DESC);
  CREATE INDEX idx_scrape_logs_bank_status ON scrape_logs(bank_id, status, scraped_at DESC);
  ```

- **Data Retention**: Historical data retention policies (minimum 5 years for tax purposes)
- **Backup Strategy**: Regular database backups
- **Data Migration**: Version-controlled database migrations
- **Tax Year Queries**: Optimized indexes for efficient tax year period queries
- **Monthly Aggregations**: Pre-computed monthly statistics for faster tax summary generation

## User Interface Requirements

### 11. Homepage Design
- **Hero Section**: Current average rate with trend indicator
- **Rate Cards**: Grid layout showing all bank rates
- **Quick Stats**: Min/Max rates, volatility indicators
- **Chart Preview**: Mini chart showing recent trends
- **Call-to-Action**: Subscribe button for email updates
- **Quick Access Menu**: Easy navigation to tax year summaries and historical analysis

### 12. Bank Detail Pages
- **Rate Display**: Large, clear current rates
- **Historical Charts**: Interactive rate history graphs
- **Statistics Panel**: Volatility, averages, extremes
- **Comparison Tools**: Compare with other banks
- **Share Functionality**: Share current rates on social media

### 12.1. Tax Year Summary Pages
- **Tax Year Selector**: 
  - Dropdown with available tax years (2024-25, 2025-26, etc.)
  - Clear indication of current vs. historical years
- **Date Selector**: 
  - Input field or dropdown for specific date selection (1-31)
  - Smart validation for month-end dates
- **Summary Table Display**:
  - Responsive table showing monthly data
  - Clear column headers (Month, Min Rate, Max Rate, Avg Rate, [Selected Date] Rate)
  - Color coding for best/worst rates in each category
  - Mobile-friendly collapsible design
- **Filter Controls**:
  - Bank selection (individual banks vs. all banks average)
  - Rate type selection (buying vs. selling rates)
  - Data export buttons (CSV, PDF)
- **Data Visualization**:
  - Mini charts showing monthly trends
  - Visual indicators for data availability
  - Tooltips with additional context

### 13. User Dashboard (Authenticated Users)
- **Subscription Management**: Enable/disable email notifications
- **Personal Alerts**: Set custom rate thresholds
- **Watchlist**: Favorite banks for quick access
- **Email History**: View sent email notifications

### 14. Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Touch Friendly**: Large touch targets for mobile
- **Progressive Enhancement**: Works without JavaScript
- **Performance**: Fast loading times with optimized assets

## Data Sources & Scraping Strategy

### 15. Bank-Specific Scraping Architecture

#### 15.1. Scraping Functions Structure
```typescript
// Base scraper interface
interface ExchangeRateScraper {
  bankId: string;
  bankName: string;
  baseUrl: string;
  scrapeRates(): Promise<ExchangeRateData>;
  validateData(data: ExchangeRateData): boolean;
  getLastUpdated(): Promise<Date>;
}

// Individual scraper implementations
class CommercialBankScraper implements ExchangeRateScraper
class NDBBankScraper implements ExchangeRateScraper  
class SampathBankScraper implements ExchangeRateScraper
class CBSLScraper implements ExchangeRateScraper
```

#### 15.2. Data Source Specifications
- **Commercial Bank of Ceylon**:
  - URL: `https://www.combank.lk/rates-tariff#exchange-rates`
  - Function: `scrapeCommercialBankRates()`
  - Target: Exchange rates table with USD buying/selling rates
  - Update Frequency: Every 2 hours during banking hours

- **National Development Bank (NDB)**:
  - URL: `https://www.ndbbank.com/rates/exchange-rates`
  - Function: `scrapeNDBBankRates()`
  - Target: Exchange rates section with USD data
  - Update Frequency: Every 2 hours during banking hours

- **Sampath Bank**:
  - URL: `https://www.sampath.lk/rates-and-charges?activeTab=exchange-rates`
  - Function: `scrapeSampathBankRates()`
  - Target: Exchange rates tab with USD rates
  - Update Frequency: Every 2 hours during banking hours

- **Central Bank of Sri Lanka (CBSL)**:
  - URL: `https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates/usd-lkr-Indicative-rate-chart`
  - Function: `scrapeCBSLRates()`
  - Target: Official USD/LKR indicative rates
  - Update Frequency: Daily (official reference rate)
  - Purpose: Reference rate for validation and comparison

#### 15.3. Scraping Implementation Strategy
- **Puppeteer/Playwright**: Handle dynamic content and JavaScript-heavy pages
- **Rate-Specific Selectors**: Target exact DOM elements containing USD rates
- **Error Handling**: Robust retry mechanisms with exponential backoff
- **Data Validation**: Cross-reference rates across sources for anomaly detection
- **Fallback Strategy**: Alternative scraping methods if primary selectors fail

### 16. Data Quality Assurance
- **Validation Rules**: Ensure rates are within reasonable ranges
- **Anomaly Detection**: Flag unusual rate changes for manual review
- **Data Consistency**: Cross-reference rates across banks for validation
- **Manual Override**: Admin ability to manually input rates when scraping fails

## Email System Requirements

### 17. Email Infrastructure
- **Service Provider**: SendGrid, Resend, or AWS SES integration
- **Template Engine**: HTML email templates with inline CSS
- **Personalization**: User-specific content and preferences
- **Unsubscribe Handling**: One-click unsubscribe functionality
- **Bounce Handling**: Process email bounces and update user status

### 18. Email Content
- **Daily Digest**: Summary of current rates and changes
- **Rate Alerts**: Immediate notifications for significant changes
- **Weekly Summary**: Comprehensive weekly rate analysis
- **HTML & Text**: Both HTML and plain text versions

## Security & Performance

### 19. Security Requirements
- **Data Protection**: Secure handling of user data and email addresses
- **HTTPS**: SSL/TLS encryption for all connections
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent API abuse and scraping overload
- **Authentication Security**: Secure session management

### 20. Performance Requirements
- **Page Load Speed**: <3 seconds for initial page load
- **Database Optimization**: Indexed queries and efficient data retrieval
- **Caching Strategy**: Cache frequently accessed rate data
- **CDN**: Static asset delivery through CDN
- **Database Connection Pooling**: Efficient database connections

## Administrative Features

### 21. Admin Dashboard
- **Scraping Status**: Monitor scraping health and success rates
- **Rate Management**: Manual rate entry and correction
- **User Management**: View and manage user subscriptions
- **Email Analytics**: Track email delivery and engagement
- **System Monitoring**: Database performance and error tracking

### 22. Configuration Management
- **Scraping Intervals**: Configurable scraping schedules
- **Email Settings**: Customize email templates and timing
- **Alert Thresholds**: Set system-wide alert parameters
- **Feature Toggles**: Enable/disable features without deployment

## Future Enhancements

### 23. Advanced Features (Phase 2)
- **Mobile App**: React Native or Flutter mobile application
- **More Banks**: Expand to include more Sri Lankan banks
- **Currency Pairs**: Support for other currency pairs (EUR/LKR, GBP/LKR)
- **API Access**: Public API for third-party integrations
- **Premium Features**: Advanced analytics for subscribed users

### 24. Integration Possibilities
- **Telegram Bot**: Rate notifications via Telegram
- **WhatsApp Integration**: WhatsApp Business API for notifications
- **Social Media**: Auto-posting rate updates to social platforms
- **Financial APIs**: Integration with international exchange rate APIs

## Success Metrics

### 25. Key Performance Indicators
- **User Engagement**: Daily active users, session duration
- **Subscription Metrics**: Email signup rate, unsubscribe rate
- **Data Accuracy**: Scraping success rate, data validation success
- **Performance Metrics**: Page load times, uptime percentage
- **Email Performance**: Open rates, click-through rates

## Technical Constraints

### 26. Development Constraints
- **Browser Compatibility**: Support for modern browsers (last 2 versions)
- **Device Support**: Desktop, tablet, and mobile responsive design
- **Accessibility**: WCAG 2.1 AA compliance for accessibility
- **SEO**: Search engine optimized for rate-related keywords

## Deployment & DevOps

### 27. Deployment Requirements
- **Platform**: Vercel for Next.js deployment (free tier compatible)
- **Database Hosting**: Neon PostgreSQL (serverless, Vercel-optimized)
- **Rate Limiting**: Redis database for API rate limiting (Upstash Redis)
- **Environment Management**: Staging and production environments
- **CI/CD Pipeline**: Automated testing and deployment via Vercel
- **Monitoring**: Error tracking with Sentry or similar

### 27.1. External Cron Service Setup
- **Primary Option**: GitHub Actions with scheduled workflows
- **Backup Options**: cron-job.org, EasyCron, or similar services
- **Frequency**: Hourly execution during business hours
- **Failover**: Multiple cron services for redundancy
- **Monitoring**: Dead man's switch alerts for missed executions

### 27.2. API Security & Rate Limiting
- **API Key Management**: Environment variable-based API keys
- **Rate Limiting Storage**: Redis with sliding window algorithm
- **Request Validation**: JSON schema validation for API requests
- **IP Whitelisting**: Optional IP-based access control
- **Audit Logging**: All API calls logged with timestamps and sources

This comprehensive requirements document serves as the foundation for building the Keep Rates application, ensuring all stakeholders understand the project scope, technical requirements, and success criteria. 
