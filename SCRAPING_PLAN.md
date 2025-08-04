# Scraping Implementation Plan

## Overview

This document outlines the detailed implementation plan for scraping USD/LKR exchange rates from four key data sources in Sri Lanka.

## Data Sources

### 1. Commercial Bank of Ceylon ✅ IMPLEMENTED
**URL**: https://www.combank.lk/rates-tariff#exchange-rates
**Function**: `CommercialBankScraper`
**Update Frequency**: Every hour (via external cron)

#### Implementation Details:
- **Target Section**: Exchange rates table/section
- **Data Points**: USD Currency Buying Rate, USD Currency Selling Rate, **USD Telegraphic Transfers Buying Rate**
- **Scraping Method**: Puppeteer with DOM table parsing and serverless support (@sparticuz/chromium)
- **Challenges**: ✅ SOLVED - Anchor navigation, multiple rate types in single row
- **Status**: PRODUCTION READY

#### Function Structure:
```typescript
export class CommercialBankScraper extends ExchangeRateScraper {
  constructor() {
    super('combank', {
      url: 'https://www.combank.lk/rates-tariff#exchange-rates',
      timeout: 30000,
      retryAttempts: 3
    });
  }

  async scrape(): Promise<ScrapingResult> {
    // ✅ IMPLEMENTED:
    // 1. Launch Puppeteer with serverless/local detection
    // 2. Navigate to rates page with bot detection avoidance
    // 3. Wait for exchange rates table to load
    // 4. Parse USD row from table with comprehensive selectors
    // 5. Extract 6 rates: Currency Buy/Sell, Demand Draft Buy/Sell, Telegraphic Buy/Sell
    // 6. Validate data format and ranges
    // 7. Return structured data with all three key rates
  }
}
```

#### Actual Data Structure (IMPLEMENTED):
```json
{
  "bankCode": "combank",
  "currencyPair": "USD/LKR",
  "buyingRate": 296.05,
  "sellingRate": 304.50,
  "telegraphicBuyingRate": 298.00,
  "indicativeRate": null,
  "timestamp": "2025-08-04T10:05:57.812Z",
  "isValid": true,
  "source": "https://www.combank.lk/rates-tariff#exchange-rates"
}
```

---

### 2. National Development Bank (NDB) ✅ IMPLEMENTED
**URL**: https://www.ndbbank.com/rates/exchange-rates
**Function**: `NDBBankScraper`
**Update Frequency**: Every hour (via external cron)

#### Implementation Details:
- **Target Section**: Exchange rates page table
- **Data Points**: USD Currency Buying Rate, USD Currency Selling Rate, **USD Telegraphic Transfers Buying Rate**
- **Scraping Method**: Puppeteer with table parsing and serverless support
- **Challenges**: ✅ SOLVED - Dynamic content loading, multiple rate formats
- **Status**: PRODUCTION READY

#### Function Structure (IMPLEMENTED):
```typescript
export class NDBBankScraper extends ExchangeRateScraper {
  constructor() {
    super('ndb', {
      url: 'https://www.ndbbank.com/rates/exchange-rates',
      timeout: 15000,
      retryAttempts: 3
    });
  }

  async scrape(): Promise<ScrapingResult> {
    // ✅ IMPLEMENTED:
    // 1. Launch Puppeteer with serverless/local detection
    // 2. Navigate to exchange rates page
    // 3. Wait for rates table to load
    // 4. Parse all tables for USD currency row
    // 5. Extract 6 rates from row: Currency Buy/Sell, Demand Draft Buy/Sell, Telegraphic Buy/Sell
    // 6. Validate data format and ranges
    // 7. Return structured data with telegraphic buying rate
  }
}
```

#### Actual Data Structure (IMPLEMENTED):
```json
{
  "bankCode": "ndb",
  "currencyPair": "USD/LKR", 
  "buyingRate": 298.00,
  "sellingRate": 304.50,
  "telegraphicBuyingRate": 298.00,
  "indicativeRate": null,
  "timestamp": "2025-08-04T10:05:56.610Z",
  "isValid": true,
  "source": "https://www.ndbbank.com/rates/exchange-rates"
}
```

---

### 3. Sampath Bank ✅ IMPLEMENTED
**URL**: https://www.sampath.lk/rates-and-charges?activeTab=exchange-rates
**Function**: `SampathBankScraper`
**Update Frequency**: Every hour (via external cron)

#### Implementation Details:
- **Target Section**: Exchange rates tab (auto-activated by URL parameter)
- **Data Points**: USD T/T Buying Rate, USD T/T Selling Rate, **USD Telegraphic Transfers Buying Rate**
- **Scraping Method**: Puppeteer with scroll-to-content and table parsing
- **Challenges**: ✅ SOLVED - Content not visible until scroll, multiple tables on page, filter out interest rate tables
- **Status**: PRODUCTION READY

#### Function Structure (IMPLEMENTED):
```typescript
export class SampathBankScraper extends ExchangeRateScraper {
  constructor() {
    super('sampath', {
      url: 'https://www.sampath.lk/rates-and-charges?activeTab=exchange-rates',
      timeout: 15000,
      retryAttempts: 3
    });
  }

  async scrape(): Promise<ScrapingResult> {
    // ✅ IMPLEMENTED:
    // 1. Launch Puppeteer with serverless/local detection
    // 2. Navigate to rates page (activeTab=exchange-rates auto-activates)
    // 3. Scroll to bottom to ensure all content loads
    // 4. Parse all tables, filter out interest rate tables
    // 5. Extract USD rates: T/T Buying (297.5), O/D Buying (295.8699), T/T Selling (304)
    // 6. Use T/T rates for currency and telegraphic rates
    // 7. Validate and return structured data
  }
}
```

#### Actual Data Structure (IMPLEMENTED):
```json
{
  "bankCode": "sampath",
  "currencyPair": "USD/LKR",
  "buyingRate": 297.50,
  "sellingRate": 304.00,
  "telegraphicBuyingRate": 297.50,
  "indicativeRate": null,
  "timestamp": "2025-08-04T15:52:58.000Z",
  "isValid": true,
  "source": "https://www.sampath.lk/rates-and-charges?activeTab=exchange-rates"
}
```

---

### 4. Central Bank of Sri Lanka (CBSL)
**URL**: https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates/usd-lkr-Indicative-rate-chart
**Function**: `scrapeCBSLRates()`
**Update Frequency**: Daily (official reference rate)

#### Implementation Details:
- **Target Section**: USD/LKR indicative rate chart/data
- **Data Points**: Official Indicative Rate (no buying/selling split)
- **Scraping Method**: Puppeteer with chart/table parsing
- **Purpose**: Reference rate for validation and official comparison

#### Function Structure:
```typescript
export class CBSLScraper implements ExchangeRateScraper {
  bankId = 'cbsl';
  bankName = 'Central Bank of Sri Lanka';
  baseUrl = 'https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates/usd-lkr-Indicative-rate-chart';

  async scrapeRates(): Promise<ExchangeRateData> {
    // 1. Navigate to CBSL indicative rates page
    // 2. Wait for rate chart/data to load
    // 3. Extract current USD/LKR indicative rate
    // 4. Parse rate value and effective date
    // 5. Return structured data (indicative rate only)
  }
}
```

#### Expected Data Structure (CBSL):
```json
{
  "bankId": "cbsl",
  "indicativeRate": 304.75,
  "effectiveDate": "2024-01-15",
  "scrapedAt": "2024-01-15T08:00:00Z",
  "source": "https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates/usd-lkr-Indicative-rate-chart"
}
```

---

## Base Interface

```typescript
export interface ExchangeRateScraper {
  bankId: string;
  bankName: string;
  baseUrl: string;
  
  scrapeRates(): Promise<ExchangeRateData>;
  validateData(data: ExchangeRateData): boolean;
  getLastUpdated(): Promise<Date>;
}

export interface ExchangeRateData {
  bankCode: string;           // Changed from bankId
  currencyPair: string;       // Added for clarity (e.g., "USD/LKR")
  buyingRate?: number;        // Optional for CBSL
  sellingRate?: number;       // Optional for CBSL
  telegraphicBuyingRate?: number; // 🆕 ADDED - For online transfers (T/T rate)
  indicativeRate?: number;    // For CBSL and reference
  timestamp: Date;            // Changed from scrapedAt (string)
  source: string;
  isValid: boolean;
}
```

---

## Scraping Service Orchestration

```typescript
export class ScrapingService {
  private scrapers: Map<string, ExchangeRateScraper> = new Map();
  
  constructor() {
    // ✅ IMPLEMENTED:
    this.scrapers.set('combank', new CommercialBankScraper());
    this.scrapers.set('ndb', new NDBBankScraper());
    this.scrapers.set('sampath', new SampathBankScraper());
    
    // TODO: Add when implemented
    // this.scrapers.set('cbsl', new CBSLScraper());
  }

  async scrapeAllRates(): Promise<ExchangeRateData[]> {
    const results = await Promise.allSettled(
      this.scrapers.map(scraper => scraper.scrapeRates())
    );
    
    return results
      .filter((result): result is PromiseFulfilledResult<ExchangeRateData> => 
        result.status === 'fulfilled' && result.value.isValid
      )
      .map(result => result.value);
  }

  async scrapeBankRates(bankId: string): Promise<ExchangeRateData | null> {
    const scraper = this.scrapers.find(s => s.bankId === bankId);
    if (!scraper) return null;
    
    try {
      return await scraper.scrapeRates();
    } catch (error) {
      console.error(`Failed to scrape ${bankId}:`, error);
      return null;
    }
  }
}
```

---

## Error Handling & Retry Strategy

```typescript
export class RetryableScrapingService {
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  async scrapeWithRetry(scraper: ExchangeRateScraper): Promise<ExchangeRateData | null> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const data = await scraper.scrapeRates();
        if (scraper.validateData(data)) {
          return data;
        }
        throw new Error(`Invalid data structure from ${scraper.bankId}`);
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed for ${scraper.bankId}:`, error);
        
        if (attempt < this.maxRetries) {
          await this.sleep(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }
    
    // Log final failure
    await this.logScrapeFailure(scraper.bankId, lastError!);
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## Data Validation

```typescript
export class RateValidator {
  private readonly MIN_RATE = 250; // Minimum reasonable USD/LKR rate
  private readonly MAX_RATE = 400; // Maximum reasonable USD/LKR rate
  private readonly MAX_SPREAD = 20; // Maximum spread between buying/selling

  validateCommercialBankData(data: ExchangeRateData): boolean {
    if (!data.buyingRate || !data.sellingRate) return false;
    
    // Check if rates are within reasonable range
    if (data.buyingRate < this.MIN_RATE || data.buyingRate > this.MAX_RATE) return false;
    if (data.sellingRate < this.MIN_RATE || data.sellingRate > this.MAX_RATE) return false;
    
    // Check if spread is reasonable
    const spread = data.sellingRate - data.buyingRate;
    if (spread < 0 || spread > this.MAX_SPREAD) return false;
    
    return true;
  }

  validateCBSLData(data: ExchangeRateData): boolean {
    if (!data.indicativeRate) return false;
    
    // Check if rate is within reasonable range
    if (data.indicativeRate < this.MIN_RATE || data.indicativeRate > this.MAX_RATE) return false;
    
    return true;
  }

  crossValidateRates(rates: ExchangeRateData[]): boolean {
    if (rates.length < 2) return true; // Can't cross-validate with less than 2 rates
    
    const avgRate = this.calculateAverageRate(rates);
    const tolerance = 0.05; // 5% tolerance
    
    return rates.every(rate => {
      const rateValue = rate.buyingRate || rate.indicativeRate || 0;
      return Math.abs(rateValue - avgRate) / avgRate <= tolerance;
    });
  }

  private calculateAverageRate(rates: ExchangeRateData[]): number {
    const validRates = rates
      .map(r => r.buyingRate || r.indicativeRate)
      .filter(r => r !== undefined) as number[];
    
    return validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length;
  }
}
```

---

## External API Trigger System

### API Endpoint Implementation

```typescript
// /api/scrape/trigger - POST endpoint
import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '~/server/services/rate-limiter';
import { ScrapingService } from '~/server/services/scrapers/ScrapingService';

export async function POST(request: NextRequest) {
  try {
    // 1. Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.SCRAPING_API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // 2. Check rate limiting
    const rateLimiter = new RateLimiter();
    const isAllowed = await rateLimiter.checkLimit(apiKey);
    if (!isAllowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Only 1 call per hour allowed',
          nextAllowedAt: await rateLimiter.getNextAllowedTime(apiKey)
        },
        { status: 429 }
      );
    }

    // 3. Trigger scraping jobs
    const scrapingService = new ScrapingService();
    const jobId = await scrapingService.triggerAllScrapingJobs();

    // 4. Return immediate response
    return NextResponse.json({
      success: true,
      jobId,
      message: 'Scraping jobs initiated',
      timestamp: new Date().toISOString(),
      estimatedCompletionTime: '2-3 minutes'
    });

  } catch (error) {
    console.error('Scraping trigger error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Rate Limiting Service

```typescript
export class RateLimiter {
  private redis: Redis; // Upstash Redis client
  private readonly HOUR_IN_SECONDS = 3600;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async checkLimit(apiKey: string): Promise<boolean> {
    const key = `rate_limit:${apiKey}`;
    const now = Date.now();
    const windowStart = now - (this.HOUR_IN_SECONDS * 1000);

    // Remove old entries
    await this.redis.zremrangebyscore(key, 0, windowStart);

    // Count current requests in the window
    const requestCount = await this.redis.zcard(key);

    if (requestCount >= 1) { // Max 1 request per hour
      return false;
    }

    // Add current request
    await this.redis.zadd(key, now, now);
    await this.redis.expire(key, this.HOUR_IN_SECONDS);

    return true;
  }

  async getNextAllowedTime(apiKey: string): Promise<string> {
    const key = `rate_limit:${apiKey}`;
    const oldestRequest = await this.redis.zrange(key, 0, 0, { withScores: true });
    
    if (oldestRequest.length === 0) {
      return new Date().toISOString();
    }

    const nextAllowed = new Date(Number(oldestRequest[1]) + (this.HOUR_IN_SECONDS * 1000));
    return nextAllowed.toISOString();
  }
}
```

### Enhanced Scraping Service

```typescript
export class ScrapingService {
  private scrapers: ExchangeRateScraper[];
  private jobQueue: JobQueue;
  
  constructor() {
    this.scrapers = [
      new CommercialBankScraper(),
      new NDBBankScraper(),
      new SampathBankScraper(),
      new CBSLScraper()
    ];
    this.jobQueue = new JobQueue();
  }

  async triggerAllScrapingJobs(): Promise<string> {
    const jobId = crypto.randomUUID();
    
    // Add scraping job to queue for async processing
    await this.jobQueue.addJob({
      id: jobId,
      type: 'scrape_all_rates',
      data: { timestamp: new Date().toISOString() },
      priority: 'high'
    });

    return jobId;
  }

  async executeScrapingJob(jobId: string): Promise<void> {
    console.log(`Starting scraping job: ${jobId}`);
    
    const results = await Promise.allSettled([
      this.scrapeCommercialBanks(),
      this.scrapeCBSL()
    ]);

    // Log results
    await this.logJobCompletion(jobId, results);
    
    // Optional: Send webhook notification
    await this.sendWebhookNotification(jobId, results);
  }

  private async scrapeCommercialBanks(): Promise<any[]> {
    const banks = ['combank', 'ndb', 'sampath'];
    const results = [];
    
    for (const bankId of banks) {
      try {
        const rate = await this.scrapeBankRates(bankId);
        if (rate) {
          await this.saveRateToDatabase(rate);
          results.push({ bankId, status: 'success', rate });
        }
      } catch (error) {
        console.error(`Failed to scrape ${bankId}:`, error);
        results.push({ bankId, status: 'error', error: error.message });
      }
    }
    
    return results;
  }

  private async scrapeCBSL(): Promise<any> {
    try {
      const rate = await this.scrapeBankRates('cbsl');
      if (rate) {
        await this.saveRateToDatabase(rate);
        return { bankId: 'cbsl', status: 'success', rate };
      }
    } catch (error) {
      console.error('Failed to scrape CBSL:', error);
      return { bankId: 'cbsl', status: 'error', error: error.message };
    }
  }
}
```

## External Cron Service Setup

### GitHub Actions Workflow

```yaml
# .github/workflows/scrape-rates.yml
name: Scrape Exchange Rates

on:
  schedule:
    # Run every hour during business hours (9 AM - 5 PM UTC+5:30)
    # Converted to UTC: 3:30 AM - 11:30 PM
    - cron: '30 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * 1-5'
  
  # Allow manual triggering
  workflow_dispatch:

jobs:
  trigger-scraping:
    runs-on: ubuntu-latest
    
    steps:
      - name: Trigger scraping API
        run: |
          response=$(curl -s -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -H "x-api-key: ${{ secrets.SCRAPING_API_KEY }}" \
            "${{ secrets.APP_URL }}/api/scrape/trigger")
          
          http_code="${response: -3}"
          body="${response%???}"
          
          echo "HTTP Status: $http_code"
          echo "Response: $body"
          
          if [ "$http_code" -ne "200" ]; then
            echo "::error::Scraping trigger failed with status $http_code"
            exit 1
          fi
```

### Alternative: cron-job.org Configuration

```json
{
  "job": {
    "url": "https://your-app.vercel.app/api/scrape/trigger",
    "enabled": true,
    "saveResponses": true,
    "schedule": {
      "timezone": "Asia/Colombo",
      "hours": [9, 10, 11, 12, 13, 14, 15, 16, 17],
      "mdays": [-1],
      "months": [-1],
      "wdays": [1, 2, 3, 4, 5]
    },
    "requestMethod": "POST",
    "headers": {
      "Content-Type": "application/json",
      "x-api-key": "your-api-key-here"
    }
  }
}
```
```

---

## Implementation Status ✅

### Phase 1: Core Infrastructure ✅ COMPLETED
1. ✅ Set up base `ExchangeRateScraper` interface with serverless support
2. ✅ Created database schema for banks and exchange_rates tables (including telegraphicBuyingRate)
3. ✅ Implemented Puppeteer browser management with @sparticuz/chromium
4. ✅ Created data validation utilities with range and spread checking

### Phase 2: Individual Scrapers ✅ 3/4 COMPLETED  
1. ✅ **Commercial Bank scraper** - PRODUCTION READY
2. ✅ **NDB Bank scraper** - PRODUCTION READY  
3. ✅ **Sampath Bank scraper** - PRODUCTION READY
4. ⏳ CBSL scraper - TODO

### Phase 3: Orchestration & Scheduling ✅ COMPLETED
1. ✅ Created main `ScrapingService` class with parallel execution
2. ✅ Implemented retry logic and error handling (3 attempts with exponential backoff)
3. ✅ Set up external cron scheduling via `/api/scrape/trigger` with Redis rate limiting
4. ✅ Added comprehensive logging to database (scrapeLogs table)

### Phase 4: Testing & Optimization ✅ COMPLETED
1. ✅ Tested each scraper individually with dedicated test scripts
2. ✅ Tested batch scraping via API endpoint
3. ✅ Performance optimized with serverless Chromium
4. ✅ Rate limiting and monitoring via Redis (Upstash)

---

## Production Deployment Status 🚀

### Currently Live:
- ✅ **Commercial Bank scraper** - Extracting all 3 rates (Currency Buy/Sell + Telegraphic Buy)
- ✅ **NDB Bank scraper** - Extracting all 3 rates (Currency Buy/Sell + Telegraphic Buy)  
- ✅ **Sampath Bank scraper** - Extracting T/T rates (Buy/Sell + Telegraphic Buy)
- ✅ **API Endpoint** `/api/scrape/trigger` - Production ready with rate limiting
- ✅ **Database Schema** - All rates stored with timestamps
- ✅ **Serverless Support** - Vercel-compatible with @sparticuz/chromium

### Available Scripts:
```bash
pnpm test:combank    # Test Commercial Bank scraper
pnpm test:ndb        # Test NDB Bank scraper  
pnpm test:sampath    # Test Sampath Bank scraper
pnpm test:scraping   # Test API endpoint
pnpm check:db        # View database contents
```

### External Cron Setup:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"async": true}' \
  https://your-app.vercel.app/api/scrape/trigger
```

### Next Steps:
1. Implement CBSL scraper for reference rates
2. Add frontend rate display components  
3. Implement email notification system
4. Add rate change alerts and historical charts 
