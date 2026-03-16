---
name: project_vsa-migration
description: api-hono Vertical Slice Architecture migration — new structure and old directories status
type: project
---

The api-hono codebase was migrated from a layered structure to Vertical Slice Architecture.

New canonical structure:
- `src/features/{auth,shop,cart,orders,admin,saas,support}/` — feature slices with their own handlers, services, repositories, routes, schemas
- `src/shared/{db,middleware,lib,types}/` — shared infrastructure

Old directories have been deleted: `src/handlers/`, `src/services/`, `src/repositories/`, `src/routes/`, `src/middleware/`, `src/lib/`, `src/db/`, `src/types/`.

**Why:** Vertical slice groups code by feature instead of by layer, reducing cross-cutting dependencies.

**How to apply:** Always import from `features/<name>/<name>.handlers.ts` (named exports), `features/shop/shop.routes.ts` (default export), and `shared/` for db/types/lib/middleware. The orders feature file is `orders.handlers.ts` (plural), not `order.handlers.ts`.
