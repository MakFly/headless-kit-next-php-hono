# Tests monorepo — commandes

| Stack | Commande |
|-------|----------|
| Symfony | `cd apps/api-sf && php bin/phpunit` |
| Laravel | `cd apps/api-laravel && php artisan test` |
| Hono | `cd apps/api-hono && bun test` |
| TanStack | `cd apps/web-tanstack && bun run test` |

Optionnel Next : `bun run --filter @headless/web test` si défini dans le workspace.

Résumé attendu par stack : total, passés, échoués ; en cas d’échec, fichier + ligne.
