---
name: lara-migration
description: Create and run Laravel database migrations. Use when schema changes are needed.
argument-hint: [description]
disable-model-invocation: true
---

# Laravel Migrations

## Steps

1. Create migration: `php artisan make:migration {description}`
2. Edit the generated file in `database/migrations/`
3. Run: `php artisan migrate`
4. For rollback: `php artisan migrate:rollback`

## Convention

- Table names: plural snake_case (e.g., `team_members`)
- Foreign keys: `{table}_id` convention
- Use `uuid` type for IDs: `$table->uuid('id')->primary()`
- Always add `$table->timestamps()`

## Important

- SQLite in dev/test, MySQL/PostgreSQL in prod
- Always test migration + rollback before committing
- Run `php artisan migrate:fresh --seed` to reset and reseed
