---
name: sf-migration
description: Generate and run Doctrine migrations. Use when schema changes are needed after entity modifications.
disable-model-invocation: true
---

# Doctrine Migrations

## Steps

1. Validate current schema: `php bin/console doctrine:schema:validate`
2. Generate migration: `php bin/console doctrine:migrations:diff`
3. Review the generated migration in `migrations/`
4. Apply: `php bin/console doctrine:migrations:migrate --no-interaction`
5. For test DB: `APP_ENV=test php bin/console doctrine:migrations:migrate --no-interaction`

## Naming convention

Migration files: `Version{YYYYMMDD}{HHMMSS}_{Description}.php`

## Important

- SQLite is used in dev/test. PostgreSQL in prod.
- Always review generated SQL before applying.
- Entity mapping is in `src/Shared/Entity/` (attribute-based).
- Run `php bin/console cache:clear` after schema changes.
