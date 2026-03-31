# CORS Configuration

## Location

`config/cors.php` — Laravel's built-in CORS middleware.

## Allowed Origins

```php
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3300')],
```

Uses `FRONTEND_URL` environment variable. Never use `['*']` with `supports_credentials: true`.

## Restricted Methods & Headers

```php
'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Request-Id', 'Accept-Language'],
```

Never use `['*']` — it's overly permissive for a production API.

## Paths

```php
'paths' => ['api/*', 'oauth/*', 'sanctum/csrf-cookie'],
```

## Credentials

`supports_credentials => true` — required for cookie-based auth via BFF.

## Preflight Cache

`max_age => 86400` — cache preflight responses for 24h to reduce OPTIONS requests.

## Pitfalls

- Default fallback port is 3300 (BFF port), not 3000
- `['*']` origin with `supports_credentials: true` is rejected by browsers
- Forgetting to add new paths (e.g., `webhook/*`) to the `paths` array
