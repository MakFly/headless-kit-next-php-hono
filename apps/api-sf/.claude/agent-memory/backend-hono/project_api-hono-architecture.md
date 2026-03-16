---
name: project_api-hono-architecture
description: Hono API (apps/api-hono) architecture: features, shared layout, skills, key patterns
type: project
---

The Hono API uses Vertical Slice Architecture in `src/features/` with 7 feature slices: auth, shop, cart, orders, admin, saas, support.

**Why:** Each feature owns its 5 files (routes/handlers/service/repository/schemas) — no cross-feature coupling.

**How to apply:** When adding code, always place it inside the matching feature directory. Shared utilities go in `src/shared/`.

Key facts:
- Response helpers: `apiSuccess()` and `apiError()` from `src/shared/lib/response.ts`
- Auth: `authMiddleware` / `optionalAuthMiddleware` / `requireUser()` from `src/shared/middleware/auth.ts`
- DB schema: single file at `src/shared/db/schema.ts`
- drizzle.config.ts points to `./src/db/schema.ts` (legacy path alias, actual file is `src/shared/db/schema.ts`)
- Tests use `app.request()` directly (no supertest)
- 4 skills available: hono-feature, hono-schema, hono-test, hono-endpoint
