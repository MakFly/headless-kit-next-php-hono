#!/bin/sh
set -eu

cd /app

DATA_DIR="/app/data"
mkdir -p "$DATA_DIR" var/cache var/log
chown -R www-data:www-data "$DATA_DIR" var 2>/dev/null || true

DB_PATH="${DB_PATH:-$DATA_DIR/db.db}"
[ -f "$DB_PATH" ] || touch "$DB_PATH"

if [ "${APP_ENV:-prod}" != "prod" ]; then
    if [ ! -f vendor/autoload.php ]; then
        echo "[entrypoint] composer install (dev)"
        if ! composer install --no-interaction --prefer-dist; then
            echo "[entrypoint] lock out of sync — regenerating with composer update"
            composer update --no-interaction --prefer-dist --no-scripts
        fi
    fi
fi

echo "[entrypoint] running doctrine migrations"
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration || true

if [ "${APP_ENV:-prod}" = "prod" ]; then
    php bin/console cache:warmup --no-debug >/dev/null 2>&1 || true
fi

echo "[entrypoint] exec: $*"
exec "$@"
