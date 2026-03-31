# Laravel Feature test template

```php
<?php

declare(strict_types=1);

namespace Tests\Feature;

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
        // models / seeders
    }

    private function authHeaders(string $token = ''): array
    {
        return [
            'Authorization' => 'Bearer ' . ($token ?: $this->token),
            'Accept' => 'application/json',
        ];
    }

    public function test_list_returns_envelope(): void
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

## Assertions

```php
$response->assertOk();
$response->assertJsonPath('success', true);
$response->assertJsonCount(3, 'data');
```

## Run

```bash
php artisan test
php artisan test tests/Feature/{File}.php
php artisan test --filter={testName}
```
