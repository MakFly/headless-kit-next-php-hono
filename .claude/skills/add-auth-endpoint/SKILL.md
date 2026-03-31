---
name: add-auth-endpoint
description: Ajoute un endpoint d'auth sur Symfony, Laravel, Hono et BFF (Next/TanStack). Plan puis implémentation multi-backends.
disable-model-invocation: true
---

# Add auth endpoint (multi-backend)

Ajouter un endpoint d’authentification aligné sur les trois APIs et les BFF.

## References (load when implementing)

- @references/workflow.md — étapes, règles BetterAuth / tests
- @../../../.claude/rules/betterauth-conventions.md
- @../../../CLAUDE.md — ports et architecture monorepo
- @../../../apps/api-sf/src/Feature/Auth/
- @../../../apps/api-laravel/app/Features/Auth/
- @../../../apps/api-hono/src/features/auth/
- @../../../apps/web/src/lib/adapters/
