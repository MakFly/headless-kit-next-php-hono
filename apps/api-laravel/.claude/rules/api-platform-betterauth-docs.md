---
paths:
  - "apps/api-laravel/**/*"
---

# API Platform + BetterAuth Docs Rules

- Keep BetterAuth runtime routes as classic Laravel routes (`/auth/*`).
- Use API Platform as the OpenAPI documentation source only for BetterAuth endpoints.
- Never migrate BetterAuth controllers to API Platform resources.
- Register `App\Providers\BetterAuthOpenApiServiceProvider` in `bootstrap/providers.php`.
- Keep OpenAPI integration code in:
  - `app/OpenApi/BetterAuthOpenApiFactory.php`
  - `app/Providers/BetterAuthOpenApiServiceProvider.php`
  - `config/betterauth_openapi.php`
- When adding new BetterAuth endpoints, update the OpenAPI decorator accordingly.
- Keep security scheme name stable (`betterAuthBearer`) unless migration is coordinated.
- Prefer idempotent install commands and avoid duplicate provider registration.
