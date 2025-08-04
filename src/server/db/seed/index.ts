#!/usr/bin/env tsx

import { seedBanks } from "./banks";

async function main() {
  console.log("🌱 Starting database seeding...");
  
  try {
    await seedBanks();
    
    console.log("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
