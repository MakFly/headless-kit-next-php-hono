---
name: hono-endpoint
description: Add a new endpoint to an existing Hono feature. Use when the user asks to add a route or API endpoint to an existing feature.
argument-hint: <feature-name> <METHOD> <path>
disable-model-invocation: true
---

# Add Endpoint to Existing Feature

Extend an existing vertical slice under `src/features/<feature>/`: schemas → repository → service → handlers → routes.

## References (load when implementing)

- @references/hono-handler-patterns.md — `apiSuccess` / `apiError`, `AppError`, middleware, `zValidator`
- @../../../src/shared/lib/response.ts
- @../../../src/shared/lib/errors.ts
- @../../../src/shared/middleware/auth.ts
- Monorepo @../../../../../.claude/rules/rest-conventions.md
- Monorepo @../../../../../.claude/rules/api-security-checklist.md

Target: $ARGUMENTS
