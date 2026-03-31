---
paths:
  - "apps/api-sf/**/*"
---

# Response Conventions

## Controller responses

Always use `ApiResponseService` — never create `JsonResponse` manually.

```php
// Correct
return $this->apiResponse->success($data);
return $this->apiResponse->error('ERROR_CODE', 'Message', 422);
return $this->apiResponse->paginated($items, $page, $perPage, $total);

// Wrong
return new JsonResponse(['data' => $data]);
return $this->json($data);
```

## Envelope shape

All responses follow the same envelope:

```json
// Success
{ "success": true, "data": { ... }, "status": 200, "request_id": "abc123" }

// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." }, "status": 422, "request_id": "abc123" }

// Paginated (success + meta)
{ "success": true, "data": [...], "meta": { "page": 1, "per_page": 20, "total": 100, "last_page": 5 }, "status": 200 }
```

## API Platform responses

API Platform responses are automatically wrapped by `EnvelopeSubscriber`. Do not add manual wrapping in providers/processors.
