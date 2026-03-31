# Server Actions : Utilisation obligatoire du BFF Client

## Règle

**Toutes les Server Actions qui communiquent avec le backend DOIVENT utiliser le `bff-client.ts`.**

```typescript
import { bffGet, bffPost, bffPut, bffPatch, bffDelete } from '../_shared/bff-client';
```

## Pourquoi ?

Le `bff-client.ts` gère automatiquement :

1. **Transmission du cookie d'authentification** - Le cookie `auth_token` est lu et transmis au BFF
2. **Vérification de l'état de connexion** - Si l'utilisateur est déconnecté, le backend retourne 401
3. **Gestion centralisée des erreurs** - `BffActionError` avec `statusCode`, `code`, `details`
4. **Headers standards** - `Content-Type`, `Accept` configurés automatiquement

## Périmètre d'application

| Destination | Utiliser bff-client ? | Raison |
|-------------|----------------------|--------|
| BFF (`/api/v1/*`) | ✅ **Obligatoire** | Auth requise, cookies à transmettre |
| Backend Laravel | ✅ **Obligatoire** | Via BFF, auth requise |
| Backend Symfony | ✅ **Obligatoire** | Via BFF, auth requise |
| API externe publique | ❌ Non requis | Pas d'auth interne |

## Exception : APIs externes publiques

`fetch()` direct est **autorisé** pour les APIs tierces publiques qui :
- Ne nécessitent pas d'authentification utilisateur
- Ne passent pas par le BFF (appel direct)

```typescript
// ✅ AUTORISÉ - API externe publique (JSONPlaceholder, etc.)
'use server';

const API_BASE = 'https://jsonplaceholder.typicode.com';

export async function getDemoPostsAction(): Promise<Post[]> {
  const response = await fetch(`${API_BASE}/posts`);
  return response.json();
}
```

**Exemples d'APIs externes autorisées :**
- JSONPlaceholder (démo/mock)
- APIs publiques sans auth (météo, devises, etc.)
- CDN/assets statiques

**⚠️ ATTENTION** : Si l'API externe nécessite une clé API stockée côté serveur, créer un client dédié avec gestion d'erreurs appropriée.

## Anti-pattern : fetch() direct vers le BFF/backend

```typescript
// ❌ INTERDIT - Le cookie n'est jamais transmis
'use server';

export async function getDataAction() {
  // Requête vers le BFF sans bff-client = cookie perdu !
  const response = await fetch('http://localhost:3000/api/v1/data', {
    credentials: 'include', // IGNORÉ côté serveur !
  });
  return response.json();
}

// ❌ INTERDIT - Appel direct au backend sans passer par le BFF
export async function getUsersAction() {
  const response = await fetch('http://localhost:8000/api/users');
  return response.json();
}
```

## Pattern correct : bff-client

```typescript
// ✅ CORRECT - Cookie transmis automatiquement
'use server';

import { bffGet } from '../_shared/bff-client';

export async function getDataAction() {
  const response = await bffGet<{ data: Data[] }>('/api/v1/data');
  return response.data;
}
```

## API du bff-client

| Fonction | Usage |
|----------|-------|
| `bffGet<T>(endpoint, options?)` | GET request |
| `bffPost<T>(endpoint, body?, options?)` | POST request |
| `bffPut<T>(endpoint, body?, options?)` | PUT request |
| `bffPatch<T>(endpoint, body?, options?)` | PATCH request |
| `bffDelete<T>(endpoint, options?)` | DELETE request |

### Option `skipAuth`

Pour les routes publiques (login, register), utiliser `skipAuth: true` :

```typescript
const response = await bffPost<AuthResponse>(
  '/api/v1/auth/login',
  credentials,
  { skipAuth: true }
);
```

## Gestion des erreurs d'authentification

Le `bff-client` lance une `BffActionError` en cas d'erreur. Pour détecter une déconnexion :

```typescript
import { bffGet } from '../_shared/bff-client';
import { BffActionError } from '../_shared/errors';
import { redirect } from 'next/navigation';

export async function protectedAction() {
  try {
    return await bffGet<Data>('/api/v1/protected');
  } catch (error) {
    if (error instanceof BffActionError && error.statusCode === 401) {
      // Utilisateur déconnecté → rediriger vers login
      redirect('/auth/login');
    }
    throw error;
  }
}
```

### Codes d'erreur courants

| Status | Signification | Action recommandée |
|--------|---------------|-------------------|
| 401 | Non authentifié | Rediriger vers `/auth/login` |
| 403 | Accès interdit (permissions) | Afficher erreur ou rediriger |
| 422 | Validation échouée | Afficher les erreurs de validation |
| 500 | Erreur serveur | Afficher erreur générique |

## Structure des Server Actions

```
src/lib/actions/
├── _shared/
│   ├── bff-client.ts    # Client HTTP (UTILISER CELUI-CI)
│   ├── errors.ts        # Classes d'erreur
│   ├── types.ts         # Types partagés
│   └── index.ts         # Exports
├── auth/
│   └── actions.ts       # Login, logout, register
├── rbac/
│   ├── users.ts         # Gestion utilisateurs
│   ├── roles.ts         # Gestion rôles
│   └── permissions.ts   # Gestion permissions
└── demo/
    └── actions.ts       # Actions de démo
```

## Checklist avant de créer une Server Action

### Pour les requêtes vers le BFF/backend interne

- [ ] Import depuis `../_shared/bff-client`
- [ ] Utilisation de `bffGet`/`bffPost`/etc. (pas de `fetch()` direct)
- [ ] Typage générique `bffGet<{ data: MyType }>`
- [ ] Gestion des erreurs 401 si la route est protégée
- [ ] `skipAuth: true` uniquement pour les routes publiques

### Pour les requêtes vers des APIs externes publiques

- [ ] Vérifier que l'API ne nécessite pas d'auth utilisateur
- [ ] `fetch()` direct autorisé
- [ ] Gestion d'erreurs basique (try/catch ou vérification `response.ok`)
