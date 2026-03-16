#!/bin/sh
set -e

# Wait for DB is handled by depends_on healthcheck in docker-compose.
# Run migrations and cache warming on first startup.

echo "Running database migrations..."
php artisan migrate --force --no-interaction

echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting Laravel..."
exec "$@"
