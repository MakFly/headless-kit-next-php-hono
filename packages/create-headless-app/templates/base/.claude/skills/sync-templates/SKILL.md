---
name: sync-templates
description: Sync monorepo apps/ to CLI templates. Use after making changes to any backend or frontend app to keep templates up to date.
---

# Sync Templates

Syncs source code from `apps/` to `packages/create-headless-app/templates/`.

## Step 1 — Check drift

```bash
bash scripts/sync-templates.sh --check
```

This shows which files have drifted between the monorepo and the CLI templates.

## Step 2 — Apply sync

```bash
bash scripts/sync-templates.sh --apply
```

This copies changed files from `apps/` to `templates/`, applying template variable substitutions where needed (`{{PROJECT_NAME}}`, `{{API_PORT}}`, etc.).

## Step 3 — Rebuild CLI and test

```bash
cd packages/create-headless-app && bun run build && bun test
```

## Step 4 — Review and commit

Review the diff to make sure no monorepo-specific code leaked into templates:
- No `@headless/` imports
- No `workspace:*` references
- No hardcoded ports (should be `{{FRONTEND_PORT}}`, `{{API_PORT}}`)
- No `CLAUDE.md` or `.claude/` dirs

## When to run

Run this after:
- Fixing bugs in any backend or frontend app
- Adding new features to an existing module
- Updating dependencies
- Security patches
