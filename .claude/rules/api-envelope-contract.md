---
paths:
  - "apps/api-sf/**/*"
  - "apps/api-laravel/**/*"
  - "apps/api-hono/**/*"
  - "apps/web/src/lib/adapters/**/*"
  - "apps/web-tanstack/**/*"
---

# Contrat d’enveloppe API (multi-backend)

Les trois backends et les BFF doivent rester **alignés** sur une enveloppe prévisible pour le frontend.

## Succès (général)

- Champ **`success`**: `true`.
- Champ **`data`**: charge utile (objet, tableau, ou scalaire selon endpoint).
- Champ **`status`**: code HTTP entier cohérent avec la réponse.
- Champ **`request_id`**: identifiant de corrélation (chaîne).

Les listes paginées peuvent inclure **`meta`** (clés du type `page`, `limit` / `per_page`, `total`, `totalPages` / `last_page`) selon les conventions de chaque stack — garder les noms déjà utilisés dans l’app touchée.

## Erreur

- **`success`**: `false`.
- **`error`**: objet avec au minimum `code` (string stable, SCREAMING_SNAKE) et `message` (lisible).
- **`status`**: code HTTP.
- **`request_id`**: si disponible côté middleware.

## Implémentations de référence

- **Laravel** : `App\Shared\Helpers\ApiResponse` + exception handler API (`bootstrap/app.php`).
- **Symfony** : `App\Shared\Service\ApiResponseService` + `EnvelopeSubscriber` (API Platform) + handlers invokables.
- **Hono** : `apiSuccess` / `apiError` dans `apps/api-hono/src/shared/lib/response.ts`.

Ne pas introduire de nouvelle forme d’enveloppe sans mettre à jour **tous** les consommateurs BFF concernés.
