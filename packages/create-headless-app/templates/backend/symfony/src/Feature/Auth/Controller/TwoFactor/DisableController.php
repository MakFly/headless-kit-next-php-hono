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

#[Route('/api/v1/auth/2fa/disable', name: 'api_v1_auth_2fa_disable', methods: ['POST'])]
class DisableController extends AbstractController
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

            $data = json_decode($request->getContent(), true) ?? [];
            $code = $data['code'] ?? null;

            if (!$code) {
                return $this->api->error('VALIDATION_ERROR', 'auth.two_factor_code_required', 400);
            }

            // TotpProvider::disable() requires a backup code (not a TOTP code) to prevent unauthorized disabling
            $disabled = $this->totpProvider->disable((string) $user->getId(), (string) $code);

            if (!$disabled) {
                return $this->api->error('INVALID_BACKUP_CODE', 'auth.two_factor_invalid_backup_code', 400);
            }

            return $this->api->success(['enabled' => false]);
        } catch (\Exception) {
            return $this->api->error('DISABLE_FAILED', 'auth.two_factor_disable_failed', 500);
        }
    }
}
