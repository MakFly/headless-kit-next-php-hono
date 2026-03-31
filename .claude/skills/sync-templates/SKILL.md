---
name: sync-templates
description: Sync apps/ → create-headless-app templates after app changes. Run check, apply, rebuild CLI.
disable-model-invocation: true
---

# Sync Templates

Copier `apps/` → `packages/create-headless-app/templates/` via le script bash (substitutions `{{…}}`).

## Flux

1. `bash scripts/sync-templates.sh --check`
2. `bash scripts/sync-templates.sh --apply`
3. `cd packages/create-headless-app && bun run build && bun test`

## References (load when implementing)

- @references/checklist.md — review post-sync, exclusions
- @../../../scripts/sync-templates.sh — `EXCLUDE_PATTERNS` et règles 1–5

## When to run

Après correctifs ou évolutions dans une app sous `apps/`, mise à jour deps, ou correctifs sécu — avant release du CLI.
