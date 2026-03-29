<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller;

use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\AuthManager;
use BetterAuth\Symfony\Controller\Trait\AuthResponseTrait;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/logout', name: 'api_v1_auth_logout', methods: ['POST'])]
class LogoutController extends AbstractController
{
    use AuthResponseTrait;

    public function __construct(
        private readonly AuthManager $authManager,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $token = $this->extractBearerToken($request);

            if (!$token) {
                return $this->api->error('UNAUTHORIZED', 'auth.no_token_provided', 401);
            }

            $this->authManager->signOut($token);

            return $this->api->success(['message' => 'auth.logged_out']);
        } catch (Exception $e) {
            return $this->api->error('LOGOUT_FAILED', 'auth.logout_failed', 400);
        }
    }
}
