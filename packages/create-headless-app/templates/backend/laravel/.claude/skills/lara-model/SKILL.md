---
name: lara-model
description: Create an Eloquent Model with migration. Use when adding a new database entity.
argument-hint: <ModelName>
disable-model-invocation: true
---

# Create Eloquent Model

Create a Model in `app/Shared/Models/` with its migration.

## Convention

All models live in `App\Shared\Models\`:

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
        // Define allowed mass-assignment fields
    ];

    protected $casts = [
        // Type casts for attributes
    ];

    protected $hidden = [
        // Fields hidden from serialization
    ];

    // Relations
}
```

## Steps

1. Create model in `app/Shared/Models/{ModelName}.php`
2. Create migration: `php artisan make:migration create_{table_name}_table`
3. Define columns in migration (UUID primary key, timestamps)
4. Add relations to both the new model and related models
5. Run `php artisan migrate` to verify
6. If seeding needed, add to `database/seeders/`

## Conventions

- UUID primary keys via `HasUuids` trait
- Always declare `$fillable` (never `$guarded = []`)
- Use `$casts` for dates, booleans, JSON, decimals
- Use `$hidden` for sensitive fields (passwords, tokens)
- Table name: plural snake_case (auto-derived)

Target: $ARGUMENTS
