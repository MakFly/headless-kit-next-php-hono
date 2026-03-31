# Dev servers — ports et commandes

| Service | Port | Commande |
|---------|------|----------|
| Next.js BFF | 3300 | `bun run --filter @headless/web dev` |
| TanStack Start | 3301 | `bun run --filter @headless/web-tanstack dev` |
| Hono | 3333 | `bun run --filter @headless/api-hono dev` |
| Laravel | 8002 | `cd apps/api-laravel && php artisan serve --port=8002` |
| Symfony | 8001 | `cd apps/api-sf && symfony server:start --port=8001 --no-tls` |

Lancer les commandes Bun en background puis les serveurs PHP dans des shells séparés ou background selon l’environnement.
