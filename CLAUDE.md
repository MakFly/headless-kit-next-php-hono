# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Monorepo **Headless Kit** — starter kit headless multi-backend avec BFF Next.js.

```
Navigateur → Next.js BFF (port 3300) ──→ Laravel API (port 8002)
         → TanStack Start (port 3301) → Hono API (port 3333)
                                       → Symfony API (port 8001)
```

Pattern BFF : le frontend ne contacte jamais les backends directement. Les requêtes passent par des Route Handlers (`/api/v1/*`) qui ajoutent HMAC signing et transmettent les cookies d'auth.

## Structure du monorepo

```
apps/
├── web/              # Next.js 16 App Router (BFF) — port 3300
├── web-tanstack/     # TanStack Start + Vite — port 3301
├── api-laravel/      # Laravel 12 + BetterAuth + API Platform — port 8002
├── api-sf/           # Symfony 8 + BetterAuth (Paseto V4) — port 8001
└── api-hono/         # Hono + Drizzle + Bun — port 3333

packages/
├── config/           # Shared ESLint + TSConfig (@headless/config)
└── types/            # Shared TypeScript types (@headless/types)
```

Chaque app a son propre `CLAUDE.md` avec des instructions spécifiques.

## Commandes

```bash
# Monorepo (Turborepo + Bun workspaces)
bun install                              # Installer les dépendances
bun run dev                              # Dev tous les apps (turbo)
bun run build                            # Build tous les packages
bun run lint                             # Lint

# Next.js BFF (port 3300)
bun run --filter @headless/web dev
bun run --filter @headless/web build

# TanStack Start (port 3301)
bun run --filter @headless/web-tanstack dev

# Hono API (port 3333)
bun run --filter @headless/api-hono dev
bun run --filter @headless/api-hono db:migrate
bun run --filter @headless/api-hono db:seed

# Laravel API (port 8002)
cd apps/api-laravel && php artisan serve --port=8002
cd apps/api-laravel && php artisan test

# Symfony API (port 8001)
cd apps/api-sf && symfony server:start --port=8001 --no-tls
cd apps/api-sf && php bin/phpunit
cd apps/api-sf && php bin/phpunit tests/Functional/Auth/
```

## Authentification

Trois backends implémentent l'auth avec des stratégies différentes :

| Backend | Auth | Tokens | 2FA | Password Reset |
|---------|------|--------|-----|----------------|
| **Symfony** | BetterAuth bundle | Paseto V4 | Oui | Oui |
| **Laravel** | BetterAuth + Passport | Bearer | Oui | Oui |
| **Hono** | JWT (jose) | HS256 | Oui | Oui |

### Flow BFF (Next.js)

1. Login via Server Action → BFF Route Handler → Backend
2. Backend retourne `access_token` + `refresh_token`
3. BFF stocke le token dans un cookie HttpOnly `auth_token`
4. Les requêtes suivantes lisent le cookie et l'envoient au backend via header

### Flow TanStack Start

- Utilise `Route.useRouteContext()` pour les données SSR (évite le flash UI)
- Zustand pour les mutations client (login, logout)
- Hydratation du store côté client via `useEffect`

## Règles critiques

### Server Actions & Cookies (Next.js)

`credentials: 'include'` est **ignoré** côté serveur. Toujours passer le cookie manuellement :

```typescript
// Dans 'use server', TOUJOURS :
const cookieStore = await cookies();
const authToken = cookieStore.get('auth_token');
headers['Cookie'] = `auth_token=${authToken.value}`;
```

Voir `.claude/rules/nextjs-server-actions-cookies.md` pour le détail.

### BFF Client obligatoire (Next.js)

Toutes les Server Actions vers le backend DOIVENT utiliser `bff-client.ts` (pas de `fetch()` direct).
Voir `apps/web/.claude/rules/server-actions-bff-client.md`.

### TypeScript

Préférer `type` à `interface` partout. Voir `apps/web/.claude/rules/typescript-types-over-interfaces.md`.

### Laravel — API Platform + BetterAuth

BetterAuth reste en routes classiques (`/auth/*`). API Platform sert uniquement de source OpenAPI.
Voir `apps/api-laravel/.claude/rules/api-platform-betterauth-docs.md`.

## Variables d'environnement

```env
# Next.js (.env.local)
NEXT_PUBLIC_APP_URL=http://localhost:3300
LARAVEL_API_URL=http://localhost:8002
SYMFONY_API_URL=http://localhost:8001
NODE_API_URL=http://localhost:3333
BFF_SECRET=xxx

# Laravel (.env)
APP_URL=http://localhost:8002
FRONTEND_URL=http://localhost:3300

# Symfony (.env)
DATABASE_URL="sqlite:///%kernel.project_dir%/var/data_dev.db"
BETTER_AUTH_SECRET=change_me_in_production
FRONTEND_URL=http://localhost:3300

# Hono (.env)
PORT=3333
JWT_SECRET=xxx
FRONTEND_URL=http://localhost:3301
```

## Tests

```bash
# Symfony — 52 tests fonctionnels auth
cd apps/api-sf && php bin/phpunit

# Laravel
cd apps/api-laravel && php artisan test

# Hono
cd apps/api-hono && bun test

# TanStack
cd apps/web-tanstack && bun run test
```
