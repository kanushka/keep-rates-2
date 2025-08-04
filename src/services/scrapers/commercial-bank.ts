import puppeteer, { type Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { ExchangeRateScraper, type ScrapingResult, type ExchangeRateData } from './types';

export class CommercialBankScraper extends ExchangeRateScraper {
	constructor() {
		super('combank', {
			url: 'https://www.combank.lk/rates-tariff#exchange-rates',
			selectors: {
				rateTable: '.rate-table, .exchange-rates-table, table',
				buyingRate: 'td:contains("USD") + td, [data-currency="USD"] .buying-rate',
				sellingRate: 'td:contains("USD") + td + td, [data-currency="USD"] .selling-rate',
				currency: 'td:contains("USD"), [data-currency="USD"]'
			},
			waitForSelector: '.rate-table, .exchange-rates-table, table',
			timeout: 30000,
			retryAttempts: 3
		});
	}

	async scrape(): Promise<ScrapingResult> {
		const startTime = Date.now();
		let browser: Browser | null = null;
		let attempts = 0;

		for (attempts = 1; attempts <= (this.config.retryAttempts || 3); attempts++) {
			try {
				console.log(`[ComBank] Scraping attempt ${attempts}/${this.config.retryAttempts}`);
				
				// Launch browser with serverless configuration
				const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
				console.log(`[ComBank] Browser mode: ${isServerless ? 'Serverless (Vercel/AWS)' : 'Local Development'}`);
				
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

				// Navigate to page
				console.log(`[ComBank] Navigating to ${this.config.url}`);
				await page.goto(this.config.url, { 
					waitUntil: 'networkidle2',
					timeout: this.config.timeout 
				});

				// Wait for exchange rate table to load
				if (this.config.waitForSelector) {
					await page.waitForSelector(this.config.waitForSelector, { 
						timeout: 10000 
					});
				}

				// Extract exchange rates
				const rateData = await page.evaluate(() => {
					// Try to find USD row in the table
					const tables = document.querySelectorAll('table');
					let usdBuyingRate: number | undefined;
					let usdSellingRate: number | undefined;
					let telegraphicBuyingRate: number | undefined;
					const debugInfo = {
						tablesFound: tables.length,
						usdRowsFound: [] as string[],
						allRateTexts: [] as string[],
						extractedRates: {
							currency: [] as number[],
							telegraphic: [] as number[]
						}
					};

					console.log(`[ComBank Browser] Found ${tables.length} tables on page`);

					for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
						const table = tables[tableIndex];
						if (!table) continue;
						
						const rows = table.querySelectorAll('tr');
						console.log(`[ComBank Browser] Table ${tableIndex + 1}: ${rows.length} rows`);
						
						for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
							const row = rows[rowIndex];
							if (!row) continue;
							
							const cells = row.querySelectorAll('td, th');
							const rowText = row.textContent?.toLowerCase() || '';
							
							// Look for USD row
							if (rowText.includes('usd') || rowText.includes('us dollar') || rowText.includes('united states')) {
								console.log(`[ComBank Browser] Found potential USD row ${rowIndex + 1}:`, rowText);
								debugInfo.usdRowsFound.push(`Table ${tableIndex + 1}, Row ${rowIndex + 1}: ${rowText}`);
								
								// Extract all cell texts for debugging
								const cellTexts = Array.from(cells).map(cell => cell.textContent?.trim() || '');
								console.log(`[ComBank Browser] Cell texts:`, cellTexts);
								
								// Try to extract rates from this row
								const rateTexts = cellTexts.filter(text => {
									const cleanText = text.replace(/,/g, '');
									return /^\d+\.?\d*$/.test(cleanText) && parseFloat(cleanText) > 100 && parseFloat(cleanText) < 500;
								});

								console.log(`[ComBank Browser] Found potential rates:`, rateTexts);
								debugInfo.allRateTexts.push(...rateTexts);

								if (rateTexts.length >= 6) {
									// Commercial Bank table structure:
									// Currency: [0] Buying, [1] Selling
									// Cheques: [2] Buying, [3] Selling 
									// Telegraphic: [4] Buying, [5] Selling
									usdBuyingRate = parseFloat(rateTexts[0]!.replace(/,/g, ''));           // Currency buying
									usdSellingRate = parseFloat(rateTexts[1]!.replace(/,/g, ''));          // Currency selling
									telegraphicBuyingRate = parseFloat(rateTexts[4]!.replace(/,/g, ''));   // Telegraphic buying
									
									debugInfo.extractedRates = {
										currency: [usdBuyingRate, usdSellingRate],
										telegraphic: [telegraphicBuyingRate, parseFloat(rateTexts[5]!.replace(/,/g, ''))]
									};
									
									console.log(`[ComBank Browser] Extracted rates: currency=${usdBuyingRate}/${usdSellingRate}, telegraphic=${telegraphicBuyingRate}`);
									break;
								} else if (rateTexts.length >= 2) {
									// Fallback: just take first two rates
									usdBuyingRate = parseFloat(rateTexts[0]!.replace(/,/g, ''));
									usdSellingRate = parseFloat(rateTexts[1]!.replace(/,/g, ''));
									debugInfo.extractedRates.currency = [usdBuyingRate, usdSellingRate];
									console.log(`[ComBank Browser] Fallback: extracted basic rates: buying=${usdBuyingRate}, selling=${usdSellingRate}`);
									break;
								}
							}
						}
						
						if (usdBuyingRate && usdSellingRate) break;
					}

					return {
						buyingRate: usdBuyingRate,
						sellingRate: usdSellingRate,
						telegraphicBuyingRate: telegraphicBuyingRate,
						debug: debugInfo
					};
				});

				await browser.close();
				browser = null;

				// Validate extracted data
				const { buyingRate, sellingRate, telegraphicBuyingRate, debug } = rateData;
				
				console.log(`[ComBank] Scraping debug info:`, debug);
				console.log(`[ComBank] Extracted rates: currency=${buyingRate}/${sellingRate}, telegraphic=${telegraphicBuyingRate}`);
				
				if (!this.validateRate(buyingRate) || !this.validateRate(sellingRate)) {
					console.error(`[ComBank] Rate validation failed:`, {
						buyingRate,
						sellingRate,
						telegraphicBuyingRate,
						buyingRateValid: this.validateRate(buyingRate),
						sellingRateValid: this.validateRate(sellingRate),
						telegraphicRateValid: this.validateRate(telegraphicBuyingRate),
						debug
					});
					throw new Error(`Invalid rates extracted: buying=${buyingRate}, selling=${sellingRate}`);
				}

				if (!this.validateSpread(buyingRate, sellingRate)) {
					console.error(`[ComBank] Spread validation failed:`, {
						buyingRate,
						sellingRate,
						telegraphicBuyingRate,
						spread: buyingRate && sellingRate ? Math.abs(sellingRate - buyingRate) : 'N/A',
						debug
					});
					throw new Error(`Invalid spread: buying=${buyingRate}, selling=${sellingRate}`);
				}

				// Validate telegraphic rate if available
				if (telegraphicBuyingRate && !this.validateRate(telegraphicBuyingRate)) {
					console.warn(`[ComBank] Telegraphic rate validation failed but continuing: ${telegraphicBuyingRate}`);
				}

				// Create successful result
				const exchangeRateData: ExchangeRateData = {
					bankCode: this.bankCode,
					currencyPair: 'USD/LKR',
					buyingRate,
					sellingRate,
					telegraphicBuyingRate,
					timestamp: new Date(),
					isValid: true,
					source: this.config.url
				};

				console.log(`[ComBank] Successfully scraped: currency=${buyingRate}/${sellingRate}, telegraphic=${telegraphicBuyingRate}`);
				return this.createResult(true, exchangeRateData, undefined, attempts, startTime);

			} catch (error) {
				console.error(`[ComBank] Attempt ${attempts} failed:`, error);
				
				if (browser) {
					await browser.close();
					browser = null;
				}

				// If this was the last attempt, return error
				if (attempts === (this.config.retryAttempts || 3)) {
					return this.createResult(
						false, 
						undefined, 
						error instanceof Error ? error.message : 'Unknown error',
						attempts, 
						startTime
					);
				}

				// Wait before retry
				await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
			}
		}

		// Fallback (shouldn't reach here)
		return this.createResult(false, undefined, 'Max retries exceeded', attempts, startTime);
	}
}
