import { ExchangeRateScraper, type ScrapingResult, type ExchangeRateData } from './types';

export class SampathBankScraper extends ExchangeRateScraper {
	constructor() {
		super('sampath', {
			url: 'https://www.sampath.lk/rates-and-charges?activeTab=exchange-rates',
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
				console.log(`[Sampath] Scraping attempt ${attempts}/${this.config.retryAttempts}`);

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

				// Sampath Bank table structure: Currency, Description, T/T Buying, O/D Buying, T/T Selling
				// Looking for USD or U.S. Dollar row with 3 rates (T/T Buy, O/D Buy, T/T Sell)
				const usdPattern = /(?:USD|U\.?S\.? Dollar)[\s\S]*?(\d{2,3}\.\d{1,4})[\s\S]*?(\d{2,3}\.\d{1,4})[\s\S]*?(\d{2,3}(?:\.\d{1,4})?)/i;

				const match = html.match(usdPattern);

				if (match && match.length >= 4) {
					const ttBuying = parseFloat(match[1] || '0');   // T/T Buying
					const odBuying = parseFloat(match[2] || '0');   // O/D Buying
					const ttSelling = parseFloat(match[3] || '0');  // T/T Selling

					// Use T/T rates as primary buying/selling rates
					const buyingRate = ttBuying;
					const sellingRate = ttSelling;
					const telegraphicBuyingRate = ttBuying; // T/T rates are telegraphic rates

					console.log(`[Sampath] Extracted rates: T/T Buy=${buyingRate}, O/D Buy=${odBuying}, T/T Sell=${sellingRate}`);

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

					console.log(`[Sampath] Successfully scraped: currency=${buyingRate}/${sellingRate}, telegraphic=${telegraphicBuyingRate}`);

					return this.createResult(true, exchangeRateData, undefined, attempts, startTime);
				} else {
					throw new Error("USD rates not found in page");
				}

			} catch (error) {
				console.log(`[Sampath] Attempt ${attempts} failed:`, error);

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
