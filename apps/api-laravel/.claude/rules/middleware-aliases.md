---
paths:
  - "apps/api-laravel/**/*"
---

# Middleware Aliases

## Available aliases (defined in bootstrap/app.php)

| Alias | Class | Purpose |
|-------|-------|---------|
| `auth:betterauth` | BetterAuth guard | JWT authentication |
| `role` | `CheckRole` | Requires specific role (e.g., `role:admin`) |
| `permission` | `CheckPermission` | Requires specific permission |
| `api.security` | `ApiSecurityHeadersMiddleware` | Security headers |
| `org.rbac` | `OrgRbacMiddleware` | Organization membership check |

## Route middleware chaining

```php
Route::middleware(['auth:betterauth', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', DashboardAction::class);
});
```

## BetterAuth native routes

BetterAuth handles these routes natively — do NOT recreate:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/revoke-all`
- `PUT /auth/password`

Custom auth endpoints (password reset, 2FA, OAuth) are added as invokable Actions in `app/Features/Auth/Actions/`.

## Pitfalls

- Forgetting `auth:betterauth` on protected routes → silent auth bypass
- Using `auth` instead of `auth:betterauth` → wrong guard
- Adding middleware to auth routes that BetterAuth handles → conflicts
