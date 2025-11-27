import { ExchangeRateScraper, type ScrapingResult, type ExchangeRateData } from './types';

export class CBSLScraper extends ExchangeRateScraper {
	constructor() {
		super('cbsl', {
			url: 'https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates',
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
				console.log(`[CBSL] Scraping attempt ${attempts}/${this.config.retryAttempts}`);

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

				// CBSL shows "USD/LKR SPOT Indicative Exchange Rate" followed by Buy and Sell rates
				// Pattern: "Buy" followed by rate, then "Sell" followed by rate
				const buyPattern = /Buy[\s\S]{0,100}?(\d{2,3}\.\d{2,4})/i;
				const sellPattern = /Sell[\s\S]{0,100}?(\d{2,3}\.\d{2,4})/i;

				const buyMatch = html.match(buyPattern);
				const sellMatch = html.match(sellPattern);

				if (buyMatch && sellMatch) {
					const buyRate = parseFloat(buyMatch[1] || '0');
					const sellRate = parseFloat(sellMatch[1] || '0');

					console.log(`[CBSL] Extracted rates: Buy=${buyRate}, Sell=${sellRate}`);

					// Validate rates
					if (!this.validateRate(buyRate) || !this.validateRate(sellRate)) {
						throw new Error(`Invalid rate values: buy=${buyRate}, sell=${sellRate}`);
					}

					if (!this.validateSpread(buyRate, sellRate)) {
						throw new Error(`Invalid spread: buy=${buyRate}, sell=${sellRate}`);
					}

					const exchangeRateData: ExchangeRateData = {
						bankCode: this.bankCode,
						currencyPair: 'USD/LKR',
						buyingRate: buyRate,
						sellingRate: sellRate,
						telegraphicBuyingRate: buyRate, // CBSL indicative buy rate
						indicativeRate: buyRate, // CBSL provides indicative rate
						timestamp: new Date(),
						isValid: true,
						source: this.config.url
					};

					console.log(`[CBSL] Successfully scraped: Buy=${buyRate}, Sell=${sellRate}`);

					return this.createResult(true, exchangeRateData, undefined, attempts, startTime);
				} else {
					// Try alternative pattern for "USD/LKR SPOT Indicative Exchange Rate"
					const spotPattern = /USD\/LKR SPOT Indicative Exchange Rate[\s\S]{0,200}?Buy[\s\S]{0,100}?(\d{2,3}\.\d{2,4})[\s\S]{0,100}?Sell[\s\S]{0,100}?(\d{2,3}\.\d{2,4})/i;
					const spotMatch = html.match(spotPattern);

					if (spotMatch && spotMatch.length >= 3) {
						const buyRate = parseFloat(spotMatch[1] || '0');
						const sellRate = parseFloat(spotMatch[2] || '0');

						console.log(`[CBSL] Extracted rates (spot pattern): Buy=${buyRate}, Sell=${sellRate}`);

						if (this.validateRate(buyRate) && this.validateRate(sellRate) && this.validateSpread(buyRate, sellRate)) {
							const exchangeRateData: ExchangeRateData = {
								bankCode: this.bankCode,
								currencyPair: 'USD/LKR',
								buyingRate: buyRate,
								sellingRate: sellRate,
								telegraphicBuyingRate: buyRate,
								indicativeRate: buyRate,
								timestamp: new Date(),
								isValid: true,
								source: this.config.url
							};

							console.log(`[CBSL] Successfully scraped (spot): Buy=${buyRate}, Sell=${sellRate}`);
							return this.createResult(true, exchangeRateData, undefined, attempts, startTime);
						}
					}

					throw new Error("CBSL Buy/Sell rates not found in page");
				}

			} catch (error) {
				console.log(`[CBSL] Attempt ${attempts} failed:`, error);

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
