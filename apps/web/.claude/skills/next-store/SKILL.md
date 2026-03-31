---
name: next-store
description: Create a Zustand store with SSR hydration support for the Next.js BFF app. Use when adding new client-side state management.
argument-hint: <StoreName>
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Create Zustand Store

New stores live in `src/stores/<name>-store.ts`. Never import stores from Server Components or Server Actions.

## References (load when implementing)

- @references/zustand-ssr.md — hydration pattern and rules
- @../../../src/components/zustand-hydration.tsx — global hydration wiring
- @../../../src/stores/auth-store.ts — reference implementation
- @../../rules/zustand-stores.md

Store: $ARGUMENTS
