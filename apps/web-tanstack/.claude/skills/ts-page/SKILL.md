---
name: ts-page
description: Create a TanStack Start page with file-based routing, loader, and auth guard. Use when adding a new page or route.
argument-hint: <route-path>
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Create TanStack Page

Add file routes under `src/routes/`. Regenerate route tree with `bun run build` after structural changes.

## References (load when implementing)

- @references/file-routing.md — `createFileRoute`, loader, `beforeLoad`, guardrails
- @../../../CLAUDE.md — auth + context conventions
- Monorepo @../../../../../.claude/rules/bff-pattern.md

Target: $ARGUMENTS
