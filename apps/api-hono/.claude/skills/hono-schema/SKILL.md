---
name: hono-schema
description: Add a new Drizzle ORM schema table and generate migration. Use when adding database tables or modifying schema.
argument-hint: <table-name>
disable-model-invocation: true
---

# Drizzle Schema + Migration

All tables live in `src/shared/db/schema.ts` (see `drizzle.config.ts` for kit layout).

## References (load when implementing)

- @references/drizzle-migration.md — table template, IDs, relations, commands
- @../../../src/shared/db/schema.ts — current schema
- @../../../drizzle.config.ts

Table: $ARGUMENTS
