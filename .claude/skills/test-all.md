---
name: test-all
description: Lance tous les tests du monorepo (Symfony, Laravel, Hono, TanStack)
user_invocable: true
---

Lance tous les tests du monorepo en parallèle.

## Instructions

1. Lance les tests en parallèle via des agents background :
   - **Symfony** : `cd apps/api-sf && php bin/phpunit`
   - **Laravel** : `cd apps/api-laravel && php artisan test`
   - **Hono** : `cd apps/api-hono && bun test`
   - **TanStack** : `cd apps/web-tanstack && bun run test`

2. Collecte les résultats de chaque agent.

3. Affiche un résumé consolidé :
   ```
   Symfony:  XX tests, XX passed, XX failed
   Laravel:  XX tests, XX passed, XX failed
   Hono:     XX tests, XX passed, XX failed
   TanStack: XX tests, XX passed, XX failed
   ```

4. Si des tests échouent, liste les échecs avec le fichier et la ligne.
