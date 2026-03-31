---
paths:
  - "apps/api-hono/**/*"
---

# Drizzle ORM Patterns

## Schema

All table definitions live in `src/shared/db/schema.ts` (single file).

### ID convention
```typescript
id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID())
```

### Timestamp convention
```typescript
createdAt: text('created_at').$defaultFn(() => new Date().toISOString())
updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString())
```

Note: SQLite stores timestamps as text (ISO strings), not Date objects.

### Relations
```typescript
export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
}))
```

## Migration workflow

```bash
bun run db:generate    # Generate migration from schema changes
bun run db:migrate     # Apply pending migrations
bun run db:push        # Dev only: push schema without migration
bun run db:seed        # Seed data
```

## Query patterns

- Use `db.query.{table}.findFirst()` for single record (with relations)
- Use `db.select().from()` for complex queries (joins, aggregates)
- Use `db.insert().values()` for inserts
- Always `import { db, schema } from '../../shared/db/index.ts'`

## Pitfalls

- Forgetting `.ts` extension in imports (required by Bun)
- Using `Date` objects instead of ISO strings for SQLite timestamps
- Forgetting to add relations() for new tables with foreign keys
