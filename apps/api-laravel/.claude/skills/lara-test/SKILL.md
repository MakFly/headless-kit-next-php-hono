---
name: lara-test
description: Create Feature or Unit tests for Laravel endpoints. Use when the user asks to write tests or add test coverage.
argument-hint: <FeatureName|TestClass>
disable-model-invocation: true
---

# Create Laravel Tests

Use `tests/Feature/` for HTTP + envelope; `tests/Unit/` for pure logic.

## References (load when implementing)

- @references/feature-test-template.md — RefreshDatabase, auth headers, JSON structure
- @../../../tests/Feature/
- Monorepo @../../../../../.claude/rules/api-security-checklist.md

Target: $ARGUMENTS
