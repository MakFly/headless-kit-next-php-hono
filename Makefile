.PHONY: help install install-web install-api install-api-sf install-api-hono api api-reset api-sf api-sf-reset api-sf-user api-hono api-hono-reset api-hono-user

help:
	@echo "Available commands:"
	@echo "  make install         - Install all dependencies (bun + composer)"
	@echo "  make install-web    - Install web dependencies"
	@echo "  make install-api    - Install Laravel API dependencies"
	@echo "  make install-api-sf - Install Symfony API dependencies"
	@echo "  make install-api-hono - Install Hono API dependencies"
	@echo ""
	@echo "  make api            - Start Laravel API server (port 8000)"
	@echo "  make api-reset      - Reset Laravel API database + seed"
	@echo "  make api-sf         - Start Symfony API server (port 8002)"
	@echo "  make api-sf-reset   - Reset Symfony API database + create users"
	@echo "  make api-sf-user    - Create test user in Symfony API"
	@echo "  make api-hono       - Start Hono API server (port 8003)"
	@echo "  make api-hono-reset - Reset Hono API database + seed"

# Installation commands
install: install-web install-api install-api-sf install-api-hono
	@echo ""
	@echo "✓ All dependencies installed"

install-web:
	@echo "Installing web dependencies..."
	cd apps/web && bun install
	cd apps/web-tanstack && bun install || true

install-api:
	@echo "Installing Laravel API dependencies..."
	cd apps/api && composer install --no-interaction

install-api-sf:
	@echo "Installing Symfony API dependencies..."
	cd apps/api-sf && cp -n .env.example .env || true
	cd apps/api-sf && composer install --ignore-platform-req=ext-gmp --no-interaction

install-api-hono:
	@echo "Installing Hono API dependencies..."
	cd apps/api-hono && bun install

# Laravel API (port 8000) - Test users: admin@example.com / Admin1234!
api:
	cd apps/api && php artisan serve --port=8000

api-reset:
	cd apps/api && php artisan migrate:fresh --seed --force
	@echo ""
	@echo "Test accounts (password: Admin1234!):"
	@echo "  - admin@example.com (admin)"
	@echo "  - test@test.com (user)"
	@echo "  - refresh-test@example.com (user)"

# Symfony API (port 8002) - Test users: admin@example.com / Admin1234!
api-sf:
	cd apps/api-sf && cp -n .env.example .env || true
	cd apps/api-sf && composer install --ignore-platform-req=ext-gmp --no-interaction
	cd apps/api-sf && symfony server:start --port=8002 --no-tls

api-sf-reset:
	cd apps/api-sf && rm -f var/data_dev.db
	cd apps/api-sf && php bin/console doctrine:schema:create
	cd apps/api-sf && php bin/console doctrine:fixtures:load --no-interaction
	@echo ""
	@echo "Test accounts:"
	@echo "  - admin@example.com / Admin1234! (ADMIN)"
	@echo "  - test@test.com / Test1234! (USER)"
	@echo "  - refresh-test@example.com / Refresh1234! (USER)"

api-sf-user:
	@echo "Use 'make api-sf-reset' to recreate the database with test users"
	@echo "Test accounts:"
	@echo "  - admin@example.com / Admin1234! (ADMIN)"
	@echo "  - test@test.com / Test1234!"

# Hono API (port 8003) - Test users: admin@example.com / Admin1234!
api-hono:
	cd apps/api-hono && bun run dev

api-hono-reset:
	cd apps/api-hono && rm -f data.db
	cd apps/api-hono && bun run db:push
	cd apps/api-hono && bun run db:seed
	@echo ""
	@echo "Test accounts:"
	@echo "  - admin@example.com / Admin1234! (admin)"
	@echo "  - test@test.com / Test1234! (user)"
	@echo "  - refresh-test@example.com / Refresh1234! (user)"
