# Vérification monorepo — commandes

Exécuter depuis la **racine** du repo (Bun + turbo).

## Lint (toutes les apps qui exposent `lint`)

```bash
bun run lint
```

## Tests (workspaces avec script `test`)

```bash
bun run test
```

## Ciblages utiles

```bash
bun run --filter @headless/api-hono typecheck
bun run --filter @headless/web build
bun run --filter @headless/web-tanstack build
```

## Backends PHP (hors turbo si besoin)

```bash
cd apps/api-sf && php bin/phpunit
cd apps/api-laravel && php artisan test
```

En cas d’échec : reporter le package, la commande et les premières lignes d’erreur.
