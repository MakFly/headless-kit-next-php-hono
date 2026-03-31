# Response Format

## Always use ApiResponse

```php
use App\Shared\Helpers\ApiResponse;

// Success
return ApiResponse::success($data);
return ApiResponse::success($data, 201);

// Error
return ApiResponse::error('ERROR_CODE', 'Human-readable message', 422);

// Paginated
return ApiResponse::paginated($collection);
```

Never use `response()->json()` or `return new JsonResponse()` directly.

## Envelope shape

Matches the Symfony and Hono backends:

```json
{ "success": true, "data": { ... }, "status": 200, "request_id": "abc123" }
{ "success": false, "error": { "code": "...", "message": "..." }, "status": 422 }
```

## Exception handling

`bootstrap/app.php` automatically catches and wraps exceptions:
- `ValidationException` → 422 `VALIDATION_ERROR`
- `AuthenticationException` → 401 `UNAUTHORIZED`
- `ModelNotFoundException` → 404 `NOT_FOUND`
- `AuthorizationException` → 403 `ACCESS_DENIED`

Do NOT catch these manually in Actions — let the global handler wrap them.
