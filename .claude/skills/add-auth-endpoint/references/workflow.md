# Add auth endpoint — workflow

1. Clarifier avec l’utilisateur : nom d’endpoint, méthode HTTP, auth requise ou non, payload, réponse attendue.
2. Mode plan : parcourir les implémentations auth existantes dans chaque backend.
3. Plan d’implémentation :
   - **Symfony** : contrôleurs invokables sous `apps/api-sf/src/Feature/Auth/Controller/` (voir structure réelle du repo).
   - **Laravel** : Actions / routes sous `apps/api-laravel/app/Features/Auth/` + `routes/api.php`.
   - **Hono** : `apps/api-hono/src/features/auth/` (routes + handlers).
   - **Next BFF** : adapters `apps/web/src/lib/adapters/`.
   - **TanStack** : server fns + `fetchFromApi` si besoin.
4. Après validation : implémenter (idéalement en parallèle par backend).
5. Lancer les tests de chaque API + front concerné.

## Règles

- Enveloppe et contrats BetterAuth : voir rule monorepo `betterauth-conventions.md`.
- Ne pas exposer BetterAuth via API Platform resources (Laravel/Symfony) hors doc OpenAPI Laravel.
- Ajouter / mettre à jour tests fonctionnels par backend.
