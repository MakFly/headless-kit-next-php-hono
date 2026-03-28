# Environment Variable Validation

## Rule

Every critical environment variable MUST be validated at application boot. In production, missing or placeholder values must cause a startup crash — not a silent fallback.

## Critical variables (must validate)

- Auth secrets (JWT_SECRET, BETTER_AUTH_SECRET, APP_SECRET)
- Database credentials (DATABASE_URL, DB_PASSWORD)
- Frontend URLs (FRONTEND_URL, NEXT_PUBLIC_APP_URL)

## Never commit real secrets

- `.env` files with real values must be in `.gitignore`
- `.env.example` must use obvious placeholders: `change-me-in-production`, empty strings
- `APP_DEBUG=false` in `.env.example` (never `true`)

## Validation patterns per backend

### Hono (top-level module guard)
```typescript
const secret = process.env.JWT_SECRET || 'dev-secret';
if (process.env.NODE_ENV === 'production' && (secret === 'dev-secret' || secret.length < 32)) {
  throw new Error('JWT_SECRET must be set to a secure value (min 32 chars) in production');
}
```

### Laravel (AppServiceProvider or config validation)
```php
// config/app.php — use env() with no default for required vars
'key' => env('APP_KEY'), // crash on boot if missing (framework enforces this)

// For custom vars, validate in AppServiceProvider::boot()
if (app()->isProduction() && empty(config('betterauth.secret'))) {
    throw new \RuntimeException('BETTER_AUTH_SECRET is required in production');
}
```

### Symfony (%env()% with processor)
```yaml
# config/packages/better_auth.yaml
better_auth:
    secret: '%env(BETTER_AUTH_SECRET)%'  # Symfony crashes if env var missing
```

Symfony's `%env()%` processor throws at container compilation if the var is undefined — this is the correct behavior.
