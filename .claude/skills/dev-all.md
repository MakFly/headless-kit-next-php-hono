---
name: dev-all
description: Lance tous les serveurs de dev en parallèle
user_invocable: true
---

Lance tous les serveurs de développement du monorepo en parallèle.

## Instructions

1. Affiche un résumé des services qui vont démarrer :
   - Next.js BFF (port 3001)
   - TanStack Start (port 3003)
   - Hono API (port 8003)
   - Laravel API (port 8000)
   - Symfony API (port 8002)

2. Lance les commandes en background :
   ```bash
   bun run --filter @headless/web dev
   bun run --filter @headless/web-tanstack dev
   bun run --filter @headless/api-hono dev
   cd apps/api-laravel && php artisan serve --port=8000
   cd apps/api-sf && symfony server:start --port=8002 --no-tls
   ```

3. Confirme que tous les services sont démarrés.
