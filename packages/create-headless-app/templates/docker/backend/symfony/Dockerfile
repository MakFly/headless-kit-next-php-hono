# syntax=docker/dockerfile:1.7
ARG FRANKENPHP_VERSION=1-php8.4

FROM dunglas/frankenphp:${FRANKENPHP_VERSION} AS base
WORKDIR /app

RUN install-php-extensions \
        pdo_sqlite \
        intl \
        zip \
        opcache \
        apcu \
        ctype \
        iconv \
        gmp \
    && curl -sS https://getcomposer.org/installer \
        | php -- --install-dir=/usr/local/bin --filename=composer \
    && apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

FROM base AS deps
COPY composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

FROM base AS runtime
COPY --from=deps /app/vendor ./vendor
COPY . .
RUN composer dump-autoload --optimize --no-dev --no-interaction --classmap-authoritative

RUN mkdir -p var/cache var/log /app/data \
    && chown -R www-data:www-data var /app/data

ENV APP_ENV=prod \
    APP_DEBUG=0 \
    DATABASE_URL=sqlite:////app/data/{{PROJECT_NAME}}.db \
    DB_PATH=/app/data/{{PROJECT_NAME}}.db \
    SERVER_NAME=":8001"

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8001/health || exit 1

ENTRYPOINT ["entrypoint"]
CMD ["frankenphp", "php-server", "--root", "/app/public", "--listen", ":8001"]
