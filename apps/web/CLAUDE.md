# Next.js BFF (`apps/web`)

## Stack

| | Version |
|-|---------|
| Next.js | 16.1.6 (App Router) |
| React | 19.2.4 |
| TypeScript | 5.7+ |
| Tailwind CSS | 3.4+ |
| shadcn/ui | latest (Radix UI primitives) |
| Zustand | 5.0 |
| TanStack Query | 5.90 (opt-in only) |
| TanStack Table | 8.21 |
| Vercel AI SDK | 6.0 |
| assistant-ui | 0.12 |
| Recharts | 2.15 |
| next-themes | 0.4 |
| Pino | 10.3 |
| Zod | 4.3 |

## Architecture

```
Browser
  │
  ├─ Page navigation → Next.js App Router (SSR / RSC)
  │                         │
  │                         └─ Server Action → BFF client → /api/v1/* → Backend
  │
  └─ Client fetch → /api/v1/* (catch-all route handler)
                         │
                         ├─ Laravel  (port 8002)
                         ├─ Symfony  (port 8001)
                         └─ Hono     (port 3333)
```

**The frontend never contacts backends directly.** All traffic goes through the BFF proxy at `/api/v1/*`.

## Directory Structure

```
src/
├── app/
│   ├── (dashboard)/dashboard/       # Admin/RBAC section — auth required
│   │   ├── auth/{login,register,forgot-password}/
│   │   └── (app)/                   # Protected layout (sidebar + header)
│   │       ├── page.tsx             # /dashboard
│   │       ├── users/
│   │       ├── roles/
│   │       ├── permissions/
│   │       ├── posts/
│   │       ├── todos/
│   │       ├── api-keys/
│   │       └── settings/
│   ├── (shop)/shop/                 # E-commerce section — public + optional auth
│   │   ├── auth/{login,register}/
│   │   ├── (storefront)/            # Product listing, cart, checkout, orders
│   │   │   ├── page.tsx             # /shop
│   │   │   ├── [slug]/              # /shop/:slug (product detail)
│   │   │   ├── categories/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   └── orders/
│   │   └── admin/                   # Shop admin
│   ├── (saas)/saas/                 # SaaS section — auth required
│   │   ├── auth/{login,register}/
│   │   ├── onboarding/
│   │   └── (app)/                   # billing, settings, team, usage
│   ├── (support)/support/           # Support/helpdesk section — auth required
│   │   ├── auth/{login,register}/
│   │   └── (app)/                   # tickets, agent view, conversations
│   ├── api/
│   │   ├── v1/[...path]/route.ts    # BFF catch-all proxy → backends
│   │   └── ai/chat/route.ts         # Vercel AI SDK streaming endpoint
│   ├── layout.tsx                   # Root layout (ThemeProvider, Zustand hydration)
│   ├── page.tsx                     # Landing page
│   ├── global-error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                          # shadcn/ui (managed by CLI, do not hand-edit)
│   ├── assistant-ui/                # AI chat components
│   ├── auth/                        # Login/register/forgot-password forms
│   ├── dashboard/                   # RBAC tables, dashboard widgets
│   ├── shop/                        # Product cards, cart, checkout UI
│   ├── saas/                        # Billing, org, team UI
│   ├── support/                     # Ticket list, conversation UI
│   ├── app-sidebar.tsx              # Main sidebar (section-aware)
│   ├── data-table.tsx               # Generic TanStack Table component
│   ├── page-header.tsx
│   └── zustand-hydration.tsx        # SSR → client store hydration
├── lib/
│   ├── actions/                     # Server Actions (always use bff-client)
│   │   ├── _shared/
│   │   │   ├── bff-client.ts        # MANDATORY HTTP client
│   │   │   ├── errors.ts            # BffActionError
│   │   │   ├── envelope.ts          # Response envelope types
│   │   │   └── index.ts
│   │   ├── auth/actions.ts          # login, logout, register, me, OAuth, magic link
│   │   ├── rbac/{users,roles,permissions}.ts
│   │   ├── shop/actions.ts
│   │   ├── saas/actions.ts
│   │   └── support/actions.ts
│   ├── adapters/                    # Backend adapters + proxy config
│   │   ├── proxy-config.ts          # Per-backend path transform + public routes
│   │   ├── laravel/
│   │   ├── symfony/
│   │   ├── node/
│   │   └── types.ts
│   ├── ai/
│   │   ├── providers.ts             # Anthropic / OpenAI / Google / Mistral
│   │   └── provider-options.ts      # Client-safe provider list
│   ├── auth/
│   │   └── backend-context.ts       # Cookie names, backend resolution
│   ├── config/
│   │   └── env.ts                   # All env vars (import from here, not process.env)
│   ├── http/                        # Low-level fetch wrapper (ApiException)
│   ├── logger/                      # Pino (server) / JSON (edge) / console (client)
│   ├── query/                       # TanStack Query setup + hooks (opt-in)
│   ├── security/                    # HMAC types
│   └── services/
│       └── token-service.ts         # Token expiry calculation
├── stores/
│   ├── auth-store.ts                # User state + login/logout/OAuth/magic-link
│   ├── cart-store.ts                # Shopping cart
│   ├── org-store.ts                 # Active organization (SaaS)
│   └── ai-preferences-store.ts      # Selected AI provider/model
├── types/                           # Shared TypeScript types
└── proxy.ts                         # Edge middleware (exported as `proxy`)
```

## BFF Proxy Flow

### Route handler: `src/app/api/v1/[...path]/route.ts`

1. Reads `auth_backend` cookie to determine active backend
2. Validates path segments (SSRF + path traversal protection)
3. Validates CSRF for mutating methods (Origin/Referer check, bypassed via `x-bff-internal: 1`)
4. Transforms BFF path `/api/v1/*` → backend-specific path
5. Checks middleware header `x-bff-refresh-needed` for proactive refresh
6. Forwards request with `Authorization: Bearer <token>`
7. On 401: attempts token refresh → retries once → clears cookies on failure
8. Stores refreshed tokens in HttpOnly cookies

### Path transformations

| Backend | BFF path | Backend path |
|---------|----------|-------------|
| Laravel | `/api/v1/auth/*` | `/api/auth/*` |
| Symfony | `/api/v1/auth/*` | `/api/v1/auth/*` (1:1) |
| Hono | `/api/v1/*` | `/api/*` |

## Auth Flow

### Login

```
1. User submits form
2. Client calls useAuthStore.login() (Zustand)
3. Zustand calls loginAction() (Server Action)
4. Server Action calls bffPost('/api/v1/auth/login', credentials, { skipAuth: true })
5. bff-client POSTs to http://localhost:3300/api/v1/auth/login
6. Route handler transforms path → backend /api/auth/login (Laravel) or /api/v1/auth/login (Symfony)
7. Backend returns { data: { user, access_token, refresh_token, expires_in } }
8. Route handler stores tokens in HttpOnly cookies:
   - auth_token (access token)
   - refresh_token
   - token_expires_at (non-HttpOnly, for client awareness)
9. Zustand stores user in memory
```

### Token Refresh

- **Proactive** (Edge middleware): detects token expiring in < 5 min via JWT decode (no signature check), sets `x-bff-refresh-needed` header
- **Reactive** (route handler): catches 401, sends refresh token to backend, retries original request
- **Fallback**: if refresh fails, clears all auth cookies

### Middleware (Edge): `src/proxy.ts`

```
Protected routes: /dashboard, /saas, /support
  → no token → redirect to /<section>/auth/login?redirect=<path>
  → token expired + no refresh → redirect + clear cookies

Auth routes: /dashboard/auth/*, /saas/auth/*, /support/auth/*, /shop/auth/*
  → valid token → redirect to section root (avoids flash of auth page)

API routes: /api/v1/*, /api/auth/*
  → sets x-bff-refresh-needed if token needs refresh

/shop → unprotected (no middleware)
```

## Data Fetching Strategy

**Default: Server Actions (80% of cases)**

```tsx
// Server Component — zero client JS, best performance
export default async function UsersPage() {
  const users = await listUsersAction();
  return <UsersTable users={users} />;
}
```

**TanStack Query — only when needed:**
- Client-side filtering / pagination with cache
- Same data needed in multiple components
- Optimistic updates critical to UX
- Polling

```tsx
import { WithQuery } from '@/lib/query';

export default function ComplexPage() {
  return <WithQuery><FilterableList /></WithQuery>;
}
```

See `.claude/rules/data-fetching-strategy.md` for the full decision matrix.

## Environment Variables

```env
# Required
NEXT_PUBLIC_APP_URL=http://localhost:3300

# Backend URLs
LARAVEL_API_URL=http://localhost:8002
SYMFONY_API_URL=http://localhost:8001
NODE_API_URL=http://localhost:3333

# Backend selection (laravel | symfony | node)
AUTH_BACKEND=laravel

# Cookie names (optional, defaults shown)
AUTH_COOKIE_NAME=auth_token
REFRESH_COOKIE_NAME=refresh_token
TOKEN_EXPIRES_COOKIE_NAME=token_expires_at

# AI providers (optional)
AI_PROVIDER=anthropic          # anthropic | openai | google | mistral
AI_MODEL=claude-sonnet-4-20250514
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
MISTRAL_API_KEY=...
```

All env vars should be accessed via `src/lib/config/env.ts`, never `process.env` directly.

## AI Integration

- **Provider**: Vercel AI SDK v6 with multi-provider support (Anthropic, OpenAI, Google, Mistral)
- **UI**: assistant-ui components in `src/components/assistant-ui/`
- **Endpoint**: `src/app/api/ai/chat/route.ts` (streaming, does NOT go through BFF proxy)
- **Store**: `src/stores/ai-preferences-store.ts` (user's provider/model preference)
- **Config**: `src/lib/ai/providers.ts` (server-side) + `src/lib/ai/provider-options.ts` (client-safe)

## Commands

```bash
bun run dev         # Dev server on port 3300
bun run build       # Production build (only when explicitly asked)
bun run lint        # ESLint
```

## Key Rules

Local rules in `.claude/rules/`:
- `server-actions-bff-client.md` — **CRITICAL**: always use `bff-client.ts`, never `fetch()` directly
- `data-fetching-strategy.md` — Server Actions by default, TanStack Query opt-in
- `typescript-types-over-interfaces.md` — always `type`, never `interface`

Monorepo rules in `../../.claude/rules/`:
- `bff-pattern.md` — BFF architecture overview
- `betterauth-conventions.md` — Auth endpoint contracts
- `monorepo-conventions.md` — `bun` only, port assignments

## Skills

Available in `.claude/skills/`:
- `next-action` — Create a Server Action
- `next-page` — Create a Next.js page
- `next-component` — Create a React component
- `next-proxy` — Modify BFF proxy configuration
