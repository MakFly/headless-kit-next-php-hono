---
name: ts-component
description: Create a React component for TanStack Start with proper data access patterns. Use when building UI components.
argument-hint: <ComponentName>
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Create TanStack Component

Place UI in `src/components/{domain}/`. Primitives from `~/components/ui/`.

## References (load when implementing)

- @references/component-patterns.md — template, SSR vs Zustand, guardrails
- @../../../src/styles/theme.css — design tokens (Tailwind v4)
- @../../../CLAUDE.md — route context vs Zustand (auth flash)
- Monorepo @../../../../../.claude/rules/bff-pattern.md — BFF boundary

Component: $ARGUMENTS
