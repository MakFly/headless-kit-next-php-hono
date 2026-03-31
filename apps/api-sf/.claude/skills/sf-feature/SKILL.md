---
name: sf-feature
description: Create a new feature slice in src/Feature/ with invokable controllers, following Vertical Slice Architecture. Use when the user asks to add a new feature, module, or endpoint group.
argument-hint: <FeatureName>
disable-model-invocation: true
---

# Create Symfony Feature Slice

Create `src/Feature/{Name}/` with Controller (+ optional Repository, Service, DTO).

## References (load when implementing)

- @references/feature-slice.md — layout, controller sketch, steps
- @../../../src/Shared/Service/ApiResponseService.php
- @../../../config/services.yaml
- @../../rules/response-conventions.md
- Monorepo @../../../../../.claude/rules/rest-conventions.md

Feature: $ARGUMENTS
