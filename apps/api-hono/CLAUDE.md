# API Hono — Backend Node.js

## Stack

- **Runtime**: Bun
- **Framework**: Hono 4
- **ORM**: Drizzle ORM (SQLite via `data.db`)
- **Auth**: JWT HS256 via `jose`
- **Validation**: Zod + `@hono/zod-validator`
- **Port**: 3333

## Architecture — Vertical Slice

```
src/
├── index.ts                    # App bootstrap, global middleware, route mounts
├── features/
│   ├── auth/                   # JWT register/login/refresh/logout/me/oauth
│   ├── shop/                   # products + categories (public)
│   ├── cart/                   # cart management (auth)
│   ├── orders/                 # order management (auth)
│   ├── admin/                  # admin CRUD (auth+admin)
│   ├── saas/                   # multi-tenant SaaS (auth+orgRbac)
│   └── support/                # support chat (auth)
├── shared/
│   ├── db/
│   │   ├── index.ts            # db + schema exports
│   │   ├── schema.ts           # all Drizzle table definitions
│   │   ├── seed.ts             # seed entrypoint
│   │   └── seeders/            # per-feature seeders
│   ├── middleware/
│   │   ├── auth.ts             # authMiddleware, optionalAuthMiddleware, requireUser()
│   │   ├── admin.ts            # adminMiddleware (requires admin role)
│   │   ├── org-rbac.ts         # orgRbacMiddleware (requires org membership)
│   │   ├── i18n.ts             # i18nMiddleware (Accept-Language → c.set('locale'))
│   │   ├── security.ts         # security headers helpers
│   │   └── index.ts            # requestContextMiddleware, i18nMiddleware re-exports
│   ├── lib/
│   │   ├── response.ts         # apiSuccess(), apiError()
│   │   ├── errors.ts           # AppError class
│   │   ├── jwt.ts              # signToken(), verifyToken()
│   │   ├── hash.ts             # hashPassword(), verifyPassword()
│   │   └── i18n/               # t() translation helper
│   └── types/
│       └── index.ts            # AppVariables, SafeUser, JwtPayload
└── tests/
    ├── setup.ts
    ├── helpers/
    │   └── test-app.ts         # createTestApp() factory
    ├── integration/
    │   ├── auth.test.ts
    │   ├── health.test.ts
    │   ├── shop/               # products.test.ts, cart.test.ts, orders.test.ts
    │   ├── saas/               # saas.test.ts, admin.test.ts
    │   └── support/            # support.test.ts
    └── unit/
        ├── hash.test.ts
        ├── jwt.test.ts
        └── schemas.test.ts
```

## Feature Convention

Each feature has exactly 5 files: `{name}.routes.ts`, `{name}.handlers.ts`, `{name}.service.ts`, `{name}.repository.ts`, `{name}.schemas.ts`.

- **routes** — Hono route definitions, middleware chain, `zValidator` calls
- **handlers** — Thin: parse request → call service → `apiSuccess` / `apiError`
- **service** — Business logic; throws `AppError` on domain errors
- **repository** — Drizzle ORM queries only
- **schemas** — Zod schemas + inferred types

## Global Middleware (src/index.ts)

Applied to all routes in order: `logger()`, `prettyJSON()`, `secureHeaders()`, `requestContextMiddleware`, `i18nMiddleware`, `cors()`.

CORS allows: `FRONTEND_URL` + `http://localhost:3300`. Credentials enabled.

## Response Envelope

```typescript
// Success — apiSuccess(c, data, meta?, status?)
{ success: true, data: unknown, status: number, request_id: string, meta?: object }

// Error — apiError(c, code, message, status, details?)
{ success: false, error: { code: string, message: string, details?: unknown }, status: number, request_id: string }
```

Auth login/register response shape (inside `data`):

```json
{ "user": { "id": "...", "email": "...", "name": "..." }, "accessToken": "...", "refreshToken": "...", "expiresIn": 3600, "tokenType": "Bearer" }
```

## Feature Routes

| Feature | Mount path | Middleware | Key endpoints |
|---------|-----------|-----------|---------------|
| auth | `/api/v1/auth` | public | `POST /register`, `POST /login`, `GET /me`, `POST /refresh`, `POST /logout`, `GET /oauth/providers` |
| shop | `/api/v1` | public | `GET /products`, `GET /categories` |
| cart | `/api/v1/cart` | `authMiddleware` | `GET /`, `POST /items`, `PATCH /items/:id`, `DELETE /items/:id` |
| orders | `/api/v1/orders` | `authMiddleware` | `POST /`, `GET /`, `GET /:id` |
| admin | `/api/v1/admin` | `authMiddleware` + `adminMiddleware` | products, orders, customers, reviews, segments, analytics |
| saas | `/api/v1/saas` | `authMiddleware` + `orgRbacMiddleware` | plans, subscription, invoices, team, usage, settings, orgs |
| support | `/api/v1/support` | `authMiddleware` | conversations, messages, canned responses |

## Commands

```bash
bun run dev                     # Dev server with --watch (port 3333)
bun run start                   # Production server
bun test                        # All tests
bun test src/tests/unit/        # Unit tests only
bun test src/tests/integration/ # Integration tests only
bun test --grep "Auth"          # Filter by name
bun run db:generate             # Generate Drizzle migration (drizzle-kit)
bun run db:migrate              # Apply migrations
bun run db:push                 # Push schema without migration (dev only)
bun run db:seed                 # Seed data
bun run db:studio               # Drizzle Studio UI
bun run typecheck               # tsc --noEmit
bun run build                   # Build to dist/
```

## Database

- Drizzle ORM with SQLite (`data.db` at project root)
- Schema: `src/shared/db/schema.ts` — all table definitions in one file
- Config: `drizzle.config.ts` — dialect `sqlite`, output `./drizzle/`
- ID convention: `text('id').primaryKey().$defaultFn(() => crypto.randomUUID())`
- Timestamps: `text('created_at')` / `text('updated_at')` as ISO strings

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3333` | Server port |
| `API_VERSION` | `v1` | API version prefix |
| `JWT_SECRET` | — | JWT signing secret (required in prod) |
| `FRONTEND_URL` | `http://localhost:3000` | Primary CORS origin |
| `DATABASE_URL` | `file:./data.db` | SQLite file path |
| `NODE_ENV` | `development` | Controls error verbosity |

## Skills

Available in `.claude/skills/` (each skill includes a `references/` folder — use the `@…` links in `SKILL.md` to load patterns and source paths):

| Skill | Usage |
|-------|-------|
| `hono-feature` | Create a full feature slice (5 files + route mount) |
| `hono-schema` | Add a Drizzle table + generate migration |
| `hono-test` | Write integration or unit tests |
| `hono-endpoint` | Add a single endpoint to an existing feature |
