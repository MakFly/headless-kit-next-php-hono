---
name: verify-monorepo
description: Run lint and tests across the monorepo (turbo + optional PHP suites). Use before a PR or after large refactors.
disable-model-invocation: true
---

# Verify monorepo

Enchaîner les vérifications automatiques du workspace (sans équivalent unique `typecheck` racine pour tous les packages).

## References (load when implementing)

- @references/commands.md — `bun run lint`, `bun run test`, filtres turbo, PHPUnit
- @../../../package.json — scripts racine
- @../../../turbo.json — pipelines si besoin
