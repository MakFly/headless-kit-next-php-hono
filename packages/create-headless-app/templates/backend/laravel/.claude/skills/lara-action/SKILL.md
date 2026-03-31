---
name: lara-action
description: Create an invokable Action class for a Laravel API endpoint. Use when the user asks to add a new endpoint, route handler, or API action.
argument-hint: <FeatureName/ActionName>
disable-model-invocation: true
---

# Create Laravel Action

Create an invokable Action class in `app/Features/`.

## Convention

Each endpoint = 1 invokable Action class:

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

1. Create Action class in `app/Features/{Feature}/Actions/{ActionName}.php`
2. If validation needed, create `app/Features/{Feature}/Requests/{ActionName}Request.php`
3. Add route in `app/Features/{Feature}/routes.php`
4. If feature is new, include routes in `routes/api.php`
5. Use models from `App\Shared\Models\`
6. Use `ApiResponse::success()` / `ApiResponse::error()` for responses
7. Run `php artisan route:list --path=api/v1/{feature}` to verify

Target: $ARGUMENTS
