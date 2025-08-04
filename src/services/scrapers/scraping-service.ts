import { CommercialBankScraper } from './commercial-bank';
import { NDBBankScraper } from './ndb-bank';
import { SampathBankScraper } from './sampath-bank';
import { CBSLScraper } from './cbsl';
import type { ScrapingResult, ExchangeRateData } from './types';
import { db } from '~/server/db';
import { exchangeRates, scrapeLogs } from '~/server/db/schema';

export interface ScrapingJobResult {
	bankCode: string;
	success: boolean;
	data?: ExchangeRateData;
	error?: string;
	duration: number;
	attempts: number;
}

export interface ScrapingBatchResult {
	timestamp: Date;
	totalBanks: number;
	successfulBanks: number;
	failedBanks: number;
	results: ScrapingJobResult[];
	totalDuration: number;
}

export class ScrapingService {
	private scrapers: Map<string, any> = new Map();

	constructor() {
		// Initialize all bank scrapers
		this.scrapers.set('combank', new CommercialBankScraper());
		this.scrapers.set('ndb', new NDBBankScraper());
		this.scrapers.set('sampath', new SampathBankScraper());
		
		// TODO: CBSL scraper - requires advanced anti-bot bypass techniques
		// The CBSL website has sophisticated anti-scraping protection
		// this.scrapers.set('cbsl', new CBSLScraper());
	}

	/**
	 * Scrape all banks and save results to database
	 */
	async scrapeAllBanks(): Promise<ScrapingBatchResult> {
		const startTime = Date.now();
		const timestamp = new Date();
		const results: ScrapingJobResult[] = [];

		console.log(`🕷️ Starting scraping batch for ${this.scrapers.size} banks...`);

		// Run all scrapers in parallel
		const scrapingPromises = Array.from(this.scrapers.entries()).map(
			async ([bankCode, scraper]) => {
				try {
					console.log(`🏦 Starting scraping for ${bankCode}...`);
					const result = await scraper.scrape();
					
					const jobResult: ScrapingJobResult = {
						bankCode,
						success: result.success,
						data: result.data,
						error: result.error,
						duration: result.duration,
						attempts: result.attempts
					};

					// Save result to database if successful
					if (result.success && result.data) {
						await this.saveExchangeRate(result.data);
						console.log(`✅ Successfully scraped and saved ${bankCode}: ${result.data.buyingRate}/${result.data.sellingRate}`);
					} else {
						console.error(`❌ Failed to scrape ${bankCode}: ${result.error}`);
					}

					return jobResult;
				} catch (error) {
					console.error(`💥 Scraper error for ${bankCode}:`, error);
					return {
						bankCode,
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
						duration: 0,
						attempts: 1
					};
				}
			}
		);

		// Wait for all scrapers to complete
		const scrapingResults = await Promise.allSettled(scrapingPromises);
		
		// Process results
		for (const promiseResult of scrapingResults) {
			if (promiseResult.status === 'fulfilled') {
				results.push(promiseResult.value);
			} else {
				console.error('Scraping promise rejected:', promiseResult.reason);
				results.push({
					bankCode: 'unknown',
					success: false,
					error: 'Promise rejected',
					duration: 0,
					attempts: 1
				});
			}
		}

		const totalDuration = Date.now() - startTime;
		const successfulBanks = results.filter(r => r.success).length;
		const failedBanks = results.length - successfulBanks;

		const batchResult: ScrapingBatchResult = {
			timestamp,
			totalBanks: results.length,
			successfulBanks,
			failedBanks,
			results,
			totalDuration
		};

		// Log batch summary to database
		await this.logScrapingBatch(batchResult);

		console.log(`🎯 Scraping batch completed: ${successfulBanks}/${results.length} banks successful in ${totalDuration}ms`);
		
		return batchResult;
	}

	/**
	 * Scrape a specific bank
	 */
	async scrapeBank(bankCode: string): Promise<ScrapingJobResult> {
		const scraper = this.scrapers.get(bankCode);
		if (!scraper) {
			return {
				bankCode,
				success: false,
				error: `No scraper found for bank: ${bankCode}`,
				duration: 0,
				attempts: 0
			};
		}

		try {
			console.log(`🏦 Starting scraping for ${bankCode}...`);
			const result = await scraper.scrape();
			
			const jobResult: ScrapingJobResult = {
				bankCode,
				success: result.success,
				data: result.data,
				error: result.error,
				duration: result.duration,
				attempts: result.attempts
			};

			// Save result to database if successful
			if (result.success && result.data) {
				await this.saveExchangeRate(result.data);
				console.log(`✅ Successfully scraped and saved ${bankCode}`);
			}

			return jobResult;
		} catch (error) {
			console.error(`💥 Scraper error for ${bankCode}:`, error);
			return {
				bankCode,
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				duration: 0,
				attempts: 1
			};
		}
	}

	/**
	 * Save exchange rate data to database
	 */
	private async saveExchangeRate(data: ExchangeRateData): Promise<void> {
		try {
			await db.insert(exchangeRates).values({
				bankId: this.getBankIdFromCode(data.bankCode),
				currencyPair: data.currencyPair,
				buyingRate: data.buyingRate ? data.buyingRate.toString() : null,
				sellingRate: data.sellingRate ? data.sellingRate.toString() : null,
				telegraphicBuyingRate: data.telegraphicBuyingRate ? data.telegraphicBuyingRate.toString() : null,
				indicativeRate: data.indicativeRate ? data.indicativeRate.toString() : null,
				scrapedAt: data.timestamp,
				isValid: data.isValid
			});
		} catch (error) {
			console.error('Failed to save exchange rate:', error);
			throw error;
		}
	}

	/**
	 * Log scraping batch results to database
	 */
	private async logScrapingBatch(batchResult: ScrapingBatchResult): Promise<void> {
		try {
			// Log a summary entry for the batch (using bankId = 1 as placeholder for batch operations)
			await db.insert(scrapeLogs).values({
				bankId: 1, // Placeholder for batch operations
				status: batchResult.failedBanks === 0 ? 'success' : 'partial',
				ratesFound: batchResult.successfulBanks,
				errorMessage: batchResult.failedBanks > 0 ? 
					`${batchResult.failedBanks} banks failed` : null,
				executionTimeMs: batchResult.totalDuration,
				scrapedAt: batchResult.timestamp,
				jobId: `batch_${Date.now()}`
			});
		} catch (error) {
			console.error('Failed to log scraping batch:', error);
			// Don't throw - logging failure shouldn't break the scraping
		}
	}

	/**
	 * Get bank ID from bank code (temporary mapping)
	 * TODO: Replace with actual database lookup
	 */
	private getBankIdFromCode(bankCode: string): number {
		const bankMap: Record<string, number> = {
			'combank': 1,
			'ndb': 2,
			'sampath': 3,
			'cbsl': 4
		};
		
		return bankMap[bankCode] || 1;
	}

	/**
	 * Get list of available bank codes
	 */
	getAvailableBanks(): string[] {
		return Array.from(this.scrapers.keys());
	}

	/**
	 * Check if a bank scraper is available
	 */
	hasScraper(bankCode: string): boolean {
		return this.scrapers.has(bankCode);
	}
}

// Export singleton instance
let scrapingService: ScrapingService | null = null;

export function getScrapingService(): ScrapingService {
	if (!scrapingService) {
		scrapingService = new ScrapingService();
	}
	return scrapingService;
}
