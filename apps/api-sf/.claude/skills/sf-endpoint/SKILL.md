---
name: sf-endpoint
description: Add a single invokable controller to an existing Symfony feature. Use when adding one endpoint, not a full feature slice.
argument-hint: <Feature/EndpointName>
disable-model-invocation: true
---

# Add Symfony Endpoint

Add one invokable controller under `src/Feature/{Feature}/Controller/`.

## References (load when implementing)

- @references/invokable-controller.md — template, steps, vs API Platform
- @../../../src/Shared/Service/ApiResponseService.php
- @../../rules/response-conventions.md
- Monorepo @../../../../../.claude/rules/rest-conventions.md

Target: $ARGUMENTS
