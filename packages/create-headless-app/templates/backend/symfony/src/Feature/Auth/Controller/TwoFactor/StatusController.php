<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller\TwoFactor;

use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\TokenManager;
use BetterAuth\Providers\TotpProvider\TotpProvider;
use BetterAuth\Symfony\Controller\Trait\AuthResponseTrait;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/2fa/status', name: 'api_v1_auth_2fa_status', methods: ['GET'])]
class StatusController extends AbstractController
{
    use AuthResponseTrait;

    public function __construct(
        private readonly TokenManager $tokenManager,
        private readonly TotpProvider $totpProvider,
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

            $status = $this->totpProvider->getStatus((string) $user->getId());

            return $this->api->success([
                'enabled' => $status['enabled'],
                'method' => 'totp',
                'backupCodesRemaining' => $status['backupCodesRemaining'] ?? 0,
                'requires2fa' => $status['requires2fa'] ?? false,
                'last2faVerifiedAt' => $status['last2faVerifiedAt'] ?? null,
            ]);
        } catch (\Exception) {
            return $this->api->error('UNAUTHORIZED', 'auth.invalid_token', 401);
        }
    }
}
