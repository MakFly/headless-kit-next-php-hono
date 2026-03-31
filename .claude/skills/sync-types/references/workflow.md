# Sync types — workflow

1. Scanner les types dupliqués ou divergents dans :
   - `apps/web/` (auth, réponses API)
   - `apps/web-tanstack/`
   - `apps/api-hono/` (schémas / DTO TS si présents)
2. Proposer une consolidation dans `packages/types/src/`.
3. Après accord :
   - Déplacer ou factoriser les types
   - Mettre à jour les imports (`@headless/types`)
   - `bun run --filter @headless/types build`
   - Typecheck des apps : ex. `bun run --filter @headless/web typecheck` (ou équivalent package.json)

Voir `.claude/rules/shared-types-package.md` pour les conventions du package.
