# Research: BFF Bulletproof — Post-Implementation Audit

## Summary

Audit complet des changements BFF Bulletproof. **6 issues trouvées et corrigées**, 1 issue de fond identifiée (pagination formats incohérents — hors scope). Tous les tests passent après corrections. **Confidence: 95%**

## Findings

### Finding 1: AUTH_ROUTES incomplet (HIGH — FIXED)
- **Evidence**: strong
- **Layer**: 1 (codebase)
- **Source**: `route.ts:66-71`, `$.tsx`, Hono `two-factor.routes.ts`
- **Details**: `auth/magic-link/check`, `auth/magic-link/verify` (retournent des tokens) et `auth/two-factor/recovery` (mismatch avec `recover` dans le Set) étaient manquants.
- **Fix**: Ajouté les 3 routes dans AUTH_ROUTES des deux BFFs.

### Finding 2: drainBody absent du catch block (HIGH — FIXED)
- **Evidence**: strong
- **Layer**: 3 (first-principles analysis)
- **Source**: `route.ts` catch block, `$.tsx` catch block
- **Details**: Si une exception est levée après `apiRequest()` réussi mais avant que le body soit consommé/streamé, le `catch` ne pouvait pas drainer le body car `response` était scopé dans le `try`. Fuite mémoire réelle.
- **Fix**: Déclaré `backendResponse` avant le `try`, assigné après chaque `apiRequest()`, drainé dans le `catch`.

### Finding 3: content-length incorrect en streaming avec compression (MEDIUM — FIXED)
- **Evidence**: strong
- **Layer**: 3 (first-principles)
- **Source**: `sanitizeResponseHeaders` dans les deux BFFs
- **Details**: Node.js `fetch` décompresse gzip/br transparently. Le `Content-Length` du backend est la taille compressée, mais le body streamé est décompressé. Le client reçoit un `Content-Length` faux → truncation.
- **Fix**: Retiré `content-length` du whitelist. Le HTTP layer gère le framing.

### Finding 4: Laravel expose_headers vide (MEDIUM — FIXED)
- **Evidence**: strong
- **Layer**: 1 (codebase)
- **Source**: `apps/api-laravel/config/cors.php`
- **Details**: `exposed_headers => []` alors que Symfony et Hono exposent `X-Request-Id`.
- **Fix**: Ajouté `['X-Request-Id', 'Content-Length']`.

### Finding 5: Symfony manque Cache-Control (MEDIUM — FIXED)
- **Evidence**: strong
- **Layer**: 1 (codebase)
- **Source**: `SecurityHeadersSubscriber.php`
- **Details**: Pas de `Cache-Control: no-store` ni `Pragma: no-cache`, contrairement à Laravel.
- **Fix**: Ajouté les deux headers.

### Finding 6: fetchFromApi body leak on 401 (MEDIUM — FIXED)
- **Evidence**: strong
- **Layer**: 1 (codebase)
- **Source**: `apps/web-tanstack/src/lib/http/fetch-api.ts`
- **Details**: Le body de la réponse 401 originale n'était jamais drainé avant le retry.
- **Fix**: Ajouté `await response.body?.cancel().catch(() => {})` avant le retry.

### Finding 7: Pagination formats incohérents (MEDIUM — NOT FIXED, hors scope)
- **Evidence**: strong
- **Layer**: 1 (codebase)
- **Details**:

| Key | Standard | Laravel | Symfony | Hono (shop) | Hono (admin) |
|-----|----------|---------|---------|-------------|--------------|
| Container | `meta` | `pagination` | `meta` | `meta` | `meta` |
| Per page | `per_page` | `perPage` | `per_page` | `per_page` | `perPage` |
| Last page | `last_page` | `totalPages` | `last_page` | `total_pages` | `totalPages` |

Seul Symfony est conforme au standard documenté dans CLAUDE.md. À traiter dans un ticket séparé.

### Finding 8: CORS maintenant alignés
- **Evidence**: strong
- **Layer**: 1 (codebase post-fix)
- **Details**: Après corrections:

| Param | Symfony | Laravel | Hono |
|-------|---------|---------|------|
| allow_headers | CT, Auth, X-Requested-With, X-Request-Id, Accept-Language | CT, Auth, Accept, X-Request-Id, Accept-Language | CT, Auth, Accept, X-Request-Id, Accept-Language |
| expose_headers | Link, X-Request-Id | X-Request-Id, Content-Length | Content-Length, X-Request-Id |
| max_age | 86400 | 86400 | 86400 |
| credentials | true | true | true |
| Cache-Control | no-store (fixed) | no-store | no-store (per-route) |

Résiduel mineur : Symfony a `X-Requested-With` en plus (héritage jQuery, harmless). `Link` et `Content-Length` dans expose_headers varient mais ne posent pas de problème fonctionnel car le BFF sanitize tout.

## Verification

| Suite | Result |
|-------|--------|
| Hono | 155/155 |
| Symfony | 129/129 |
| Laravel | 121/121 |
| TypeScript (nos fichiers) | 0 errors |

## Unknowns

1. **serverActions.bodySizeLimit** ne protège pas les Route Handlers — le body entrant client n'a pas de cap explicite. Risque faible car les request bodies sont petits (JSON auth/CRUD).
2. **`cache: 'no-store'`** est ignoré dans TanStack/Bun — harmless car les backends sont sur localhost, pas de cache HTTP intermédiaire.

---

*Audit conducted 2026-03-29*
