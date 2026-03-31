---
name: add-auth-endpoint
description: Ajoute un endpoint d'auth sur tous les backends (Symfony, Laravel, Hono) + BFF
user_invocable: true
---

Ajoute un nouvel endpoint d'authentification de manière cohérente sur tous les backends et le BFF.

## Instructions

1. Demande à l'utilisateur :
   - Nom de l'endpoint (ex: `verify-email`, `change-password`)
   - Méthode HTTP (GET/POST/PUT/DELETE)
   - Authentification requise ? (oui/non)
   - Payload attendu (champs)
   - Response attendue

2. Entre en mode plan et explore les implémentations auth existantes dans chaque backend.

3. Crée le plan d'implémentation couvrant :
   - **Symfony** : Controller dans `src/Controller/Api/V1/`
   - **Laravel** : Controller + route dans routes/api.php
   - **Hono** : Handler + route dans `src/routes/auth.routes.ts`
   - **BFF Next.js** : Adapter method dans chaque adapter
   - **BFF TanStack** : Si applicable

4. Après approbation, implémente en parallèle (un agent par backend).

5. Lance les tests existants pour vérifier qu'il n'y a pas de régression.

## Règles

- Suivre les conventions de réponse BetterAuth (voir `.claude/rules/betterauth-conventions.md`)
- Les routes BetterAuth restent en routes classiques, pas en API Platform resources
- Ajouter les tests fonctionnels pour chaque backend
