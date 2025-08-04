import puppeteer, { type Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { ExchangeRateScraper, type ScrapingResult, type ExchangeRateData } from './types';

export class SampathBankScraper extends ExchangeRateScraper {
	constructor() {
		super('sampath', {
			url: 'https://www.sampath.lk/rates-and-charges?activeTab=exchange-rates',
			timeout: 15000,
			retryAttempts: 3,
			selectors: {
				rateTable: 'table',
				currency: 'tr:has(td:contains("USD")), tr:has(td:contains("US Dollar")), tr:has(td:contains("u.s. dollar"))'
			}
		});
	}

	async scrape(): Promise<ScrapingResult> {
		let browser: Browser | null = null;
		let attempts = 0;

		for (attempts = 1; attempts <= (this.config.retryAttempts || 3); attempts++) {
			try {
				console.log(`[Sampath] Scraping attempt ${attempts}/${this.config.retryAttempts}`);
				
				// Launch browser with serverless configuration
				const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
				console.log(`[Sampath] Browser mode: ${isServerless ? 'Serverless (Vercel/AWS)' : 'Local Development'}`);
				
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

				console.log(`[Sampath] Navigating to ${this.config.url}`);
				await page.goto(this.config.url, { 
					waitUntil: 'networkidle0',
					timeout: this.config.timeout 
				});

				// Wait for any table to load first
				await page.waitForSelector('table', { timeout: 10000 });

				// Scroll down to make sure the exchange rates table is visible
				console.log(`[Sampath] Scrolling to make exchange rates table visible`);
				await page.evaluate(() => {
					// Scroll to the bottom of the page to ensure all content is loaded
					window.scrollTo(0, document.body.scrollHeight);
				});

				// Wait a bit for any dynamic content to load after scrolling
				await new Promise(resolve => setTimeout(resolve, 2000));

				// Extract rates using page.evaluate for better performance
				const debugInfo = await page.evaluate(() => {
					const tables = document.querySelectorAll('table');
					const debugData = {
						tablesFound: tables.length,
						usdRowsFound: [] as string[],
						allRateTexts: [] as string[],
						extractedRates: { currency: [] as number[], telegraphic: [] as number[] },
						allUSDRows: [] as string[] // Debug: show all USD-containing rows
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
							
							// First, log all USD-containing rows for debugging
							if (rowText.includes('usd') || rowText.includes('u.s. dollar') || rowText.includes('us dollar')) {
								debugData.allUSDRows.push(`Table ${tableIndex + 1}, Row ${rowIndex + 1}: ${row.textContent}`);
							}
							
							// Look for USD row that might be exchange rates (look for numeric patterns)
							// Also check if it contains text that suggests it's an exchange rate table
							if ((rowText.includes('usd') || rowText.includes('u.s. dollar') || rowText.includes('us dollar')) &&
								!rowText.includes('avg.bal') && !rowText.includes('interest') && !rowText.includes('bonus')) {
								debugData.usdRowsFound.push(`Table ${tableIndex + 1}, Row ${rowIndex + 1}: ${row.textContent}`);
								
								// Extract all numbers from the row that look like exchange rates (xxx.xx format)
								const cells = row.querySelectorAll('td');
								const rateTexts: string[] = [];
								
								for (const cell of cells) {
									const cellText = cell.textContent?.trim() || '';
									// Look for decimal numbers that could be exchange rates
									// More flexible pattern to capture rates like 297.5, 295.8699, 304
									const rateMatch = cellText.match(/(\d{2,3}\.\d{1,4})/);
									if (rateMatch) {
										const rate = parseFloat(rateMatch[1] || '0');
										if (rate >= 200 && rate <= 500) { // Reasonable range for USD/LKR
											rateTexts.push(rateMatch[1] || '0');
										}
									}
									// Also check for whole numbers like 304
									const wholeMatch = cellText.match(/\b(\d{3})\b/);
									if (wholeMatch && !rateMatch) {
										const rate = parseFloat(wholeMatch[1] || '0');
										if (rate >= 200 && rate <= 500) { // Reasonable range for USD/LKR
											rateTexts.push(wholeMatch[1] || '0');
										}
									}
								}
								
								debugData.allRateTexts = rateTexts;
								
								// Only process if we found reasonable exchange rate values
								if (rateTexts.length >= 2) {
									debugData.usdRowsFound.push(`Table ${tableIndex + 1}, Row ${rowIndex + 1}: ${row.textContent}`);
									
																	// Based on Sampath Bank table structure from screenshot:
								// USD, U.S. Dollar, T/T Buying (297.5), O/D Buying (295.8699), T/T Selling (304)
								if (rateTexts.length >= 3) {
									// We have all three rates
									const ttBuying = parseFloat(rateTexts[0] || '0');     // T/T Buying 
									const odBuying = parseFloat(rateTexts[1] || '0');     // O/D Buying
									const ttSelling = parseFloat(rateTexts[2] || '0');    // T/T Selling
									
									debugData.extractedRates.currency = [ttBuying, ttSelling];  // T/T rates for currency
									debugData.extractedRates.telegraphic = [ttBuying, ttSelling]; // T/T rates are telegraphic rates
								} else {
									// Fallback for only 2 rates
									const buyingRate = parseFloat(rateTexts[0] || '0');  
									const sellingRate = parseFloat(rateTexts[1] || '0'); 
									
									debugData.extractedRates.currency = [buyingRate, sellingRate];
									debugData.extractedRates.telegraphic = [buyingRate, sellingRate];
								}
									
									return debugData; // Return after finding first valid USD row with rates
								}
							}
						}
					}
					
					return debugData;
				});

				console.log(`[Sampath] Scraping debug info:`, JSON.stringify(debugInfo, null, 2));

				// Extract rates from debug info
				const rates = debugInfo.extractedRates;
				
				if (rates.currency.length >= 2 && rates.telegraphic.length >= 2) {
					const buyingRate = rates.currency[0];
					const sellingRate = rates.currency[1];
					const telegraphicBuyingRate = rates.telegraphic[0];
					
					console.log(`[Sampath] Extracted rates: currency=${buyingRate}/${sellingRate}, telegraphic=${telegraphicBuyingRate}`);
					
					// Validate rates
					if (this.validateRate(buyingRate) && this.validateRate(sellingRate) && this.validateRate(telegraphicBuyingRate)) {
						const spread = buyingRate && sellingRate ? Math.abs(sellingRate - buyingRate) : 'N/A';
						console.log(`[Sampath] Rate validation passed. Spread: ${spread}`);
						
						const exchangeRateData: ExchangeRateData = {
							bankCode: this.bankCode,
							currencyPair: 'USD/LKR',
							buyingRate,
							sellingRate,
							telegraphicBuyingRate,
							indicativeRate: undefined, // Sampath doesn't provide separate indicative rate
							timestamp: new Date(),
							isValid: true,
							source: this.config.url
						};

						console.log(`[Sampath] Successfully scraped: currency=${buyingRate}/${sellingRate}, telegraphic=${telegraphicBuyingRate}`);

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
				console.log(`[Sampath] Attempt ${attempts} failed:`, error);
				
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
