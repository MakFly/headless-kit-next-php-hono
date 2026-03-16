/**
 * Test setup and utilities
 */

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../shared/db/schema.ts';
import { eq } from 'drizzle-orm';

/**
 * Create an in-memory test database
 */
export function createTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON;');

  // Create tables
  sqlite.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified_at TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      resource TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE user_roles (
      user_id TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );

    CREATE TABLE role_permissions (
      role_id INTEGER NOT NULL,
      permission_id INTEGER NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    );

    CREATE TABLE refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  const db = drizzle(sqlite, { schema });

  return { db, sqlite };
}

/**
 * Seed test database with default roles
 */
export async function seedTestDb(db: ReturnType<typeof drizzle<typeof schema>>) {
  const now = new Date().toISOString();

  // Insert default roles
  await db.insert(schema.roles).values([
    { name: 'Admin', slug: 'admin', description: 'Full access', createdAt: now, updatedAt: now },
    { name: 'User', slug: 'user', description: 'Standard user', createdAt: now, updatedAt: now },
  ]);

  return db;
}

/**
 * Clean test database
 */
export async function cleanTestDb(db: ReturnType<typeof drizzle<typeof schema>>) {
  await db.delete(schema.refreshTokens);
  await db.delete(schema.userRoles);
  await db.delete(schema.users);
}

/**
 * Test user data
 */
export const testUser = {
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123',
};

/**
 * Create a test user in the database
 */
export async function createTestUser(
  db: ReturnType<typeof drizzle<typeof schema>>,
  userData: { id: string; email: string; name: string; passwordHash: string }
) {
  const now = new Date().toISOString();

  await db.insert(schema.users).values({
    id: userData.id,
    email: userData.email,
    name: userData.name,
    passwordHash: userData.passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  // Assign user role
  const userRole = await db.query.roles.findFirst({
    where: eq(schema.roles.slug, 'user'),
  });

  if (userRole) {
    await db.insert(schema.userRoles).values({
      userId: userData.id,
      roleId: userRole.id,
    });
  }

  return userData;
}
