<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller\TwoFactor;

use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\TokenManager;
use BetterAuth\Providers\TotpProvider\TotpProvider;
use BetterAuth\Symfony\Controller\Trait\AuthResponseTrait;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/2fa/setup', name: 'api_v1_auth_2fa_setup', methods: ['POST'])]
class SetupController extends AbstractController
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

            $result = $this->totpProvider->generateSecret(
                (string) $user->getId(),
                $user->getEmail()
            );

            return $this->api->success([
                'secret' => $result['secret'],
                'qrCode' => $result['qrCode'],
                'manualEntryKey' => $result['manualEntryKey'] ?? $result['secret'],
                'backupCodes' => $result['backupCodes'],
            ], 201);
        } catch (Exception) {
            return $this->api->error('SETUP_FAILED', 'auth.two_factor_setup_failed', 500);
        }
    }
}
