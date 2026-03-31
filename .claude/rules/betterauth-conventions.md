---
paths:
  - "apps/api-sf/**/*"
  - "apps/api-laravel/**/*"
  - "apps/api-hono/**/*"
  - "apps/web/**/*"
  - "apps/web-tanstack/**/*"
---

# BetterAuth Conventions

## Présent dans

- **Symfony** : `betterauth/symfony-bundle` — tokens Paseto V4
- **Laravel** : `betterauth/laravel` — tokens Bearer

## Endpoints standardisés

Tous les backends exposent les mêmes endpoints auth sous `/api/v1/auth/` :

| Endpoint | Description |
|----------|-------------|
| `POST /register` | Inscription |
| `POST /login` | Connexion |
| `GET /me` | Utilisateur courant |
| `POST /refresh` | Rafraîchir le token |
| `POST /logout` | Déconnexion |

## Conventions de réponse

```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

- Les champs de réponse sont en **snake_case** (`access_token`, `refresh_token`)
- Les champs de requête refresh sont en **camelCase** (`refreshToken`)
- Hono retourne aussi en camelCase (`accessToken`) pour compatibilité

## Ne pas migrer BetterAuth vers API Platform

Les routes BetterAuth restent en routes classiques. API Platform sert uniquement de documentation OpenAPI.
