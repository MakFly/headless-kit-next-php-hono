---
name: update
description: Update this Headless Kit project to the latest version. Runs automated codemods + verification. Use when the user asks to update or upgrade.
argument-hint: [target-version]
---

# Update Headless Kit Project

## Step 1 — Run the automated update script

```bash
bash scripts/update.sh $ARGUMENTS
```

This will:
- Detect the current version from README.md
- Apply automated codemods (port fixes, adapter cleanup, security patches)
- Run `scripts/verify.sh` to check project health

## Step 2 — Handle manual migrations

If the update script reports issues or if the migration has manual steps:

1. Read the migration guide: check `https://headlesskit.dev/changelog` or the project's migration notes
2. For complex changes (adapter index.ts rewrite, env.ts cleanup, import fixes), apply them using Edit tool
3. For new files (security headers subscriber, logger, etc.), create them following the migration guide

## Step 3 — Verify

Run the health check again:

```bash
bash scripts/verify.sh
```

If TypeScript fails, fix the import errors. If tests fail, investigate.

## Step 4 — Commit

Once `verify.sh` reports all green, commit the update:

```bash
git add -A && git commit -m "chore: update headless kit to v$ARGUMENTS"
```
