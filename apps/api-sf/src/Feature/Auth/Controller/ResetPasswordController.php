<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller;

use App\Shared\Service\ApiResponseService;
use BetterAuth\Providers\PasswordResetProvider\PasswordResetProvider;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/password/reset', name: 'api_v1_auth_password_reset', methods: ['POST'])]
class ResetPasswordController extends AbstractController
{
    public function __construct(
        private readonly PasswordResetProvider $passwordResetProvider,
        private readonly ApiResponseService $api,
        private readonly ?LoggerInterface $logger = null,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];

            $token = $data['token'] ?? null;
            $password = $data['newPassword'] ?? $data['password'] ?? null;

            if (!$token || !$password) {
                return $this->api->error('VALIDATION_ERROR', 'auth.token_password_required', 400);
            }

            if (\strlen($password) < 8) {
                return $this->api->error('VALIDATION_ERROR', 'auth.password_too_short', 400);
            }

            $result = $this->passwordResetProvider->resetPassword($token, $password);

            if (!$result['success']) {
                $this->logger?->warning('Password reset failed - invalid token');

                return $this->api->error('INVALID_TOKEN', $result['error'] ?? 'auth.invalid_reset_token', 400);
            }

            $this->logger?->info('Password reset successful');

            return $this->api->success([
                'message' => 'Password has been reset successfully',
            ]);
        } catch (Exception $e) {
            $this->logger?->error('Password reset failed', ['error' => $e->getMessage()]);

            return $this->api->error('INVALID_TOKEN', 'auth.invalid_reset_token', 400);
        }
    }
}
