# BFF proxy — behavior and security

## Architecture

```
Browser → Next.js BFF (/api/v1/*) → Backend API
```

The frontend never calls backends directly.

## Route handler (`src/app/api/v1/[...path]/route.ts`)

1. Resolve backend from `auth_backend` cookie
2. Validate path (SSRF / traversal), CSRF on mutations
3. Transform BFF path → backend path
4. Forward with `Authorization: Bearer <token>`
5. On 401: refresh + retry once; clear cookies on failure
6. Write refreshed tokens to HttpOnly cookies

## Env (typical local)

| Var | Role |
|-----|------|
| `AUTH_BACKEND` | Default backend if no cookie (`laravel` \| `symfony` \| `node`) |
| `LARAVEL_API_URL` | Laravel base |
| `SYMFONY_API_URL` | Symfony base |
| `NODE_API_URL` | Hono base |

## `proxy-config.ts`

Per backend: `baseUrl`, `transformPath`, `publicRoutes`, `timeout`.

### Public route

Add backend path to `publicRoutes` in the relevant `get*Config()`:

```typescript
publicRoutes: [
  `${authPrefix}/login`,
  '/api/v1/your-new-public-route',
],
```

### Path transforms (BFF always `/api/v1/*`)

- Laravel: `/api/v1/auth/*` → `/api/auth/*`
- Symfony: `/api/v1/auth/*` → `/api/v1/auth/*` (1:1)
- Hono: `/api/v1/*` → `/api/*`

## Token refresh (summary)

Edge middleware sets `x-bff-refresh-needed`; route handler may refresh proactively; reactive 401 + refresh token retry.

## Security

- Path validation (`..`, empty segments, `://`)
- Host must match configured backend
- CSRF: Origin/Referer or `x-bff-internal: 1` for Server Actions
- Responses: `Cache-Control: no-store`

## AI

`src/app/api/ai/chat/route.ts` — Vercel AI SDK, **not** under `/api/v1/` proxy.
