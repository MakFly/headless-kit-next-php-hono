---
name: next-component
description: Create a React component using shadcn/ui and Tailwind CSS. Use when the user asks to build a UI component.
argument-hint: <component-name>
disable-model-invocation: true
---

# Create React Component

Place feature UI in `src/components/{feature}/`. Shared primitives: `src/components/ui/` (shadcn only via CLI).

## Conventions

- `type` for props (not `interface`)
- Tailwind for styling; `lucide-react` for icons
- Do not hand-edit `src/components/ui/*`

## References (load when implementing)

- @references/ui-and-data.md — template, shadcn workflow, tables, charts, Zustand sketch, `useAuthStore`
- @../../../src/components/data-table.tsx — TanStack table wrapper
- @../../../src/app/globals.css — Tailwind entry (tokens live in `src/styles/theme.css`)
- @../../rules/typescript-types-over-interfaces.md

Target: $ARGUMENTS
