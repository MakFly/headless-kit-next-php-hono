---
name: project_web-bff-architecture
description: Architecture of the Next.js BFF app (apps/web): route groups, proxy, auth flow, skills location
type: project
---

The Next.js BFF app (`apps/web`, port 3001) proxies all traffic to backends via `/api/v1/[...path]/route.ts`.

**Why:** Browser never contacts backends directly; BFF adds CSRF protection, token storage, and proactive refresh.

**How to apply:** When adding features to `apps/web`, always route backend calls through `bff-client.ts`. When adding pages, place them in the correct route group — `(dashboard)`, `(shop)`, `(saas)`, or `(support)`. When exposing a new public backend endpoint, add it to `publicRoutes` in `src/lib/adapters/proxy-config.ts`.

Key facts:
- Skills created at `apps/web/.claude/skills/`: `next-action`, `next-page`, `next-component`, `next-proxy`
- CLAUDE.md rewritten March 2026 to reflect actual architecture (Next.js 16, React 19)
- Auth stores tokens in HttpOnly cookies: `auth_token`, `refresh_token`, `token_expires_at`
- Proactive token refresh: Edge middleware decodes JWT expiry (no sig check), signals route handler via `x-bff-refresh-needed` header
- AI chat at `/api/ai/chat` (Vercel AI SDK, 4 providers) — separate from BFF proxy
- `AUTH_BACKEND` env var (or `auth_backend` cookie) selects active backend at runtime
