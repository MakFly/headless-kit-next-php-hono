#!/bin/sh
set -e

# Wait for DB is handled by depends_on healthcheck in docker-compose.
# Run migrations on first startup.

echo "Running database migrations..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

echo "Warming up cache..."
php bin/console cache:warmup --env=prod

echo "Starting Symfony..."
exec "$@"
