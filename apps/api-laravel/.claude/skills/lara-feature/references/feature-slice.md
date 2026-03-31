# Laravel feature slice

## Layout

```
app/Features/{Name}/
├── Actions/            # Invokable (1 per endpoint)
├── Requests/           # Form Request (optional)
├── Services/           # Business logic (optional)
├── Formatters/         # Static format helpers (optional)
└── routes.php
```

## routes.php example

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

Include from `routes/api.php` inside `Route::prefix('v1')`:

```php
require app_path('Features/{Name}/routes.php');
```

## ApiResponse

```php
return ApiResponse::success($data, 200);
return ApiResponse::error('ERROR_CODE', 'Message', 422);
return ApiResponse::paginated($collection);
```

## Steps

1. Create dirs + `routes.php`
2. Add Action classes
3. `require` in `routes/api.php` under `v1`
4. `php artisan route:list --path=api/v1/{name}`
