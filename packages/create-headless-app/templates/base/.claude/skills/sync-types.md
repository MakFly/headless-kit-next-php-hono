---
name: sync-types
description: Synchronise les types TypeScript partagés entre les apps
user_invocable: true
---

Vérifie et synchronise les types TypeScript partagés dans `packages/types/`.

## Instructions

1. Scanne les types utilisés dans chaque app frontend :
   - `apps/web/` — types d'auth, API responses
   - `apps/web-tanstack/` — types d'auth, API responses
   - `apps/api-hono/` — types de schema Drizzle

2. Identifie les types dupliqués ou incohérents entre les apps.

3. Propose de déplacer les types communs vers `packages/types/src/`.

4. Après approbation :
   - Déplace les types vers le package partagé
   - Met à jour les imports dans chaque app
   - Build le package : `bun run --filter @headless/types build`
   - Vérifie le typecheck : `bun run --filter @headless/web typecheck` (si disponible)
