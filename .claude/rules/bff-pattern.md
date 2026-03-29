# BFF Pattern Rules

## Architecture

Le frontend ne contacte JAMAIS les backends directement. Tout passe par le BFF :

```
Client → BFF Route Handler (/api/v1/*) → Backend API
```

## Sécurité BFF → Backend

Les requêtes BFF → Backend sont authentifiées via le Bearer token de l'utilisateur. Le BFF ajoute les headers de sécurité (CSRF, X-Request-Id) et gère le cycle de vie des tokens (refresh proactif/réactif).

## Adapter Pattern

Le BFF utilise des adapters pour communiquer avec différents backends :

```
apps/web/src/lib/adapters/
├── LaravelAdapter    → Laravel API (port 8002)
├── SymfonyAdapter    → Symfony API (port 8001)
└── NodeAdapter       → Hono API (port 3333)
```

Le choix de l'adapter est configurable via `AUTH_BACKEND` dans `.env.local`.

## Règle anti-fetch direct

Dans les Server Actions (`'use server'`), TOUJOURS utiliser le `bff-client.ts`.
Ne JAMAIS faire de `fetch()` direct vers `localhost:8002`, `localhost:8001`, ou `localhost:3333`.
