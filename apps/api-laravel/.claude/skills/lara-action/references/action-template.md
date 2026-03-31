# Laravel invokable Action — template

Each endpoint = one invokable Action class:

```php
<?php

declare(strict_types=1);

namespace App\Features\{Feature}\Actions;

use App\Shared\Helpers\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class {ActionName}
{
    public function __invoke(Request $request): JsonResponse
    {
        // Implementation
        return ApiResponse::success($data);
    }
}
```

## Steps

1. Create `app/Features/{Feature}/Actions/{ActionName}.php`
2. If validation needed: `app/Features/{Feature}/Requests/{ActionName}Request.php`
3. Register route in `app/Features/{Feature}/routes.php`
4. New feature: `require` in `routes/api.php` inside `Route::prefix('v1')`
5. Models: `App\Shared\Models\`
6. Responses: `ApiResponse::success()` / `ApiResponse::error()` / `ApiResponse::paginated()`
7. Verify: `php artisan route:list --path=api/v1/{feature}`
