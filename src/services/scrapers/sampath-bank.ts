import { ExchangeRateScraper, type ScrapingResult, type ExchangeRateData } from './types';

export class SampathBankScraper extends ExchangeRateScraper {
	constructor() {
		super('sampath', {
			url: 'https://www.sampath.lk/api/exchange-rates',
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
						'Accept': 'application/json, text/plain, */*',
						'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
						'Referer': 'https://www.sampath.lk/rates-and-charges?activeTab=exchange-rates'
					},
					signal: AbortSignal.timeout(this.config.timeout || 15000)
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();

				console.log(`[Sampath] API Response success:`, data.success);

				// Check if API response is successful
				if (!data.success || !data.data || !Array.isArray(data.data)) {
					throw new Error(`Invalid API response structure`);
				}

				// Find USD exchange rate in the response
				// API structure: { success: true, data: [...] }
				const usdRate = data.data.find((rate: any) => rate.CurrCode === 'USD');

				if (!usdRate) {
					throw new Error(`USD rate not found in API response`);
				}

				// Extract rates from API response
				// API fields: TTBUY (T/T Buying), TTSEL (T/T Selling), ODBUY (O/D Buying)
				const ttBuying = parseFloat(usdRate.TTBUY || '0');
				const ttSelling = parseFloat(usdRate.TTSEL || '0');
				const odBuying = parseFloat(usdRate.ODBUY || '0');

				console.log(`[Sampath] Extracted rates: T/T Buy=${ttBuying}, O/D Buy=${odBuying}, T/T Sell=${ttSelling}`);

				// Validate rates
				if (!this.validateRate(ttBuying) || !this.validateRate(ttSelling)) {
					throw new Error(`Invalid rate values: ttBuying=${ttBuying}, ttSelling=${ttSelling}`);
				}

				if (!this.validateSpread(ttBuying, ttSelling)) {
					throw new Error(`Invalid spread: ttBuying=${ttBuying}, ttSelling=${ttSelling}`);
				}

				const exchangeRateData: ExchangeRateData = {
					bankCode: this.bankCode,
					currencyPair: 'USD/LKR',
					buyingRate: odBuying,
					sellingRate: ttSelling,
					telegraphicBuyingRate: ttBuying, // T/T rates are telegraphic rates
					timestamp: new Date(),
					isValid: true,
					source: this.config.url
				};

				console.log(`[Sampath] Successfully scraped: T/T Buy=${ttBuying}, T/T Sell=${ttSelling}`);

				return this.createResult(true, exchangeRateData, undefined, attempts, startTime);

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
