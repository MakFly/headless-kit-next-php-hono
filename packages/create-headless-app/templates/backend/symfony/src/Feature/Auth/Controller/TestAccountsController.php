<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller;

use App\Shared\Service\ApiResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/test-accounts', name: 'api_v1_auth_test_accounts', methods: ['GET'])]
class TestAccountsController extends AbstractController
{
    public function __construct(
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        if ($this->getParameter('kernel.environment') !== 'dev') {
            return $this->api->success([]);
        }

        return $this->api->success([
            ['email' => 'admin@example.com', 'name' => 'Admin User', 'password' => 'Admin1234!', 'role' => 'admin'],
            ['email' => 'test@test.com', 'name' => 'Test User', 'password' => 'Admin1234!', 'role' => 'user'],
            ['email' => 'refresh-test@example.com', 'name' => 'Refresh Test User', 'password' => 'Admin1234!', 'role' => 'user'],
        ]);
    }
}
