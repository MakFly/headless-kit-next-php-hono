# Services Convention

## Purpose

Services in `src/lib/services/` wrap `createServerFn` calls for non-auth data operations (SaaS, shop, cart, orders, admin, support, RBAC).

## Pattern

Each service file exports server functions using `fetchFromApi` from `src/lib/http/fetch-api.ts`:

```typescript
import { fetchFromApi } from '../http/fetch-api'

export const getProductsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    return fetchFromApi<Product[]>('/products')
  })
```

## Existing services

| File | Domain |
|------|--------|
| `admin-service.ts` | Admin CRUD operations |
| `cart-service.ts` | Cart management |
| `order-service.ts` | Order management |
| `rbac-service.ts` | Roles & permissions |
| `saas-service.ts` | SaaS orgs, billing, team |
| `shop-service.ts` | Products & categories |
| `support-service.ts` | Conversations & tickets |
| `token-service.ts` | Token/cookie config |

## Rules

- All services use `fetchFromApi` from `../http/fetch-api` (no local copy)
- Auth operations go through adapters in `lib/server/auth.ts`, NOT in services
- Input validation via Zod `inputValidator` on `createServerFn`
- Error handling: services let errors propagate — UI handles them
