/**
 * One-off script: add totp_secrets table to the dev SQLite DB.
 * Run with: bun scripts/add-totp-table.ts
 */

import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(import.meta.dir, '..', 'data.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS totp_secrets (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id TEXT NOT NULL,
    secret TEXT NOT NULL,
    enabled INTEGER DEFAULT 0 NOT NULL,
    backup_codes TEXT DEFAULT '[]' NOT NULL,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

db.exec(
  'CREATE UNIQUE INDEX IF NOT EXISTS totp_secrets_user_id_unique ON totp_secrets (user_id);'
);

console.log('totp_secrets table created (or already exists).');
db.close();
