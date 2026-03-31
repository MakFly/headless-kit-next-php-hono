# Eloquent ORM Patterns

## Model Namespace

All models live in `App\Shared\Models\`. Never create models inside feature directories.

## Mass Assignment

Always declare `$fillable` explicitly. Never use `$guarded = []`.

```php
class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'category_id',
    ];
}
```

## Casts

Use `$casts` for type safety:

```php
protected $casts = [
    'price' => 'decimal:2',
    'is_active' => 'boolean',
    'metadata' => 'array',
    'published_at' => 'datetime',
];
```

## Avoiding N+1

Always eager-load relations in queries:

```php
// Correct — 2 queries
$orders = Order::with('items', 'user')->paginate(20);

// Wrong — N+1 queries
$orders = Order::paginate(20);
foreach ($orders as $order) {
    $order->items; // lazy load = 1 query per order
}
```

## Scopes

Use scopes for reusable query filters:

```php
public function scopeActive(Builder $query): Builder
{
    return $query->where('is_active', true);
}

// Usage
Product::active()->paginate(20);
```

## Hidden Fields

Never expose sensitive fields in API responses:

```php
protected $hidden = [
    'password',
    'remember_token',
    'email_verified_at',
];
```

## Conventions

- Primary key: `id` (UUID string via `$keyType = 'string'`)
- Timestamps: `created_at`, `updated_at` (auto-managed)
- Soft deletes: use `SoftDeletes` trait when records should be recoverable
- Table names: plural snake_case (auto-derived from model name)
