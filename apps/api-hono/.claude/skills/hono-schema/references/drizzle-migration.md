# Drizzle — table + migration

## Table template (SQLite)

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const myTable = sqliteTable('my_table', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});
```

## IDs

- UUID text PK: `text('id').primaryKey().$defaultFn(() => crypto.randomUUID())`
- Integer PK: `integer('id').primaryKey({ autoIncrement: true })` for small lookup tables
- FK: `text('user_id').notNull().references(() => users.id)`

## Relations (optional)

```typescript
import { relations } from 'drizzle-orm';

export const myTableRelations = relations(myTable, ({ one }) => ({
  user: one(users, { fields: [myTable.userId], references: [users.id] }),
}));
```

## Commands

1. Edit `src/shared/db/schema.ts` (single source of truth; see `drizzle.config.ts` for paths)
2. `bun run db:generate`
3. `bun run db:migrate`
4. Seeder: `src/shared/db/seeders/<name>.seeder.ts` + wire in `seed.ts` if needed
