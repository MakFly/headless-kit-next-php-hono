---
name: sf-api-platform-resource
description: Add a CRUD resource via API Platform with operations, serialization groups, and envelope compliance. Use when adding standard list/show/create/update/delete for an entity.
argument-hint: <EntityName>
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Add API Platform Resource

Expose an existing entity as an API Platform CRUD resource.

## Use when

- Adding standard CRUD operations for an entity
- The entity needs list, show, create, update, or delete

## Default workflow

1. Add `#[ApiResource]` with operations to the entity in `src/Shared/Entity/$ARGUMENTS.php`
2. Add `#[Groups]` on properties for serialization (`$ARGUMENTS:read`, `$ARGUMENTS:write`)
3. Verify routing: `php bin/console debug:router | grep $ARGUMENTS`
4. Verify envelope: `EnvelopeSubscriber` wraps responses automatically — no manual wrapping

## Guardrails

- Use relative `uriTemplate` (no `/api/v1` prefix — applied by config)
- Groups on properties, never getters
- Do NOT create invokable controllers for standard CRUD — API Platform handles it
- If the entity needs business logic endpoints too, those go in `Feature/{Name}/Controller/`

## Output contract

- Entity updated with `#[ApiResource]` + `#[Groups]`
- Routes verified via console
- EnvelopeSubscriber confirmed wrapping responses

Entity: $ARGUMENTS
