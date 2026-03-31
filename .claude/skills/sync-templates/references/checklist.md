# Sync templates — review checklist

Après `bash scripts/sync-templates.sh --apply` :

- Pas d’imports `@headless/`
- Pas de `workspace:*` dans les `package.json` template
- Ports : placeholders `{{FRONTEND_PORT}}`, `{{API_PORT}}`, etc.

## Exclusions (source de vérité)

Le script **n’aligne jamais** depuis `apps/` : `CLAUDE.md`, `.claude/`, `node_modules/`, `vendor/`, bases SQLite, caches, lockfiles, `.env*`. Voir la liste complète dans `scripts/sync-templates.sh` (`EXCLUDE_PATTERNS`).

Un `.claude/` présent **uniquement** sous `packages/create-headless-app/templates/` est maintenu à part (pas produit par ce sync).
