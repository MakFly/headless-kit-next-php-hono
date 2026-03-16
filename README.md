# Headless Kit

A multi-backend headless starter kit with a **BFF (Backend For Frontend)** architecture. Pick your frontend, pick your backend — everything communicates through a secure BFF proxy.

```
Browser ──→ Next.js BFF (port 3001) ──→ Laravel API  (port 8000)
                                    ──→ Symfony API  (port 8002)
                                    ──→ Hono API     (port 8003)

Browser ──→ TanStack Start (port 3003) ──→ (same backends)
```

## Architecture

The frontend **never contacts backends directly**. All requests go through BFF Route Handlers (`/api/v1/*`) that handle:

- **HMAC signing** — requests are signed with a shared secret to prevent forgery
- **Cookie management** — auth tokens stored in HttpOnly cookies (XSS-safe)
- **Token refresh** — proactive (Edge middleware) and reactive (on 401) refresh
- **Path transformation** — BFF paths mapped to backend-specific routes
- **CSRF protection** — Origin/Referer validation on mutating methods

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo + Bun workspaces |
| **Frontend** | Next.js 16 (App Router, React 19) / TanStack Start (Vite) |
| **Backend** | Laravel 12 / Symfony 8 / Hono 4 (Bun) |
| **Auth** | BetterAuth (Laravel + Symfony) / JWT HS256 (Hono) |
| **ORM** | Eloquent / Doctrine / Drizzle |
| **UI** | shadcn/ui + Tailwind CSS + Radix UI |
| **AI** | Vercel AI SDK v6 (Anthropic, OpenAI, Google, Mistral) |
| **State** | Zustand (client) / TanStack Query (opt-in) |
| **Docs** | Astro Starlight |
| **CLI** | `create-headless-app` scaffolder |

## Monorepo Structure

```
apps/
├── web/              # Next.js 16 BFF — port 3001
├── web-tanstack/     # TanStack Start — port 3003
├── api-laravel/      # Laravel 12 + BetterAuth — port 8000
├── api-sf/           # Symfony 8 + BetterAuth (Paseto V4) — port 8002
├── api-hono/         # Hono 4 + Drizzle + Bun — port 8003
├── landing/          # Astro landing page — port 4000
└── docs/             # Astro Starlight docs — port 4001

packages/
└── create-headless-app/  # CLI scaffolder
```

## Features

Each backend implements the same feature set:

| Feature | Description |
|---------|-------------|
| **Auth** | Register, login, logout, refresh, 2FA (Symfony), password reset |
| **Shop** | Products, categories, cart, orders, checkout |
| **Admin** | Dashboard, RBAC (users/roles/permissions), analytics |
| **SaaS** | Multi-tenant orgs, plans, billing, team, usage |
| **Support** | Conversations, messages, canned responses, agent queue |
| **AI Chat** | Multi-provider streaming chat (Next.js only) |

## Prerequisites

- **Bun** (package manager + Hono runtime)
- **PHP 8.4+** with `pdo_sqlite`, `mbstring`, `xml`, `intl`
- **Composer**

## Quick Start

```bash
# Install all dependencies
bun install

# Pick a frontend + backend combo:
bun run dev:next-laravel       # Next.js + Laravel
bun run dev:next-sf            # Next.js + Symfony
bun run dev:next-hono          # Next.js + Hono
bun run dev:tanstack-laravel   # TanStack + Laravel
bun run dev:tanstack-sf        # TanStack + Symfony
bun run dev:tanstack-hono      # TanStack + Hono

# Or run everything:
bun run dev:all
```

### Backend Setup

```bash
# Laravel
cd apps/api-laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Symfony
cd apps/api-sf
composer install
php bin/console doctrine:migrations:migrate

# Hono
cd apps/api-hono
bun run db:migrate
bun run db:seed
```

## Environment Variables

### Next.js BFF (`apps/web/.env.local`)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
LARAVEL_API_URL=http://localhost:8000
SYMFONY_API_URL=http://localhost:8002
NODE_API_URL=http://localhost:8003
AUTH_BACKEND=laravel          # laravel | symfony | node
BFF_SECRET=your-secret-key
```

### Laravel (`apps/api-laravel/.env`)

```env
APP_URL=http://localhost:8000
SANCTUM_STATEFUL_DOMAINS=localhost:3001
```

### Symfony (`apps/api-sf/.env`)

```env
DATABASE_URL="sqlite:///%kernel.project_dir%/var/data_dev.db"
BETTER_AUTH_SECRET=change_me_in_production
FRONTEND_URL=http://localhost:3001
```

### Hono (`apps/api-hono/.env`)

```env
PORT=8003
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3003
```

## Auth Comparison

| Backend | Auth Library | Token Format | 2FA | Password Reset |
|---------|-------------|--------------|-----|----------------|
| Laravel | BetterAuth | Bearer | No | In progress |
| Symfony | BetterAuth | Paseto V4 | Yes | Yes |
| Hono | jose | JWT HS256 | No | No |

### Standardized Auth Endpoints

All backends expose the same contract under `/api/v1/auth/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register` | POST | Sign up |
| `/login` | POST | Sign in |
| `/me` | GET | Current user |
| `/refresh` | POST | Refresh token |
| `/logout` | POST | Sign out |

## Tests

```bash
# Laravel
cd apps/api-laravel && php artisan test

# Symfony (129 tests)
cd apps/api-sf && php bin/phpunit

# Hono
cd apps/api-hono && bun test

# TanStack
cd apps/web-tanstack && bun run test
```

## Build

```bash
bun run build          # Build all apps
bun run lint           # Lint all apps
```

## API Response Envelope

All backends use the same response format:

```json
{
  "success": true,
  "data": { "..." },
  "status": 200,
  "request_id": "abc123"
}
```

## License

MIT
