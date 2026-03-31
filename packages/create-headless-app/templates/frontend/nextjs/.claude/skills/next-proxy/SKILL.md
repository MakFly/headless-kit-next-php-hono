---
name: next-proxy
description: Add or modify BFF proxy route configuration for a new backend endpoint. Use when a new backend API path needs to be proxied through the BFF.
argument-hint: <backend-path>
disable-model-invocation: true
---

# BFF Proxy Configuration

The BFF proxies all API calls from the frontend to the backend.

## Architecture

```
Browser → Next.js BFF (/api/v1/*) → Backend API
```

The frontend NEVER contacts backends directly.

## Proxy route handler

`src/app/api/v1/[...path]/route.ts` is the catch-all handler for all `/api/v1/*` requests. It:
1. Resolves the active backend from the `auth_backend` cookie
2. Validates the path (SSRF protection, CSRF check)
3. Transforms the BFF path to the backend path
4. Forwards the request with `Authorization: Bearer <token>`
5. Handles 401 with automatic token refresh + retry
6. Stores refreshed tokens in HttpOnly cookies

## Backend selection

The active backend is stored in the `auth_backend` cookie (set by middleware when navigating to `/laravel`, `/symfony`, or `/hono` prefixed paths, or configured via `AUTH_BACKEND` env var).

| Env var | Default | Purpose |
|---------|---------|---------|
| `AUTH_BACKEND` | `laravel` | Default backend if no cookie |
| `LARAVEL_API_URL` | `http://localhost:8000` | Laravel base URL |
| `SYMFONY_API_URL` | `http://localhost:8002` | Symfony base URL |
| `NODE_API_URL` | `http://localhost:8003` | Hono base URL |

## Proxy config file

`src/lib/adapters/proxy-config.ts` defines per-backend:
- `baseUrl`: Backend URL
- `transformPath`: BFF path → backend path mapping
- `publicRoutes`: Paths accessible without auth token
- `timeout`: Request timeout (default 30s)

## Adding a new public route

If a new backend endpoint should be accessible without an auth token, add its backend path to the `publicRoutes` array in the relevant `get*Config()` function in `proxy-config.ts`:

```typescript
// In getLaravelConfig() / getSymfonyConfig() / getNodeConfig()
publicRoutes: [
  `${authPrefix}/login`,
  // ... existing routes ...
  '/api/v1/your-new-public-route',  // add here
],
```

## Path transformation

Each backend has its own `transformPath` function. BFF paths are always `/api/v1/*`:
- Laravel: `/api/v1/auth/*` → `/api/auth/*` (strips v1)
- Symfony: `/api/v1/auth/*` → `/api/v1/auth/*` (1:1)
- Hono: `/api/v1/*` → `/api/*` (strips v1)

To add a custom mapping, edit the `transformPath` function for the relevant backend.

## Token refresh flow

1. Middleware decodes JWT (Edge-compatible, no verification)
2. If token expires in < 5 min: sets `x-bff-refresh-needed: true` header
3. If token expired: sets `x-bff-refresh-needed: expired` header
4. Route handler attempts proactive refresh before forwarding request
5. If backend returns 401 AND refresh token exists: refresh + retry once
6. Tokens stored in HttpOnly cookies: `auth_token`, `refresh_token`, `token_expires_at`

## Security features

- **Path validation**: Rejects `..`, empty segments, `://` — prevents SSRF/path traversal
- **Host validation**: Final URL must match configured backend host
- **CSRF protection**: Mutating requests require matching `Origin`/`Referer` header (or `x-bff-internal: 1` for Server Actions)
- **No-store headers**: All proxy responses are `Cache-Control: no-store`

## AI routes

AI chat is handled separately at `src/app/api/ai/chat/route.ts` (Vercel AI SDK).
These do NOT go through the `/api/v1/` proxy.

Target: $ARGUMENTS
