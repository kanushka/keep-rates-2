# GitHub Actions Workflow Setup

This directory contains the GitHub Actions workflow for automated exchange rate scraping.

## Workflow: `scrape-exchange-rates.yml`

### Overview
The workflow automatically triggers exchange rate scraping from Sri Lankan banks every hour during business hours.

### Schedule
- **Frequency**: Every hour during business days (Monday-Friday)
- **Time Zone**: Sri Lanka Time (UTC+5:30)
- **Business Hours**: 9:00 AM - 5:00 PM SLT
- **UTC Schedule**: 3:30 AM - 11:30 AM UTC (every hour)

### Triggers
1. **Scheduled**: Automatically runs every hour during business hours
2. **Manual**: Can be triggered manually via GitHub Actions UI

### Required Secrets

Configure these secrets in your GitHub repository:

1. **`SCRAPING_API_KEY`**
   - Description: Secure API key for authentication
   - Type: String
   - Example: `your-super-secret-api-key-here`
   - Must match the `SCRAPING_API_KEY` environment variable in your Vercel app

2. **`APP_URL`**
   - Description: Your Vercel application URL
   - Type: String
   - Example: `https://keep-rates-2.vercel.app`
   - Must be the full URL to your deployed application

### Setup Instructions

1. **Add Repository Secrets**:
   - Go to your repository → Settings → Secrets and Variables → Actions
   - Click "New repository secret"
   - Add `SCRAPING_API_KEY` and `APP_URL`

2. **Verify Environment Variables**:
   Ensure your Vercel app has these environment variables:
   ```env
   SCRAPING_API_KEY=your-super-secret-api-key-here
   UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-redis-auth-token
   AUTH_URL=https://your-app.vercel.app
   ```

3. **Test the Workflow**:
   - Go to Actions tab in your repository
   - Find "🏦 Scrape Exchange Rates" workflow
   - Click "Run workflow" → "Run workflow" to test manually

### Expected Behavior

#### Successful Execution (HTTP 200)
```
✅ Scraping triggered successfully!
📊 HTTP Status: 200
📄 Response Body: {"success":true,"jobId":"uuid","message":"Scraping jobs initiated"}
```

#### Rate Limited (HTTP 429)
```
⚠️ Rate limit reached - this is expected behavior
📊 HTTP Status: 429
📄 Response Body: {"error":"Rate limit exceeded","message":"Only 1 call per hour allowed"}
```

#### Error (HTTP 500)
```
❌ Scraping failed with status 500
📊 HTTP Status: 500
📄 Response Body: {"error":"Internal server error"}
```

### Monitoring

- **View Logs**: Go to Actions tab → Click on any workflow run
- **Enable Notifications**: Repository Settings → Notifications → Actions
- **Failure Alerts**: GitHub will email you when workflows fail

### Troubleshooting

1. **401 Unauthorized**: Check `SCRAPING_API_KEY` secret matches your Vercel environment variable
2. **404 Not Found**: Verify `APP_URL` points to the correct Vercel deployment
3. **500 Internal Error**: Check Vercel function logs for application errors
4. **429 Rate Limited**: Normal behavior if called more than once per hour

### Security Notes

- The API key should be a strong, randomly generated string
- Never commit API keys to version control
- Rotate API keys periodically for security
- Monitor for unusual API usage patterns 
