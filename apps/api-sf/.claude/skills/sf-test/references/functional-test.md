# Symfony WebTestCase pattern

```php
<?php

declare(strict_types=1);

namespace App\Tests\Functional\{Feature};

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

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

    private function authHeaders(string $token): array
    {
        return [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ];
    }
}
```

## Envelope

`{ success, data, status, request_id }` — collections may include `meta`.

## Run

```bash
php bin/phpunit
php bin/phpunit tests/Functional/{dir}/
php bin/phpunit --filter={testName}
```
