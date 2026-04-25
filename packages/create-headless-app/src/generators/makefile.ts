import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ProjectOptions } from '../prompts.js';

/**
 * Generate a coloured per-project Makefile.
 * Tailored to the chosen frontend, backend, database, and docker flag.
 */
export async function generateMakefile(
  projectDir: string,
  options: ProjectOptions,
): Promise<void> {
  const isLaravel = options.backend === 'laravel';
  const isSymfony = options.backend === 'symfony';
  const isHono = options.backend === 'hono';
  const isPhp = isLaravel || isSymfony;
  const hasDocker = options.docker !== false;
  const isPostgres = options.database === 'postgresql';

  const frontPort = options.frontend === 'nextjs' ? '3300' : '3301';
  const apiPort = isLaravel ? '8002' : isSymfony ? '8001' : '3333';
  const frontLabel = options.frontend === 'nextjs' ? 'Next.js' : 'TanStack';
  const apiLabel = isLaravel ? 'Laravel' : isSymfony ? 'Symfony' : 'Hono';
  const apiColor = isHono ? 'green' : isLaravel ? 'magenta' : 'yellow';

  // ── Per-stack snippets ─────────────────────────────────────────────────
  const installApi = isPhp
    ? '@cd apps/api && composer install --no-interaction'
    : '@cd apps/api && bun install';

  const updateApi = isPhp
    ? '@cd apps/api && composer update --no-interaction'
    : '@cd apps/api && bun update';

  const devApi = isLaravel
    ? `@cd apps/api && php artisan serve --port=${apiPort}`
    : isSymfony
      ? `@cd apps/api && symfony server:start --port=${apiPort} --no-tls`
      : '@cd apps/api && bun run dev';

  const testApi = isLaravel
    ? '@cd apps/api && php artisan test'
    : isSymfony
      ? '@cd apps/api && php bin/phpunit'
      : '@cd apps/api && bun test';

  const lintApi = isPhp
    ? '@cd apps/api && composer lint 2>/dev/null || true'
    : '@cd apps/api && bun run lint 2>/dev/null || true';

  const formatApi = isLaravel
    ? '@cd apps/api && vendor/bin/pint 2>/dev/null || true'
    : isSymfony
      ? '@cd apps/api && vendor/bin/php-cs-fixer fix 2>/dev/null || true'
      : '@cd apps/api && bunx prettier --write "src/**/*.ts" 2>/dev/null || true';

  const routesApi = isLaravel
    ? '@cd apps/api && php artisan route:list'
    : isSymfony
      ? '@cd apps/api && php bin/console debug:router'
      : '@echo "  $(C_DIM)Hono routes are declared inline. Open apps/api/src/index.ts$(C_RESET)"';

  const dbResetApi = isLaravel
    ? `@cd apps/api && php artisan migrate:fresh --seed --force`
    : isSymfony
      ? `@cd apps/api && rm -f var/data_dev.db
\t@cd apps/api && php bin/console doctrine:migrations:migrate --no-interaction
\t@cd apps/api && php bin/console doctrine:fixtures:load --no-interaction`
      : `@cd apps/api && rm -f data.db
\t@cd apps/api && bun run db:push
\t@cd apps/api && bun run db:seed`;

  const seedApi = isLaravel
    ? '@cd apps/api && php artisan db:seed --force'
    : isSymfony
      ? '@cd apps/api && php bin/console doctrine:fixtures:load --no-interaction --append'
      : '@cd apps/api && bun run db:seed';

  const dbShellCmd = isPostgres
    ? `@docker compose exec db psql -U postgres ${options.projectName}`
    : isLaravel
      ? '@cd apps/api && sqlite3 database/database.sqlite'
      : isSymfony
        ? '@cd apps/api && sqlite3 var/data_dev.db'
        : '@cd apps/api && sqlite3 data.db';

  // ── Docker section (conditional) ───────────────────────────────────────
  const dockerSection = hasDocker
    ? `
# ============================================================================
# Docker
# ============================================================================

docker-up:
\t@echo "  $(C_CYAN)►$(C_RESET) Starting Docker stack..."
\t@docker compose -f compose.yml up -d
\t@echo "  $(C_GREEN)✓$(C_RESET) Stack up — $(C_BOLD)http://localhost:${frontPort}$(C_RESET)"

docker-down:
\t@echo "  $(C_YELLOW)►$(C_RESET) Stopping Docker stack..."
\t@docker compose -f compose.yml down

docker-logs:
\t@docker compose -f compose.yml logs -f --tail=100

docker-build:
\t@echo "  $(C_CYAN)►$(C_RESET) Building images..."
\t@docker compose -f compose.yml build
\t@echo "  $(C_GREEN)✓$(C_RESET) Images built"

docker-shell-web:
\t@docker compose -f compose.yml exec web sh

docker-shell-api:
\t@docker compose -f compose.yml exec api ${isPhp ? 'bash' : 'sh'}

docker-prod:
\t@echo "  $(C_MAGENTA)►$(C_RESET) Starting $(C_BOLD)prod$(C_RESET) stack..."
\t@docker compose -f compose.prod.yml up -d
\t@echo "  $(C_GREEN)✓$(C_RESET) Prod stack up"
`
    : '';

  const dockerHelp = hasDocker
    ? `\t@echo "  $(C_BOLD)Docker$(C_RESET)"
\t@echo "  $(C_GREEN)docker-up$(C_RESET)        Start dev stack $(C_DIM)(detached)$(C_RESET)"
\t@echo "  $(C_GREEN)docker-down$(C_RESET)      Stop & remove containers"
\t@echo "  $(C_GREEN)docker-logs$(C_RESET)      Tail container logs"
\t@echo "  $(C_GREEN)docker-build$(C_RESET)     Rebuild images"
\t@echo "  $(C_GREEN)docker-shell-web$(C_RESET) Open shell in web container"
\t@echo "  $(C_GREEN)docker-shell-api$(C_RESET) Open shell in api container"
\t@echo "  $(C_GREEN)docker-prod$(C_RESET)      Run prod stack $(C_DIM)(compose.prod.yml)$(C_RESET)"
\t@echo ""
`
    : '';

  const dockerPhony = hasDocker
    ? ' \\\n        docker-up docker-down docker-logs docker-build docker-shell-web docker-shell-api docker-prod'
    : '';

  // ── Final Makefile ─────────────────────────────────────────────────────
  const content = `# ============================================================================
# ${options.projectName} — Makefile
# Frontend: ${frontLabel} (:${frontPort})  ·  Backend: ${apiLabel} (:${apiPort})
# Database: ${options.database}${hasDocker ? '  ·  Docker: yes' : ''}
# Generated by create-headless-app
# ============================================================================

C_RESET   := \\033[0m
C_BOLD    := \\033[1m
C_DIM     := \\033[2m
C_GREEN   := \\033[32m
C_CYAN    := \\033[36m
C_YELLOW  := \\033[33m
C_RED     := \\033[31m
C_MAGENTA := \\033[35m
C_BLUE    := \\033[34m

.PHONY: help setup install update build clean \\
        dev dev-web dev-api stop \\
        lint format typecheck test \\
        db-reset db-seed db-shell routes health urls open${dockerPhony}

# ============================================================================
# Help (default target)
# ============================================================================

help:
\t@echo ""
\t@echo "  $(C_BOLD)$(C_CYAN)━━━ ${options.projectName} ━━━$(C_RESET)"
\t@echo "  $(C_DIM)${frontLabel} :${frontPort}  +  ${apiLabel} :${apiPort}  ·  ${options.database}$(C_RESET)"
\t@echo ""
\t@echo "  $(C_BOLD)$(C_YELLOW)First time? Run:$(C_RESET) $(C_BOLD)make setup$(C_RESET)"
\t@echo ""
\t@echo "  $(C_BOLD)Setup$(C_RESET)"
\t@echo "  $(C_GREEN)setup$(C_RESET)            Full bootstrap $(C_DIM)(install + db-reset + urls)$(C_RESET)"
\t@echo "  $(C_GREEN)install$(C_RESET)          Install all deps $(C_DIM)(web + api)$(C_RESET)"
\t@echo "  $(C_GREEN)update$(C_RESET)           Update dependencies"
\t@echo "  $(C_GREEN)build$(C_RESET)            Build frontend"
\t@echo "  $(C_GREEN)clean$(C_RESET)            Remove node_modules + build output"
\t@echo ""
\t@echo "  $(C_BOLD)Dev$(C_RESET)"
\t@echo "  $(C_GREEN)dev$(C_RESET)              Run web + api in parallel"
\t@echo "  $(C_GREEN)dev-web$(C_RESET)          Frontend only $(C_DIM):${frontPort}$(C_RESET)"
\t@echo "  $(C_GREEN)dev-api$(C_RESET)          Backend only $(C_DIM):${apiPort}$(C_RESET)"
\t@echo "  $(C_GREEN)stop$(C_RESET)             Kill processes on dev ports"
\t@echo ""
\t@echo "  $(C_BOLD)QA$(C_RESET)"
\t@echo "  $(C_GREEN)lint$(C_RESET)             Lint web + api"
\t@echo "  $(C_GREEN)format$(C_RESET)           Auto-format code"
\t@echo "  $(C_GREEN)typecheck$(C_RESET)        TypeScript check $(C_DIM)(web)$(C_RESET)"
\t@echo "  $(C_GREEN)test$(C_RESET)             Run all tests"
\t@echo ""
\t@echo "  $(C_BOLD)Database$(C_RESET)"
\t@echo "  $(C_GREEN)db-reset$(C_RESET)         Reset DB + seed $(C_DIM)(${apiLabel})$(C_RESET)"
\t@echo "  $(C_GREEN)db-seed$(C_RESET)          Re-run seeders only"
\t@echo "  $(C_GREEN)db-shell$(C_RESET)         Open ${isPostgres ? 'psql' : 'sqlite3'} shell"
\t@echo ""
\t@echo "  $(C_BOLD)Inspect$(C_RESET)"
\t@echo "  $(C_GREEN)routes$(C_RESET)           List API routes"
\t@echo "  $(C_GREEN)health$(C_RESET)           Curl /health on web + api"
\t@echo "  $(C_GREEN)urls$(C_RESET)             Print all URLs + test credentials"
\t@echo "  $(C_GREEN)open$(C_RESET)             Open the app in your browser"
\t@echo ""
${dockerHelp}\t@echo ""

# ============================================================================
# Setup
# ============================================================================

setup: install db-reset urls
\t@echo ""
\t@echo "  $(C_GREEN)$(C_BOLD)✓ Setup complete — run $(C_RESET)$(C_BOLD)make dev$(C_RESET)$(C_GREEN)$(C_BOLD) to start$(C_RESET)"
\t@echo ""

install:
\t@echo "  $(C_CYAN)►$(C_RESET) Installing $(C_BOLD)web$(C_RESET) deps..."
\t@cd apps/web && bun install
\t@echo "  $(C_CYAN)►$(C_RESET) Installing $(C_BOLD)api$(C_RESET) deps..."
\t${installApi}
\t@echo "  $(C_GREEN)✓$(C_RESET) Dependencies installed"

update:
\t@echo "  $(C_CYAN)►$(C_RESET) Updating $(C_BOLD)web$(C_RESET)..."
\t@cd apps/web && bun update
\t@echo "  $(C_CYAN)►$(C_RESET) Updating $(C_BOLD)api$(C_RESET)..."
\t${updateApi}
\t@echo "  $(C_GREEN)✓$(C_RESET) Dependencies updated"

build:
\t@echo "  $(C_CYAN)►$(C_RESET) Building frontend..."
\t@cd apps/web && bun run build
\t@echo "  $(C_GREEN)✓$(C_RESET) Build complete"

clean:
\t@echo "  $(C_YELLOW)►$(C_RESET) Cleaning..."
\t@rm -rf apps/web/node_modules apps/web/.next apps/web/.output apps/web/dist
\t@rm -rf apps/api/node_modules apps/api/vendor apps/api/var/cache
\t@echo "  $(C_GREEN)✓$(C_RESET) Clean"

# ============================================================================
# Dev
# ============================================================================

dev:
\t@echo "  $(C_CYAN)►$(C_RESET) $(C_BOLD)${frontLabel}$(C_RESET) $(C_DIM):${frontPort}$(C_RESET)  +  $(C_BOLD)${apiLabel}$(C_RESET) $(C_DIM):${apiPort}$(C_RESET)"
\t@bunx concurrently -n web,api -c cyan,${apiColor} \\
\t\t"$(MAKE) --no-print-directory dev-web" \\
\t\t"$(MAKE) --no-print-directory dev-api"

dev-web:
\t@cd apps/web && bun run dev

dev-api:
\t${devApi}

stop:
\t@echo "  $(C_YELLOW)►$(C_RESET) Killing processes on :${frontPort} and :${apiPort}..."
\t@lsof -ti:${frontPort} | xargs kill -9 2>/dev/null || true
\t@lsof -ti:${apiPort} | xargs kill -9 2>/dev/null || true
\t@echo "  $(C_GREEN)✓$(C_RESET) Stopped"

# ============================================================================
# QA
# ============================================================================

lint:
\t@echo "  $(C_CYAN)━━━ Lint web ━━━$(C_RESET)"
\t@cd apps/web && bun run lint 2>/dev/null || true
\t@echo "  $(C_CYAN)━━━ Lint api ━━━$(C_RESET)"
\t${lintApi}
\t@echo "  $(C_GREEN)✓$(C_RESET) Lint passed"

format:
\t@echo "  $(C_CYAN)►$(C_RESET) Formatting web..."
\t@cd apps/web && bunx prettier --write "src/**/*.{ts,tsx}" 2>/dev/null || true
\t@echo "  $(C_CYAN)►$(C_RESET) Formatting api..."
\t${formatApi}
\t@echo "  $(C_GREEN)✓$(C_RESET) Formatted"

typecheck:
\t@echo "  $(C_CYAN)►$(C_RESET) TypeScript check..."
\t@cd apps/web && bunx tsc --noEmit
\t@echo "  $(C_GREEN)✓$(C_RESET) Types OK"

test:
\t@echo "  $(C_CYAN)━━━ Test web ━━━$(C_RESET)"
\t@cd apps/web && bun test 2>/dev/null || true
\t@echo "  $(C_CYAN)━━━ Test api ━━━$(C_RESET)"
\t${testApi}
\t@echo "  $(C_GREEN)✓$(C_RESET) Tests passed"

# ============================================================================
# Database
# ============================================================================

db-reset:
\t@echo "  $(C_YELLOW)►$(C_RESET) Resetting ${apiLabel} database..."
\t${dbResetApi}
\t@echo "  $(C_GREEN)✓$(C_RESET) ${apiLabel} DB reset"
\t@echo "  $(C_DIM)admin@example.com / Admin1234!$(C_RESET)"
\t@echo "  $(C_DIM)user@example.com  / User1234!$(C_RESET)"

db-seed:
\t@echo "  $(C_CYAN)►$(C_RESET) Re-seeding ${apiLabel}..."
\t${seedApi}
\t@echo "  $(C_GREEN)✓$(C_RESET) Seed done"

db-shell:
\t${dbShellCmd}

# ============================================================================
# Inspect
# ============================================================================

routes:
\t@echo "  $(C_CYAN)━━━ ${apiLabel} routes ━━━$(C_RESET)"
\t${routesApi}

health:
\t@echo "  $(C_CYAN)►$(C_RESET) GET http://localhost:${frontPort}/api/health"
\t@curl -fsS http://localhost:${frontPort}/api/health 2>/dev/null && echo "" || echo "  $(C_RED)✗$(C_RESET) web down"
\t@echo "  $(C_CYAN)►$(C_RESET) GET http://localhost:${apiPort}/health"
\t@curl -fsS http://localhost:${apiPort}/health 2>/dev/null && echo "" || echo "  $(C_RED)✗$(C_RESET) api down"

urls:
\t@echo ""
\t@echo "  $(C_BOLD)$(C_CYAN)URLs$(C_RESET)"
\t@echo "  $(C_GREEN)Web:$(C_RESET)        http://localhost:${frontPort}"
\t@echo "  $(C_GREEN)API:$(C_RESET)        http://localhost:${apiPort}"
\t@echo "  $(C_GREEN)Health:$(C_RESET)     http://localhost:${apiPort}/health"
\t@echo ""
\t@echo "  $(C_BOLD)$(C_CYAN)Test credentials$(C_RESET) $(C_DIM)(after make db-reset)$(C_RESET)"
\t@echo "  $(C_GREEN)Admin:$(C_RESET)      admin@example.com / Admin1234!"
\t@echo "  $(C_GREEN)User:$(C_RESET)       user@example.com  / User1234!"
\t@echo ""

open:
\t@open http://localhost:${frontPort} 2>/dev/null || xdg-open http://localhost:${frontPort} 2>/dev/null || echo "  $(C_DIM)Open http://localhost:${frontPort}$(C_RESET)"
${dockerSection}`;

  await fs.writeFile(path.join(projectDir, 'Makefile'), content, 'utf-8');
}
