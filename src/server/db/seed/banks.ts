import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { banks } from "../schema";

// Load environment variables
config();

// Log STORAGE_DATABASE_URL to debug
console.log("📊 STORAGE_DATABASE_URL:", process.env.STORAGE_DATABASE_URL ? "✅ Found" : "❌ Missing");

// Direct database connection for seeding (bypassing env validation)
const conn = postgres(process.env.STORAGE_DATABASE_URL!);
const db = drizzle(conn, { schema: { banks } });

export const bankSeedData = [
  {
    name: "Commercial Bank of Ceylon",
    code: "combank",
    displayName: "Commercial Bank", 
    websiteUrl: "https://www.combank.lk/rates-tariff#exchange-rates",
    bankType: "commercial" as const,
    isActive: true,
    scrapeConfig: {
      selectors: {
        usdRow: "TBD",
        buyingRate: "TBD", 
        sellingRate: "TBD"
      },
      waitForSelectors: ["exchange-rates-table", ".rates-section"],
      customLogic: "navigate_to_anchor"
    }
  },
  {
    name: "National Development Bank",
    code: "ndb", 
    displayName: "NDB Bank",
    websiteUrl: "https://www.ndbbank.com/rates/exchange-rates",
    bankType: "commercial" as const,
    isActive: true,
    scrapeConfig: {
      selectors: {
        usdRow: "TBD",
        buyingRate: "TBD",
        sellingRate: "TBD"
      },
      waitForSelectors: [".exchange-rates", ".rates-table"],
      customLogic: "standard_table"
    }
  },
  {
    name: "Sampath Bank",
    code: "sampath",
    displayName: "Sampath Bank", 
    websiteUrl: "https://www.sampath.lk/rates-and-charges?activeTab=exchange-rates",
    bankType: "commercial" as const,
    isActive: true,
    scrapeConfig: {
      selectors: {
        tabButton: "TBD",
        usdRow: "TBD",
        buyingRate: "TBD", 
        sellingRate: "TBD"
      },
      waitForSelectors: [".tab-content", ".exchange-rates-tab"],
      customLogic: "click_tab_first"
    }
  },
  {
    name: "Central Bank of Sri Lanka",
    code: "cbsl",
    displayName: "Central Bank", 
    websiteUrl: "https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates/usd-lkr-Indicative-rate-chart",
    bankType: "central" as const,
    isActive: true,
    scrapeConfig: {
      selectors: {
        indicativeRate: "TBD",
        rateValue: "TBD",
        dateElement: "TBD"
      },
      waitForSelectors: [".rate-chart", ".indicative-rate"],
      customLogic: "extract_chart_data"
    }
  }
];

export async function seedBanks() {
  console.log("🏦 Seeding banks...");
  
  try {
    // Check if banks already exist
    const existingBanks = await db.select().from(banks);
    
    if (existingBanks.length > 0) {
      console.log(`📊 Found ${existingBanks.length} existing banks, skipping seed`);
      return existingBanks;
    }
    
    // Insert seed data with proper typing
    const insertedBanks = await db.insert(banks).values(bankSeedData as any).returning();
    
    console.log(`✅ Successfully seeded ${insertedBanks.length} banks:`);
    insertedBanks.forEach(bank => {
      console.log(`   - ${bank.displayName} (${bank.code})`);
    });
    
    return insertedBanks;
  } catch (error) {
    console.error("❌ Error seeding banks:", error);
    throw error;
  }
}
