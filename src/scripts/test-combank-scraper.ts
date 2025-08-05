/**
 * Direct test of Commercial Bank scraper to see extracted values
 * Run with: npx tsx src/scripts/test-combank-scraper.ts
 */

import { CommercialBankScraper } from '../services/scrapers/commercial-bank';

async function testComBankScraper() {
	console.log('🏦 Testing Commercial Bank Scraper Directly...\n');

	try {
		const scraper = new CommercialBankScraper();
		console.log('⏳ Starting scraping process...');
		
		const result = await scraper.scrape();
		
		console.log('\n📊 Scraping Result:');
		console.log('Success:', result.success);
		console.log('Duration:', `${result.duration}ms`);
		console.log('Attempts:', result.attempts);
		
		if (result.success && result.data) {
			console.log('\n💰 Extracted Exchange Rates:');
			console.log('Bank Code:', result.data.bankCode);
			console.log('Currency Pair:', result.data.currencyPair);
			console.log('Currency Buying Rate:', result.data.buyingRate);
			console.log('Currency Selling Rate:', result.data.sellingRate);
			console.log('Telegraphic Buying Rate:', result.data.telegraphicBuyingRate);
			console.log('Indicative Rate:', result.data.indicativeRate);
			console.log('Timestamp:', result.data.timestamp.toISOString());
			console.log('Valid:', result.data.isValid);
			console.log('Source:', result.data.source);
		} else {
			console.log('\n❌ Scraping Failed:');
			console.log('Error:', result.error);
		}

	} catch (error) {
		console.error('\n💥 Scraper test failed:', error);
	}
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	testComBankScraper().catch(console.error);
}
