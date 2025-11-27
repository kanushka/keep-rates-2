import { ExchangeRateScraper, type ScrapingResult, type ExchangeRateData } from './types';

export class CommercialBankScraper extends ExchangeRateScraper {
	constructor() {
		super('combank', {
			url: 'https://www.combank.lk/rates-tariff#exchange-rates',
			selectors: {},
			timeout: 15000,
			retryAttempts: 3
		});
	}

	async scrape(): Promise<ScrapingResult> {
		const startTime = Date.now();
		let attempts = 0;

		for (attempts = 1; attempts <= (this.config.retryAttempts || 3); attempts++) {
			try {
				console.log(`[ComBank] Scraping attempt ${attempts}/${this.config.retryAttempts}`);

				const response = await fetch(this.config.url, {
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
					},
					signal: AbortSignal.timeout(this.config.timeout || 15000)
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const html = await response.text();

				// Commercial Bank table structure has multiple rates per currency
				// We need to capture: Currency Buying, Currency Selling, Telegraphic Buying
				// Pattern looks for US DOLLARS row and captures the 5th numeric value (Telegraphic Buying)
				// Updated to capture all relevant rates
				const usdPattern = /US DOLLARS[\s\S]*?text-align:right">\s*([\d.]+)\s*<\/td>[\s\S]*?text-align:right">\s*([\d.]+)\s*<\/td>[\s\S]*?text-align:right">\s*([\d.]+)\s*<\/td>[\s\S]*?text-align:right">\s*([\d.]+)\s*<\/td>[\s\S]*?text-align:right">\s*([\d.]+)\s*</;

				const match = html.match(usdPattern);

				if (match && match.length >= 6) {
					const buyingRate = parseFloat(match[1] || '0');           // Currency buying (1st rate)
					const sellingRate = parseFloat(match[2] || '0');          // Currency selling (2nd rate)
					const telegraphicBuyingRate = parseFloat(match[5] || '0'); // Telegraphic buying (5th rate)

					console.log(`[ComBank] Extracted rates: currency=${buyingRate}/${sellingRate}, telegraphic=${telegraphicBuyingRate}`);

					// Validate rates
					if (!this.validateRate(buyingRate) || !this.validateRate(sellingRate)) {
						throw new Error(`Invalid rates extracted: buying=${buyingRate}, selling=${sellingRate}`);
					}

					if (!this.validateSpread(buyingRate, sellingRate)) {
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
						telegraphicBuyingRate: telegraphicBuyingRate || undefined,
						timestamp: new Date(),
						isValid: true,
						source: this.config.url
					};

					console.log(`[ComBank] Successfully scraped: currency=${buyingRate}/${sellingRate}, telegraphic=${telegraphicBuyingRate}`);
					return this.createResult(true, exchangeRateData, undefined, attempts, startTime);

				} else {
					throw new Error("USD rates not found in page");
				}

			} catch (error) {
				console.error(`[ComBank] Attempt ${attempts} failed:`, error);

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
