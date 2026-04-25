<?php

declare(strict_types=1);

namespace App\Shared\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/health', name: 'app_health', methods: ['GET'])]
final class HealthController extends AbstractController
{
    public function __construct(
        private readonly Connection $connection,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        $db = 'ok';
        try {
            $this->connection->executeQuery('SELECT 1');
        } catch (\Throwable) {
            $db = 'down';
        }

        $status = $db === 'ok' ? 200 : 503;

        return new JsonResponse([
            'success' => $status === 200,
            'data' => [
                'status' => $status === 200 ? 'ok' : 'degraded',
                'service' => 'api-sf',
                'db' => $db,
            ],
            'status' => $status,
        ], $status);
    }
}
