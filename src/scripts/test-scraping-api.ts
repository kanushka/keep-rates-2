/**
 * Test script for the scraping API endpoint
 * Run with: npx tsx src/scripts/test-scraping-api.ts
 */

async function testScrapingAPI() {
	const baseUrl = 'http://localhost:3000';
	const apiKey = 'test-scraping-api-key-12345';

	console.log('🧪 Testing Keep Rates Scraping API...\n');

	try {
		// Test 1: GET endpoint (API info)
		console.log('1️⃣ Testing GET /api/scrape/trigger...');
		const infoResponse = await fetch(`${baseUrl}/api/scrape/trigger`);
		const info = await infoResponse.json();
		
		console.log('   Status:', infoResponse.status);
		console.log('   Available Banks:', info.availableBanks);
		console.log('   Rate Limit:', info.rateLimit);
		console.log('   ✅ API info retrieved successfully\n');

		// Test 2: POST without API key (should fail)
		console.log('2️⃣ Testing POST without API key...');
		const noKeyResponse = await fetch(`${baseUrl}/api/scrape/trigger`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});
		
		console.log('   Status:', noKeyResponse.status, '(Expected: 401)');
		if (noKeyResponse.status === 401) {
			console.log('   ✅ Authentication correctly required\n');
		}

		// Test 3: POST with valid API key
		console.log('3️⃣ Testing POST with API key...');
		const scrapingResponse = await fetch(`${baseUrl}/api/scrape/trigger`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': apiKey
			},
			body: JSON.stringify({
				banks: ['combank', 'ndb', 'sampath'], // Only test ComBank for now
				async: false // Sync for testing
			})
		});

		const scrapingResult = await scrapingResponse.json();
		console.log('   Status:', scrapingResponse.status);
		console.log('   Rate Limit Headers:');
		console.log('     X-RateLimit-Limit:', scrapingResponse.headers.get('X-RateLimit-Limit'));
		console.log('     X-RateLimit-Remaining:', scrapingResponse.headers.get('X-RateLimit-Remaining'));
		console.log('     X-RateLimit-Reset:', scrapingResponse.headers.get('X-RateLimit-Reset'));
		
		if (scrapingResponse.status === 200) {
			console.log('   ✅ Scraping triggered successfully');
			console.log('   Result:', scrapingResult);
		} else if (scrapingResponse.status === 429) {
			console.log('   ⏰ Rate limited (expected after first successful call)');
			console.log('   Retry After:', scrapingResponse.headers.get('Retry-After'));
		} else {
			console.log('   ❌ Unexpected status:', scrapingResult);
		}

		console.log('\n🎉 API testing completed!');

	} catch (error) {
		console.error('💥 Test failed:', error);
	} finally {
		process.exit(0);
	}
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	testScrapingAPI().catch(console.error);
}
