---
paths:
  - "apps/api-hono/**/*"
---

# CORS Configuration

## Location

CORS is configured globally in `src/index.ts` via Hono's `cors()` middleware.

## Allowed Origins

Origins are built dynamically from environment variables:

```typescript
const allowedOrigins = [frontendUrl]; // FRONTEND_URL env var
if (process.env.BFF_ORIGIN) allowedOrigins.push(process.env.BFF_ORIGIN);
```

- `FRONTEND_URL` — primary frontend origin (required)
- `BFF_ORIGIN` — optional additional origin (e.g., Next.js BFF on a different port)

## Never hardcode origins

Do NOT add `http://localhost:*` directly in the origins array. Use environment variables.

## Configuration

```typescript
cors({
  origin: allowedOrigins,
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Request-Id', 'Accept-Language'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400,
})
```

## Credentials

`credentials: true` is required because the BFF sends auth cookies cross-origin.

## Pitfalls

- Adding `*` as origin breaks credentialed requests (browser rejects)
- CORS middleware must be registered BEFORE route handlers
- Forgetting `OPTIONS` in allowMethods breaks preflight requests
