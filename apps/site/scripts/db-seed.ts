/**
 * Seed database with demo data (without dropping tables).
 * Use db-reset.ts for a full reset.
 *
 * Usage: bun run scripts/db-seed.ts
 */

import postgres from "postgres"
import { randomBytes } from "crypto"

const DATABASE_URL = process.env.DATABASE_URL || "postgres://headless:headless@localhost:5432/headless_site"
const client = postgres(DATABASE_URL)

function generateLicenseKey(): string {
  const segments = Array.from({ length: 4 }, () =>
    randomBytes(4).toString("hex").toUpperCase()
  )
  return `HK-${segments.join("-")}`
}

function createId(): string {
  return randomBytes(12).toString("hex")
}

async function seed() {
  console.log("🌱 Checking if data already exists...")

  const existing = await client.unsafe(`SELECT COUNT(*) as count FROM "user"`)
  if (Number(existing[0].count) > 0) {
    console.log(`  Found ${existing[0].count} users. Skipping seed (use db-reset for fresh start).`)
    await client.end()
    return
  }

  console.log("  No users found. Seeding...")

  // We delegate to db-reset for the actual seeding logic
  console.log("  Run 'bun run scripts/db-reset.ts' for a full reset with seed data.")

  await client.end()
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
