# Laravel migrations

## Commands

1. `php artisan make:migration {description}`
2. Edit `database/migrations/`
3. `php artisan migrate` — apply
4. `php artisan migrate:rollback` — rollback

## Conventions

- Tables: plural `snake_case` (e.g. `team_members`)
- FKs: `{table}_id`
- Prefer UUID: `$table->uuid('id')->primary()`
- Always `$table->timestamps()`

## Notes

- SQLite dev/test; MySQL/PostgreSQL prod
- Test up + down before commit
- Full reset: `php artisan migrate:fresh --seed`
