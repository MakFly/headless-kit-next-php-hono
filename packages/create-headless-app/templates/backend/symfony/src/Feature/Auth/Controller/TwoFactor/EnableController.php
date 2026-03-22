<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller\TwoFactor;

use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\Interfaces\TotpStorageInterface;
use BetterAuth\Core\TokenManager;
use BetterAuth\Providers\TotpProvider\TotpProvider;
use BetterAuth\Symfony\Controller\Trait\AuthResponseTrait;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/2fa/enable', name: 'api_v1_auth_2fa_enable', methods: ['POST'])]
class EnableController extends AbstractController
{
    use AuthResponseTrait;

    public function __construct(
        private readonly TokenManager $tokenManager,
        private readonly TotpProvider $totpProvider,
        private readonly TotpStorageInterface $totpStorage,
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

            $enabled = $this->totpProvider->verifyAndEnable((string) $user->getId(), (string) $code);

            if (!$enabled) {
                return $this->api->error('INVALID_2FA', 'auth.invalid_2fa_code', 400);
            }

            // Retrieve remaining backup codes count after enabling
            $totpData = $this->totpStorage->findByUserId((string) $user->getId());
            $backupCodesCount = count($totpData['backup_codes'] ?? []);

            return $this->api->success([
                'enabled' => true,
                'backupCodesRemaining' => $backupCodesCount,
            ]);
        } catch (\Exception) {
            return $this->api->error('ENABLE_FAILED', 'auth.two_factor_enable_failed', 500);
        }
    }
}
