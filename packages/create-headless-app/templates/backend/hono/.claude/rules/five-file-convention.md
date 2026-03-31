# Five-File Feature Convention

Every feature in `src/features/{name}/` has exactly 5 files:

| File | Responsibility | Imports from |
|------|---------------|--------------|
| `{name}.routes.ts` | Hono route definitions, middleware chain, zValidator | handlers, schemas |
| `{name}.handlers.ts` | Thin: parse request → call service → apiSuccess/apiError | service, response helpers |
| `{name}.service.ts` | Business logic, throws `AppError` on domain errors | repository, errors |
| `{name}.repository.ts` | Drizzle ORM queries only — no business logic | db, schema |
| `{name}.schemas.ts` | Zod validation schemas + inferred types | zod |

## Layer rules

- **Handlers never call repositories directly** — always go through service
- **Services never access `c` (Hono Context)** — they receive plain data, return plain data
- **Repositories never throw AppError** — they return null/undefined, services interpret
- **Schemas are pure Zod** — no runtime imports, no side effects

## Anti-patterns

- Putting DB queries in handlers (bypass service layer)
- Importing `Context` in service files
- Throwing HTTP-specific errors in repositories
- Defining Zod schemas inline in routes instead of in schemas file
