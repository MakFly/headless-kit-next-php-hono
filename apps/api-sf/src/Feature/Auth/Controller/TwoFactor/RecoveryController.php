<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller\TwoFactor;

use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\AuthManager;
use BetterAuth\Core\Interfaces\TotpStorageInterface;
use BetterAuth\Symfony\Controller\Trait\AuthResponseTrait;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Recovery login endpoint — allows logging in using a backup code when TOTP device is unavailable.
 * Requires email + password + backup code.
 */
#[Route('/api/v1/auth/2fa/recovery', name: 'api_v1_auth_2fa_recovery', methods: ['POST'])]
class RecoveryController extends AbstractController
{
    use AuthResponseTrait;

    public function __construct(
        private readonly AuthManager $authManager,
        private readonly TotpStorageInterface $totpStorage,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];

            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;
            $backupCode = $data['code'] ?? null;

            if (!$email || !$password || !$backupCode) {
                return $this->api->error('VALIDATION_ERROR', 'auth.email_password_recovery_code_required', 400);
            }

            // Authenticate with credentials first
            $result = $this->authManager->signIn(
                (string) $email,
                (string) $password,
                $request->getClientIp() ?? '127.0.0.1',
                $request->headers->get('User-Agent') ?? 'Unknown'
            );

            $userId = $result['user']['id'];

            // Verify the backup code (useBackupCode consumes it)
            $valid = $this->totpStorage->useBackupCode((string) $userId, (string) $backupCode);

            if (!$valid) {
                // Revoke the just-created session/token to avoid leaving it dangling
                if (isset($result['session'])) {
                    $this->authManager->signOut($result['session']->getToken());
                } elseif (isset($result['access_token'])) {
                    $this->authManager->revokeAllTokens((string) $userId);
                }

                return $this->api->error('INVALID_RECOVERY_CODE', 'auth.invalid_recovery_code', 401);
            }

            // Update last 2FA verified timestamp
            $this->totpStorage->updateLast2faVerifiedAt((string) $userId);

            return $this->api->success($result);
        } catch (\Exception) {
            return $this->api->error('INVALID_CREDENTIALS', 'auth.invalid_credentials', 401);
        }
    }
}
