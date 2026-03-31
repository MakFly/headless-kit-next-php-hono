---
name: next-section
description: Scaffold a new route group section with auth pages, layouts, and middleware. Use when adding a new section like dashboard, shop, saas, support.
argument-hint: <section-name>
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Scaffold New Section

Add a major vertical (new route group) with auth + `(app)` shell + `proxy.ts` rules + sidebar.

## References (load when implementing)

- @references/scaffold.md — step list and guardrails
- @../../../src/proxy.ts — extend protected / auth routes
- @../../../src/components/app-sidebar.tsx — navigation
- @../../../src/components/auth/ — reuse forms/layouts
- @../../rules/route-groups-layout.md

Section: $ARGUMENTS
