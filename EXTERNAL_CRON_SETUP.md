# External Cron Service Setup Guide

## Overview

Since Vercel's free tier has limited cron job capabilities, Keep Rates uses external cron services to trigger exchange rate scraping. This guide covers multiple options for setting up reliable hourly triggers.

## Quick Setup Checklist

- [ ] Deploy your app to Vercel
- [ ] Set up Upstash Redis for rate limiting
- [ ] Configure environment variables
- [ ] Choose and configure an external cron service
- [ ] Test the scraping trigger endpoint
- [ ] Set up monitoring and alerts

## Prerequisites

### 1. Environment Variables Required

```env
# Scraping API Configuration
SCRAPING_API_KEY="your-super-secret-api-key-here"

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-auth-token"

# Application URL
AUTH_URL="https://your-app.vercel.app"
```

### 2. Upstash Redis Setup

1. Visit [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Choose the region closest to your Vercel deployment
4. Copy the REST URL and Token to your environment variables

## Option 1: GitHub Actions (Recommended)

### Advantages
- ✅ Free for public repositories
- ✅ Reliable and well-documented
- ✅ Easy to monitor and debug
- ✅ Built-in failure notifications
- ✅ Version controlled configuration

### Setup Steps

1. **Create the workflow file**

```bash
mkdir -p .github/workflows
touch .github/workflows/scrape-exchange-rates.yml
```

2. **Add the workflow configuration**

```yaml
# .github/workflows/scrape-exchange-rates.yml
name: 🏦 Scrape Exchange Rates

on:
  schedule:
    # Every hour during business hours (9 AM - 5 PM Sri Lanka Time)
    # Cron is in UTC, so we adjust for UTC+5:30
    - cron: '30 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * 1-5'
    
  # Allow manual triggering for testing
  workflow_dispatch:
    inputs:
      test_mode:
        description: 'Run in test mode'
        required: false
        default: 'false'

jobs:
  trigger-scraping:
    name: 🚀 Trigger Rate Scraping
    runs-on: ubuntu-latest
    
    steps:
      - name: 📋 Trigger Scraping API
        id: trigger
        run: |
          echo "🔄 Triggering exchange rate scraping..."
          
          response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -H "x-api-key: ${{ secrets.SCRAPING_API_KEY }}" \
            "${{ secrets.APP_URL }}/api/scrape/trigger")
          
          http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
          body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
          
          echo "📊 HTTP Status: $http_code"
          echo "📄 Response Body: $body"
          
          if [ "$http_code" -eq "200" ]; then
            echo "✅ Scraping triggered successfully!"
          elif [ "$http_code" -eq "429" ]; then
            echo "⚠️ Rate limit reached - this is expected behavior"
          else
            echo "❌ Scraping failed with status $http_code"
            echo "::error::API call failed with status $http_code: $body"
            exit 1
          fi

      - name: 📊 Log Results
        if: always()
        run: |
          echo "🕐 Execution time: $(date)"
          echo "🎯 Workflow: ${{ github.workflow }}"
          echo "🔄 Run ID: ${{ github.run_id }}"
```

3. **Configure GitHub Secrets**

Go to your repository → Settings → Secrets and Variables → Actions

Add these secrets:
- `SCRAPING_API_KEY`: Your secure API key (generate a strong random string)
- `APP_URL`: Your Vercel app URL (e.g., `https://keep-rates-2.vercel.app`)

4. **Test the Workflow**

- Go to Actions tab in your repository
- Find "🏦 Scrape Exchange Rates" workflow
- Click "Run workflow" → "Run workflow" to test manually

### Monitoring GitHub Actions

- **View Logs**: Go to Actions tab → Click on any workflow run
- **Enable Notifications**: Repository Settings → Notifications → Actions
- **Failure Alerts**: GitHub will email you when workflows fail

---

## Option 2: cron-job.org

### Advantages
- ✅ Free tier available
- ✅ Web-based configuration
- ✅ Email notifications
- ✅ Request/response logging
- ✅ Multiple timezone support

### Setup Steps

1. **Create Account**
   - Visit [cron-job.org](https://cron-job.org/)
   - Sign up for a free account

2. **Create New Cron Job**
   - Click "Create cronjob"
   - Configure the following:

```
Title: Keep Rates - Exchange Rate Scraping
URL: https://your-app.vercel.app/api/scrape/trigger
Schedule: 
  - Minutes: 0
  - Hours: 9,10,11,12,13,14,15,16,17
  - Days: * (every day)
  - Months: * (every month)
  - Weekdays: 1,2,3,4,5 (Monday to Friday)
  
Request Method: POST
Request Headers:
  Content-Type: application/json
  x-api-key: your-scraping-api-key-here

Timezone: Asia/Colombo
```

3. **Configure Notifications**
   - Enable "Email notifications on failure"
   - Set failure threshold (e.g., 3 consecutive failures)

4. **Test the Job**
   - Click "Test" to verify the configuration
   - Monitor the execution logs

---

## Option 3: EasyCron

### Advantages
- ✅ Reliable service with high uptime
- ✅ Detailed execution logs
- ✅ Multiple notification channels
- ✅ Advanced scheduling options
- ✅ API for managing cron jobs

### Setup Steps

1. **Create Account**
   - Visit [EasyCron](https://www.easycron.com/)
   - Sign up for an account

2. **Create Cron Job**
   ```
   URL: https://your-app.vercel.app/api/scrape/trigger
   Cron Expression: 0 9-17 * * 1-5
   Method: POST
   Headers:
     x-api-key: your-scraping-api-key
     Content-Type: application/json
   Timezone: Asia/Colombo
   ```

3. **Configure Alerts**
   - Set up email notifications for failures
   - Configure webhook notifications (optional)

---

## Option 4: Uptime Robot (Monitoring + Cron)

### Advantages
- ✅ Free tier with 50 monitors
- ✅ Combines uptime monitoring with cron
- ✅ Multiple alert channels
- ✅ Status page integration

### Setup Steps

1. **Create Monitor**
   - Type: HTTP(s)
   - URL: `https://your-app.vercel.app/api/scrape/trigger`
   - Method: POST
   - Custom HTTP Headers: `x-api-key:your-api-key`
   - Monitoring Interval: 60 minutes
   - Monitor Timeout: 30 seconds

2. **Configure Alerts**
   - Add email, SMS, or webhook alerts
   - Set alert frequency preferences

---

## Testing Your Setup

### 1. Manual API Test

```bash
# Test the API endpoint directly
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  https://your-app.vercel.app/api/scrape/trigger
```

Expected response:
```json
{
  "success": true,
  "jobId": "uuid-job-id",
  "message": "Scraping jobs initiated",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "estimatedCompletionTime": "2-3 minutes"
}
```

### 2. Rate Limiting Test

```bash
# Test rate limiting by calling twice quickly
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  https://your-app.vercel.app/api/scrape/trigger

# Immediately call again (should be rate limited)
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  https://your-app.vercel.app/api/scrape/trigger
```

Expected second response:
```json
{
  "error": "Rate limit exceeded",
  "message": "Only 1 call per hour allowed",
  "nextAllowedAt": "2024-01-15T11:30:00.000Z"
}
```

## Monitoring and Maintenance

### 1. Application Logs

Monitor your Vercel application logs for scraping activities:
- Go to Vercel Dashboard → Your Project → Functions tab
- Look for `/api/scrape/trigger` function logs

### 2. Database Monitoring

Check that rates are being updated:
```sql
-- Check recent rate updates
SELECT b.name, er.buying_rate, er.selling_rate, er.scraped_at
FROM exchange_rates er
JOIN banks b ON er.bank_id = b.id
WHERE er.scraped_at > NOW() - INTERVAL '2 hours'
ORDER BY er.scraped_at DESC;
```

### 3. Failure Alerts

Set up additional monitoring:
- **Dead Man's Switch**: Use a service like Cronitor or Better Uptime
- **Application Monitoring**: Use Sentry or LogRocket for error tracking
- **Database Alerts**: Set up alerts for stale data

## Troubleshooting

### Common Issues

1. **429 Rate Limit Errors**
   - Expected behavior if external service calls more than once per hour
   - Check cron service configuration

2. **401 Authentication Errors**
   - Verify `SCRAPING_API_KEY` environment variable
   - Check if API key matches in external service

3. **500 Internal Server Errors**
   - Check Vercel function logs
   - Verify database connectivity
   - Check Upstash Redis configuration

4. **Timeout Errors**
   - Increase timeout in external service settings
   - Check if bank websites are accessible

### Emergency Manual Trigger

If automatic scraping fails, you can manually trigger via curl:

```bash
curl -X POST \
  -H "x-api-key: $SCRAPING_API_KEY" \
  https://your-app.vercel.app/api/scrape/trigger
```

## Security Best Practices

1. **Strong API Keys**: Use cryptographically strong random keys
2. **Environment Variables**: Never commit API keys to version control
3. **Rate Limiting**: Monitor for unusual API usage patterns
4. **IP Whitelisting**: Consider restricting by IP if using dedicated services
5. **Regular Rotation**: Rotate API keys periodically

## Cost Considerations

| Service | Free Tier | Paid Plans | Best For |
|---------|-----------|------------|----------|
| GitHub Actions | 2000 minutes/month | $0.008/minute | Open source projects |
| cron-job.org | 3 jobs, 1 min interval | €2.50/month | Simple setups |
| EasyCron | 2 jobs | $0.99/month | Reliability focused |
| Uptime Robot | 50 monitors | $5.50/month | Combined monitoring |

## Conclusion

For most use cases, **GitHub Actions is recommended** due to its reliability, free tier, and excellent integration with your codebase. However, choose the option that best fits your specific needs and monitoring requirements.

Remember to test your setup thoroughly and monitor the scraping logs to ensure consistent data collection. 
