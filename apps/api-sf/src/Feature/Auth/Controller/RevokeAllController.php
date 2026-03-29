<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller;

use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\AuthManager;
use BetterAuth\Core\TokenManager;
use BetterAuth\Symfony\Controller\Trait\AuthResponseTrait;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/revoke-all', name: 'api_v1_auth_revoke_all', methods: ['POST'])]
class RevokeAllController extends AbstractController
{
    use AuthResponseTrait;

    public function __construct(
        private readonly AuthManager $authManager,
        private readonly TokenManager $tokenManager,
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

            $user = $this->tokenManager->getUserFromToken($token);

            if (!$user) {
                return $this->api->error('UNAUTHORIZED', 'auth.invalid_token', 401);
            }

            $this->authManager->revokeAllTokens($user->getId());

            return $this->api->success(['message' => 'auth.all_sessions_revoked']);
        } catch (Exception $e) {
            return $this->api->error('REVOKE_FAILED', 'auth.revoke_all_failed', 400);
        }
    }
}
