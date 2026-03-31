---
name: ts-service
description: Create a service file with createServerFn wrappers and fetchFromApi calls. Use when adding server-side data operations for a new feature.
argument-hint: <service-name>
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Create Service

Add `src/lib/services/<feature>-service.ts` with `createServerFn` + Zod + `fetchFromApi`.

## References (load when implementing)

- @references/service-crud-template.md — list/get/create pattern
- @../../../src/lib/http/fetch-api.ts — required HTTP helper
- Monorepo @../../../../../.claude/rules/rest-conventions.md
- Monorepo @../../../../../.claude/rules/bff-pattern.md

Service: $ARGUMENTS
