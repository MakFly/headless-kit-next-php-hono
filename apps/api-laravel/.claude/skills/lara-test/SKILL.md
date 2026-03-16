---
name: lara-test
description: Create Feature or Unit tests for Laravel endpoints. Use when the user asks to write tests or add test coverage.
argument-hint: <FeatureName|TestClass>
disable-model-invocation: true
---

# Create Laravel Tests

Write tests in `tests/Feature/` or `tests/Unit/`.

## Convention

```php
<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Shared\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class {Feature}Test extends TestCase
{
    use RefreshDatabase;

    private string $token = '';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedTestData();
    }

    private function seedTestData(): void
    {
        // Seed via models or seeders
    }

    private function authHeaders(string $token = ''): array
    {
        return [
            'Authorization' => 'Bearer ' . ($token ?: $this->token),
            'Accept' => 'application/json',
        ];
    }

    public function test_list_items_returns_success(): void
    {
        $response = $this->getJson('/api/v1/{feature}', $this->authHeaders());

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data',
                'status',
                'request_id',
            ]);
    }
}
```

## Response format assertions

```php
$response->assertOk();
$response->assertJsonPath('success', true);
$response->assertJsonCount(3, 'data');
```

## Run

```bash
php artisan test                        # All tests
php artisan test tests/Feature/{file}   # Specific file
php artisan test --filter={testName}    # Single test
```

Target: $ARGUMENTS
