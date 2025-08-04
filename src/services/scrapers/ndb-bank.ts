import puppeteer, { type Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { ExchangeRateScraper, type ScrapingResult, type ExchangeRateData } from './types';

export class NDBBankScraper extends ExchangeRateScraper {
	constructor() {
		super('ndb', {
			url: 'https://www.ndbbank.com/rates/exchange-rates',
			timeout: 15000,
			retryAttempts: 3,
			selectors: {
				rateTable: 'table',
				currency: 'tr:has(td:contains("USD")), tr:has(td:contains("US Dollar")), tr:has(td:contains("us dollar"))'
			}
		});
	}

	async scrape(): Promise<ScrapingResult> {
		let browser: Browser | null = null;
		let attempts = 0;

		for (attempts = 1; attempts <= (this.config.retryAttempts || 3); attempts++) {
			try {
				console.log(`[NDBBank] Scraping attempt ${attempts}/${this.config.retryAttempts}`);
				
				// Launch browser with serverless configuration
				const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
				console.log(`[NDBBank] Browser mode: ${isServerless ? 'Serverless (Vercel/AWS)' : 'Local Development'}`);
				
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

				console.log(`[NDBBank] Navigating to ${this.config.url}`);
				await page.goto(this.config.url, { 
					waitUntil: 'networkidle0',
					timeout: this.config.timeout 
				});

				// Wait for the rates table to load
				await page.waitForSelector('table', { timeout: 10000 });

				// Extract rates using page.evaluate for better performance
				const debugInfo = await page.evaluate(() => {
					const tables = document.querySelectorAll('table');
					const debugData = {
						tablesFound: tables.length,
						usdRowsFound: [] as string[],
						allRateTexts: [] as string[],
						extractedRates: { currency: [] as number[], telegraphic: [] as number[] }
					};

					// Search through all tables for USD rates
					for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
						const table = tables[tableIndex];
						if (!table) continue;
						
						const rows = table.querySelectorAll('tr');
						
						for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
							const row = rows[rowIndex];
							if (!row) continue;
							
							const rowText = row.textContent?.toLowerCase() || '';
							
							// Look for USD row (various possible formats)
							if (rowText.includes('us dollar') || rowText.includes('usd') || rowText.includes('dollar')) {
								debugData.usdRowsFound.push(`Table ${tableIndex + 1}, Row ${rowIndex + 1}: ${row.textContent}`);
								
								// Extract all numbers from the row that look like exchange rates (xxx.xx format)
								const cells = row.querySelectorAll('td');
								const rateTexts: string[] = [];
								
								for (const cell of cells) {
									const cellText = cell.textContent?.trim() || '';
									// Look for decimal numbers that could be exchange rates (between 200-400 range typically)
									const rateMatch = cellText.match(/(\d{2,3}\.\d{2})/);
									if (rateMatch) {
										const rate = parseFloat(rateMatch[1] || '0');
										if (rate >= 200 && rate <= 500) { // Reasonable range for USD/LKR
											rateTexts.push(rateMatch[1] || '0');
										}
									}
								}
								
								debugData.allRateTexts = rateTexts;
								
								// Based on NDB Bank table structure from screenshot:
								// Currency Buying, Currency Selling, Demand Draft Buying, Demand Draft Selling, Telegraphic Buying, Telegraphic Selling
								if (rateTexts.length >= 6) {
									debugData.extractedRates.currency = [parseFloat(rateTexts[0] || '0'), parseFloat(rateTexts[1] || '0')]; // Currency rates
									debugData.extractedRates.telegraphic = [parseFloat(rateTexts[4] || '0'), parseFloat(rateTexts[5] || '0')]; // Telegraphic rates
								}
								
								return debugData; // Return after finding first USD row
							}
						}
					}
					
					return debugData;
				});

				console.log(`[NDBBank] Scraping debug info:`, JSON.stringify(debugInfo, null, 2));

				// Extract rates from debug info
				const rates = debugInfo.extractedRates;
				
				if (rates.currency.length >= 2 && rates.telegraphic.length >= 2) {
					const buyingRate = rates.currency[0];
					const sellingRate = rates.currency[1];
					const telegraphicBuyingRate = rates.telegraphic[0];
					
					console.log(`[NDBBank] Extracted rates: currency=${buyingRate}/${sellingRate}, telegraphic=${telegraphicBuyingRate}`);
					
					// Validate rates
					if (this.validateRate(buyingRate) && this.validateRate(sellingRate) && this.validateRate(telegraphicBuyingRate)) {
						const spread = buyingRate && sellingRate ? Math.abs(sellingRate - buyingRate) : 'N/A';
						console.log(`[NDBBank] Rate validation passed. Spread: ${spread}`);
						
						const exchangeRateData: ExchangeRateData = {
							bankCode: this.bankCode,
							currencyPair: 'USD/LKR',
							buyingRate,
							sellingRate,
							telegraphicBuyingRate,
							indicativeRate: undefined, // NDB doesn't provide separate indicative rate
							timestamp: new Date(),
							isValid: true,
							source: this.config.url
						};

						console.log(`[NDBBank] Successfully scraped: currency=${buyingRate}/${sellingRate}, telegraphic=${telegraphicBuyingRate}`);

						return {
							success: true,
							data: exchangeRateData,
							duration: Date.now() - Date.now(), // Will be calculated by caller
							attempts
						};
					} else {
						throw new Error(`Invalid rate values: buying=${buyingRate}, selling=${sellingRate}, telegraphic=${telegraphicBuyingRate}`);
					}
				} else {
					throw new Error(`Failed to extract rates. Debug info: ${JSON.stringify(debugInfo)}`);
				}

			} catch (error) {
				console.log(`[NDBBank] Attempt ${attempts} failed:`, error);
				
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
