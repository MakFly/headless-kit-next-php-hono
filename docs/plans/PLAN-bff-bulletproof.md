# Plan: BFF Bulletproof

**Spec**: `docs/specs/SPEC-bff-bulletproof.md`
**Scope**: 15 fichiers modifiés, 0 fichier créé, 2 waves, 6 milestones

## Architecture

```
Wave 1 (parallel — 3 agents)          Wave 2 (sequential)
┌──────────────┐                      ┌──────────────────────┐
│ M1: BFF-web  │                      │ M4: Streaming Next.js│
│ guards+cache │                      │ dual-path auth/data  │
├──────────────┤                      ├──────────────────────┤
│ M2: BFF-ts   │  ──── all done ───►  │ M5: Streaming TS     │
│ guards+cache │                      │ dual-path auth/data  │
├──────────────┤                      ├──────────────────────┤
│ M3: Backends │                      │ M6: Verify all ACs   │
│ pagination   │                      │ manual curl tests    │
└──────────────┘                      └──────────────────────┘
```

## Key Decisions

### Decision: Streaming granularity
**Options**: A) Stream toutes les réponses, buffer auth via intercepteur B) Dual-path explicite `isAuthRoute` C) Header-based (`X-Needs-Token-Extract`)
**Pick**: B — dual-path `isAuthRoute`
**Why**: Explicite, pas de magie de headers, les routes auth sont un set fini et stable. Le code dit clairement "cette route bufferise parce qu'on extrait des tokens".
**One-way door?**: Non — on peut toujours ajouter des routes au Set ou passer au streaming total.

### Decision: Response size guard sans Content-Length
**Options**: A) Trust Content-Length uniquement B) Counting stream wrapper C) Ignorer (backends internes de confiance)
**Pick**: A + fallback C — vérifier `Content-Length` quand présent, sinon laisser passer (backends internes). Pour les routes auth uniquement, ajouter un cap dur de 64 KB en comptant les bytes lus.
**Why**: Les 3 backends envoient `Content-Length` pour le JSON. Le cas sans header n'arrive qu'en chunked (pas utilisé). Le cap auth à 64 KB protège contre un backend compromis sans overhead sur le streaming.
**One-way door?**: Non.

### Decision: Format pagination Laravel admin
**Options**: A) Utiliser `->paginate()` natif B) Utiliser `forPage()` + `$this->paginated()` comme `ListProducts`
**Pick**: B — suivre le pattern existant de `ListProducts.php` avec `$this->paginated()` du trait `ApiResponder`
**Why**: Cohérence avec le code existant. Tous les endpoints shop utilisent déjà ce pattern. `->paginate()` natif retourne un format différent (`LengthAwarePaginator`).
**One-way door?**: Non.

### Decision: Hono pagination format inventory/support
**Options**: A) `{ data, pagination: { page, perPage, total, totalPages } }` B) Nouveau format
**Pick**: A — suivre le format existant de `findAllOrders`
**Why**: Cohérence avec les handlers admin déjà paginés (`findAllOrders`, `findAllCustomers`, `findAllReviews`).
**One-way door?**: Non.

---

## Waves

### Wave 1 (parallel) — Guards & Caps

#### M1: BFF Next.js — Size guards + cache disable
- **Goal**: Les requêtes BFF→backend ont `cache: 'no-store'`, les réponses > 5 MB sont rejetées, le body size est limité
- **Files owned**:
  - `apps/web/src/lib/http/api-request.ts` (modified)
  - `apps/web/next.config.ts` (modified)
- **Tasks**:
  - [ ] Dans `apiRequest()` (`api-request.ts` ~L68): ajouter `cache: 'no-store' as const` dans les options fetch
  - [ ] Dans `apiRequest()`: après le fetch, ajouter le response size guard — vérifier `Content-Length` > `MAX_RESPONSE_SIZE` (5 MB = 5_242_880), si oui `await response.body?.cancel()` puis throw `ApiException(502, 'Backend response too large')`
  - [ ] Ajouter la constante `MAX_RESPONSE_SIZE = 5_242_880` en haut du fichier
  - [ ] Dans `next.config.ts`: ajouter `experimental: { serverActions: { bodySizeLimit: '1mb' } }`
- **Tests**: `ig "cache" apps/web/src/lib/http/api-request.ts` pour vérifier `no-store`. Vérifier que `next.config.ts` compile (`bun run --filter @headless/web build` — smoke test).
- **Done when**: T3 (cache no-store), T4 (response size guard), T5 (request body limit)

#### M2: BFF TanStack — Size guards + cache disable + timeout
- **Goal**: Mêmes guards que M1 + timeout sur `fetchFromApi`
- **Files owned**:
  - `apps/web-tanstack/src/lib/http/api-request.ts` (modified)
  - `apps/web-tanstack/src/lib/http/fetch-api.ts` (modified)
- **Tasks**:
  - [ ] Dans `apiRequest()` (`api-request.ts` ~L68): ajouter `cache: 'no-store' as const` dans les options fetch
  - [ ] Dans `apiRequest()`: après le fetch, ajouter le response size guard identique à M1
  - [ ] Ajouter la constante `MAX_RESPONSE_SIZE = 5_242_880` en haut du fichier
  - [ ] Dans `fetchFromApi()` (`fetch-api.ts`): ajouter `signal: AbortSignal.timeout(30_000)` dans les options fetch (tant la requête initiale que le retry)
- **Tests**: `ig "no-store" apps/web-tanstack/src/lib/http/` pour vérifier. `ig "timeout" apps/web-tanstack/src/lib/http/fetch-api.ts`.
- **Done when**: T3, T4, T8 (timeout fetchFromApi)

#### M3: Backends — Pagination caps + CORS fix
- **Goal**: Tous les endpoints admin ont un cap de pagination dur à 100, CORS uniformisés
- **Files owned** (3 backends, 0 overlap avec M1/M2):
  - `apps/api-laravel/app/Features/Admin/Actions/AdminListProducts.php` (modified)
  - `apps/api-laravel/app/Features/Admin/Actions/AdminListOrders.php` (modified)
  - `apps/api-laravel/app/Features/Admin/Actions/ListCustomers.php` (modified)
  - `apps/api-laravel/app/Features/Admin/Actions/ListReviews.php` (modified)
  - `apps/api-laravel/app/Features/Admin/Actions/Inventory.php` (modified)
  - `apps/api-hono/src/features/admin/admin.repository.ts` (modified)
  - `apps/api-hono/src/features/admin/admin.handlers.ts` (modified)
  - `apps/api-hono/src/features/support/support.repository.ts` (modified)
  - `apps/api-sf/config/packages/api_platform.yaml` (modified)
  - `apps/api-sf/config/packages/nelmio_cors.yaml` (modified)
- **Tasks**:

  **Laravel (5 actions):**
  - [ ] `AdminListProducts.php`: remplacer `->get()` par `forPage($page, $perPage)->get()` avec `$perPage = min(100, max(1, (int) $request->input('per_page', 20)))`, `$page = max(1, (int) $request->input('page', 1))`, count + `$this->paginated()`
  - [ ] `AdminListOrders.php`: même pattern — `forPage` + cap 100 + `$this->paginated()`. Conserver le `with('items', 'user')`.
  - [ ] `ListCustomers.php`: même pattern
  - [ ] `ListReviews.php`: même pattern — conserver les filtres `status`/`rating` existants, ajouter pagination après filtrage
  - [ ] `Inventory.php`: même pattern — conserver le `select()` existant

  **Hono admin (2 fonctions repo + 1 handler):**
  - [ ] `admin.repository.ts` — `getInventory()`: ajouter params `page = 1, perPage = 20`, cap `Math.min(perPage, 100)`, ajouter `.limit(cappedPerPage).offset(offset)`, ajouter count query, retourner `{ data, pagination: { page, perPage: cappedPerPage, total, totalPages } }`
  - [ ] `admin.repository.ts` — `findAllSegments()`: même pattern pagination
  - [ ] `admin.handlers.ts` — `getInventory` handler (~L115): lire `page`/`per_page` depuis query params, passer à `getInventory(page, perPage)`, formater la réponse paginée

  **Hono support (4 fonctions repo):**
  - [ ] `support.repository.ts` — `findConversationsByUserId()`: ajouter `page = 1, perPage = 50`, cap 100, limit/offset, count
  - [ ] `support.repository.ts` — `findConversationsByAgentId()`: idem
  - [ ] `support.repository.ts` — `findUnassignedConversations()`: idem
  - [ ] `support.repository.ts` — `findMessagesByConversationId()`: idem, perPage défaut 100, cap 200 (messages plus nombreux)

  **Symfony:**
  - [ ] `api_platform.yaml`: ajouter `pagination_client_max_items_per_page: 100` sous `defaults`
  - [ ] `nelmio_cors.yaml`: ajouter `'X-Request-Id'` et `'Accept-Language'` dans `allow_headers`, `'X-Request-Id'` dans `expose_headers`, passer `max_age` à 86400

- **Tests**:
  - Laravel: `cd apps/api-laravel && php artisan test` (si tests admin existent)
  - Hono: `cd apps/api-hono && bun test`
  - Symfony: `cd apps/api-sf && php bin/phpunit`
- **Done when**: T7 (pagination caps), T9 (CORS uniformisés)

---

### Wave 2 (sequential, after Wave 1) — Streaming & Signals

#### M4: Streaming Next.js — Dual-path + AbortSignal + drain
- **Depends on**: M1
- **Goal**: Les réponses non-auth sont streamées (pass-through `response.body`), l'AbortSignal client est propagé, les bodies non consommés sont drainés
- **Files owned**:
  - `apps/web/src/app/api/v1/[...path]/route.ts` (modified)
- **Tasks**:
  - [ ] Ajouter le helper `isAuthRoute(path: string): boolean` avec le Set des routes auth (`auth/login`, `auth/register`, `auth/refresh`, `auth/logout`, `auth/forgot-password`, `auth/reset-password`, `auth/two-factor/enable`, `auth/two-factor/verify`, `auth/two-factor/disable`, `auth/two-factor/recover`)
  - [ ] Ajouter le helper `sanitizeResponseHeaders(backendHeaders: Headers): Headers` — whitelist: `content-type`, `content-length`, `cache-control`, `etag`, `last-modified`, `x-request-id`, `x-total-count`, `link` + ajout `x-content-type-options: nosniff`, `x-frame-options: DENY`
  - [ ] Ajouter le helper `drainBody(response: Response): Promise<void>` — `await response.body?.cancel()` dans un try/catch
  - [ ] Dans `proxyRequest()` — **happy path** (actuellement ~L499): remplacer `const responseData = await response.text()` par le dual-path:
    - Si `isAuthRoute(cleanPath)`: garder le comportement actuel (`response.text()` → `buildResponse()`)
    - Sinon: `return new Response(response.body, { status: response.status, headers: sanitizeResponseHeaders(response.headers) })` + `setNoStoreHeaders(streamingResponse)`
  - [ ] Dans `proxyRequest()` — **401-retry path** (actuellement ~L463): même dual-path après le retry
  - [ ] Propager `request.signal` au fetch backend — dans l'appel `apiRequest()` (~L428), ajouter `signal: request.signal` dans les options (note: `withTimeoutSignal` dans `api-request.ts` combine déjà le signal parent avec le timeout via `AbortSignal.any` — vérifier)
  - [ ] Ajouter `drainBody()` dans le catch block principal (~L508) si `response` existe
  - [ ] Ajouter `drainBody()` quand le refresh 401 échoue et qu'on retourne SESSION_EXPIRED (~L477) — la réponse 401 originale n'est jamais lue (fuite mémoire confirmée)
  - [ ] Vérifier que `buildResponse()` n'est appelé QUE sur les routes auth (le code de `buildResponse` reste intact)
- **Tests**: Manual curl:
  - `curl -v http://localhost:3300/api/v1/shop/products` → vérifie streaming (headers chunked ou rapide TTFB)
  - `curl -X POST http://localhost:3300/api/v1/auth/login -d '{"email":"...","password":"..."}' -H 'Content-Type: application/json'` → vérifie cookies auth set
- **Done when**: T1 (streaming non-auth), T2 (buffering auth), T6 (AbortSignal), T10 (drain bodies)

#### M5: Streaming TanStack — Dual-path + AbortSignal + drain
- **Depends on**: M2, M4 (pattern validé sur Next.js)
- **Goal**: Même transformation que M4, adaptée aux APIs TanStack Start
- **Files owned**:
  - `apps/web-tanstack/src/routes/api/v1/$.tsx` (modified)
- **Tasks**:
  - [ ] Ajouter `isAuthRoute()` — même Set que M4
  - [ ] Ajouter `sanitizeResponseHeaders()` — même whitelist que M4
  - [ ] Ajouter `drainBody()` — même helper que M4
  - [ ] Dans `handleBffRequest()` — **happy path** (~L459): dual-path streaming vs auth buffering
  - [ ] Dans `handleBffRequest()` — **401-retry path** (~L431): même dual-path
  - [ ] Propager `request.signal` au fetch backend — dans l'appel `apiRequest()`, ajouter `signal: request.signal`
  - [ ] Ajouter `drainBody()` dans le catch block et dans le path SESSION_EXPIRED
  - [ ] Note TanStack: `storeTokens()` utilise `setCookie()` de `@tanstack/react-start/server` — vérifier que ça fonctionne toujours quand on retourne une `Response` standard (pas via le builder TanStack). Si problème, wrapper la `Response` streamée pour ajouter les headers de cookie.
- **Tests**: Manual curl sur port 3301 (même tests que M4)
- **Done when**: T1, T2, T6, T10 (mêmes truths que M4, côté TanStack)

#### M6: Verification — Acceptance criteria check
- **Depends on**: M3, M4, M5
- **Goal**: Valider les 10 acceptance criteria de la spec
- **Files owned**: aucun (read-only verification)
- **Tasks**:
  - [ ] AC1: `curl --no-buffer -s http://localhost:3300/api/v1/shop/products` → streaming vérifié
  - [ ] AC2: `curl -X POST http://localhost:3300/api/v1/auth/login` → cookies `auth_token` + `refresh_token` corrects
  - [ ] AC3: Vérifier absence de cache hits dans les logs dev Next.js
  - [ ] AC4: Simuler réponse > 5 MB (endpoint test ou mock) → BFF retourne 502
  - [ ] AC7: `curl http://localhost:8002/api/v1/admin/products?per_page=500` → max 100 items (Laravel)
  - [ ] AC7: `curl http://localhost:3333/api/v1/admin/inventory?per_page=500` → max 100 items (Hono)
  - [ ] AC7: `curl http://localhost:8001/api/v1/products?itemsPerPage=500` → max 100 items (Symfony)
  - [ ] AC9: `curl -X OPTIONS http://localhost:8001/api/v1/auth/me -H 'Origin: http://localhost:3300'` → `X-Request-Id` dans `Access-Control-Allow-Headers`
  - [ ] Exécuter les tests existants sur les 3 backends pour vérifier 0 régression
- **Done when**: Tous les ACs passent, tous les tests backend sont verts

---

## must_haves Verification

| must_have Truth | Verified by | Milestone |
|----------------|-------------|-----------|
| T1 — Streaming non-auth | curl --no-buffer + TTFB | M4, M5 |
| T2 — Buffering auth seulement | curl login → cookies set | M4, M5 |
| T3 — cache: 'no-store' | ig "no-store" dans api-request.ts | M1, M2 |
| T4 — Response > 5 MB → 502 | Test avec endpoint large | M1, M2 |
| T5 — Request > 1 MB → 413 | next.config.ts bodySizeLimit | M1 |
| T6 — AbortSignal propagé | curl Ctrl+C + logs backend | M4, M5 |
| T7 — Pagination cap 100 | curl per_page=500 sur 3 backends | M3 |
| T8 — fetchFromApi timeout 30s | ig "timeout" dans fetch-api.ts | M2 |
| T9 — CORS X-Request-Id | curl OPTIONS sur Symfony | M3 |
| T10 — Drain bodies non consommés | drainBody() dans catch + 401 fail | M4, M5 |

## Deviation Rules

| Level | Trigger | Permission |
|-------|---------|-----------|
| 1. Bug dans le code existant | Bloque le progrès | Auto-fix, noter dans le plan |
| 2. Validation/sécurité manquante | Gap critique | Auto-fix, noter dans le plan |
| 3. Dépendance bloquante | Impossible de continuer | Auto-fix, noter dans le plan |
| 4. Changement d'architecture | Shift structurel | **STOP — demander à l'utilisateur** |

Exemples concrets :
- Si `withTimeoutSignal` ne supporte pas `AbortSignal.any` → Level 1, implémenter le fallback `AbortController` combo
- Si le streaming `response.body` ne fonctionne pas dans Next.js Route Handler → Level 4, STOP (change l'approche fondamentale)
- Si `setCookie()` TanStack ne fonctionne pas avec une `Response` standard → Level 3, wrapper la Response

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Streaming ne fonctionne pas en prod Next.js | Low | High | Tester avec `bun run build && bun run start` avant de merge |
| `setCookie` TanStack incompatible avec Response standard | Low | Medium | Les cookies ne sont settés que sur les routes auth (bufferisées) — pas de risque sur le path streaming |
| Laravel `ApiResponder` trait n'a pas les méthodes attendues | Low | Low | Vérifier l'interface du trait avant d'implémenter |
| Hono support handlers cassés par changement de signature repo | Medium | Medium | Vérifier tous les call sites de chaque fonction repo modifiée |
| `AbortSignal.any` non disponible | Low | Low | Fallback sur le pattern combo existant dans `withTimeoutSignal` |

## Scope Summary

| Wave | Milestones | Files | Complexity |
|------|-----------|-------|-----------|
| 1 (parallel) | M1, M2, M3 | 12 | S (M1, M2), M (M3) |
| 2 (sequential) | M4, M5, M6 | 2 + verification | M (M4), M (M5), S (M6) |
| **Total** | **6** | **15 files** | **M overall** |

---

**Confidence: 92%** — Plan solide. Le seul point d'incertitude est le streaming `response.body` en production Next.js (vérifié en M6). Les patterns existants sont clairs et réutilisables.

Dis "go" pour lancer la Wave 1 (3 agents parallèles).

---

*Plan rédigé le 2026-03-29*
