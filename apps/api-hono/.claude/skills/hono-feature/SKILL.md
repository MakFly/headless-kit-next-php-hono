---
name: hono-feature
description: Create a new feature slice in src/features/ with all 5 convention files (routes, handlers, service, repository, schemas). Use when the user asks to add a new feature module or endpoint group.
argument-hint: <feature-name>
disable-model-invocation: true
---

# Create Hono Feature Slice

Create `src/features/<name>/` with exactly five files: `{name}.routes.ts`, `{name}.handlers.ts`, `{name}.service.ts`, `{name}.repository.ts`, `{name}.schemas.ts`, then mount in `src/index.ts`.

## References (load when implementing)

- @references/five-file-templates.md — copy-paste starters + mount snippet
- @../../../src/index.ts — route registration pattern
- @../../../src/shared/db/schema.ts — tables (if persistence needed)
- @../../../CLAUDE.md — architecture + response envelope
- Monorepo @../../../../../.claude/rules/rest-conventions.md

Feature: $ARGUMENTS
