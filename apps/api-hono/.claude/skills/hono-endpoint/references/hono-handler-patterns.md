# Hono endpoint — responses, errors, validation

## Response helpers (`shared/lib/response.ts`)

```typescript
import { apiSuccess, apiError } from '../../shared/lib/response.ts';

return apiSuccess(c, data);
return apiSuccess(c, data, undefined, 201);
return apiSuccess(c, items, { page, limit, total, totalPages });

return apiError(c, 'NOT_FOUND', 'Resource not found', 404);
return apiError(c, 'VALIDATION_ERROR', 'Invalid input', 422, zodError);
```

## AppError in services

```typescript
import { AppError } from '../../shared/lib/errors.ts';

throw new AppError('Not found', 'NOT_FOUND', 404);
throw new AppError('Unauthorized', 'UNAUTHORIZED', 401);
```

## Middleware

```typescript
import { authMiddleware, optionalAuthMiddleware } from '../../shared/middleware/auth.ts';
import { adminMiddleware } from '../../shared/middleware/admin.ts';
import { orgRbacMiddleware } from '../../shared/middleware/org-rbac.ts';

app.post('/path', authMiddleware, adminMiddleware, zValidator('json', schema), handler);
```

## zValidator

```typescript
import { zValidator } from '@hono/zod-validator';

app.post('/', zValidator('json', createSchema), handlers.create);
app.get('/', zValidator('query', listQuerySchema), handlers.list);
app.get('/:id', zValidator('param', z.object({ id: z.string() })), handlers.getById);
```

## Vertical slice order

1. `schemas.ts` — Zod
2. `repository.ts` — Drizzle
3. `service.ts` — logic + `AppError`
4. `handlers.ts` — thin: service → `apiSuccess` / `apiError`
5. `routes.ts` — method, path, middleware, `zValidator`

Then `bun run typecheck`.
