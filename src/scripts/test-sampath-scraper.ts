import { config } from 'dotenv';
config(); // Load environment variables

import { SampathBankScraper } from '../services/scrapers/sampath-bank';

async function testSampathScraper(): Promise<void> {
	console.log('🏦 Testing Sampath Bank Scraper Directly...\n');

	const scraper = new SampathBankScraper();

	console.log('⏳ Starting scraping process...');
	const startTime = Date.now();
	
	try {
		const result = await scraper.scrape();
		const duration = Date.now() - startTime;
		
		console.log('\n📊 Scraping Result:');
		console.log(`Success: ${result.success}`);
		console.log(`Duration: ${duration}ms`);
		console.log(`Attempts: ${result.attempts}`);
		
		if (result.success && result.data) {
			console.log('\n💰 Extracted Exchange Rates:');
			console.log(`Bank Code: ${result.data.bankCode}`);
			console.log(`Currency Pair: ${result.data.currencyPair}`);
			console.log(`Currency Buying Rate: ${result.data.buyingRate}`);
			console.log(`Currency Selling Rate: ${result.data.sellingRate}`);
			console.log(`Telegraphic Buying Rate: ${result.data.telegraphicBuyingRate}`);
			console.log(`Indicative Rate: ${result.data.indicativeRate}`);
			console.log(`Timestamp: ${result.data.timestamp}`);
			console.log(`Valid: ${result.data.isValid}`);
			console.log(`Source: ${result.data.source}`);
		} else {
			console.log('\n❌ Scraping Failed:');
			console.log(`Error: ${result.error}`);
		}
		
	} catch (error) {
		console.error('\n💥 Test failed:', error);
	}
}

// Run the test
testSampathScraper().catch(console.error);
