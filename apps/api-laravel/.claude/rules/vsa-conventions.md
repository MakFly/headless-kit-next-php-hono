# Vertical Slice Architecture Conventions

## Feature structure

```
app/Features/{Name}/
├── Actions/            # Invokable Action classes (1 per endpoint)
├── Requests/           # Form Request validation (optional)
├── Services/           # Business logic (optional)
├── Formatters/         # Static format methods (optional)
└── routes.php          # Feature route definitions
```

## Action pattern

Each endpoint = 1 invokable Action with `__invoke(Request $request): JsonResponse`:

```php
class ListItems
{
    public function __invoke(Request $request): JsonResponse
    {
        $items = Product::paginate(20);
        return ApiResponse::success($items);
    }
}
```

## Model namespace

All Eloquent models live in `App\Shared\Models\`. Never create models inside a feature directory.

## Route inclusion

**Critical exception**: Auth routes have NO `/api/v1` prefix — they are included directly:
```php
// routes/api.php
require app_path('Features/Auth/routes.php');          // /auth/* directly

Route::prefix('v1')->group(function () {
    require app_path('Features/Shop/routes.php');       // /api/v1/...
});
```

## Guardrails

- Never use `Route::resource()` — always explicit route definitions with invokable Actions
- Never put business logic in Actions — extract to Services if complex
- Use `use Illuminate\Support\Facades\Route;` (not `use Route;`)
- `declare(strict_types=1)` in every PHP file
