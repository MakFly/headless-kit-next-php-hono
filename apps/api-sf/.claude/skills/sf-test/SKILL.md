---
name: sf-test
description: Create functional tests for Symfony endpoints using WebTestCase. Use when the user asks to write tests, add test coverage, or test an endpoint.
argument-hint: <FeatureName|TestClass>
disable-model-invocation: true
---

# Create Functional Tests

Write tests in `tests/Functional/`.

## Convention

```php
<?php

declare(strict_types=1);

namespace App\Tests\Functional\{Feature};

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\ORM\EntityManagerInterface;

class {Feature}Test extends WebTestCase
{
    private ?KernelBrowser $client = null;
    private ?EntityManagerInterface $em = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = static::createClient();
        $this->em = $this->client->getContainer()->get('doctrine')->getManager();
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->client = null;
        $this->em = null;
    }
}
```

## Auth helper

```php
private function authHeaders(string $token): array
{
    return [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
    ];
}
```

## Response format

API returns envelope: `{success: bool, data: mixed, status: int, request_id: string}`
Collections include `meta: {page, per_page, total, last_page}`

## Run

```bash
php bin/phpunit                          # All tests
php bin/phpunit tests/Functional/{dir}/  # Feature tests
php bin/phpunit --filter={testName}      # Single test
```

Target: $ARGUMENTS
