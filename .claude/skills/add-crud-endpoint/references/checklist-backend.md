# CRUD endpoint — checklist multi-backend

Avant d’implémenter, figer : ressource, méthodes (GET list, GET one, POST, PATCH, DELETE), auth (public / user / admin / org), validation, codes d’erreur.

## Symfony (`apps/api-sf`)

- **CRUD standard** : préférer API Platform sur entité `src/Shared/Entity/` (`sf-api-platform-resource` skill) + groups.
- **Logique métier non CRUD** : contrôleur invokable `src/Feature/{X}/Controller/` (`sf-endpoint`).
- Réponses : `ApiResponseService` / enveloppe — `.claude/rules/api-envelope-contract.md`.
- Tests : `tests/Functional/`.

## Laravel (`apps/api-laravel`)

- Action invokable par endpoint `app/Features/{Feature}/Actions/` + `routes.php` + `routes/api.php`.
- `ApiResponse::success` / `error` / `paginated`.
- Middleware : `auth:betterauth`, `role:…`, `org.rbac` selon cas.
- Tests : `tests/Feature/`.

## Hono (`apps/api-hono`)

- Slice verticale : `schemas` → `repository` → `service` → `handlers` → `routes` (`hono-feature` / `hono-endpoint`).
- `zValidator`, `apiSuccess` / `apiError`, middleware auth.
- Tests : `src/tests/integration/`.

## BFF

- **Next** : `apps/web/src/lib/adapters/` — `transformPath`, `publicRoutes` si route sans cookie.
- **TanStack** : services + `fetchFromApi` vers le proxy du kit.

## Alignement

- Même chemin logique côté BFF (`/api/v1/...`) que les contrats BetterAuth / REST existants.
- Vérifier `.claude/rules/rest-conventions.md` et `betterauth-conventions.md` pour les segments auth.
