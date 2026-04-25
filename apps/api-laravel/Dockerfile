# syntax=docker/dockerfile:1.7
ARG FRANKENPHP_VERSION=1-php8.4

# ---------- base ----------
FROM dunglas/frankenphp:${FRANKENPHP_VERSION} AS base
WORKDIR /app

RUN install-php-extensions \
        pdo_sqlite \
        pdo_mysql \
        pdo_pgsql \
        intl \
        zip \
        opcache \
        apcu \
        bcmath \
        gd \
        gmp \
    && curl -sS https://getcomposer.org/installer \
        | php -- --install-dir=/usr/local/bin --filename=composer \
    && apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

# ---------- deps (prod only) ----------
FROM base AS deps
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

# ---------- runtime ----------
FROM base AS runtime
COPY --from=deps /app/vendor ./vendor
COPY . .
RUN composer dump-autoload --optimize --no-dev --no-interaction

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views \
             storage/logs bootstrap/cache /app/data \
    && chown -R www-data:www-data storage bootstrap/cache /app/data

ENV APP_ENV=production \
    APP_DEBUG=false \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/app/data/laravel.db \
    SESSION_DRIVER=file \
    CACHE_STORE=file \
    QUEUE_CONNECTION=sync \
    LOG_CHANNEL=stderr \
    SERVER_NAME=":8002"

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8002/health || exit 1

ENTRYPOINT ["entrypoint"]
CMD ["frankenphp", "php-server", "--root", "/app/public", "--listen", ":8002"]
