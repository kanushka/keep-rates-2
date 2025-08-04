import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { banks } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const banksRouter = createTRPCRouter({
	// Get all active banks
	getAll: publicProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.banks.findMany({
			where: eq(banks.isActive, true),
			orderBy: (banks, { asc }) => [asc(banks.name)],
		});
	}),

	// Get bank by ID
	getById: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			return await ctx.db.query.banks.findFirst({
				where: eq(banks.id, input.id),
			});
		}),

	// Get bank by code
	getByCode: publicProcedure
		.input(z.object({ code: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.db.query.banks.findFirst({
				where: eq(banks.code, input.code),
			});
		}),

	// Get commercial banks only (excludes central bank)
	getCommercialBanks: publicProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.banks.findMany({
			where: eq(banks.bankType, "commercial"),
			orderBy: (banks, { asc }) => [asc(banks.name)],
		});
	}),

	// Get central bank
	getCentralBank: publicProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.banks.findFirst({
			where: eq(banks.bankType, "central"),
		});
	}),
});
