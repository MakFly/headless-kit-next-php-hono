---
paths:
  - "apps/api-sf/**/*"
  - "apps/api-laravel/**/*"
  - "apps/api-hono/**/*"
  - "apps/web/src/lib/adapters/**/*"
  - "apps/web-tanstack/**/*"
---

# REST API Conventions

## URL Design

- Use **nouns**, not verbs: `/products` not `/getProducts`
- Use **plurals**: `/users`, `/orders`, `/categories`
- Use **lowercase** with **hyphens**: `/order-items` not `/orderItems`
- Nest for ownership: `/orders/{id}/items` (max 2 levels)

## HTTP Methods

| Method | Usage | Success code | Idempotent |
|--------|-------|-------------|------------|
| GET | Read resource(s) | 200 | Yes |
| POST | Create resource | 201 | No |
| PUT | Full replace | 200 | Yes |
| PATCH | Partial update | 200 | Yes |
| DELETE | Remove resource | 204 | Yes |

## Status Codes

| Code | Meaning | When to use |
|------|---------|------------|
| 200 | OK | Successful read/update |
| 201 | Created | Successful POST creation |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Malformed request body |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource / business rule violation |
| 422 | Unprocessable | Validation error (valid JSON, invalid data) |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Error | Unhandled server error |

## Pagination

Standard format across all 3 backends:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 142,
    "last_page": 8
  }
}
```

Query params: `?page=2&per_page=20`

## Filtering & Sorting

- Filter by field: `?category=shoes&status=active`
- Price range: `?min_price=10&max_price=100`
- Sort: `?sort=-created_at` (prefix `-` for descending)
- Search: `?search=keyword`

## Versioning

- All endpoints under `/api/v1/`
- Bump version only on breaking changes (field removal, type change, semantic change)
- Never remove a field without a version bump
