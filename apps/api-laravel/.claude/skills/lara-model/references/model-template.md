# Eloquent model (Shared)

All models: `App\Shared\Models\`.

```php
<?php

declare(strict_types=1);

namespace App\Shared\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class {ModelName} extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        // mass-assignment
    ];

    protected $casts = [
        // dates, bool, json, decimal
    ];

    protected $hidden = [
        // passwords, tokens
    ];
}
```

## Steps

1. `app/Shared/Models/{ModelName}.php`
2. `php artisan make:migration create_{table}_table`
3. UUID PK, timestamps in migration
4. Relations on both sides
5. `php artisan migrate`
6. Seeders in `database/seeders/` if needed

## Conventions

- `HasUuids`, explicit `$fillable` (no `$guarded = []`)
- `$casts`, `$hidden` for sensitive fields
- Table: plural snake_case (default)
