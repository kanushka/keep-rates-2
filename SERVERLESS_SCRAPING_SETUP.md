# Serverless Scraping Setup Guide

This project uses Puppeteer with `@sparticuz/chromium` for web scraping in serverless environments (Vercel). Here's how it's configured and optimized.

## Architecture Overview

### Browser Launcher (`src/services/scrapers/browser-launcher.ts`)
- **Singleton Pattern**: Manages browser instances efficiently
- **Serverless Detection**: Automatically detects Vercel/AWS Lambda environments
- **Memory Management**: Proper cleanup for serverless functions
- **Optimized Arguments**: Extensive Chrome flags for serverless performance

### Key Optimizations

#### 1. Next.js Configuration (`next.config.js`)
```javascript
serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
output: 'standalone',
```

#### 2. Vercel Configuration (`vercel.json`)
```json
{
  "functions": {
    "src/app/api/scrape/**/*.ts": {
      "maxDuration": 60,
      "memory": 3008
    }
  }
}
```

#### 3. Browser Launch Arguments
- `--no-sandbox`: Required for serverless
- `--disable-setuid-sandbox`: Security bypass for serverless
- `--disable-dev-shm-usage`: Memory optimization
- `--single-process`: Reduces memory footprint
- `--disable-extensions`: Performance optimization

## Troubleshooting Common Issues

### 1. "Chrome not found" Error
**Solution**: Ensure `@sparticuz/chromium` is properly installed and configured.

### 2. Memory Exceeded Errors
**Solutions**:
- Increase function memory in `vercel.json`
- Use `--single-process` flag
- Implement proper browser cleanup

### 3. Timeout Issues
**Solutions**:
- Increase `maxDuration` in `vercel.json`
- Optimize page load strategies
- Use `networkidle0` instead of `networkidle2`

### 4. Browser Launch Failures
**Solutions**:
- Check environment variables
- Verify Chromium executable path
- Use fallback launch options

## Environment Variables

```bash
# Required for serverless
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Optional for local development
CHROME_EXECUTABLE_PATH=/path/to/chrome
```

## Best Practices

### 1. Browser Management
```typescript
// Always use the browser launcher
const browser = await browserLauncher.getBrowser();

// Always close browsers properly
await browserLauncher.closeBrowser(browser);
```

### 2. Error Handling
```typescript
try {
  const browser = await browserLauncher.getBrowser();
  // ... scraping logic
} catch (error) {
  console.error('Scraping failed:', error);
} finally {
  if (browser) {
    await browserLauncher.closeBrowser(browser);
  }
}
```

### 3. Memory Optimization
- Close browsers immediately after use
- Use `--single-process` flag
- Implement proper cleanup in finally blocks
- Avoid keeping browser instances in memory

## Performance Tips

### 1. Page Load Optimization
```typescript
await page.goto(url, { 
  waitUntil: 'networkidle0', // More reliable than networkidle2
  timeout: 30000 
});
```

### 2. Selector Waiting
```typescript
await page.waitForSelector('table', { timeout: 10000 });
```

### 3. User Agent Spoofing
```typescript
await page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
);
```

## Monitoring and Debugging

### 1. Logging
All scrapers include comprehensive logging:
```typescript
console.log(`[BankName] Scraping attempt ${attempts}/${maxAttempts}`);
console.log(`[BankName] Browser mode: ${isServerless ? 'Serverless' : 'Local'}`);
```

### 2. Debug Information
Scrapers return debug information for troubleshooting:
```typescript
const debugInfo = {
  tablesFound: tables.length,
  usdRowsFound: [],
  extractedRates: { currency: [], telegraphic: [] }
};
```

## Deployment Checklist

- [ ] `@sparticuz/chromium` is installed
- [ ] `vercel.json` is configured with proper memory/timeout
- [ ] `next.config.js` has serverless optimizations
- [ ] Environment variables are set
- [ ] All scrapers use the browser launcher
- [ ] Proper error handling and cleanup is implemented

## Common Error Messages and Solutions

| Error | Solution |
|-------|----------|
| `Chrome not found` | Check `@sparticuz/chromium` installation |
| `Memory exceeded` | Increase memory in `vercel.json` |
| `Function timeout` | Increase `maxDuration` in `vercel.json` |
| `Browser launch failed` | Check Chrome flags and executable path |
| `Page not found` | Verify URL and network connectivity |

## Testing

### Local Testing
```bash
npm run test:combank
npm run test:ndb
npm run test:sampath
npm run test:cbsl
```

### Serverless Testing
Deploy to Vercel and test the `/api/scrape/trigger` endpoint.

## Support

If you encounter issues:
1. Check the logs in Vercel dashboard
2. Verify all configurations are correct
3. Test locally first
4. Check browser launcher implementation
5. Review error handling in scrapers 
