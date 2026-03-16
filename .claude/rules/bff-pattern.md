# BFF Pattern Rules

## Architecture

Le frontend ne contacte JAMAIS les backends directement. Tout passe par le BFF :

```
Client → BFF Route Handler (/api/v1/*) → Backend API
```

## HMAC Signing

Les requêtes BFF → Backend sont signées avec HMAC pour garantir l'authenticité :
- Le `BFF_SECRET` est partagé entre le BFF et les backends
- Chaque requête inclut une signature HMAC dans les headers
- Les backends vérifient la signature avant de traiter la requête

## Adapter Pattern

Le BFF utilise des adapters pour communiquer avec différents backends :

```
apps/web/src/lib/adapters/
├── LaravelAdapter    → Laravel API (port 8000)
├── SymfonyAdapter    → Symfony API (port 8002)
└── NodeAdapter       → Hono API (port 8003)
```

Le choix de l'adapter est configurable via `AUTH_BACKEND` dans `.env.local`.

## Règle anti-fetch direct

Dans les Server Actions (`'use server'`), TOUJOURS utiliser le `bff-client.ts`.
Ne JAMAIS faire de `fetch()` direct vers `localhost:8000`, `localhost:8002`, ou `localhost:8003`.
