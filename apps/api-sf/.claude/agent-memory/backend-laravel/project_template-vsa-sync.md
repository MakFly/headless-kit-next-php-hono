---
name: CLI template VSA sync
description: The create-headless-app Laravel template has been synced to match the Vertical Slice Architecture of apps/api-laravel
type: project
---

The `packages/create-headless-app/templates/backend/laravel/` template now mirrors the VSA structure of `apps/api-laravel/`.

**Why:** apps/api-laravel was refactored from classic MVC Controllers to VSA (Vertical Slice Architecture) — the CLI template must stay in sync so generated projects use the correct structure.

**How to apply:** When updating apps/api-laravel (new features, refactors), also sync the same files in the CLI template. The key mapping is:
- `app/Features/` — one slice per domain (Auth, Shop, Cart, Orders, Admin, Saas, Support, Users)
- `app/Shared/` — Models, Middleware, Helpers, Traits (replaces old app/Models, app/Http/Middleware, etc.)
- `app/Http/Controllers/Controller.php` — keep as base controller, do NOT delete
- `routes/api.php` — now delegates to each Feature's `routes.php` via `require app_path(...)`
- `bootstrap/app.php` — middleware aliases point to `App\Shared\Middleware\*`
- `config/auth.php` and `config/betterauth.php` — User model is `App\Shared\Models\User`
- All seeders and tests reference `App\Shared\Models\*` not `App\Models\*`
