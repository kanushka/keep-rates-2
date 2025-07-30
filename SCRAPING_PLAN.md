# Scraping Implementation Plan

## Overview

This document outlines the detailed implementation plan for scraping USD/LKR exchange rates from four key data sources in Sri Lanka.

## Data Sources

### 1. Commercial Bank of Ceylon
**URL**: https://www.combank.lk/rates-tariff#exchange-rates
**Function**: `scrapeCommercialBankRates()`
**Update Frequency**: Every 2 hours during banking hours

#### Implementation Details:
- **Target Section**: Exchange rates table/section
- **Data Points**: USD Buying Rate, USD Selling Rate
- **Scraping Method**: Puppeteer with DOM selectors
- **Challenges**: May require handling anchor navigation (#exchange-rates)

#### Function Structure:
```typescript
export class CommercialBankScraper implements ExchangeRateScraper {
  bankId = 'combank';
  bankName = 'Commercial Bank of Ceylon';
  baseUrl = 'https://www.combank.lk/rates-tariff#exchange-rates';

  async scrapeRates(): Promise<ExchangeRateData> {
    // 1. Navigate to rates page
    // 2. Wait for exchange rates section to load
    // 3. Locate USD row in exchange rates table
    // 4. Extract buying and selling rates
    // 5. Validate data format
    // 6. Return structured data
  }
}
```

#### Expected Data Structure:
```json
{
  "bankId": "combank",
  "buyingRate": 299.50,
  "sellingRate": 309.50,
  "scrapedAt": "2024-01-15T10:30:00Z",
  "source": "https://www.combank.lk/rates-tariff#exchange-rates"
}
```

---

### 2. National Development Bank (NDB)
**URL**: https://www.ndbbank.com/rates/exchange-rates
**Function**: `scrapeNDBBankRates()`
**Update Frequency**: Every 2 hours during banking hours

#### Implementation Details:
- **Target Section**: Exchange rates page
- **Data Points**: USD Buying Rate, USD Selling Rate
- **Scraping Method**: Puppeteer with table parsing
- **Challenges**: May have dynamic content loading

#### Function Structure:
```typescript
export class NDBBankScraper implements ExchangeRateScraper {
  bankId = 'ndb';
  bankName = 'National Development Bank';
  baseUrl = 'https://www.ndbbank.com/rates/exchange-rates';

  async scrapeRates(): Promise<ExchangeRateData> {
    // 1. Navigate to exchange rates page
    // 2. Wait for rates table to load
    // 3. Find USD currency row
    // 4. Extract buying and selling columns
    // 5. Parse numeric values
    // 6. Return structured data
  }
}
```

---

### 3. Sampath Bank
**URL**: https://www.sampath.lk/rates-and-charges?activeTab=exchange-rates
**Function**: `scrapeSampathBankRates()`
**Update Frequency**: Every 2 hours during banking hours

#### Implementation Details:
- **Target Section**: Exchange rates tab
- **Data Points**: USD Buying Rate, USD Selling Rate
- **Scraping Method**: Puppeteer with tab navigation
- **Challenges**: Requires clicking on exchange-rates tab

#### Function Structure:
```typescript
export class SampathBankScraper implements ExchangeRateScraper {
  bankId = 'sampath';
  bankName = 'Sampath Bank';
  baseUrl = 'https://www.sampath.lk/rates-and-charges?activeTab=exchange-rates';

  async scrapeRates(): Promise<ExchangeRateData> {
    // 1. Navigate to rates and charges page
    // 2. Click on exchange-rates tab (if not already active)
    // 3. Wait for exchange rates content to load
    // 4. Locate USD rates in the table
    // 5. Extract buying and selling rates
    // 6. Return structured data
  }
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
  bankId: string;
  buyingRate?: number;        // Optional for CBSL
  sellingRate?: number;       // Optional for CBSL
  indicativeRate?: number;    // For CBSL and reference
  effectiveDate?: string;     // For CBSL
  scrapedAt: string;
  source: string;
  isValid: boolean;
}
```

---

## Scraping Service Orchestration

```typescript
export class ScrapingService {
  private scrapers: ExchangeRateScraper[];
  
  constructor() {
    this.scrapers = [
      new CommercialBankScraper(),
      new NDBBankScraper(),
      new SampathBankScraper(),
      new CBSLScraper()
    ];
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

## Implementation Priority

### Phase 1: Core Infrastructure
1. Set up base `ExchangeRateScraper` interface
2. Create database schema for banks and exchange_rates tables
3. Implement basic Puppeteer browser management
4. Create data validation utilities

### Phase 2: Individual Scrapers
1. Implement Commercial Bank scraper (likely easiest)
2. Implement NDB Bank scraper
3. Implement Sampath Bank scraper
4. Implement CBSL scraper

### Phase 3: Orchestration & Scheduling
1. Create main `ScrapingService` class
2. Implement retry logic and error handling
3. Set up cron scheduling
4. Add comprehensive logging

### Phase 4: Testing & Optimization
1. Test each scraper individually
2. Test cross-validation logic
3. Performance optimization
4. Add monitoring and alerting

---

## Next Steps

Once you provide the specific DOM selectors and elements to target on each page, I can implement the exact scraping logic for each function. The architecture above provides a solid foundation that's modular, testable, and maintainable. 
