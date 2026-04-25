#!/bin/sh
set -eu

cd /app

DB_PATH="${DB_DATABASE:-/app/data/laravel.db}"
DB_DIR="$(dirname "$DB_PATH")"
mkdir -p "$DB_DIR"
[ -f "$DB_PATH" ] || touch "$DB_PATH"

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views \
         storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache "$DB_DIR" 2>/dev/null || true

if [ "${APP_ENV:-production}" != "production" ]; then
    if [ ! -f vendor/autoload.php ]; then
        echo "[entrypoint] composer install (dev)"
        if ! composer install --no-interaction --prefer-dist; then
            echo "[entrypoint] lock out of sync — regenerating with composer update"
            composer update --no-interaction --prefer-dist --no-scripts
        fi
    fi
fi

if [ ! -f .env ]; then
    [ -f .env.example ] && cp .env.example .env || true
fi

if [ -z "${APP_KEY:-}" ]; then
    if [ -f .env ] && ! grep -q "^APP_KEY=base64:" .env; then
        echo "[entrypoint] generating APP_KEY"
        php artisan key:generate --force --no-interaction || true
    fi
fi

echo "[entrypoint] running migrations"
php artisan migrate --force --no-interaction || true

if [ ! -f storage/oauth-private.key ] && php artisan list 2>/dev/null | grep -q "passport:keys"; then
    echo "[entrypoint] generating Passport keys"
    php artisan passport:keys --force --length=4096 --no-interaction || true
fi

if [ "${APP_ENV:-production}" = "production" ]; then
    php artisan config:cache  >/dev/null 2>&1 || true
    php artisan route:cache   >/dev/null 2>&1 || true
fi

echo "[entrypoint] exec: $*"
exec "$@"
