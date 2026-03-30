/**
 * Reset database: drop all tables, run better-auth migrations, create licenses table, seed data.
 *
 * Usage: bun run scripts/db-reset.ts
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

// Use better-auth's own hash function for compatibility
const { hashPassword } = await import("better-auth/crypto")

async function reset() {
  console.log("🗑️  Dropping all tables...")
  await client.unsafe(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
      END LOOP;
    END $$;
  `)
  console.log("✓ Tables dropped")

  console.log("\n📦 Creating better-auth tables...")
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL DEFAULT false,
      "image" TEXT,
      "role" TEXT DEFAULT 'customer',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "expiresAt" TIMESTAMP NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "account" (
      "id" TEXT PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMP,
      "refreshTokenExpiresAt" TIMESTAMP,
      "scope" TEXT,
      "password" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "verification" (
      "id" TEXT PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP,
      "updatedAt" TIMESTAMP
    );
  `)
  console.log("✓ better-auth tables created")

  console.log("\n📦 Creating licenses table...")
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS "licenses" (
      "id" TEXT PRIMARY KEY,
      "user_id" TEXT NOT NULL,
      "tier" TEXT NOT NULL CHECK ("tier" IN ('pro', 'business')),
      "license_key" TEXT NOT NULL UNIQUE,
      "stripe_session_id" TEXT,
      "stripe_customer_id" TEXT,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "expires_at" TIMESTAMP
    );
  `)
  console.log("✓ licenses table created")

  console.log("\n🌱 Seeding data...")

  // Admin user (password: admin123!)
  const adminId = createId()
  const adminPasswordHash = await hashPassword("admin123!")
  await client.unsafe(`
    INSERT INTO "user" ("id", "name", "email", "emailVerified", "role")
    VALUES ($1, $2, $3, true, 'admin')
  `, [adminId, "Admin", "admin@headlesskit.dev"])

  await client.unsafe(`
    INSERT INTO "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
    VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())
  `, [createId(), adminId, adminId, adminPasswordHash])

  // Customer user (password: customer123!)
  const customerId = createId()
  const customerPasswordHash = await hashPassword("customer123!")
  await client.unsafe(`
    INSERT INTO "user" ("id", "name", "email", "emailVerified", "role")
    VALUES ($1, $2, $3, true, 'customer')
  `, [customerId, "Demo Customer", "customer@headlesskit.dev"])

  await client.unsafe(`
    INSERT INTO "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
    VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())
  `, [createId(), customerId, customerId, customerPasswordHash])

  // Pro license for customer
  const proLicenseKey = generateLicenseKey()
  await client.unsafe(`
    INSERT INTO "licenses" ("id", "user_id", "tier", "license_key", "active", "created_at", "expires_at")
    VALUES ($1, $2, 'pro', $3, true, NOW(), NOW() + INTERVAL '1 year')
  `, [createId(), customerId, proLicenseKey])

  // Business user + license
  const businessId = createId()
  const businessPasswordHash = await hashPassword("business123!")
  await client.unsafe(`
    INSERT INTO "user" ("id", "name", "email", "emailVerified", "role")
    VALUES ($1, $2, $3, true, 'customer')
  `, [businessId, "Business User", "business@headlesskit.dev"])

  await client.unsafe(`
    INSERT INTO "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
    VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())
  `, [createId(), businessId, businessId, businessPasswordHash])

  const businessLicenseKey = generateLicenseKey()
  await client.unsafe(`
    INSERT INTO "licenses" ("id", "user_id", "tier", "license_key", "active", "created_at")
    VALUES ($1, $2, 'business', $3, true, NOW())
  `, [createId(), businessId, businessLicenseKey])

  console.log("✓ Seeded 3 users:")
  console.log("  → admin@headlesskit.dev / admin123! (role: admin)")
  console.log("  → customer@headlesskit.dev / customer123! (role: customer, Pro license)")
  console.log("  → business@headlesskit.dev / business123! (role: customer, Business license)")
  console.log(`\n  Pro license key: ${proLicenseKey}`)
  console.log(`  Business license key: ${businessLicenseKey}`)

  await client.end()
  console.log("\n✅ Database reset complete!")
}

reset().catch((err) => {
  console.error("❌ Reset failed:", err)
  process.exit(1)
})
