---
name: hono-endpoint
description: Add a new endpoint to an existing Hono feature. Use when the user asks to add a route or API endpoint to an existing feature.
argument-hint: <feature-name> <METHOD> <path>
disable-model-invocation: true
---

# Add Endpoint to Existing Feature

Add an endpoint to an existing feature in `src/features/`.

## Steps

1. **schemas.ts** — add a Zod schema for the request body / query params
2. **repository.ts** — add the database query
3. **service.ts** — add the business logic (calls repository, may throw `AppError`)
4. **handlers.ts** — add the thin handler (calls service, returns `apiSuccess` or `apiError`)
5. **routes.ts** — register the route with correct method, path, middleware, and `zValidator`
6. Run `bun run typecheck` to verify no type errors

## Response Helpers

Import from `../../shared/lib/response.ts`:

```typescript
import { apiSuccess, apiError } from '../../shared/lib/response.ts';

// 200 success
return apiSuccess(c, data);

// 201 created
return apiSuccess(c, data, undefined, 201);

// With pagination meta
return apiSuccess(c, items, { page, limit, total, totalPages });

// Error
return apiError(c, 'NOT_FOUND', 'Resource not found', 404);
return apiError(c, 'VALIDATION_ERROR', 'Invalid input', 422, zodError);
```

## Throwing Errors in Services

```typescript
import { AppError } from '../../shared/lib/errors.ts';

// Throw in service — caught by global onError handler
throw new AppError('Not found', 'NOT_FOUND', 404);
throw new AppError('Unauthorized', 'UNAUTHORIZED', 401);
```

## Middleware Available

```typescript
import { authMiddleware, optionalAuthMiddleware } from '../../shared/middleware/auth.ts';
import { adminMiddleware } from '../../shared/middleware/admin.ts';
import { orgRbacMiddleware } from '../../shared/middleware/org-rbac.ts';

// Route-level middleware order:
app.post('/path', authMiddleware, adminMiddleware, zValidator('json', schema), handler);
```

## zValidator Usage

```typescript
import { zValidator } from '@hono/zod-validator';
import { createSchema, listQuerySchema } from './{feature}.schemas.ts';

// JSON body
app.post('/', zValidator('json', createSchema), handlers.create);

// Query params
app.get('/', zValidator('query', listQuerySchema), handlers.list);

// Path params
app.get('/:id', zValidator('param', z.object({ id: z.string() })), handlers.getById);
```

Target: $ARGUMENTS
