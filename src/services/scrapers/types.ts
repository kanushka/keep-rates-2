export interface ExchangeRateData {
	bankCode: string;
	currencyPair: 'USD/LKR';
	buyingRate?: number; // Currency buying rate
	sellingRate?: number; // Currency selling rate
	telegraphicBuyingRate?: number; // Telegraphic transfer buying rate
	indicativeRate?: number;
	timestamp: Date;
	isValid: boolean;
	source: string; // URL where the data was scraped from
}

export interface ScrapingConfig {
	url: string;
	selectors: {
		rateTable?: string;
		buyingRate?: string;
		sellingRate?: string;
		indicativeRate?: string;
		currency?: string;
		// Fallback selectors for different page layouts
		fallbackSelectors?: {
			[key: string]: string;
		};
	};
	waitForSelector?: string;
	timeout?: number;
	retryAttempts?: number;
}

export interface ScrapingResult {
	success: boolean;
	data?: ExchangeRateData;
	error?: string;
	attempts: number;
	duration: number; // milliseconds
}

export abstract class ExchangeRateScraper {
	protected bankCode: string;
	protected config: ScrapingConfig;

	constructor(bankCode: string, config: ScrapingConfig) {
		this.bankCode = bankCode;
		this.config = config;
	}

	abstract scrape(): Promise<ScrapingResult>;

	protected validateRate(rate: number | undefined): boolean {
		if (!rate || isNaN(rate)) return false;
		// USD/LKR should be between 100-500 (reasonable range)
		return rate >= 100 && rate <= 500;
	}

	protected validateSpread(buyingRate?: number, sellingRate?: number): boolean {
		if (!buyingRate || !sellingRate) return true; // Skip validation if rates missing
		const spread = Math.abs(sellingRate - buyingRate);
		// Spread should be reasonable (0.1 to 20 LKR)
		return spread >= 0.1 && spread <= 20;
	}

	protected createResult(
		success: boolean,
		data?: ExchangeRateData,
		error?: string,
		attempts: number = 1,
		startTime: number = Date.now()
	): ScrapingResult {
		return {
			success,
			data,
			error,
			attempts,
			duration: Date.now() - startTime
		};
	}
}
