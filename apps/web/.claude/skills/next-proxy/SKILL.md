---
name: next-proxy
description: Add or modify BFF proxy route configuration for a new backend endpoint. Use when a new backend API path needs to be proxied through the BFF.
argument-hint: <backend-path>
disable-model-invocation: true
---

# BFF Proxy Configuration

Touch **`src/lib/adapters/proxy-config.ts`** for transforms / `publicRoutes`, and **`src/app/api/v1/[...path]/route.ts`** only if handler behavior must change.

## References (load when implementing)

- @references/proxy-behavior.md — handler flow, env, security, path maps, AI exception
- @../../../src/lib/adapters/proxy-config.ts — source of truth for backends
- @../../../src/app/api/v1/[...path]/route.ts — catch-all proxy
- @../../../CLAUDE.md — BFF overview (repo-relative: from `apps/web` root)
- Monorepo @../../../../../.claude/rules/bff-pattern.md

Target: $ARGUMENTS
