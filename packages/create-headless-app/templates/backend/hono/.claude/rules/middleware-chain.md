# Middleware Chain

## Global middleware (src/index.ts)

Applied to ALL routes in this order:
1. `logger()` — request logging
2. `prettyJSON()` — formatted JSON in dev
3. `secureHeaders()` — security headers
4. `requestContextMiddleware` — sets `requestId` in context
5. `i18nMiddleware` — sets `locale` from Accept-Language
6. `cors()` — CORS with `FRONTEND_URL` + optional `BFF_ORIGIN` env var

## Available route middleware

| Middleware | Import from | Purpose |
|-----------|-------------|---------|
| `authMiddleware` | `shared/middleware/auth.ts` | Validates JWT, sets `user` in context |
| `optionalAuthMiddleware` | `shared/middleware/auth.ts` | Sets `user` if token present, continues if not |
| `adminMiddleware` | `shared/middleware/admin.ts` | Requires `admin` role (must come after authMiddleware) |
| `orgRbacMiddleware` | `shared/middleware/org-rbac.ts` | Requires org membership |
| `rateLimitMiddleware()` | `shared/middleware/index.ts` | Rate limiting with configurable scope/window |

## Route-level middleware order

```typescript
app.post('/action',
  authMiddleware,           // 1. Authenticate
  adminMiddleware,          // 2. Authorize (optional)
  zValidator('json', schema), // 3. Validate
  handler                   // 4. Handle
)
```

## Accessing user in handlers

```typescript
import { requireUser } from '../../shared/middleware/auth.ts'

export async function myHandler(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c)  // throws if not authenticated
  // user.id, user.email, user.name
}
```

## Context variables (AppVariables)

```typescript
type AppVariables = {
  user?: JwtPayload    // set by authMiddleware
  requestId: string    // set by requestContextMiddleware
  locale: string       // set by i18nMiddleware
}
```
