---
name: hono-schema
description: Add a new Drizzle ORM schema table and generate migration. Use when adding database tables or modifying schema.
argument-hint: <table-name>
disable-model-invocation: true
---

# Drizzle Schema + Migration

## Convention

All tables are defined in `src/shared/db/schema.ts`. The schema file is referenced by `drizzle.config.ts` (pointing to `./src/db/schema.ts` — note: this path is an alias, actual file is at `src/shared/db/schema.ts`).

## Table Template

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const {tableName} = sqliteTable('{table_name}', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});
```

## ID Convention

- Use `text('id').primaryKey().$defaultFn(() => crypto.randomUUID())` for UUID primary keys
- Integer auto-increment: `integer('id').primaryKey({ autoIncrement: true })` (for lookup tables like roles/permissions)
- All tables have `createdAt` and `updatedAt` text timestamps (ISO 8601)
- Foreign keys: `text('{table}_id').notNull().references(() => {table}.id)`

## Relations

Add relations for Drizzle relational queries:

```typescript
import { relations } from 'drizzle-orm';

export const {tableName}Relations = relations({tableName}, ({ one, many }) => ({
  user: one(users, {
    fields: [{tableName}.userId],
    references: [users.id],
  }),
}));
```

## Steps

1. Add table definition to `src/shared/db/schema.ts`
2. Export the table from schema.ts
3. If using relational queries, add a `relations()` definition
4. Generate migration: `bun run db:generate`
5. Apply migration: `bun run db:migrate`
6. If seeder needed, add to `src/shared/db/seeders/{tableName}.seeder.ts` and call from `src/shared/db/seed.ts`

Table: $ARGUMENTS
