# Brainstorm: BFF Bulletproof — 0 bug, 0 fuite mémoire, 0 faille

## Context

La recherche (`docs/research/RESEARCH-bff-memory-security.md`) a identifié **10 problèmes** dans les BFF Next.js et TanStack Start. Les deux plus critiques :
- **Full response buffering** via `response.text()` → 3 copies en mémoire par requête
- **Aucune limite de taille** nulle part dans la chaîne (BFF + backends)

Le BFF est la pièce maîtresse de l'architecture Headless Kit — c'est le produit commercial. Il doit être irréprochable.

### Fichiers concernés
- `apps/web/src/app/api/v1/[...path]/route.ts` (655 lignes) — proxy Next.js
- `apps/web-tanstack/src/routes/api/v1/$.tsx` (561 lignes) — proxy TanStack
- `apps/web/src/lib/http/api-request.ts` (112 lignes) — fetch wrapper Next.js
- `apps/web-tanstack/src/lib/http/api-request.ts` (116 lignes) — fetch wrapper TanStack
- `apps/web-tanstack/src/lib/http/fetch-api.ts` (56 lignes) — server function fetch
- `apps/web/next.config.ts` (41 lignes)
- 12+ endpoints backend sans pagination (Laravel surtout)

---

## Questions structurées

**Q1: Faut-il streamer TOUTES les réponses ou seulement celles > seuil ?**
- Ce que je sais : seules les réponses auth (`/auth/login`, `/auth/refresh`) ont besoin d'extraction de tokens. Tout le reste est du pass-through pur.
- Ce qu'il faut décider : seuil de basculement buffering → streaming, ou streaming par défaut ?
- Mon default : **streaming par défaut, buffering sélectif uniquement sur les routes auth**. Les routes auth retournent des payloads < 1 KB — le buffering est négligeable.

**Q2: Le support binaire/upload est-il requis maintenant ou c'est du futur ?**
- Ce que je sais : aucun endpoint backend ne gère les uploads. Le filesystem Laravel est configuré mais inutilisé. Le shop va probablement avoir besoin d'images produit.
- Ce qu'il faut décider : implémenter le passthrough binaire maintenant (fondation) ou plus tard (YAGNI) ?
- Mon default : **maintenant pour le passthrough réponse** (images, PDF), **plus tard pour l'upload multipart** (pas d'endpoint backend).

**Q3: Quelle est la stratégie de pagination côté backend — uniformiser ou patcher ?**
- Ce que je sais : Symfony a la meilleure pagination (cap 100 sur inventory). Laravel a 5 endpoints sans aucun LIMIT. Hono en a 2.
- Ce qu'il faut décider : pagination obligatoire partout avec cap dur, ou juste les endpoints exposés via BFF ?
- Mon default : **cap dur universel** — un backend sans cap est une bombe à retardement, même derrière un BFF protégé.

---

## Options

### 1. "The Ghost Ship" — Ne rien faire (Completeness: 0/10, Effort: —)

**What**: On laisse le code tel quel. Le BFF fonctionne en dev avec des datasets petits.

**Builds on**: état actuel

**Pros**:
- Zero effort
- Aucun risque de régression

**Cons**:
- OOM en production dès que les datasets grossissent
- Vecteur DoS trivial (envoyer des requêtes + disconnect)
- CVE Undici potentiellement non patché
- Fuite mémoire graduelle via le cache Next.js
- Impossible de servir des fichiers binaires
- **Inacceptable pour un produit commercial**

**One-way / two-way door?**: Two-way, mais le coût augmente avec le temps (dette technique)

---

### 2. "The Tourniquet" — Quick wins critiques (Completeness: 4/10, Effort: S)

**What**: Colmater les 3 failles les plus dangereuses sans refactorer l'architecture : body size limits, `cache: 'no-store'` sur les fetch BFF, pagination caps backend.

**Builds on**: fichiers existants, modifications chirurgicales

**Implémentation** :
```
1. next.config.ts → ajouter experimental.serverActions.bodySizeLimit
2. api-request.ts (×2) → ajouter { cache: 'no-store' } dans fetch options
3. api-request.ts (×2) → vérifier Content-Length de la réponse avant .text()
4. Laravel admin actions (×5) → ajouter ->paginate() avec cap 100
5. Hono admin handlers (×2) → ajouter LIMIT + pagination
6. Symfony api_platform.yaml → ajouter pagination_client_max_items_per_page: 100
```

**Pros**:
- Rapide (2-3h)
- Élimine le risque OOM immédiat côté backend
- Pas de refactoring d'architecture

**Cons**:
- Le buffering complet reste (response.text())
- Pas de streaming, pas de binaire
- L'AbortSignal n'est pas géré
- Le double JSON parse reste
- Les fuites graduelles du cache Next.js persistent

**One-way / two-way door?**: Two-way (ajouts ponctuels, faciles à reverser)

---

### 3. "The Sieve" — Streaming sélectif + size guards (Completeness: 7/10, Effort: M)

**What**: Refactorer le proxy pour streamer par défaut et ne bufferer que les réponses auth. Ajouter des gardes de taille multi-couche. Gérer l'AbortSignal.

**Builds on**: `route.ts`, `$.tsx`, `api-request.ts` (×2)

**Implémentation** :

```typescript
// Nouveau pattern dans proxyRequest / handleBffRequest :

const isAuthRoute = path.startsWith('/auth/login') || path.startsWith('/auth/refresh') || ...

const response = await fetch(backendUrl, { ...options, signal: request.signal })

// Guard: rejeter si Content-Length > MAX_RESPONSE_SIZE (5 MB)
const contentLength = parseInt(response.headers.get('content-length') || '0')
if (contentLength > MAX_RESPONSE_SIZE) {
  return new Response('Response too large', { status: 502 })
}

if (isAuthRoute) {
  // Buffering sélectif — petits payloads auth uniquement
  const text = await response.text()
  const data = JSON.parse(text)
  storeTokensInResponse(data, ...)
  return new Response(JSON.stringify(data), { headers: ... })
} else {
  // Streaming pass-through — zero buffering
  return new Response(response.body, {
    status: response.status,
    headers: sanitizeHeaders(response.headers),
  })
}
```

**Détail des changements** :

| Fichier | Changement |
|---------|-----------|
| `web/route.ts` | Split proxyRequest en 2 paths (auth vs pass-through) |
| `web-tanstack/$.tsx` | Même split |
| `api-request.ts` (×2) | Ajouter `{ cache: 'no-store' }`, propager AbortSignal |
| `next.config.ts` | Body size limit |
| `fetch-api.ts` | Ajouter timeout, Content-Length guard |
| Backends (×7 endpoints) | Pagination caps |
| Symfony `api_platform.yaml` | `max_items_per_page: 100` |
| Symfony `nelmio_cors.yaml` | Ajouter `X-Request-Id` dans allow/expose headers |

**Pros**:
- Élimine le buffering sur ~95% des requêtes (seules les routes auth buffèrent)
- Time-to-first-byte amélioré (streaming)
- AbortSignal = cleanup automatique si client disconnect
- Size guards = protection OOM même pour les routes auth
- Effort raisonnable (~1-2 jours)

**Cons**:
- Le Content-Type est toujours JSON-only en entrée
- Les uploads ne passent toujours pas
- Le 401-retry path doit quand même bufferer pour re-jouer la requête
- Complexité accrue du proxy (2 code paths)

**One-way / two-way door?**: Two-way (le streaming est backwards-compatible)

---

### 4. "The Membrane" — Proxy transparent content-aware (Completeness: 9/10, Effort: L)

**What**: Refactoring complet du proxy en couches séparées : transport (streaming), auth (buffering sélectif), content-type routing (JSON, binary, multipart). Le proxy devient un vrai reverse-proxy intelligent.

**Builds on**: refactoring profond de `route.ts` et `$.tsx`

**Architecture** :

```
Request → [SizeGuard] → [CSRF] → [ContentRouter] → [AuthInterceptor] → Backend
                                       ↓                    ↓
                                  JSON path           Token extraction
                                  Binary path          (buffered, <2KB)
                                  Multipart path
                                       ↓
Response ← [StreamRelay] ← [HeaderSanitizer] ← Backend
```

**Modules** :
1. `proxy-transport.ts` — fetch + AbortSignal + timeout + retry
2. `proxy-guards.ts` — size limit, rate check, CSRF
3. `proxy-auth.ts` — token extraction/storage (buffered, isolé)
4. `proxy-content.ts` — routing par Content-Type (stream vs buffer)
5. `proxy-headers.ts` — sanitization headers (remove internal, add security)

**Pros**:
- Architecture propre, testable, chaque concern isolé
- Support natif binaire + futur multipart
- Le produit commercial peut afficher "zero-copy streaming proxy"
- Chaque module testable unitairement
- Réutilisable entre Next.js et TanStack (module partagé dans `packages/`)

**Cons**:
- Effort significatif (~3-5 jours)
- Risque de sur-engineering pour un starter kit
- Le 401-retry avec streaming est complexe (il faut bufferiser le request body pour le rejouer)
- TanStack Start et Next.js ont des API Response différentes (abstraction nécessaire)

**One-way / two-way door?**: One-way (refactoring d'architecture, difficile à reverser partiellement)

---

### 5. "The Catapult" — Next.js 16 `proxy.ts` natif (Completeness: 6/10, Effort: S-M)

**What**: Next.js 16 introduit `proxy.ts` — un fichier de configuration qui transforme le Route Handler catch-all en proxy natif avec streaming duplex intégré. On migre le BFF Next.js vers cette API native et on garde le custom proxy uniquement pour TanStack.

**Builds on**: `apps/web/` seulement, greenfield `proxy.ts`

**Implémentation** :
```typescript
// apps/web/proxy.ts (nouveau fichier Next.js 16)
export default {
  '/api/v1/:path*': {
    target: getBackendUrl(),
    rewrite: (path) => transformPath(path),
    headers: (req) => ({
      ...authHeaders(req),
      'Cookie': `auth_token=${getAuthToken(req)}`,
    }),
    onResponse: (res) => {
      // Token extraction sur les routes auth uniquement
      if (isAuthRoute(res.url)) {
        return extractAndStoreTokens(res)
      }
      return res // streaming natif
    },
  },
}
```

**Pros**:
- Next.js gère le streaming, le duplex, les AbortSignal, le body size nativement
- Code proxy réduit de 655 lignes à ~50 lignes
- Performance optimale (zero-copy dans le framework)
- `proxyClientMaxBodySize` intégré

**Cons**:
- Next.js 16 seulement (vérifier la version actuelle)
- Ne résout rien pour TanStack Start
- L'API `proxy.ts` est experimentale/récente — risque de breaking changes
- La logique auth custom (multi-backend, refresh proactif) doit s'adapter aux hooks limités
- Le 401-retry automatique n'est probablement pas supporté nativement

**One-way / two-way door?**: Two-way (on peut toujours revenir au Route Handler)

---

### 6. "The Aqueduct" — Shared proxy engine dans `packages/` (Completeness: 9.5/10, Effort: XL)

**What**: Extraire la logique proxy dans un package `@headless/proxy` partagé entre Next.js et TanStack Start. Le package expose une API framework-agnostic basée sur les Web Standards (Request/Response/ReadableStream).

**Builds on**: greenfield `packages/proxy/`

**API** :
```typescript
// packages/proxy/src/index.ts
export function createBffProxy(config: BffProxyConfig): BffProxy

type BffProxyConfig = {
  backends: Record<string, BackendConfig>
  auth: {
    tokenExtractor: (response: Response) => TokenPair | null
    tokenStore: TokenStore  // adapter pattern pour cookies
    refreshEndpoint: (backend: string) => string
  }
  limits: {
    maxRequestBodySize: number   // default 1MB
    maxResponseBodySize: number  // default 5MB
    requestTimeout: number       // default 30s
  }
  security: {
    csrfCheck: boolean
  }
}

// Usage Next.js
import { createBffProxy } from '@headless/proxy'
const proxy = createBffProxy({ ... })
export async function GET(req: Request) { return proxy.handle(req) }

// Usage TanStack Start
const proxy = createBffProxy({ ... })
export const Route = createFileRoute('/api/v1/$')({
  server: { handlers: { GET: ({ request }) => proxy.handle(request) } }
})
```

**Pros**:
- DRY : une seule implémentation, deux consommateurs
- Testable en isolation (pas de dépendance framework)
- Argument commercial fort ("production-grade proxy engine")
- Streaming natif via Web Standards
- Content-type routing intégré
- Configuration déclarative

**Cons**:
- Effort très significatif (~5-8 jours)
- Abstraction prématurée si on n'a que 2 frontends ?
- Les différences Next.js / TanStack en gestion de cookies nécessitent un adapter
- Le 401-retry avec body replay reste le problème le plus complexe
- Risque de "framework dans le framework"

**One-way / two-way door?**: One-way (création d'un package, changement d'architecture)

---

## Tradeoff Matrix

| Criterion | Ghost Ship | Tourniquet | Sieve | Membrane | Catapult | Aqueduct |
|-----------|-----------|------------|-------|----------|----------|----------|
| **Complexité** | — | Faible | Moyenne | Haute | Faible-Moy. | Très haute |
| **Time to ship** | 0 | 2-3h | 1-2j | 3-5j | 1-2j | 5-8j |
| **Mémoire** | ❌ OOM risk | ⚠️ Limité | ✅ Streaming | ✅ Streaming | ✅ Natif | ✅ Streaming |
| **Sécurité** | ❌ DoS | ⚠️ Size only | ✅ Signal+Size | ✅ Full | ✅ Natif | ✅ Full |
| **Binaire/Upload** | ❌ | ❌ | ❌ | ✅ | ✅ Natif | ✅ |
| **DRY (×2 BFF)** | ❌ Dupliqué | ❌ Dupliqué | ❌ Dupliqué | ⚠️ Patterns | ❌ Next only | ✅ Partagé |
| **Réversibilité** | — | ✅ Easy | ✅ Easy | ⚠️ Hard | ✅ Easy | ❌ Hard |
| **Valeur produit** | ❌ | ⚠️ | ✅ | ✅✅ | ✅ | ✅✅✅ |
| **Completeness** | 0/10 | 4/10 | 7/10 | 9/10 | 6/10 | 9.5/10 |

---

## Patterns émergents

1. **Le streaming est non-négociable** — toutes les options viables (Sieve+) l'incluent
2. **L'auth est le seul cas de buffering légitime** — et les payloads auth font < 1 KB
3. **Les backends ont besoin de caps indépendamment** — même sans BFF, les endpoints admin sont dangereux
4. **La duplication Next.js / TanStack est le vrai problème structurel** — mais le résoudre maintenant est prématuré

---

## Combinabilité

La meilleure approche est un **pipeline incrémental** :

```
Wave 1 (jour 1) : "Tourniquet" — quick wins immédiats
  → Body size limits, cache: 'no-store', pagination caps backend
  → Élimine le risque OOM immédiat

Wave 2 (jours 2-3) : "Sieve" — streaming sélectif
  → Split auth vs pass-through dans les 2 proxies
  → AbortSignal propagation
  → Élimine le buffering sur 95% des requêtes

Wave 3 (futur, si besoin) : "Aqueduct" — extraction package partagé
  → Seulement si un 3e frontend est ajouté ou si le produit le justifie
```

"Catapult" est un bonus opportuniste : si Next.js 16 `proxy.ts` est stable, on peut l'adopter dans la Wave 2 pour Next.js tout en gardant le custom proxy pour TanStack.

---

## Recommandation

**Wave 1 + Wave 2 combinées = "Tourniquet → Sieve"** (Completeness: 7/10, Effort: M)

Confiance : **90%**

Raisons :
1. Élimine les 2 risques CRITICAL (buffering + no limits) et les 2 HIGH (unbounded queries + CVE)
2. Effort raisonnable pour un solo dev (~2-3 jours total)
3. Réversible à chaque étape
4. Ne crée pas d'abstraction prématurée
5. Laisse la porte ouverte à "Aqueduct" plus tard

**Ce qui changerait cette recommandation** :
- Si Next.js 16 `proxy.ts` supporte les hooks auth custom → "Catapult" devient Wave 2
- Si un 3e frontend est prévu → "Aqueduct" passe en Wave 2
- Si le produit doit supporter les uploads avant la V1 → "Membrane" remplace "Sieve"

---

## Next steps

- `/spec bff-bulletproof` → spécifier Wave 1 + Wave 2 avec fichiers, tests, acceptance criteria
- `/plan bff-bulletproof` → plan d'implémentation avec file ownership et parallélisme

---

*Brainstorm conducted 2026-03-29*
