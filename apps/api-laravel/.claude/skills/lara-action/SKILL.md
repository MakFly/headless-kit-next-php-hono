---
name: lara-action
description: Create an invokable Action class for a Laravel API endpoint. Use when the user asks to add a new endpoint, route handler, or API action.
argument-hint: <FeatureName/ActionName>
disable-model-invocation: true
---

# Create Laravel Action

Add an invokable class under `app/Features/{Feature}/Actions/` and wire it in that feature’s `routes.php`.

## References (load when implementing)

- @references/action-template.md — PHP template and step list
- @../../../routes/api.php — `v1` group + `require` pattern
- @../../../app/Shared/Helpers/ApiResponse.php — response helpers
- @../../../bootstrap/app.php — API exception mapping
- @../../rules/response-format.md
- Monorepo @../../../../../.claude/rules/rest-conventions.md
- Monorepo @../../../../../.claude/rules/betterauth-conventions.md

Target: $ARGUMENTS
