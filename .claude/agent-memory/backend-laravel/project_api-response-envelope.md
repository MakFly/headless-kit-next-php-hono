---
name: api-response-envelope
description: Standard API response envelope format and key files — ApiResponse helper, ApiResponder trait, i18n setup
type: project
---

The Laravel API uses a standardized envelope pattern implemented in March 2026.

**Key files:**
- `app/Http/Helpers/ApiResponse.php` — static class generating all envelopes
- `app/Http/Traits/ApiResponder.php` — trait for controllers delegating to ApiResponse
- `app/Http/Middleware/SetLocaleMiddleware.php` — parses Accept-Language (en/fr), registered in `api` group
- `lang/en/api.php` and `lang/fr/api.php` — ~40 translation keys across auth/shop/admin/saas/support/org
- `bootstrap/app.php` — centralized exception handler for api/* routes

**Envelope formats:**

Success: `{ success, data, status, request_id, [meta] }`
Error: `{ success: false, error: { code, message, [details] }, status, request_id }`
Paginated: `{ success, data, pagination: { page, perPage, total, totalPages }, status, request_id }`

**Why pagination uses camelCase keys:** tests assert `pagination.perPage` and `pagination.totalPages` — this is intentional to match the existing test contract.

**Exception handler covers (api/* only):**
- ValidationException → 422 VALIDATION_ERROR
- AuthenticationException → 401 UNAUTHORIZED
- ModelNotFoundException → 404 NOT_FOUND
- AuthorizationException → 403 ACCESS_DENIED
- NotFoundHttpException → 404 NOT_FOUND
- Default → 500 INTERNAL_ERROR

**Why:** standardize all API responses across 10+ controllers for consistent frontend consumption.

**How to apply:** all new controllers must `use ApiResponder` and call `$this->success()`, `$this->error()`, `$this->paginated()`, `$this->created()`, `$this->deleted()` — never `response()->json()` directly (except special cases like bulk operations with non-standard top-level keys).
