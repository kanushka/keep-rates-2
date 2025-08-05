import puppeteer, { type Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { ExchangeRateScraper, type ScrapingResult, type ExchangeRateData } from './types';

export class CBSLScraper extends ExchangeRateScraper {
	constructor() {
		super('cbsl', {
			url: 'https://www.cbsl.gov.lk/',
			timeout: 15000,
			retryAttempts: 3,
			selectors: {
				rateTable: '.economy-snapshot, .exchange-rate, .rate-display',
				currency: 'text*="TT Buy"'
			}
		});
	}

	async scrape(): Promise<ScrapingResult> {
		let browser: Browser | null = null;
		let attempts = 0;

		for (attempts = 1; attempts <= (this.config.retryAttempts || 3); attempts++) {
			try {
				console.log(`[CBSL] Scraping attempt ${attempts}/${this.config.retryAttempts}`);
				
				// Launch browser with serverless configuration
				const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
				console.log(`[CBSL] Browser mode: ${isServerless ? 'Serverless (Vercel/AWS)' : 'Local Development'}`);
				
				if (isServerless) {
					// Serverless environment (Vercel/AWS Lambda)
					browser = await puppeteer.launch({
						args: [
							...chromium.args,
							'--hide-scrollbars',
							'--disable-web-security',
							'--disable-features=VizDisplayCompositor',
						],
						defaultViewport: { width: 1280, height: 720 },
						executablePath: await chromium.executablePath(),
						headless: true,
					});
				} else {
					// Local development - use system Chrome or downloaded Chrome
					const { executablePath } = await import('puppeteer');
					browser = await puppeteer.launch({
						args: [
							'--no-sandbox',
							'--disable-setuid-sandbox',
							'--disable-dev-shm-usage',
							'--disable-gpu'
						],
						executablePath: process.env.CHROME_EXECUTABLE_PATH || executablePath(),
						headless: true,
					});
				}

				const page = await browser.newPage();
				
				// Set user agent to avoid bot detection
				await page.setUserAgent(
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
				);

				console.log(`[CBSL] Navigating to ${this.config.url}`);
				await page.goto(this.config.url, { 
					waitUntil: 'networkidle0',
					timeout: this.config.timeout 
				});

				// Wait for initial content to load
				await new Promise(resolve => setTimeout(resolve, 3000));
				
				// Scroll to trigger dynamic content loading
				await page.evaluate(() => {
					window.scrollTo(0, document.body.scrollHeight);
				});
				
				// Wait for dynamic content
				await new Promise(resolve => setTimeout(resolve, 2000));
				
				// Scroll back to top
				await page.evaluate(() => {
					window.scrollTo(0, 0);
				});
				
				// Wait for any additional content to load
				await new Promise(resolve => setTimeout(resolve, 2000));

				// Extract rates using page.evaluate for better performance
				const debugInfo = await page.evaluate(() => {
					const debugData = {
						pageTitle: document.title,
						bodyText: document.body.textContent?.substring(0, 1000) || '',
						rateSections: [] as string[],
						extractedRates: {
							buy: null as number | null,
							sell: null as number | null
						},
						allNumbers: [] as string[],
						allTTText: [] as string[]
					};

					// First, find all text containing TT Buy/Sell
					const allElements = document.querySelectorAll('*');
					
					for (const element of allElements) {
						const text = element.textContent?.trim() || '';
						
						if ((text.includes('TT Buy') || text.includes('TT Sell')) && text.length < 500) {
							debugData.allTTText.push(text);
						}
					}

					// Look for specific TT rate patterns
					const fullText = document.body.textContent || '';
					
					// Find all decimal numbers in reasonable exchange rate range
					const allRateNumbers = fullText.match(/\b(\d{2,3}\.\d{2,4})\b/g);
					if (allRateNumbers) {
						const validRates = allRateNumbers
							.map(n => parseFloat(n))
							.filter(n => n >= 250 && n <= 400);
						debugData.allNumbers = validRates.map(n => n.toString());
					}

					// Look for TT Buy/Sell patterns
					const patterns = [
						// Pattern 1: "TT Buy" followed by rate
						/TT Buy[\s\S]{0,50}?(\d{2,3}\.\d{2,4})/i,
						// Pattern 2: "TT Sell" followed by rate  
						/TT Sell[\s\S]{0,50}?(\d{2,3}\.\d{2,4})/i,
						// Pattern 3: Both TT rates in sequence
						/TT Buy[\s\S]{0,100}?(\d{2,3}\.\d{2,4})[\s\S]{0,100}?TT Sell[\s\S]{0,100}?(\d{2,3}\.\d{2,4})/i,
						// Pattern 4: Exchange Rate USD/LKR section
						/Exchange Rate USD\/LKR[\s\S]{0,200}?(\d{2,3}\.\d{2,4})[\s\S]{0,100}?(\d{2,3}\.\d{2,4})/i
					];

					// Try to extract TT Buy and TT Sell rates
					const ttBuyMatch = fullText.match(/TT Buy[\s\S]{0,50}?(\d{2,3}\.\d{2,4})/i);
					const ttSellMatch = fullText.match(/TT Sell[\s\S]{0,50}?(\d{2,3}\.\d{2,4})/i);

					if (ttBuyMatch && ttSellMatch) {
						const buyRate = parseFloat(ttBuyMatch[1] || '0');
						const sellRate = parseFloat(ttSellMatch[1] || '0');
						
						if (buyRate >= 250 && buyRate <= 400 && sellRate >= 250 && sellRate <= 400) {
							debugData.extractedRates.buy = buyRate;
							debugData.extractedRates.sell = sellRate;
							debugData.rateSections.push(`TT Buy: ${buyRate}, TT Sell: ${sellRate}`);
						}
					}

					// Alternative: Look for "Exchange Rate USD/LKR" section
					const exchangeRateMatch = fullText.match(/Exchange Rate USD\/LKR[\s\S]{0,300}?(\d{2,3}\.\d{2,4})[\s\S]{0,100}?(\d{2,3}\.\d{2,4})/i);
					if (exchangeRateMatch && !debugData.extractedRates.buy) {
						const rate1 = parseFloat(exchangeRateMatch[1] || '0');
						const rate2 = parseFloat(exchangeRateMatch[2] || '0');
						
						if (rate1 >= 250 && rate1 <= 400 && rate2 >= 250 && rate2 <= 400) {
							// Assume first is buy, second is sell (buy < sell)
							if (rate1 < rate2) {
								debugData.extractedRates.buy = rate1;
								debugData.extractedRates.sell = rate2;
							} else {
								debugData.extractedRates.buy = rate2;
								debugData.extractedRates.sell = rate1;
							}
							debugData.rateSections.push(`Exchange Rate pattern: ${rate1}/${rate2}`);
						}
					}

					return debugData;
				});

				console.log(`[CBSL] Scraping debug info:`, JSON.stringify(debugInfo, null, 2));

				// Extract rates from debug info
				const { buy, sell } = debugInfo.extractedRates;
				
				if (buy && sell) {
					console.log(`[CBSL] Extracted rates: TT Buy=${buy}, TT Sell=${sell}`);
					
					// Validate rates
					if (this.validateRate(buy) && this.validateRate(sell)) {
						const spread = Math.abs(sell - buy);
						console.log(`[CBSL] Rate validation passed. Spread: ${spread}`);
						
						const exchangeRateData: ExchangeRateData = {
							bankCode: this.bankCode,
							currencyPair: 'USD/LKR',
							buyingRate: buy,
							sellingRate: sell,
							telegraphicBuyingRate: buy, // CBSL TT Buy rate
							timestamp: new Date(),
							isValid: true,
							source: this.config.url
						};

						console.log(`[CBSL] Successfully scraped: TT Buy=${buy}, TT Sell=${sell}`);

						return {
							success: true,
							data: exchangeRateData,
							duration: Date.now() - Date.now(), // Will be calculated by caller
							attempts
						};
					} else {
						throw new Error(`Invalid rate values: buy=${buy}, sell=${sell}`);
					}
				} else {
					throw new Error(`Failed to extract rates. Debug info: ${JSON.stringify(debugInfo)}`);
				}

			} catch (error) {
				console.log(`[CBSL] Attempt ${attempts} failed:`, error);
				
				if (attempts === (this.config.retryAttempts || 3)) {
					return {
						success: false,
						error: error instanceof Error ? error.message : String(error),
						duration: Date.now() - Date.now(), // Will be calculated by caller
						attempts
					};
				}
				
				// Wait before retry
				await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
			} finally {
				if (browser) {
					await browser.close();
					browser = null;
				}
			}
		}

		return {
			success: false,
			error: 'All retry attempts exhausted',
			duration: Date.now() - Date.now(),
			attempts
		};
	}
}
