---
name: add-crud-endpoint
description: Plan and add a CRUD (or REST) resource across Symfony, Laravel, Hono, and BFF adapters. Use for non-auth API surface area.
disable-model-invocation: true
---

# Add CRUD endpoint (multi-backend)

Généralisation multi-stacks pour une ressource API (pas spécifique à l’auth — pour l’auth utiliser `/add-auth-endpoint`).

## References (load when implementing)

- @references/checklist-backend.md — Symfony / Laravel / Hono / BFF
- @../../../.claude/rules/api-envelope-contract.md
- @../../../.claude/rules/rest-conventions.md
- @../../../.claude/rules/bff-pattern.md
- @../../../.claude/rules/bff-dual-frontend.md

## Skills par stack (détail)

- Symfony : `sf-api-platform-resource` ou `sf-endpoint` / `sf-feature`
- Laravel : `lara-feature` / `lara-action`
- Hono : `hono-feature` / `hono-endpoint`
- Next : `next-action`, `next-proxy`
- TanStack : `ts-service`, `ts-server-fn`
