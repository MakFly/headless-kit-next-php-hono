# Changelog

All notable changes to `create-headless-app` will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-29

### Added
- **ai-assistant module** — assistant-ui components, multi-provider AI chat (Anthropic, OpenAI, Google, Mistral), streaming endpoint, preferences store
- **Module dependency injection** — modules now automatically add their npm dependencies to the project's `package.json`
- **Backend cleanup** — scaffolded projects only contain the adapter for the selected backend (unused Laravel/Symfony/Hono adapters are removed)
- **Version stamp** — scaffolded projects show which Headless Kit version created them
- **`--version` flag** — `bunx create-headless-app --version`
- Security headers middleware (all 3 backends)
- JWT production guard (Hono — crashes if secret is weak/missing in production)

### Fixed
- **Port consistency** — all generated `.env`, `package.json`, Docker configs, and post-scaffold messages now use correct ports (3300/3301/8002/8001/3333)
- **Missing base template files** — `logger/`, `types/index.ts`, `envelope.ts`, `sidebar.tsx` added to base template (previously caused TypeScript compilation failures)
- **support-chat module** — Hono backend files (5 feature files + seeder + test), TanStack components (ai-chat-thread, escalation-banner, model-selector) were empty/missing
- **org-rbac module** — backend files for all 3 backends were empty
- **team module** — Laravel Actions were missing
- Laravel auth routes moved to `/api/v1/auth/*` for cross-backend consistency
- Symfony `OrgScopeExtension` now reads `orgId` from URL path (was reading a header that no frontend sent)
- Laravel `OrgResolver` now resolves orgs for team members, not just owners

### Changed
- TanStack cleanup now detects template type and uses correct import style
- Preset `package.json` files use `{{FRONTEND_PORT}}` template variable
- All Next.js preset `package.json` files include `pino` dependency

## [0.1.0] - 2026-03-21

### Added
- Initial release
- 3 backends: Laravel, Symfony, Hono
- 2 frontends: Next.js, TanStack Start
- 4 presets: admin, saas, ecommerce, landing
- 7 modules: multi-tenant, billing, team, org-rbac, support-chat, ai-assistant, api-platform
- Docker support for all combinations
- Interactive CLI with @clack/prompts
- 219 integration tests

---

## Migration Guides

See `migrations/` directory for step-by-step upgrade instructions between versions.
