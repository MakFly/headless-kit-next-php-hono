---
name: lara-feature
description: Create a new feature slice in app/Features/ with Actions, routes, and optional Requests/Services/Formatters. Use when the user asks to add a new feature module.
argument-hint: <FeatureName>
disable-model-invocation: true
---

# Create Laravel Feature Slice

Scaffold `app/Features/{Name}/` (Actions, optional Requests/Services/Formatters, `routes.php`) and register routes under `/api/v1`.

## References (load when implementing)

- @references/feature-slice.md — layout, `routes.php`, ApiResponse, steps
- @../../../routes/api.php
- @../../../app/Shared/Helpers/ApiResponse.php
- @../../rules/vsa-conventions.md
- @../../rules/response-format.md
- Monorepo @../../../../../.claude/rules/rest-conventions.md

Feature: $ARGUMENTS
