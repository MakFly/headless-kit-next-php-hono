---
name: ts-server-fn
description: Create a server function with createServerFn, middleware, and Zod validation. Use when adding server-side logic callable from components.
argument-hint: <functionName>
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Create Server Function

Use `createServerFn` from `@tanstack/react-start`. Colocate auth RPC in `lib/server/auth.ts`; feature logic in `lib/services/*`.

## References (load when implementing)

- @references/server-fn-advanced.md — GET/POST examples, middleware, guardrails
- @../../../src/lib/http/fetch-api.ts — BFF client (`fetchFromApi`) when calling API
- @../../../CLAUDE.md
- Monorepo @../../../../../.claude/rules/betterauth-conventions.md

Function: $ARGUMENTS
