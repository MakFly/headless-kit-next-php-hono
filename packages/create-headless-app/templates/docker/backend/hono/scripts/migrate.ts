import { existsSync, readdirSync } from 'node:fs';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

const folder = './drizzle';
if (!existsSync(folder) || readdirSync(folder).filter((f) => f.endsWith('.sql')).length === 0) {
  console.log('No migrations to apply (run `bun run db:generate` first).');
  process.exit(0);
}

const databaseUrl = process.env.DATABASE_URL || './data.db';
const sqlite = new Database(databaseUrl);
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: folder });

sqlite.close();
console.log('Migrations applied.');
