---
paths:
  - "packages/types/**/*"
  - "apps/web/**/*"
  - "apps/web-tanstack/**/*"
  - "apps/api-hono/**/*"
---

# Package `@headless/types`

## Rôle

Centraliser les types TypeScript **partagés** entre frontends et, si pertinent, le backend Node (Hono) — contrats d’API stables, DTO communs, helpers de typage.

## Quand exporter dans `packages/types`

- Même structure utilisée dans **plus d’une** app TS du monorepo.
- Contrats publics stables (réponses auth, pagination, erreurs API côté client).

## Quand garder local

- Types UI-only, props de composants, états Zustand locaux.
- DTO internes à une seule app sauf besoin avéré de réutilisation.

## Imports

- Depuis les apps : `@headless/types` (ou alias défini dans le `package.json` / tsconfig du workspace).
- Après modification : `bun run --filter @headless/types build` puis typecheck des consommateurs.

## Skill associé

- `/sync-types` — workflow de déduplication et migration vers le package.
