<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller\TwoFactor;

use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\Interfaces\TotpStorageInterface;
use BetterAuth\Core\TokenManager;
use BetterAuth\Symfony\Controller\Trait\AuthResponseTrait;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Returns the remaining backup codes count for the authenticated user.
 *
 * Note: backup codes are stored as bcrypt hashes and cannot be revealed after setup.
 * This endpoint returns the count of remaining (unused) codes only.
 */
#[Route('/api/v1/auth/2fa/recovery-codes', name: 'api_v1_auth_2fa_recovery_codes', methods: ['GET'])]
class RecoveryCodesController extends AbstractController
{
    use AuthResponseTrait;

    public function __construct(
        private readonly TokenManager $tokenManager,
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

            $totpData = $this->totpStorage->findByUserId((string) $user->getId());

            if ($totpData === null) {
                return $this->api->error('NOT_CONFIGURED', 'auth.two_factor_not_configured', 404);
            }

            $remaining = \count($totpData['backup_codes'] ?? []);

            return $this->api->success([
                'remainingCodes' => $remaining,
                'note' => 'Backup codes are not retrievable after initial setup. Generate new ones via POST /api/v1/auth/2fa/setup if needed.',
            ]);
        } catch (Exception) {
            return $this->api->error('UNAUTHORIZED', 'auth.invalid_token', 401);
        }
    }
}
