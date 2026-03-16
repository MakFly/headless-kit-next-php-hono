/**
 * Database connection using Bun's native SQLite driver
 */

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema.ts';

const databaseUrl = process.env.DATABASE_URL || './data.db';

const sqlite = new Database(databaseUrl);

// Enable foreign keys
sqlite.exec('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqlite, { schema });

export { schema };

export type DbClient = typeof db;
