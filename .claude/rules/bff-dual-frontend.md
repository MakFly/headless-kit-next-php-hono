---
paths:
  - "apps/web/**/*"
  - "apps/web-tanstack/**/*"
---

# BFF — deux frontends (Next.js et TanStack)

Le navigateur ne doit **jamais** appeler les URLs des backends PHP/Hono directement. Tout passe par le BFF du frontend concerné.

## Next.js (`apps/web`)

- **Server Actions / RSC** : utiliser exclusivement `bff-client.ts` (`bffGet`, `bffPost`, …) sous `src/lib/actions/_shared/`.
- **Cookies** : en `'use server'`, ne pas compter sur `credentials: 'include'` pour transporter les cookies vers le BFF — suivre `.claude/rules/nextjs-server-actions-cookies.md` et `apps/web/.claude/rules/server-actions-bff-client.md`.

## TanStack Start (`apps/web-tanstack`)

- Appels API via **`fetchFromApi`** (`src/lib/http/fetch-api.ts` ou équivalent) vers les routes BFF/proxy du kit, pas vers `LARAVEL_API_URL` / `SYMFONY_API_URL` / `NODE_API_URL` depuis le client.
- Données SSR : `Route.useRouteContext()` ; mutations : patterns du `CLAUDE.md` TanStack.

## Monorepo

- Vue d’ensemble : `.claude/rules/bff-pattern.md`.
