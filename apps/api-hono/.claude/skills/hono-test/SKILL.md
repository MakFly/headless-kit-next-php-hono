---
name: hono-test
description: Write integration or unit tests using Bun test runner. Use when the user asks to test a feature or endpoint.
argument-hint: <feature-name>
disable-model-invocation: true
---

# Write Hono Tests

Integration tests hit the real `app` from `src/index.ts`; unit tests live under `src/tests/unit/`.

## References (load when implementing)

- @references/bun-test-examples.md — integration template, envelope shape, commands
- @../../../src/tests/setup.ts
- @../../../src/tests/helpers/test-app.ts — `createTestApp` when you need isolation
- @../../../CLAUDE.md — response envelope
- Monorepo @../../../../../.claude/rules/api-security-checklist.md — authz cases to cover

Target: $ARGUMENTS
