/**
 * Generate and run Drizzle migrations for the licenses table.
 * better-auth tables are managed by db-reset.ts (raw SQL).
 *
 * Usage: bun run scripts/db-migrate.ts
 */

import { execSync } from "child_process"
import path from "path"

const root = path.resolve(import.meta.dir, "..")

console.log("📦 Generating Drizzle migrations...")
execSync("bunx drizzle-kit generate", { cwd: root, stdio: "inherit" })

console.log("\n🚀 Pushing schema to database...")
execSync("bunx drizzle-kit push", { cwd: root, stdio: "inherit" })

console.log("\n✅ Migration complete!")
