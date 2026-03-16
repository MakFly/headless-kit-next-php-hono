---
name: template-sync-process
description: Laravel template sync: source is apps/api-laravel/, destination is packages/create-headless-app/templates/backend/laravel/
type: project
---

The CLI template at `packages/create-headless-app/templates/backend/laravel/` is a standalone copy of `apps/api-laravel/`. It must never contain `workspace:*` or `@headless/*` references.

**Why:** The CLI scaffolds new projects from this template. It must be self-contained and workspace-independent.

**How to apply:** When syncing, always read existing template files before overwriting them. The template must be kept in sync with the monorepo app. The following areas were fully synced (as of 2026-03-16):

- `app/Http/Controllers/Api/V1/` — AdminController, AdminShopController, CartController, CategoryController, OrderController, OrgController, ProductController, SaasController, SupportController, UserController
- `app/Http/Controllers/Auth/` — OAuthController, TestAccountsController
- `app/Http/Helpers/ApiResponse.php` — static JSON envelope helper
- `app/Http/Traits/ApiResponder.php` — controller convenience trait
- `app/Http/Middleware/` — CheckPermission, CheckRole, OrgRbacMiddleware, SetLocaleMiddleware
- `app/Models/` — 22 models total (User + Role + Permission + OAuthProvider + 18 new domain models)
- `bootstrap/app.php` — full exception handler + middleware aliases
- `routes/api.php` — complete route set (auth, shop, cart, orders, admin, saas, support)
- `database/migrations/` — 18 new 2026_03_15_* migrations
- `database/seeders/` — DatabaseSeeder, RbacSeeder, ShopSeeder, AdminShopSeeder, SaasSeeder, SupportSeeder
- `config/test-accounts.php` — flat array format (admin + user)
- `lang/en/api.php` and `lang/fr/api.php` — i18n keys for all domains
- `tests/Feature/` — ShopTest, CartTest, OrderTest, AdminShopTest, SaasTest, SupportTest
