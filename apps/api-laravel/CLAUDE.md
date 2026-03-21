# API Laravel — Backend PHP

## Stack

- **Framework**: Laravel 12
- **PHP**: 8.2+
- **Auth**: BetterAuth (`betterauth/laravel` ^0.0.9) — via VCS from `MakFly/betterauth-laravel`
- **OAuth**: `laravel/passport` ^13.4, `laravel/socialite` ^5.24
- **OpenAPI docs**: `api-platform/laravel` ^4.2 (documentation only, not runtime)
- **ORM**: Eloquent
- **DB**: SQLite (dev/test), MySQL/PostgreSQL (prod)
- **Testing**: PHPUnit 11 (no Pest)
- **Formatter**: Laravel Pint

## Architecture — Vertical Slice Architecture

```
app/
├── Features/
│   ├── Auth/
│   │   ├── Actions/            # OAuthProviders.php, TestAccounts.php
│   │   └── routes.php          # Auth routes (no v1 prefix — direct /auth/*)
│   ├── Shop/
│   │   ├── Actions/            # ListProducts, ShowProduct, ListCategories, ShowCategory
│   │   └── routes.php
│   ├── Cart/
│   │   ├── Actions/            # ShowCart, AddItem, UpdateItem, RemoveItem
│   │   └── routes.php
│   ├── Orders/
│   │   ├── Actions/            # CreateOrder, ListOrders, ShowOrder
│   │   └── routes.php
│   ├── Users/
│   │   ├── Actions/            # ListUsers, Me
│   │   └── routes.php
│   ├── Admin/
│   │   ├── Actions/            # ~25 actions: products, orders, customers, reviews, segments, roles, permissions, analytics
│   │   ├── Requests/
│   │   ├── Formatters/
│   │   ├── Services/
│   │   └── routes.php
│   ├── Saas/
│   │   ├── Actions/            # orgs, plans, subscription, invoices, team, usage, settings (+ Flat* variants)
│   │   └── routes.php
│   └── Support/
│       ├── Actions/            # conversations, messages, canned responses, agent queue, ratings
│       └── routes.php
├── Shared/
│   ├── Models/                 # ALL Eloquent models (User, Product, Order, Cart, etc.)
│   ├── Middleware/
│   │   ├── CheckRole.php
│   │   ├── CheckPermission.php
│   │   ├── ApiSecurityHeadersMiddleware.php
│   │   ├── OrgRbacMiddleware.php
│   │   └── SetLocaleMiddleware.php
│   ├── Helpers/
│   │   └── ApiResponse.php     # Standardized API responses
│   └── Traits/
│       └── ApiResponder.php
├── Http/                       # Legacy (kept for compatibility)
├── OpenApi/                    # API Platform OpenAPI decorators
└── Providers/                  # BetterAuthOpenApiServiceProvider
```

### Convention — Action classes

Each endpoint = 1 invokable Action class with `__invoke(Request $request)`:

```php
<?php

declare(strict_types=1);

namespace App\Features\Shop\Actions;

use App\Shared\Helpers\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListProducts
{
    public function __invoke(Request $request): JsonResponse
    {
        $products = Product::with('category')->paginate(20);
        return ApiResponse::success($products);
    }
}
```

### Convention — Feature route files

Auth routes are included without prefix. All other feature routes are included inside a `Route::prefix('v1')` group in `routes/api.php`:

```php
// routes/api.php
require app_path('Features/Auth/routes.php');          // /auth/* directly

Route::prefix('v1')->group(function () {
    require app_path('Features/Shop/routes.php');       // /api/v1/...
    require app_path('Features/Cart/routes.php');
    // ...
});
```

Each feature's `routes.php` defines its own paths relative to the v1 prefix:

```php
// app/Features/Shop/routes.php
use App\Features\Shop\Actions\ListProducts;
use Illuminate\Support\Facades\Route;

Route::get('/products', ListProducts::class);
Route::get('/products/{id}', ShowProduct::class);
```

### Convention — Form Requests

Complex validation → Laravel Form Request classes in `Features/{name}/Requests/`.

### Convention — Formatters

Private `format*()` methods extracted to `Features/{name}/Formatters/` as static classes.

### Convention — Services

Shared logic (e.g., org resolution) → `Features/{name}/Services/`.

### Adding a new feature

1. Create `app/Features/{Name}/Actions/` with invokable Action classes
2. Create `app/Features/{Name}/routes.php` with route definitions
3. Include routes in `routes/api.php` inside the `Route::prefix('v1')` group
4. Add Form Requests in `Requests/` if needed
5. Use models from `App\Shared\Models\`

## Middleware aliases (bootstrap/app.php)

| Alias | Class |
|-------|-------|
| `role` | `App\Shared\Middleware\CheckRole` |
| `permission` | `App\Shared\Middleware\CheckPermission` |
| `api.security` | `App\Shared\Middleware\ApiSecurityHeadersMiddleware` |
| `org.rbac` | `App\Shared\Middleware\OrgRbacMiddleware` |

`SetLocaleMiddleware` is appended globally to the `api` group.

## Exception handling (bootstrap/app.php)

All API exceptions (`api/*`) are caught and returned via `ApiResponse::error()`:
- `ValidationException` → 422 `VALIDATION_ERROR`
- `AuthenticationException` → 401 `UNAUTHORIZED`
- `ModelNotFoundException` → 404 `NOT_FOUND`
- `AuthorizationException` → 403 `ACCESS_DENIED`
- `NotFoundHttpException` → 404 `NOT_FOUND`
- Fallback → 500 `INTERNAL_ERROR`

## Commands

```bash
php artisan serve --port=8002         # Dev server
php artisan test                      # Run all tests
php artisan test tests/Feature/ShopTest.php  # Specific test file
php artisan test --filter=test_name   # Single test
php artisan migrate                   # Run migrations
php artisan migrate:fresh --seed      # Reset and reseed
php artisan db:seed                   # Seed data
php artisan route:list --path=api/v1  # List API routes
composer dump-autoload                # Regenerate autoloader
```

## Feature slices

| Feature | Prefix | Middleware | Key Actions |
|---------|--------|-----------|-------------|
| Auth | `/auth` | rate-limit | OAuthProviders, TestAccounts (+ BetterAuth handles register/login/me/refresh/logout) |
| Shop | `/api/v1` | public | ListProducts, ShowProduct, ListCategories, ShowCategory |
| Cart | `/api/v1/cart` | `auth:betterauth` | ShowCart, AddItem, UpdateItem, RemoveItem |
| Orders | `/api/v1/orders` | `auth:betterauth` | CreateOrder, ListOrders, ShowOrder |
| Users | `/api/v1/users` | `auth:betterauth` | ListUsers, Me |
| Admin | `/api/v1/admin` | `auth:betterauth` + `role:admin` | ~25 actions (products, orders, customers, reviews, segments, roles, permissions, analytics) |
| Saas | `/api/v1/saas` | `auth:betterauth` + `org.rbac` | orgs, plans, subscription, invoices, team, usage, settings |
| Support | `/api/v1/support` | `auth:betterauth` | conversations, messages, canned responses, agent queue, ratings |

## Key config

- `config/auth.php` — User model: `App\Shared\Models\User`
- `config/betterauth.php` — BetterAuth configuration
- `bootstrap/app.php` — Middleware aliases and global exception handling
- `routes/api.php` — Includes each feature's `routes.php`

## Response format

```json
{
  "success": true,
  "data": { ... },
  "status": 200,
  "request_id": "abc123"
}
```

Error:
```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "..." },
  "status": 422
}
```

## Tests

8 feature test files in `tests/Feature/`:
- `BetterAuthTest.php` — Auth endpoints
- `ShopTest.php` — Products & categories
- `CartTest.php` — Cart management
- `OrderTest.php` — Order management
- `AdminShopTest.php` — Admin CRUD
- `SaasTest.php` — SaaS multi-tenant
- `SupportTest.php` — Support chat
- `ExampleTest.php` — Smoke test

All tests use `RefreshDatabase` trait and PHPUnit assertions.

## API Platform (OpenAPI docs only)

`api-platform/laravel` is used exclusively as an OpenAPI documentation source.
BetterAuth routes remain as classic Laravel routes — never migrate them to API Platform resources.
See `.claude/rules/api-platform-betterauth-docs.md` for details.
