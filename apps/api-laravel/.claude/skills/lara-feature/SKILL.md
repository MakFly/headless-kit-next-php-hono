---
name: lara-feature
description: Create a new feature slice in app/Features/ with Actions, routes, and optional Requests/Services/Formatters. Use when the user asks to add a new feature module.
argument-hint: <FeatureName>
disable-model-invocation: true
---

# Create Feature Slice

Create a new feature in `app/Features/$ARGUMENTS/`.

## Architecture

```
app/Features/{Name}/
├── Actions/            # Invokable Action classes (1 per endpoint)
├── Requests/           # Form Request validation (optional)
├── Services/           # Business logic (optional)
├── Formatters/         # Static format methods (optional)
└── routes.php          # Feature route definitions
```

## Route file convention

```php
<?php
// app/Features/{Name}/routes.php

use App\Features\{Name}\Actions\ListItems;
use App\Features\{Name}\Actions\ShowItem;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1/{name}')->middleware('auth:betterauth')->group(function () {
    Route::get('/', ListItems::class);
    Route::get('/{id}', ShowItem::class);
});
```

Then include in `routes/api.php` inside the `v1` prefix group:
```php
require app_path('Features/{Name}/routes.php');
```

## Response format

```php
// Success
return ApiResponse::success($data, 200);

// Error
return ApiResponse::error('ERROR_CODE', 'Message', 422);

// Paginated
return ApiResponse::paginated($collection);
```

## Steps

1. Create directory structure
2. Create routes.php with route definitions
3. Create Action classes
4. Include routes in `routes/api.php` inside the `Route::prefix('v1')` group
5. Run `php artisan route:list --path=api/v1/{name}` to verify

Feature: $ARGUMENTS
