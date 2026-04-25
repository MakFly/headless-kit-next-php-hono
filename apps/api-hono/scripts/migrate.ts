import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

const databaseUrl = process.env.DATABASE_URL || './data.db';
const sqlite = new Database(databaseUrl);
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: './drizzle' });

sqlite.close();
console.log('Migrations applied.');
