# Keep Rates 📈

**Real-time USD/LKR Exchange Rate Tracker for Sri Lankan Banks**

Keep Rates is a modern web application that tracks USD/LKR exchange rates from major Sri Lankan banks, providing real-time rate information, historical analysis, and daily email updates to help users make informed currency exchange decisions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-%232596BE.svg?logo=tRPC&logoColor=white)](https://trpc.io/)

## 🌟 Features

### 📊 Real-Time Rate Tracking
- **Live Exchange Rates**: USD/LKR rates from Commercial Bank, NDB Bank, and Sampath Bank
- **External Cron Triggers**: Rates updated hourly via external cron services (Vercel-friendly)
- **Rate-Limited API**: Secure `/api/scrape/trigger` endpoint with hourly rate limits
- **Historical Data**: Track rate changes over time with interactive charts
- **Market Analysis**: Volatility indicators, min/max rates, and trend analysis
- **Tax Year Summaries**: Monthly rate summaries for Sri Lankan tax years (April-March)
- **Custom Date Analysis**: View rates for specific dates across tax year periods

### 🏦 Data Sources
- **Commercial Bank of Ceylon**: Complete buying/selling rate tracking from [Exchange Rates](https://www.combank.lk/rates-tariff#exchange-rates)
- **National Development Bank (NDB)**: Real-time rate monitoring from [Exchange Rates](https://www.ndbbank.com/rates/exchange-rates)
- **Sampath Bank**: Comprehensive rate data collection from [Exchange Rates](https://www.sampath.lk/rates-and-charges?activeTab=exchange-rates)
- **Central Bank of Sri Lanka (CBSL)**: Official reference rates from [USD/LKR Indicative Rates](https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates/usd-lkr-Indicative-rate-chart)

### 📧 Smart Notifications
- **Daily Email Digest**: Personalized rate summaries delivered to your inbox
- **Rate Alerts**: Instant notifications for significant rate changes
- **Subscription Management**: Easy subscribe/unsubscribe functionality
- **Custom Thresholds**: Set personal rate alerts based on your preferences

### 📱 Modern User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Charts**: Beautiful data visualizations powered by Chart.js
- **Fast Performance**: Server-side rendering with intelligent caching
- **Accessibility**: WCAG 2.1 AA compliant for all users

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://typescriptlang.org/) for type safety
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for modern UI
- **State Management**: [TanStack Query](https://tanstack.com/query) for server state
- **Charts**: [Chart.js](https://www.chartjs.org/) for data visualization

### Backend
- **API**: [tRPC](https://trpc.io/) for end-to-end type safety
- **Database**: [PostgreSQL](https://postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) v5
- **Email Service**: [Resend](https://resend.com/) for transactional emails
- **Web Scraping**: [Puppeteer](https://pptr.dev/) for rate extraction

### DevOps & Tools
- **Code Quality**: [Biome](https://biomejs.dev/) for linting and formatting
- **Database Migrations**: Drizzle Kit for schema management
- **Deployment**: [Vercel](https://vercel.com/) for hosting
- **Monitoring**: Built-in error tracking and performance monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/keep-rates-2.git
   cd keep-rates-2
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in `.env`:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/keeprates"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Email Service
   RESEND_API_KEY="your-resend-api-key"
   FROM_EMAIL="noreply@yourapp.com"
   
       # Web Scraping & Rate Limiting
    SCRAPING_API_KEY="your-secure-api-key-for-external-cron"
    UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
    UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
   ```

4. **Set up the database**
   ```bash
   # Generate and run migrations
   pnpm db:generate
   pnpm db:migrate
   
   # Optional: Open Drizzle Studio to view your database
   pnpm db:studio
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Usage

### For General Users
1. **View Current Rates**: Visit the homepage to see real-time USD/LKR rates
2. **Explore Bank Pages**: Click on any bank to view detailed historical data
3. **Compare Rates**: Use the comparison tool to find the best rates
4. **Tax Year Analysis**: Access monthly summaries for Sri Lankan tax years (April-March)
5. **Custom Date Reports**: Select specific dates to view rates across months
6. **Subscribe for Updates**: Sign up to receive daily email digests

### For Registered Users
1. **Sign Up**: Create an account using email or social login
2. **Manage Subscriptions**: Control your email notification preferences
3. **Set Rate Alerts**: Configure custom rate thresholds
4. **View History**: Access your personal notification history

### For Administrators
1. **Monitor Scraping**: Check scraping status and success rates
2. **Manage Users**: View and manage user subscriptions
3. **Configure Settings**: Adjust scraping intervals and alert thresholds

## 🏗️ Project Structure

```
keep-rates-2/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── _components/        # Shared React components
│   │   ├── api/               # API routes
│   │   ├── banks/             # Bank-specific pages
│   │   ├── tax-years/         # Tax year summary pages
│   │   └── dashboard/         # User dashboard
│   ├── server/                # Backend logic
│   │   ├── api/               # tRPC routers
│   │   ├── auth/              # Authentication config
│   │   ├── db/                # Database schema and client
│   │   └── services/          # Business logic services
│   ├── trpc/                  # tRPC client configuration
│   └── lib/                   # Shared utilities
├── public/                    # Static assets
├── docs/                      # Documentation
└── scripts/                   # Build and utility scripts
```

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server with turbo
pnpm build            # Build for production
pnpm start            # Start production server
pnpm preview          # Build and start production server

# Database
pnpm db:generate      # Generate database migrations
pnpm db:migrate       # Run database migrations
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open Drizzle Studio

# Code Quality
pnpm check            # Run Biome linter and formatter
pnpm check:write      # Fix linting and formatting issues
pnpm typecheck        # Run TypeScript type checking
```

### Database Migrations

When modifying the database schema:

1. Update the schema in `src/server/db/schema.ts`
2. Generate migration: `pnpm db:generate`
3. Review the generated migration in `drizzle/`
4. Apply migration: `pnpm db:migrate`

### Scraping Service Architecture

The application uses a modular scraping system with individual scrapers for each data source:

```typescript
// Core scraping service structure
src/server/services/scrapers/
├── base/
│   ├── ExchangeRateScraper.ts      # Base interface
│   └── ScrapingService.ts          # Main orchestration service
├── banks/
│   ├── CommercialBankScraper.ts    # Commercial Bank scraper
│   ├── NDBBankScraper.ts           # NDB Bank scraper
│   ├── SampathBankScraper.ts       # Sampath Bank scraper
│   └── CBSLScraper.ts              # Central Bank scraper
├── utils/
│   ├── validation.ts               # Data validation utilities
│   ├── retry.ts                    # Retry mechanisms
│   └── browser.ts                  # Puppeteer browser management
└── scheduler/
    └── CronService.ts              # Scheduling and orchestration
```

Each scraper implements the `ExchangeRateScraper` interface and targets specific DOM elements on bank websites to extract USD/LKR rates.

### External Cron Service Setup

Since Vercel's free tier has limited cron capabilities, the application uses external cron services to trigger scraping jobs:

#### Option 1: GitHub Actions (Recommended)
1. Create `.github/workflows/scrape-rates.yml` in your repository
2. Add the following secrets to your GitHub repository:
   - `SCRAPING_API_KEY`: Your secure API key
   - `APP_URL`: Your Vercel app URL

```yaml
name: Scrape Exchange Rates
on:
  schedule:
    - cron: '0 9,10,11,12,13,14,15,16,17 * * 1-5' # Every hour, 9 AM-5 PM, weekdays
  workflow_dispatch:

jobs:
  trigger-scraping:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger scraping API
        run: |
          curl -X POST \
            -H "x-api-key: ${{ secrets.SCRAPING_API_KEY }}" \
            "${{ secrets.APP_URL }}/api/scrape/trigger"
```

#### Option 2: External Cron Services
- **cron-job.org**: Free web-based cron service
- **EasyCron**: Reliable cron service with monitoring
- **Uptime Robot**: Monitoring service with cron capabilities

Configure any of these services to make a POST request to your `/api/scrape/trigger` endpoint every hour with the `x-api-key` header.

### Adding New Banks

To add support for a new bank:

1. Add bank configuration to the database
2. Create a scraper service in `src/server/services/scrapers/banks/`
3. Implement the `ExchangeRateScraper` interface
4. Update the scraping scheduler in `CronService.ts`
5. Add bank-specific page routes
6. Update the homepage to include the new bank

## 📊 API Documentation

### tRPC Endpoints

#### Banks Router (`/api/trpc/banks`)
- `banks.getAll` - Get all supported banks and data sources
- `banks.getById(id)` - Get specific bank details
- `banks.getCurrentRates(bankId)` - Get current exchange rates for specific bank
- `banks.getCommercialBanks()` - Get only commercial banks (excludes CBSL)
- `banks.getCentralBankRate()` - Get official CBSL reference rate

#### Rates Router (`/api/trpc/rates`)
- `rates.getCurrent()` - Get current rates for all banks
- `rates.getHistory(bankId, period)` - Get historical rates
- `rates.getComparison()` - Get rate comparison data
- `rates.getStatistics(bankId)` - Get rate statistics
- `rates.getTaxYearSummary(year, bankId?, date?)` - Get monthly tax year summary
- `rates.getAvailableTaxYears()` - Get available tax years with data
- `rates.exportTaxYearData(year, format)` - Export tax year data (CSV/PDF)

#### Subscriptions Router (`/api/trpc/subscriptions`)
- `subscriptions.create(type)` - Create email subscription
- `subscriptions.update(id, settings)` - Update subscription preferences
- `subscriptions.delete(id)` - Cancel subscription

#### Scraping API (`/api/scrape/`)
- `POST /api/scrape/trigger` - External endpoint to trigger all scraping jobs
  - **Authentication**: Requires `x-api-key` header
  - **Rate Limiting**: Maximum 1 call per hour per API key
  - **Response**: Job ID and status information
  - **Usage**: Called by external cron services (GitHub Actions, cron-job.org)

## 🚦 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes | - |
| `NEXTAUTH_URL` | Application URL | Yes | http://localhost:3000 |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No | - |
| `RESEND_API_KEY` | Resend email service API key | Yes | - |
| `FROM_EMAIL` | Email sender address | Yes | - |
| `SCRAPING_API_KEY` | API key for external cron trigger endpoint | Yes | - |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for rate limiting | Yes | - |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token | Yes | - |
| `PUPPETEER_EXECUTABLE_PATH` | Custom Chrome/Chromium path | No | - |
| `SCRAPING_TIMEOUT_MS` | Scraping timeout in milliseconds | No | 30000 |

## 🔒 Security

- **Authentication**: Secure session management with NextAuth.js
- **Data Protection**: All sensitive data encrypted in transit and at rest
- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: All user inputs validated and sanitized
- **HTTPS**: SSL/TLS encryption enforced in production

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run quality checks: `pnpm check && pnpm typecheck`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style (enforced by Biome)
- Write meaningful commit messages
- Add JSDoc comments for new functions
- Include tests for new features

## 📋 Roadmap

### Phase 1 (Current)
- [x] Basic rate scraping for 3 major banks
- [x] Real-time rate display
- [x] User authentication
- [x] Email subscription system
- [ ] Historical data visualization
- [ ] Rate comparison tools

### Phase 2 (Upcoming)
- [ ] Mobile application (React Native)
- [ ] Additional banks (BOC, HNB, People's Bank)
- [ ] Advanced analytics and predictions
- [ ] API access for third-party developers
- [ ] Telegram and WhatsApp notifications

### Phase 3 (Future)
- [ ] Multi-currency support (EUR/LKR, GBP/LKR)
- [ ] Premium subscription features
- [ ] Rate prediction algorithms
- [ ] Social media integrations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [T3 Stack](https://create.t3.gg/) for the excellent starter template
- [Vercel](https://vercel.com/) for hosting and deployment
- [Bank websites](README.md#bank-coverage) for providing rate data
- The open-source community for amazing tools and libraries

## 📞 Support

- **Documentation**: Check our [docs](./docs/) directory
- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/keep-rates-2/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/yourusername/keep-rates-2/discussions)
- **Email**: Contact us at support@keeprates.com

---

---

📋 **Planning Documents**: 
- [Requirements](requirements.md) - Detailed technical specifications
- [Scraping Plan](SCRAPING_PLAN.md) - Implementation roadmap for data collection
- [External Cron Setup](EXTERNAL_CRON_SETUP.md) - Complete guide for configuring external cron services

**Built with ❤️ for the Sri Lankan community**

*Keep Rates - Your trusted source for USD/LKR exchange rate information*
