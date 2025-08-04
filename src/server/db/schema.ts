import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `keep-rates-2_${name}`);

export const posts = createTable(
	"post",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }),
		createdById: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("created_by_idx").on(t.createdById),
		index("name_idx").on(t.name),
	],
);

export const users = createTable("user", (d) => ({
	id: d
		.varchar({ length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.varchar({ length: 255 }),
	email: d.varchar({ length: 255 }).notNull(),
	emailVerified: d
		.timestamp({
			mode: "date",
			withTimezone: true,
		})
		.default(sql`CURRENT_TIMESTAMP`),
	image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
}));

export const accounts = createTable(
	"account",
	(d) => ({
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
		provider: d.varchar({ length: 255 }).notNull(),
		providerAccountId: d.varchar({ length: 255 }).notNull(),
		refresh_token: d.text(),
		access_token: d.text(),
		expires_at: d.integer(),
		token_type: d.varchar({ length: 255 }),
		scope: d.varchar({ length: 255 }),
		id_token: d.text(),
		session_state: d.varchar({ length: 255 }),
	}),
	(t) => [
		primaryKey({ columns: [t.provider, t.providerAccountId] }),
		index("account_user_id_idx").on(t.userId),
	],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
	"session",
	(d) => ({
		sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
	"verification_token",
	(d) => ({
		identifier: d.varchar({ length: 255 }).notNull(),
		token: d.varchar({ length: 255 }).notNull(),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// =============================================================================
// Keep Rates Application Tables
// =============================================================================

export const banks = createTable(
	"bank",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 255 }).notNull(), // e.g., "Commercial Bank of Ceylon"
		code: d.varchar({ length: 10 }).notNull().unique(), // e.g., "combank", "ndb", "sampath", "cbsl"
		displayName: d.varchar({ length: 255 }).notNull(), // e.g., "Commercial Bank"
		websiteUrl: d.text(), // URL to the bank's exchange rates page
		scrapeConfig: d.json().$type<{
			selectors?: Record<string, string>;
			waitForSelectors?: string[];
			customLogic?: string;
		}>(), // JSON configuration for scraping
		isActive: d.boolean().default(true).notNull(),
		bankType: d.varchar({ length: 20 }).default("commercial").notNull(), // "commercial", "central"
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("bank_code_idx").on(t.code),
		index("bank_active_idx").on(t.isActive),
	],
);

export const exchangeRates = createTable(
	"exchange_rate",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		bankId: d
			.integer()
			.notNull()
			.references(() => banks.id),
		buyingRate: d.numeric({ precision: 10, scale: 4 }), // Currency buying rate
		sellingRate: d.numeric({ precision: 10, scale: 4 }), // Currency selling rate
		telegraphicBuyingRate: d.numeric({ precision: 10, scale: 4 }), // Telegraphic transfer buying rate
		indicativeRate: d.numeric({ precision: 10, scale: 4 }), // For CBSL and reference purposes
		currencyPair: d.varchar({ length: 10 }).default("USD/LKR").notNull(),
		scrapedAt: d.timestamp({ withTimezone: true }).notNull(), // When the rate was scraped
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		isValid: d.boolean().default(true).notNull(), // Data validation flag
	}),
	(t) => [
		index("exchange_rate_bank_scraped_idx").on(t.bankId, t.scrapedAt.desc()),
		index("exchange_rate_scraped_at_idx").on(t.scrapedAt.desc()),
		index("exchange_rate_currency_idx").on(t.currencyPair),
		index("exchange_rate_valid_idx").on(t.isValid),
	],
);

export const userSubscriptions = createTable(
	"user_subscription",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		subscriptionType: d.varchar({ length: 50 }).notNull(), // "daily_digest", "rate_alerts"
		isActive: d.boolean().default(true).notNull(),
		preferences: d.json().$type<{
			emailFrequency?: "daily" | "weekly";
			rateThreshold?: number;
			banks?: string[]; // Array of bank codes
			alertOnlyWorkdays?: boolean;
		}>(), // User preferences for notifications
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("user_subscription_user_idx").on(t.userId),
		index("user_subscription_type_idx").on(t.subscriptionType),
		index("user_subscription_active_idx").on(t.isActive),
	],
);

export const scrapeLogs = createTable(
	"scrape_log",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		bankId: d
			.integer()
			.notNull()
			.references(() => banks.id),
		status: d.varchar({ length: 20 }).notNull(), // "success", "failed", "partial"
		ratesFound: d.integer().default(0).notNull(), // Number of rates successfully scraped
		errorMessage: d.text(), // Error details if failed
		executionTimeMs: d.integer(), // How long the scraping took
		scrapedAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		jobId: d.varchar({ length: 255 }), // Optional job ID for tracking
	}),
	(t) => [
		index("scrape_log_bank_status_idx").on(t.bankId, t.status, t.scrapedAt.desc()),
		index("scrape_log_scraped_at_idx").on(t.scrapedAt.desc()),
		index("scrape_log_job_idx").on(t.jobId),
	],
);

export const emailLogs = createTable(
	"email_log",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		emailType: d.varchar({ length: 50 }).notNull(), // "daily_digest", "rate_alert", "welcome"
		subject: d.varchar({ length: 255 }),
		sentAt: d.timestamp({ withTimezone: true }),
		status: d.varchar({ length: 20 }).notNull(), // "sent", "failed", "bounced"
		errorMessage: d.text(), // Error details if failed
		emailProvider: d.varchar({ length: 50 }).default("resend"), // Track which service was used
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		index("email_log_user_idx").on(t.userId),
		index("email_log_type_idx").on(t.emailType),
		index("email_log_status_idx").on(t.status),
		index("email_log_sent_at_idx").on(t.sentAt.desc()),
	],
);

// =============================================================================
// Relations
// =============================================================================

export const banksRelations = relations(banks, ({ many }) => ({
	exchangeRates: many(exchangeRates),
	scrapeLogs: many(scrapeLogs),
}));

export const exchangeRatesRelations = relations(exchangeRates, ({ one }) => ({
	bank: one(banks, {
		fields: [exchangeRates.bankId],
		references: [banks.id],
	}),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
	user: one(users, {
		fields: [userSubscriptions.userId],
		references: [users.id],
	}),
}));

export const scrapeLogsRelations = relations(scrapeLogs, ({ one }) => ({
	bank: one(banks, {
		fields: [scrapeLogs.bankId],
		references: [banks.id],
	}),
}));

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
	user: one(users, {
		fields: [emailLogs.userId],
		references: [users.id],
	}),
}));

// Update users relations to include new relationships
export const enhancedUsersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	subscriptions: many(userSubscriptions),
	emailLogs: many(emailLogs),
}));
