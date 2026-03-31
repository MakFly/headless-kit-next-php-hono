---
name: sf-api-platform-resource
description: Add a CRUD resource via API Platform with operations, serialization groups, and envelope compliance. Use when adding standard list/show/create/update/delete for an entity.
argument-hint: <EntityName>
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Add API Platform Resource

Add `#[ApiResource]` + `#[Groups]` on an existing `App\Shared\Entity` class. Prefer API Platform for standard CRUD; use invokable controllers for custom flows.

## References (load when implementing)

- @references/api-platform.md — workflow, guardrails, router check
- @../../../src/Shared/Entity/
- @../../../config/routes/api_platform.yaml
- @../../../config/packages/api_platform.yaml
- @../../rules/api-platform-hybrid.md
- Monorepo @../../../../../.claude/rules/rest-conventions.md

Entity: $ARGUMENTS
