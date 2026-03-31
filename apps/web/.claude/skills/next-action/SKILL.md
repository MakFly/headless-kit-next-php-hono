---
name: next-action
description: Create a Server Action that communicates with the backend via the BFF client. Use when the user asks to add a server action, API call, or data fetching function.
argument-hint: <feature/action-name>
disable-model-invocation: true
---

# Create Server Action

Add or extend handlers under `src/lib/actions/`.

## Non‑negotiable

**Any Server Action that hits the backend MUST use `bff-client`.** Never `fetch()` directly to backend URLs.

## References (load when implementing)

- @references/bff-client-patterns.md — API surface, auth `skipAuth`, errors, folder layout, examples
- @../../../src/lib/actions/_shared/bff-client.ts — implementation
- @../../rules/server-actions-bff-client.md — full rule
- @../../rules/typescript-types-over-interfaces.md — `type` only

Target: $ARGUMENTS
