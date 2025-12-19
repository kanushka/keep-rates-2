import { z } from "zod";
import { desc, eq, and, gte } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { exchangeRates, banks } from "~/server/db/schema";

export const exchangeRatesRouter = createTRPCRouter({
	// Get latest rates for a specific bank
	getLatestByBank: publicProcedure
		.input(z.object({
			bankCode: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			// First get the bank ID from the bank code
			const bank = await ctx.db
				.select({ id: banks.id })
				.from(banks)
				.where(eq(banks.code, input.bankCode))
				.limit(1);

			if (!bank[0]) {
				return null;
			}

			const latestRate = await ctx.db
				.select()
				.from(exchangeRates)
				.where(eq(exchangeRates.bankId, bank[0].id))
				.orderBy(desc(exchangeRates.scrapedAt))
				.limit(1);

			return latestRate[0] || null;
		}),

	// Get historical rates for a specific bank (last 7 days by default)
	getHistoryByBank: publicProcedure
		.input(z.object({
			bankCode: z.string(),
			days: z.number().min(1).max(90).default(7),
		}))
		.query(async ({ ctx, input }) => {
			// First get the bank ID from the bank code
			const bank = await ctx.db
				.select({ id: banks.id })
				.from(banks)
				.where(eq(banks.code, input.bankCode))
				.limit(1);

			if (!bank[0]) {
				return [];
			}

			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - input.days);

			const rates = await ctx.db
				.select({
					id: exchangeRates.id,
					bankId: exchangeRates.bankId,
					currencyPair: exchangeRates.currencyPair,
					buyingRate: exchangeRates.buyingRate,
					sellingRate: exchangeRates.sellingRate,
					telegraphicBuyingRate: exchangeRates.telegraphicBuyingRate,
					indicativeRate: exchangeRates.indicativeRate,
					scrapedAt: exchangeRates.scrapedAt,
					isValid: exchangeRates.isValid,
				})
				.from(exchangeRates)
				.where(
					and(
						eq(exchangeRates.bankId, bank[0].id),
						gte(exchangeRates.scrapedAt, cutoffDate),
						eq(exchangeRates.isValid, true)
					)
				)
				.orderBy(desc(exchangeRates.scrapedAt));

			return rates;
		}),

	// Get today's high/low rates for a specific bank
	getTodayStats: publicProcedure
		.input(z.object({
			bankCode: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			// First get the bank ID from the bank code
			const bank = await ctx.db
				.select({ id: banks.id })
				.from(banks)
				.where(eq(banks.code, input.bankCode))
				.limit(1);

			if (!bank[0]) {
				return {
					high: null,
					low: null,
					change: null,
					lastUpdated: null,
				};
			}

			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const todayRates = await ctx.db
				.select({
					buyingRate: exchangeRates.buyingRate,
					sellingRate: exchangeRates.sellingRate,
					telegraphicBuyingRate: exchangeRates.telegraphicBuyingRate,
					scrapedAt: exchangeRates.scrapedAt,
				})
				.from(exchangeRates)
				.where(
					and(
						eq(exchangeRates.bankId, bank[0].id),
						gte(exchangeRates.scrapedAt, today),
						eq(exchangeRates.isValid, true)
					)
				)
				.orderBy(desc(exchangeRates.scrapedAt));

			if (todayRates.length === 0) {
				return {
					high: null,
					low: null,
					change: null,
					lastUpdated: null,
				};
			}

			// Calculate high/low from buying rates (most relevant for users)
			const buyingRates = todayRates
				.map(rate => rate.buyingRate)
				.filter(rate => rate !== null)
				.map(rate => parseFloat(rate as string));

			if (buyingRates.length === 0) {
				return {
					high: null,
					low: null,
					change: null,
					lastUpdated: todayRates[0]?.scrapedAt,
				};
			}

			const high = Math.max(...buyingRates);
			const low = Math.min(...buyingRates);
			const change = buyingRates.length > 1
				? (buyingRates[0] || 0) - (buyingRates[buyingRates.length - 1] || 0)
				: 0;

			return {
				high,
				low,
				change,
				lastUpdated: todayRates[0]?.scrapedAt,
			};
		}),

	// Get historical rates for all commercial banks for comparison
	getAllBanksHistory: publicProcedure
		.input(z.object({
			days: z.number().min(1).max(90).default(7),
		}))
		.query(async ({ ctx, input }) => {
			// Get all commercial banks
			const commercialBanks = await ctx.db
				.select({ id: banks.id, code: banks.code, name: banks.name })
				.from(banks)
				.where(eq(banks.bankType, "commercial"))
				.orderBy(banks.name);

			if (commercialBanks.length === 0) {
				return [];
			}

			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - input.days);

			// Get rates for all commercial banks
			const rates = await ctx.db
				.select({
					id: exchangeRates.id,
					bankId: exchangeRates.bankId,
					currencyPair: exchangeRates.currencyPair,
					buyingRate: exchangeRates.buyingRate,
					sellingRate: exchangeRates.sellingRate,
					telegraphicBuyingRate: exchangeRates.telegraphicBuyingRate,
					scrapedAt: exchangeRates.scrapedAt,
					isValid: exchangeRates.isValid,
				})
				.from(exchangeRates)
				.where(
					and(
						gte(exchangeRates.scrapedAt, cutoffDate),
						eq(exchangeRates.isValid, true)
					)
				)
				.orderBy(desc(exchangeRates.scrapedAt));

			// Group rates by bank and attach bank info
			return commercialBanks.map(bank => ({
				bankId: bank.id,
				bankCode: bank.code,
				bankName: bank.name,
				rates: rates.filter(rate => rate.bankId === bank.id),
			}));
		}),
}); 
