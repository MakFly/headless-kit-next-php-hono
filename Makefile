# ============================================================================
# Headless Kit — Development Makefile
# ============================================================================

C_RESET   := \033[0m
C_BOLD    := \033[1m
C_DIM     := \033[2m
C_GREEN   := \033[32m
C_CYAN    := \033[36m
C_YELLOW  := \033[33m
C_RED     := \033[31m
C_MAGENTA := \033[35m
C_BLUE    := \033[34m

CLI_DIR   := packages/create-headless-app
TMP_DIR   := /tmp/headless-test

.PHONY: help install build lint test clean \
        dev-next-laravel dev-next-hono dev-next-sf \
        dev-tanstack-laravel dev-tanstack-hono dev-tanstack-sf \
        dev-all dev-landing dev-docs \
        api-reset api-sf-reset api-hono-reset \
        qa qa-hono qa-laravel qa-sf qa-lint \
        cli-build cli-test cli-try cli-try-all cli-clean \
        cli-try-admin cli-try-landing cli-try-saas cli-try-ecommerce cli-try-none

# ============================================================================
# Help
# ============================================================================

help:
	@echo ""
	@echo "  $(C_BOLD)$(C_CYAN)━━━ Headless Kit ━━━$(C_RESET)"
	@echo ""
	@echo "  $(C_BOLD)Dev Servers$(C_RESET)  $(C_DIM)frontend + backend en parallele$(C_RESET)"
	@echo ""
	@echo "  $(C_BOLD)  Next.js :3300$(C_RESET)"
	@echo "  $(C_GREEN)dev-next-hono$(C_RESET)        Next.js + Hono    $(C_DIM):3333$(C_RESET)"
	@echo "  $(C_GREEN)dev-next-laravel$(C_RESET)     Next.js + Laravel $(C_DIM):8002$(C_RESET)"
	@echo "  $(C_GREEN)dev-next-sf$(C_RESET)          Next.js + Symfony $(C_DIM):8001$(C_RESET)"
	@echo ""
	@echo "  $(C_BOLD)  TanStack :3301$(C_RESET)"
	@echo "  $(C_GREEN)dev-tanstack-hono$(C_RESET)     TanStack + Hono    $(C_DIM):3333$(C_RESET)"
	@echo "  $(C_GREEN)dev-tanstack-laravel$(C_RESET)  TanStack + Laravel $(C_DIM):8002$(C_RESET)"
	@echo "  $(C_GREEN)dev-tanstack-sf$(C_RESET)       TanStack + Symfony $(C_DIM):8001$(C_RESET)"
	@echo ""
	@echo "  $(C_GREEN)dev-all$(C_RESET)              Tout $(C_DIM)(6 apps)$(C_RESET)"
	@echo ""
	@echo "  $(C_BOLD)  Sites$(C_RESET)"
	@echo "  $(C_GREEN)dev-landing$(C_RESET)          Landing page  $(C_DIM):4000$(C_RESET)"
	@echo "  $(C_GREEN)dev-docs$(C_RESET)             Documentation $(C_DIM):4001$(C_RESET)"
	@echo ""
	@echo "  $(C_BOLD)QA$(C_RESET)  $(C_DIM)lint + analyse + tests$(C_RESET)"
	@echo "  $(C_GREEN)qa$(C_RESET)                   Tous les checks $(C_DIM)(lint + hono + laravel + sf)$(C_RESET)"
	@echo "  $(C_GREEN)qa-lint$(C_RESET)              Lint TS $(C_DIM)(turbo)$(C_RESET) + PHP $(C_DIM)(pint + cs-fixer)$(C_RESET)"
	@echo "  $(C_GREEN)qa-hono$(C_RESET)              Hono tests $(C_DIM)(bun test)$(C_RESET)"
	@echo "  $(C_GREEN)qa-laravel$(C_RESET)           Pint + Larastan + PHPUnit"
	@echo "  $(C_GREEN)qa-sf$(C_RESET)                CS-Fixer + PHPStan + PHPUnit"
	@echo ""
	@echo "  $(C_BOLD)Setup$(C_RESET)"
	@echo "  $(C_GREEN)install$(C_RESET)              Install all deps $(C_DIM)(bun + composer)$(C_RESET)"
	@echo "  $(C_GREEN)build$(C_RESET)                Build all packages"
	@echo "  $(C_GREEN)lint$(C_RESET)                 Lint"
	@echo "  $(C_GREEN)test$(C_RESET)                 Run all tests"
	@echo "  $(C_GREEN)clean$(C_RESET)                Remove node_modules + dist"
	@echo ""
	@echo "  $(C_BOLD)DB Reset$(C_RESET)  $(C_DIM)fresh + seed$(C_RESET)"
	@echo "  $(C_GREEN)api-reset$(C_RESET)            Laravel  $(C_DIM)(migrate:fresh --seed)$(C_RESET)"
	@echo "  $(C_GREEN)api-sf-reset$(C_RESET)         Symfony  $(C_DIM)(schema:create + fixtures)$(C_RESET)"
	@echo "  $(C_GREEN)api-hono-reset$(C_RESET)       Hono     $(C_DIM)(db:push + seed)$(C_RESET)"
	@echo ""
	@echo "  $(C_BOLD)CLI$(C_RESET)  $(C_DIM)(create-headless-app)$(C_RESET)"
	@echo "  $(C_GREEN)cli-build$(C_RESET)            Build the CLI"
	@echo "  $(C_GREEN)cli-test$(C_RESET)             Unit tests"
	@echo "  $(C_GREEN)cli-try$(C_RESET)              Interactive $(C_DIM)(opens prompts)$(C_RESET)"
	@echo "  $(C_GREEN)cli-try-saas$(C_RESET)         $(C_YELLOW)Recommended$(C_RESET) — SaaS + Next.js + Laravel"
	@echo "  $(C_GREEN)cli-try-admin$(C_RESET)        Admin + Next.js + Laravel"
	@echo "  $(C_GREEN)cli-try-landing$(C_RESET)      Landing + Next.js + Laravel"
	@echo "  $(C_GREEN)cli-try-ecommerce$(C_RESET)    Ecommerce + TanStack + Hono"
	@echo "  $(C_GREEN)cli-try-none$(C_RESET)         Minimal + Next.js + Hono"
	@echo "  $(C_GREEN)cli-try-all$(C_RESET)          ALL 10 combos"
	@echo "  $(C_GREEN)cli-clean$(C_RESET)            Remove $(C_DIM)$(TMP_DIR)$(C_RESET)"
	@echo ""
	@echo "  $(C_BOLD)$(C_YELLOW)Quick start:$(C_RESET)"
	@echo "    make install            $(C_DIM)# une seule fois$(C_RESET)"
	@echo "    make api-hono-reset     $(C_DIM)# init la DB Hono$(C_RESET)"
	@echo "    make dev-next-hono      $(C_DIM)# lance Next.js :3300 + Hono :3333$(C_RESET)"
	@echo ""

# ============================================================================
# Dev Servers — frontend x backend
# ============================================================================

dev-next-laravel:
	@echo "  $(C_CYAN)►$(C_RESET) $(C_BOLD)Next.js$(C_RESET) $(C_DIM):3300$(C_RESET)  +  $(C_BOLD)Laravel$(C_RESET) $(C_DIM):8002$(C_RESET)"
	@bun run dev:next-laravel

dev-next-hono:
	@echo "  $(C_CYAN)►$(C_RESET) $(C_BOLD)Next.js$(C_RESET) $(C_DIM):3300$(C_RESET)  +  $(C_BOLD)Hono$(C_RESET) $(C_DIM):3333$(C_RESET)"
	@bun run dev:next-hono

dev-next-sf:
	@echo "  $(C_CYAN)►$(C_RESET) $(C_BOLD)Next.js$(C_RESET) $(C_DIM):3300$(C_RESET)  +  $(C_BOLD)Symfony$(C_RESET) $(C_DIM):8001$(C_RESET)"
	@bun run dev:next-sf

dev-tanstack-laravel:
	@echo "  $(C_CYAN)►$(C_RESET) $(C_BOLD)TanStack$(C_RESET) $(C_DIM):3301$(C_RESET)  +  $(C_BOLD)Laravel$(C_RESET) $(C_DIM):8002$(C_RESET)"
	@bun run dev:tanstack-laravel

dev-tanstack-hono:
	@echo "  $(C_CYAN)►$(C_RESET) $(C_BOLD)TanStack$(C_RESET) $(C_DIM):3301$(C_RESET)  +  $(C_BOLD)Hono$(C_RESET) $(C_DIM):3333$(C_RESET)"
	@bun run dev:tanstack-hono

dev-tanstack-sf:
	@echo "  $(C_CYAN)►$(C_RESET) $(C_BOLD)TanStack$(C_RESET) $(C_DIM):3301$(C_RESET)  +  $(C_BOLD)Symfony$(C_RESET) $(C_DIM):8001$(C_RESET)"
	@bun run dev:tanstack-sf

dev-all:
	@echo "  $(C_CYAN)►$(C_RESET) All apps"
	@bun run dev:all

dev-landing:
	@echo "  $(C_CYAN)►$(C_RESET) $(C_BOLD)Landing$(C_RESET) $(C_DIM):4000$(C_RESET)"
	@cd apps/landing && bun run dev

dev-docs:
	@echo "  $(C_CYAN)►$(C_RESET) $(C_BOLD)Docs$(C_RESET) $(C_DIM):4001$(C_RESET)"
	@cd apps/docs && bun run dev

# ============================================================================
# QA — lint + analyse + tests
# ============================================================================

qa: qa-lint qa-hono qa-laravel qa-sf
	@echo ""
	@echo "  $(C_GREEN)$(C_BOLD)✓ All QA checks passed$(C_RESET)"
	@echo ""

qa-lint:
	@echo ""
	@echo "  $(C_CYAN)━━━ Lint TS (Turbo) ━━━$(C_RESET)"
	@bun run lint
	@echo "  $(C_CYAN)━━━ Lint PHP (Laravel — Pint) ━━━$(C_RESET)"
	@cd apps/api-laravel && composer lint
	@echo "  $(C_CYAN)━━━ Lint PHP (Symfony — CS-Fixer) ━━━$(C_RESET)"
	@cd apps/api-sf && composer lint
	@echo "  $(C_GREEN)✓$(C_RESET) All lint passed"

qa-hono:
	@echo ""
	@echo "  $(C_CYAN)━━━ Hono ━━━$(C_RESET)"
	@cd apps/api-hono && bun test
	@echo "  $(C_GREEN)✓$(C_RESET) Hono tests passed"

qa-laravel:
	@echo ""
	@echo "  $(C_CYAN)━━━ Laravel ━━━$(C_RESET)"
	@cd apps/api-laravel && composer lint
	@cd apps/api-laravel && composer analyse
	@cd apps/api-laravel && php artisan test
	@echo "  $(C_GREEN)✓$(C_RESET) Laravel QA passed"

qa-sf:
	@echo ""
	@echo "  $(C_CYAN)━━━ Symfony ━━━$(C_RESET)"
	@cd apps/api-sf && composer lint
	@cd apps/api-sf && php bin/console cache:warmup --env=dev 2>/dev/null
	@cd apps/api-sf && composer analyse
	@cd apps/api-sf && php bin/phpunit
	@echo "  $(C_GREEN)✓$(C_RESET) Symfony QA passed"

# ============================================================================
# Setup
# ============================================================================

install:
	@echo "  $(C_CYAN)►$(C_RESET) Installing bun dependencies..."
	@bun install
	@echo "  $(C_CYAN)►$(C_RESET) Installing Laravel (composer)..."
	@cd apps/api-laravel && composer install --no-interaction 2>/dev/null || echo "  $(C_YELLOW)⚠$(C_RESET) Laravel: composer install failed (php/composer needed)"
	@echo "  $(C_CYAN)►$(C_RESET) Installing Symfony (composer)..."
	@cd apps/api-sf && cp -n .env.example .env 2>/dev/null || true
	@cd apps/api-sf && composer install --ignore-platform-req=ext-gmp --no-interaction 2>/dev/null || echo "  $(C_YELLOW)⚠$(C_RESET) Symfony: composer install failed (php/composer needed)"
	@echo ""
	@echo "  $(C_GREEN)✓$(C_RESET) Dependencies installed"

build:
	@echo "  $(C_CYAN)►$(C_RESET) Building..."
	@bun run build
	@echo "  $(C_GREEN)✓$(C_RESET) Build complete"

lint:
	@bun run lint

test:
	@echo "  $(C_CYAN)►$(C_RESET) Running tests..."
	@bun run test
	@echo "  $(C_GREEN)✓$(C_RESET) Tests passed"

clean:
	@echo "  $(C_YELLOW)►$(C_RESET) Cleaning..."
	@rm -rf node_modules $(CLI_DIR)/dist
	@echo "  $(C_GREEN)✓$(C_RESET) Clean"

# ============================================================================
# DB Reset
# ============================================================================

api-reset:
	cd apps/api-laravel && php artisan migrate:fresh --seed --force
	@echo ""
	@echo "  $(C_GREEN)✓$(C_RESET) Laravel DB reset"
	@echo "  $(C_DIM)admin@example.com / Admin1234!$(C_RESET)"
	@echo "  $(C_DIM)user@example.com / User1234!$(C_RESET)"

api-sf-reset:
	cd apps/api-sf && rm -f var/data_dev.db
	cd apps/api-sf && php bin/console doctrine:migrations:migrate --no-interaction
	cd apps/api-sf && php bin/console doctrine:fixtures:load --no-interaction
	@echo ""
	@echo "  $(C_GREEN)✓$(C_RESET) Symfony DB reset"
	@echo "  $(C_DIM)admin@example.com / Admin1234!$(C_RESET)"
	@echo "  $(C_DIM)user@example.com / User1234!$(C_RESET)"

api-hono-reset:
	cd apps/api-hono && rm -f data.db
	cd apps/api-hono && bun run db:push
	cd apps/api-hono && bun run db:seed
	@echo ""
	@echo "  $(C_GREEN)✓$(C_RESET) Hono DB reset"
	@echo "  $(C_DIM)admin@example.com / Admin1234!$(C_RESET)"
	@echo "  $(C_DIM)user@example.com / User1234!$(C_RESET)"

# ============================================================================
# CLI — create-headless-app
# ============================================================================

cli-build:
	@echo "  $(C_CYAN)►$(C_RESET) Building CLI..."
	@cd $(CLI_DIR) && bun run build
	@echo "  $(C_GREEN)✓$(C_RESET) CLI built"

cli-test:
	@echo "  $(C_CYAN)►$(C_RESET) Running CLI tests..."
	@cd $(CLI_DIR) && bun test
	@echo "  $(C_GREEN)✓$(C_RESET) CLI tests passed"

cli-try: cli-build
	@echo ""
	@echo "  $(C_BOLD)$(C_MAGENTA)Testing create-headless-app interactively$(C_RESET)"
	@echo "  $(C_DIM)Output: $(TMP_DIR)/$(C_RESET)"
	@echo ""
	@mkdir -p $(TMP_DIR)
	@cd $(TMP_DIR) && bun $(CURDIR)/$(CLI_DIR)/src/index.ts

cli-try-admin: cli-build
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=admin FRONTEND=nextjs BACKEND=laravel NAME=my-admin

cli-try-landing: cli-build
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=landing FRONTEND=nextjs BACKEND=laravel NAME=my-landing

cli-try-saas: cli-build
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=saas FRONTEND=nextjs BACKEND=laravel NAME=my-saas

cli-try-ecommerce: cli-build
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=ecommerce FRONTEND=tanstack BACKEND=hono NAME=my-shop

cli-try-none: cli-build
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=none FRONTEND=nextjs BACKEND=hono NAME=my-bare

cli-try-all: cli-build
	@echo ""
	@echo "  $(C_BOLD)$(C_MAGENTA)Running ALL preset tests$(C_RESET)"
	@echo ""
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=admin      FRONTEND=nextjs   BACKEND=laravel NAME=test-admin-nj
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=admin      FRONTEND=tanstack BACKEND=laravel NAME=test-admin-ts
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=landing    FRONTEND=nextjs   BACKEND=laravel NAME=test-landing-nj
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=landing    FRONTEND=tanstack BACKEND=hono    NAME=test-landing-ts
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=saas       FRONTEND=nextjs   BACKEND=laravel NAME=test-saas-nj
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=saas       FRONTEND=tanstack BACKEND=symfony NAME=test-saas-ts
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=ecommerce  FRONTEND=nextjs   BACKEND=laravel NAME=test-ecom-nj
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=ecommerce  FRONTEND=tanstack BACKEND=hono    NAME=test-ecom-ts
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=none       FRONTEND=nextjs   BACKEND=hono    NAME=test-none-nj
	@$(MAKE) --no-print-directory _cli-scaffold PRESET=none       FRONTEND=tanstack BACKEND=hono    NAME=test-none-ts
	@echo "  $(C_GREEN)$(C_BOLD)✓ All 10 preset combinations passed$(C_RESET)"
	@echo ""

cli-clean:
	@echo "  $(C_YELLOW)►$(C_RESET) Cleaning $(TMP_DIR)..."
	@rm -rf $(TMP_DIR)
	@echo "  $(C_GREEN)✓$(C_RESET) Test output cleaned"

# ============================================================================
# Internal
# ============================================================================

_cli-scaffold:
	@echo "  $(C_BLUE)┌$(C_RESET) $(C_BOLD)$(PRESET)$(C_RESET) + $(FRONTEND) + $(BACKEND) $(C_DIM)→ $(NAME)$(C_RESET)"
	@rm -rf $(TMP_DIR)/$(NAME)
	@mkdir -p $(TMP_DIR)
	@cd $(TMP_DIR) && node -e " \
		const { scaffold } = await import('$(CURDIR)/$(CLI_DIR)/dist/scaffold.js'); \
		await scaffold({ \
			projectName: '$(NAME)', \
			backend: '$(BACKEND)', \
			frontend: '$(FRONTEND)', \
			features: ['rbac'], \
			database: 'sqlite', \
			preset: '$(PRESET)', \
		}); \
	"
	@$(MAKE) --no-print-directory _cli-verify DIR=$(TMP_DIR)/$(NAME) PRESET=$(PRESET)

_cli-verify:
	@_ok=true; \
	if [ ! -f $(DIR)/apps/web/package.json ]; then \
		echo "  $(C_RED)│$(C_RESET)  $(C_RED)✗$(C_RESET) apps/web/package.json missing"; _ok=false; \
	fi; \
	if [ ! -d $(DIR)/apps/api ]; then \
		echo "  $(C_RED)│$(C_RESET)  $(C_RED)✗$(C_RESET) apps/api missing"; _ok=false; \
	fi; \
	if grep -rq 'workspace:' $(DIR)/apps/web/package.json 2>/dev/null; then \
		echo "  $(C_RED)│$(C_RESET)  $(C_RED)✗$(C_RESET) Found workspace:* refs"; _ok=false; \
	fi; \
	if grep -rq '@headless/' $(DIR)/apps/web/src/ 2>/dev/null; then \
		echo "  $(C_RED)│$(C_RESET)  $(C_RED)✗$(C_RESET) Found @headless/* imports"; _ok=false; \
	fi; \
	if grep -rqE '\{\{[A-Z_]+\}\}' $(DIR)/apps/web/src/ 2>/dev/null; then \
		echo "  $(C_RED)│$(C_RESET)  $(C_RED)✗$(C_RESET) Found unreplaced {{VARS}}"; _ok=false; \
	fi; \
	if [ "$(PRESET)" != "none" ]; then \
		if [ ! -f $(DIR)/apps/web/src/components/ui/button.tsx ]; then \
			echo "  $(C_RED)│$(C_RESET)  $(C_RED)✗$(C_RESET) button.tsx missing"; _ok=false; \
		fi; \
		if [ ! -f $(DIR)/apps/web/components.json ]; then \
			echo "  $(C_RED)│$(C_RESET)  $(C_RED)✗$(C_RESET) components.json missing"; _ok=false; \
		fi; \
	fi; \
	if $$_ok; then \
		echo "  $(C_GREEN)└$(C_RESET)  $(C_GREEN)✓ passed$(C_RESET)"; \
	else \
		echo "  $(C_RED)└$(C_RESET)  $(C_RED)✗ FAILED$(C_RESET)"; exit 1; \
	fi
