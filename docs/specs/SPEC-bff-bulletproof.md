# Spec: BFF Bulletproof — Zero Memory Leak, Zero Security Hole

## Goal

Éliminer les 10 vulnérabilités identifiées dans les BFF Next.js et TanStack Start (buffering complet, aucune limite de taille, endpoints backend sans pagination, pas d'AbortSignal) en implémentant un proxy streaming sélectif avec gardes de sécurité multi-couche. **Completeness: 8/10**

## Context

Les deux BFF (`apps/web/` et `apps/web-tanstack/`) servent de reverse proxy entre les frontends et les 3 backends (Symfony, Laravel, Hono). Aujourd'hui, **chaque réponse backend est intégralement bufferisée en mémoire** via `response.text()`, parsée une seconde fois avec `JSON.parse()`, puis ré-encodée dans une nouvelle `Response`. Combiné avec 12+ endpoints backend qui retournent des datasets sans pagination, cela crée un risque OOM réel en production.

### Fichiers existants

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `apps/web/src/app/api/v1/[...path]/route.ts` | 655 | Proxy BFF Next.js |
| `apps/web-tanstack/src/routes/api/v1/$.tsx` | 561 | Proxy BFF TanStack |
| `apps/web/src/lib/http/api-request.ts` | 111 | Fetch wrapper Next.js |
| `apps/web-tanstack/src/lib/http/api-request.ts` | 115 | Fetch wrapper TanStack |
| `apps/web-tanstack/src/lib/http/fetch-api.ts` | 56 | Client direct services TanStack |
| `apps/web/next.config.ts` | 40 | Config Next.js |

### Problèmes identifiés (voir `docs/research/RESEARCH-bff-memory-security.md`)

| # | Problème | Sévérité |
|---|----------|----------|
| 1 | Full response buffering (`response.text()`) — 3 copies en mémoire | CRITICAL |
| 2 | Aucune limite de taille (ni request ni response) | CRITICAL |
| 3 | 12+ endpoints backend sans pagination (surtout Laravel) | HIGH |
| 4 | CVE Undici — fetch body non consommé sur erreurs = fuite mémoire | HIGH |
| 5 | Cache Next.js amplifié par headers uniques (`X-Request-Id`) | MEDIUM |
| 6 | JSON-only — binaire/upload impossible | MEDIUM |
| 7 | Double JSON parse sur chaque réponse | MEDIUM |
| 8 | Pas d'AbortSignal — client disconnect = requête zombie | MEDIUM |
| 9 | Timeouts manquants (`fetchFromApi` TanStack) | LOW |
| 10 | CORS inconsistants (Symfony manque `X-Request-Id`) | LOW |

---

## must_haves

### Truths (ce qui doit être vrai quand c'est fini)

1. **T1** — Les réponses non-auth sont streamées directement (`response.body` passé en pass-through), sans buffering en mémoire
2. **T2** — Seules les routes auth (`/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/two-factor/*`) sont bufferisées pour extraction de tokens
3. **T3** — Les requêtes BFF→backend utilisent `{ cache: 'no-store' }` pour éviter le cache Next.js
4. **T4** — Une réponse backend > `MAX_RESPONSE_SIZE` (5 MB) est rejetée avec 502 avant tout buffering
5. **T5** — Un request body > `MAX_REQUEST_SIZE` (1 MB) est rejeté avec 413
6. **T6** — L'`AbortSignal` de la requête client est propagé au `fetch()` backend
7. **T7** — Tous les endpoints backend admin ont un cap de pagination dur (max 100 items par page)
8. **T8** — `fetchFromApi` (TanStack) a un timeout de 30s
9. **T9** — Les 3 backends ont des headers CORS cohérents (`X-Request-Id` dans allow + expose)
10. **T10** — Les réponses backend dont le body n'est pas consommé (erreurs, redirects) sont explicitement drainées

### Artifacts (fichiers qui doivent exister/être modifiés)

| Path | Provides | Notes |
|------|----------|-------|
| `apps/web/src/app/api/v1/[...path]/route.ts` | Proxy streaming + auth buffering sélectif | modified |
| `apps/web-tanstack/src/routes/api/v1/$.tsx` | Même refactoring streaming | modified |
| `apps/web/src/lib/http/api-request.ts` | `cache: 'no-store'`, AbortSignal propagation | modified |
| `apps/web-tanstack/src/lib/http/api-request.ts` | Même chose | modified |
| `apps/web-tanstack/src/lib/http/fetch-api.ts` | Timeout 30s, drain body | modified |
| `apps/web/next.config.ts` | `serverActions.bodySizeLimit` | modified |
| `apps/api-laravel/app/Features/Admin/Actions/AdminListProducts.php` | `->paginate()` avec cap 100 | modified |
| `apps/api-laravel/app/Features/Admin/Actions/AdminListOrders.php` | idem | modified |
| `apps/api-laravel/app/Features/Admin/Actions/ListCustomers.php` | idem | modified |
| `apps/api-laravel/app/Features/Admin/Actions/ListReviews.php` | idem | modified |
| `apps/api-laravel/app/Features/Admin/Actions/Inventory.php` | idem | modified |
| `apps/api-hono/src/features/admin/admin.repository.ts` | `getInventory` + `findAllSegments` → LIMIT | modified |
| `apps/api-hono/src/features/support/support.repository.ts` | Pagination sur conversations + messages | modified |
| `apps/api-sf/config/packages/api_platform.yaml` | `pagination_client_max_items_per_page: 100` | modified |
| `apps/api-sf/config/packages/nelmio_cors.yaml` | `X-Request-Id` dans allow/expose headers | modified |

### Key Links (connexions qui doivent fonctionner)

| From | To | Via | Verify with |
|------|----|----|-------------|
| `web/route.ts` (streaming path) | Backend response | `response.body` ReadableStream | `curl -v /api/v1/shop/products` — vérifie chunked |
| `web/route.ts` (auth path) | `storeTokensInResponse` | JSON buffer + parse | `curl /api/v1/auth/login` — vérifie cookies set |
| `web/api-request.ts` | Backend fetch | `{ cache: 'no-store', signal }` | Vérifier absence cache hit en logs |
| `web-tanstack/$.tsx` | Même dual path | Idem | Idem |
| Laravel admin actions | `->paginate()` | Eloquent | `curl /api/v1/admin/products?per_page=200` → cap à 100 |
| Hono `getInventory` | `.limit()` | Drizzle | `curl /api/v1/admin/inventory` → paginé |

---

## Requirements

### Wave 1 — Guards & Caps (élimine les risques immédiats)

**R1. Body size limits (→ T4, T5)**

Dans `api-request.ts` (×2), avant de consommer le body :

```typescript
// Response size guard
const contentLength = Number(response.headers.get('content-length') || '0')
if (contentLength > MAX_RESPONSE_SIZE) {
  // Drain le body pour éviter la fuite mémoire Undici
  await response.body?.cancel()
  throw new ApiException(502, 'Backend response too large')
}
```

Dans `next.config.ts` :
```typescript
experimental: {
  serverActions: {
    bodySizeLimit: '1mb',
  },
},
```

**R2. `cache: 'no-store'` sur tous les fetch BFF→backend (→ T3)**

Dans `apiRequest()` des deux `api-request.ts` :
```typescript
const response = await fetch(url, {
  ...options,
  cache: 'no-store',  // AJOUT — évite le cache Next.js
  signal,
})
```

**R3. Pagination caps backend (→ T7)**

*Laravel* — Remplacer `.get()` par `.paginate()` avec cap :
```php
// Pattern pour les 5 actions admin
$perPage = min(100, max(1, (int) $request->input('per_page', 20)));
$items = Model::with(...)->orderBy(...)->paginate($perPage);

return response()->json([
    'success' => true,
    'data' => $items->items(),
    'meta' => [
        'page' => $items->currentPage(),
        'per_page' => $items->perPage(),
        'total' => $items->total(),
        'last_page' => $items->lastPage(),
    ],
]);
```

*Hono* — `getInventory()` et `findAllSegments()` doivent accepter `page`/`perPage` :
```typescript
export async function getInventory(page = 1, perPage = 20) {
  const offset = (page - 1) * perPage
  const cappedPerPage = Math.min(perPage, 100)
  return db.select({...}).from(schema.products)
    .orderBy(asc(schema.products.name))
    .limit(cappedPerPage)
    .offset(offset)
}
```

*Hono support* — `findConversationsByUserId`, `findConversationsByAgentId`, `findUnassignedConversations`, `findMessagesByConversationId` doivent accepter pagination (défaut 50, cap 100).

*Symfony* — Ajouter dans `api_platform.yaml` :
```yaml
pagination_client_max_items_per_page: 100
```

**R4. CORS uniformisation (→ T9)**

*Symfony* `nelmio_cors.yaml` — ajouter `X-Request-Id` et `Accept-Language` dans `allow_headers`, `X-Request-Id` dans `expose_headers`. Aligner `max_age` sur 86400.

### Wave 2 — Streaming & Signals (élimine le buffering)

**R5. Streaming pass-through pour les routes non-auth (→ T1, T2)**

Introduire un helper `isAuthRoute(path)` dans les deux proxies :
```typescript
const AUTH_ROUTES = new Set([
  'auth/login', 'auth/register', 'auth/refresh', 'auth/logout',
  'auth/forgot-password', 'auth/reset-password',
  'auth/two-factor/enable', 'auth/two-factor/verify',
  'auth/two-factor/disable', 'auth/two-factor/recover',
])

function isAuthRoute(path: string): boolean {
  const normalized = path.replace(/^\//, '').replace(/\/$/, '')
  return AUTH_ROUTES.has(normalized)
}
```

Dans `proxyRequest` / `handleBffRequest`, après le fetch backend :
```typescript
if (isAuthRoute(cleanPath)) {
  // Auth path — buffering sélectif (payloads < 2 KB)
  const text = await response.text()
  // ... extraction tokens existante ...
  return buildAuthResponse(text, response.status, response.headers, ...)
} else {
  // Data path — streaming pass-through
  const headers = sanitizeResponseHeaders(response.headers)
  return new Response(response.body, {
    status: response.status,
    headers,
  })
}
```

**R6. AbortSignal propagation (→ T6)**

Dans `proxyRequest` / `handleBffRequest` :
```typescript
const response = await apiRequest(backendUrl, {
  ...options,
  signal: request.signal,  // AJOUT — propage l'abort du client
  timeoutMs: 30_000,
})
```

Dans `withTimeoutSignal` de `api-request.ts`, combiner le signal parent avec le timeout :
```typescript
// Déjà implémenté : le signal parent est combiné via AbortSignal.any()
// Vérifier que request.signal est bien passé jusqu'ici
```

**R7. Drain des bodies non consommés (→ T10)**

Sur tout chemin d'erreur où une `Response` backend existe mais son body n'est pas lu :
```typescript
// Helper
async function drainBody(response: Response): Promise<void> {
  try {
    await response.body?.cancel()
  } catch {
    // Ignore — body peut déjà être consommé ou fermé
  }
}
```

Appeler `drainBody()` dans :
- Les catch blocks de `proxyRequest` / `handleBffRequest`
- Après un 401 si le refresh échoue et qu'on ne retry pas
- Quand `Content-Length` > max

**R8. Timeout sur fetchFromApi (→ T8)**

Dans `apps/web-tanstack/src/lib/http/fetch-api.ts` :
```typescript
const response = await fetch(url, {
  ...options,
  signal: AbortSignal.timeout(30_000),  // AJOUT
})
```

**R9. Sanitize des headers de réponse streamée (→ T1)**

Ne pas transférer les headers internes backend :
```typescript
function sanitizeResponseHeaders(backendHeaders: Headers): Headers {
  const headers = new Headers()
  const PASSTHROUGH = ['content-type', 'content-length', 'cache-control',
    'etag', 'last-modified', 'x-request-id', 'x-total-count']
  for (const key of PASSTHROUGH) {
    const value = backendHeaders.get(key)
    if (value) headers.set(key, value)
  }
  // Security headers ajoutés par le BFF, pas hérités du backend
  headers.set('x-content-type-options', 'nosniff')
  headers.set('x-frame-options', 'DENY')
  return headers
}
```

---

## Non-Goals

- **Upload multipart** — Aucun endpoint backend ne le supporte. Sera spécifié séparément quand le shop aura des images.
- **`@headless/proxy` package partagé** — Prématuré. Les deux BFF restent des copies séparées pour l'instant.
- **Next.js 16 `proxy.ts`** — API trop récente, notre logique auth est trop custom. À réévaluer dans une future version.
- **Support `application/octet-stream` en entrée** — Pas de cas d'usage.
- **Refactoring modulaire du proxy** (option "Membrane") — Over-engineering pour l'instant.

---

## Design

### Architecture finale

```
                         ┌─ isAuthRoute? ─┐
                         │                │
Client ──► BFF Route ──► │  YES: buffer   │ ──► Backend API
  │        Handler       │  (< 2KB)      │       │
  │          │           │  extract tokens│       │
  │          │           │                │       │
  │     AbortSignal ──►  │  NO: stream    │ ◄─────┘
  │     propagated       │  response.body │
  │                      │  pass-through  │
  │                      └────────────────┘
  │
  ├── Size guard: request > 1MB → 413
  ├── Size guard: response > 5MB → 502
  ├── cache: 'no-store' on all backend fetches
  └── AbortSignal: client disconnect → backend fetch aborted
```

### Le problème du 401-retry

Le chemin 401-retry (token expiré → refresh → rejouer la requête) est le cas complexe :

1. La requête originale est envoyée au backend
2. Le backend retourne 401
3. Le BFF fait un refresh token
4. Le BFF **rejoue** la requête originale

Au step 4, il faut le body de la requête originale. Aujourd'hui, `extractBody()` parse le JSON et le garde en mémoire. Avec le streaming, on a deux options :

**Option choisie** : garder le buffering du request body tel quel (via `extractBody()`). Les request bodies sont petits (JSON, < 100 KB). Le problème de mémoire est sur les **response** bodies (datasets de 10 MB+), pas les request bodies. Le request body est déjà lu une seule fois et stocké en string — c'est acceptable.

Le changement est donc uniquement sur le **response path** :
- Route non-auth : `response.body` streamé directement
- Route auth : `response.text()` → parse tokens → `new Response(text, ...)`
- 401-retry : la requête est rejouée, la nouvelle réponse suit le même routing auth/non-auth

---

## Edge Cases & Risks

### 1. Backend sans Content-Length header
**Risque** : Le size guard basé sur `Content-Length` ne protège pas si le backend ne l'envoie pas (chunked transfer).
**Mitigation** : Pour les routes auth (bufferisées), utiliser un `ReadableStream` wrapper qui compte les bytes et aborte à `MAX_AUTH_RESPONSE_SIZE` (64 KB). Pour les routes non-auth (streamées), le client gère — le backend est interne et de confiance.
**Likelihood** : Faible (les 3 backends envoient `Content-Length` pour les JSON). **Impact** : Moyen.

### 2. Race condition sur le 401-retry
**Risque** : Le client disconnect (AbortSignal) pendant le refresh token, mais le refresh réussit. Les nouveaux tokens sont stockés en cookies, mais la réponse finale n'est jamais envoyée.
**Mitigation** : C'est acceptable — le client fera une nouvelle requête avec les tokens frais via les cookies.
**Likelihood** : Faible. **Impact** : Nul.

### 3. Streaming + Next.js middleware
**Risque** : Le middleware Edge Next.js pourrait essayer de lire le body de la réponse streamée.
**Mitigation** : Le middleware actuel ne touche que les headers/cookies, pas le body. Vérifié dans le code existant.
**Likelihood** : Très faible. **Impact** : Elevé si ça arrive.

### 4. Headers perdus en streaming
**Risque** : Le whitelist `sanitizeResponseHeaders` pourrait omettre des headers nécessaires (pagination `Link`, `X-Total-Count`).
**Mitigation** : Whitelist explicite incluant les headers de pagination. Tests d'intégration.
**Likelihood** : Moyen (à vérifier). **Impact** : Moyen.

### 5. TanStack `setCookie` incompatible avec streaming
**Risque** : Dans TanStack Start, `setCookie()` de `@tanstack/react-start/server` pourrait nécessiter l'accès au response builder avant le return.
**Mitigation** : Les cookies ne sont modifiés que sur les routes auth (path bufferisé). Les routes non-auth ne touchent jamais aux cookies.
**Likelihood** : Nul (le path streaming ne modifie pas de cookies). **Impact** : Nul.

---

## Open Questions

1. **[VERIFY AT IMPL TIME]** Est-ce que `AbortSignal.any([request.signal, AbortSignal.timeout(30000)])` est supporté par la version Node.js du projet ? Sinon, fallback sur le pattern `AbortController` combo existant dans `withTimeoutSignal`.

2. **[VERIFY AT IMPL TIME]** Le `response.body` passé à `new Response()` dans un Next.js Route Handler — est-ce que le streaming fonctionne réellement end-to-end en production build (pas juste en dev) ? Tester avec `curl --no-buffer`.

3. **[ASSUMPTION]** Les payloads auth font < 2 KB. Si un backend retourne un payload auth anormalement large (ex: profil utilisateur avec beaucoup de metadata), le size guard de 64 KB sur les routes auth le captera.

---

## Acceptance Criteria

| AC | Maps to | Verification |
|----|---------|-------------|
| AC1 | T1 | `curl --no-buffer -s /api/v1/shop/products` retourne des chunks (vérifier `Transfer-Encoding: chunked` ou first byte < 100ms) |
| AC2 | T2 | `curl -X POST /api/v1/auth/login` retourne les cookies `auth_token` + `refresh_token` correctement |
| AC3 | T3 | Aucune entrée cache Next.js pour les requêtes BFF→backend (vérifier en logs dev `MISS` ou absence de `HIT`) |
| AC4 | T4 | Un endpoint retournant > 5 MB → BFF retourne 502 |
| AC5 | T5 | Un POST avec body > 1 MB → BFF retourne 413 |
| AC6 | T6 | Un `curl` interrompu (Ctrl+C) → aucune requête zombie côté backend (vérifier logs backend) |
| AC7 | T7 | `GET /api/v1/admin/products?per_page=500` retourne max 100 items sur les 3 backends |
| AC8 | T8 | `fetchFromApi` TanStack timeout après 30s sur un backend lent |
| AC9 | T9 | `OPTIONS /api/v1/auth/me` sur Symfony retourne `X-Request-Id` dans `Access-Control-Allow-Headers` |
| AC10 | T10 | Aucune fuite mémoire après 1000 requêtes en boucle (`process.memoryUsage().heapUsed` stable ±10%) |

---

## Implementation Waves

### Wave 1 — Guards & Caps (~3h, parallélisable)

Peut être fait en 3 agents parallèles (file ownership disjoint) :

| Agent | Fichiers | Requirements |
|-------|----------|-------------|
| BFF-web | `web/route.ts`, `web/api-request.ts`, `web/next.config.ts` | R1, R2 |
| BFF-tanstack | `tanstack/$.tsx`, `tanstack/api-request.ts`, `tanstack/fetch-api.ts` | R1, R2, R8 |
| Backends | 5× Laravel, 2× Hono repo, 1× Hono handler, 1× SF yaml, 1× SF cors | R3, R4 |

### Wave 2 — Streaming & Signals (~1-2j, séquentiel)

Modifier les proxies pour le dual-path auth/streaming. Séquentiel car le pattern doit être validé sur Next.js avant d'être répliqué sur TanStack.

| Step | Fichiers | Requirements |
|------|----------|-------------|
| 1 | `web/route.ts` | R5, R6, R7, R9 |
| 2 | Test Next.js E2E (manual curl) | AC1, AC2, AC6 |
| 3 | `tanstack/$.tsx` | R5, R6, R7, R9 |
| 4 | Test TanStack E2E | AC1, AC2, AC6 |

---

**Confidence: 92%** — Spec prête. Les 2 open questions sont vérifiables au moment de l'implémentation, pas des bloqueurs.

Prochaine étape : `/plan bff-bulletproof` pour le plan d'implémentation détaillé.

---

*Spec rédigée le 2026-03-29 — basée sur research + brainstorm du même jour*
