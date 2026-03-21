---
name: next-store
description: Create a Zustand store with SSR hydration support for the Next.js BFF app. Use when adding new client-side state management.
argument-hint: <StoreName>
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Create Zustand Store

Create a new Zustand store with SSR hydration in `src/stores/`.

## Use when

- Adding new client-side state that persists across pages
- Need to share state between multiple client components

## Default workflow

1. Create `src/stores/$ARGUMENTS-store.ts` with state type + actions type + create()
2. Use `type` (not interface) for all type definitions
3. Add a `hydrate` action for SSR → client synchronization
4. If needed, add hydration call in `src/components/zustand-hydration.tsx`

## Guardrails

- Never import the store in Server Components or `'use server'` files
- Always provide a `hydrate` method for SSR data
- Keep store focused — one concern per store
- Use `type` for state and actions types

## Output contract

- Store file created at `src/stores/$ARGUMENTS-store.ts`
- Hydration integration if needed
- Export `use{Name}Store` hook

Store: $ARGUMENTS
