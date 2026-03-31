---
name: sf-entity
description: Create or modify a Doctrine entity in src/Shared/Entity/ with ORM attributes, UUID v7, lifecycle callbacks, and optional API Platform #[ApiResource]. Use when creating a new entity, adding fields, or modifying schema.
argument-hint: <EntityName> [field:type...]
disable-model-invocation: true
---

# Create or Modify Doctrine Entity

Work in `src/Shared/Entity/`; validate with Doctrine console.

## References (load when implementing)

- @references/entity-conventions.md — UUID v7, timestamps, ApiResource snippet
- @../../../src/Shared/Entity/
- @../../../config/packages/doctrine.yaml
- @../../rules/api-platform-hybrid.md
- Monorepo @../../../../../.claude/rules/rest-conventions.md
- Monorepo @../../../../../.claude/rules/api-envelope-contract.md

Entity: $ARGUMENTS
