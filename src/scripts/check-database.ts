/**
 * Check database contents - banks and exchange rates
 * Run with: npx tsx src/scripts/check-database.ts
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../server/db/schema";

// Load environment variables
config();

// Direct database connection
const conn = postgres(process.env.DATABASE_URL!);
const db = drizzle(conn, { schema });

async function checkDatabase() {
	console.log('🗄️ Checking Keep Rates Database...\n');

	try {
		// Check banks
		console.log('📊 Banks:');
		const banks = await db.query.banks.findMany();
		console.table(banks.map(bank => ({
			ID: bank.id,
			Code: bank.code,
			Name: bank.displayName,
			Type: bank.bankType,
			Active: bank.isActive ? '✅' : '❌',
			Website: bank.websiteUrl ? '🌐' : '➖'
		})));

		// Check exchange rates
		console.log('\n💰 Exchange Rates:');
		const rates = await db.query.exchangeRates.findMany({
			with: {
				bank: true
			},
			orderBy: (rates, { desc }) => [desc(rates.scrapedAt)],
			limit: 10
		});

		if (rates.length === 0) {
			console.log('   📭 No exchange rates found in database');
		} else {
			console.table(rates.map(rate => ({
				Bank: rate.bank.displayName,
				'Currency Pair': rate.currencyPair,
				'Buying Rate': rate.buyingRate || '➖',
				'Selling Rate': rate.sellingRate || '➖',
				'Telegraphic Rate': rate.telegraphicBuyingRate || '➖',
				'Indicative Rate': rate.indicativeRate || '➖',
				'Scraped At': rate.scrapedAt.toISOString(),
				Valid: rate.isValid ? '✅' : '❌'
			})));
		}

		// Check scrape logs
		console.log('\n📋 Recent Scrape Logs:');
		const logs = await db.query.scrapeLogs.findMany({
			with: {
				bank: true
			},
			orderBy: (logs, { desc }) => [desc(logs.scrapedAt)],
			limit: 5
		});

		if (logs.length === 0) {
			console.log('   📭 No scrape logs found in database');
		} else {
			console.table(logs.map(log => ({
				Bank: log.bank.displayName,
				Status: log.status,
				'Rates Found': log.ratesFound,
				'Duration (ms)': log.executionTimeMs,
				'Scraped At': log.scrapedAt.toISOString(),
				Error: log.errorMessage?.substring(0, 50) || '➖'
			})));
		}

		console.log('\n✅ Database check completed!');

	} catch (error) {
		console.error('💥 Database check failed:', error);
	} finally {
		await conn.end();
		process.exit(0);
	}
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	void checkDatabase();
}
