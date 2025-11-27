import { ExchangeRateScraper, type ScrapingResult, type ExchangeRateData } from './types';

export class NDBBankScraper extends ExchangeRateScraper {
	constructor() {
		super('ndb', {
			url: 'https://www.ndbbank.com/rates/exchange-rates',
			timeout: 15000,
			retryAttempts: 3,
			selectors: {}
		});
	}

	async scrape(): Promise<ScrapingResult> {
		const startTime = Date.now();
		let attempts = 0;

		for (attempts = 1; attempts <= (this.config.retryAttempts || 3); attempts++) {
			try {
				console.log(`[NDBBank] Scraping attempt ${attempts}/${this.config.retryAttempts}`);

				const response = await fetch(this.config.url, {
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
					},
					signal: AbortSignal.timeout(this.config.timeout || 15000)
				});

				console.log(`[NDBBank] HTTP Response status: ${response.status}`);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const html = await response.text();

				// NDB Bank table structure: Currency Buying, Currency Selling, Demand Draft Buying, Demand Draft Selling, Telegraphic Buying, Telegraphic Selling
				// Looking for US Dollar or USD row with 6 rates
				const usdPattern = /(?:US Dollar|USD)[\s\S]*?(\d{2,3}\.\d{2})[\s\S]*?(\d{2,3}\.\d{2})[\s\S]*?(\d{2,3}\.\d{2})[\s\S]*?(\d{2,3}\.\d{2})[\s\S]*?(\d{2,3}\.\d{2})[\s\S]*?(\d{2,3}\.\d{2})/i;

				const match = html.match(usdPattern);

				if (match && match.length >= 7) {
					const buyingRate = parseFloat(match[1] || '0');           // Currency buying
					const sellingRate = parseFloat(match[2] || '0');          // Currency selling
					const telegraphicBuyingRate = parseFloat(match[5] || '0'); // Telegraphic buying

					console.log(`[NDBBank] Extracted rates: currency=${buyingRate}/${sellingRate}, telegraphic=${telegraphicBuyingRate}`);

					// Validate rates
					if (!this.validateRate(buyingRate) || !this.validateRate(sellingRate) || !this.validateRate(telegraphicBuyingRate)) {
						throw new Error(`Invalid rate values: buying=${buyingRate}, selling=${sellingRate}, telegraphic=${telegraphicBuyingRate}`);
					}

					if (!this.validateSpread(buyingRate, sellingRate)) {
						throw new Error(`Invalid spread: buying=${buyingRate}, selling=${sellingRate}`);
					}

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

					console.log(`[NDBBank] Successfully scraped: currency=${buyingRate}/${sellingRate}, telegraphic=${telegraphicBuyingRate}`);

					return this.createResult(true, exchangeRateData, undefined, attempts, startTime);
				} else {
					throw new Error("USD rates not found in page");
				}

			} catch (error) {
				console.log(`[NDBBank] Attempt ${attempts} failed:`, error);

				if (attempts === (this.config.retryAttempts || 3)) {
					return this.createResult(
						false,
						undefined,
						error instanceof Error ? error.message : String(error),
						attempts,
						startTime
					);
				}

				// Wait before retry
				await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
			}
		}

		return this.createResult(false, undefined, 'All retry attempts exhausted', attempts, startTime);
	}
}
