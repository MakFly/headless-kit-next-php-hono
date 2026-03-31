---
name: next-page
description: Create a Next.js page with App Router conventions. Use when the user asks to add a new page or route.
argument-hint: <route-path>
disable-model-invocation: true
---

# Create Next.js Page

Create routes under `src/app/` using the existing route groups `(dashboard)`, `(shop)`, `(saas)`, `(support)`.

## References (load when implementing)

- @references/routing-and-fetching.md — groups table, RSC vs client, TanStack Query opt-in, middleware, folder example
- @../../../src/proxy.ts — edge auth / redirects
- @../../rules/data-fetching-strategy.md
- @../../rules/route-groups-layout.md

Target: $ARGUMENTS
