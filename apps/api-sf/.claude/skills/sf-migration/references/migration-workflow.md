# Doctrine migrations

1. `php bin/console doctrine:schema:validate`
2. `php bin/console doctrine:migrations:diff`
3. Review `migrations/Version*.php`
4. `php bin/console doctrine:migrations:migrate --no-interaction`
5. Test env: `APP_ENV=test php bin/console doctrine:migrations:migrate --no-interaction`

## Notes

- SQLite dev/test; PostgreSQL prod
- Entity mapping: `src/Shared/Entity/` (attributes)
- After schema changes: `php bin/console cache:clear`
