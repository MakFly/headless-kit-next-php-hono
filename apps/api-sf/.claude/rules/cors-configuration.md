---
paths:
  - "apps/api-sf/**/*"
---

# CORS Configuration

## Location

`config/packages/nelmio_cors.yaml` — via NelmioBundle.

## Never add manual CORS headers

NelmioBundle handles all CORS headers. Do NOT set `Access-Control-*` headers in controllers, subscribers, or middleware.

## Configuration

```yaml
nelmio_cors:
    defaults:
        allow_origin: ['%env(FRONTEND_URL)%']
        allow_methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
        allow_headers: ['Content-Type', 'Authorization', 'X-Requested-With']
        allow_credentials: true
        max_age: 3600
    paths:
        '^/auth': ~
        '^/api': ~
```

## Allowed Origins

Uses `FRONTEND_URL` environment variable. Never use `'*'` with `allow_credentials: true`.

## Path Scoping

CORS is scoped to `^/auth` and `^/api` paths. The root `^/` receives no CORS headers.

## Pitfalls

- Adding `Access-Control-Allow-Origin` manually in a subscriber conflicts with NelmioBundle
- Forgetting to add a new path prefix (e.g., `^/webhook`) if routes are added outside `/api/`
- Using `'*'` as origin with credentials — browsers reject this combination
