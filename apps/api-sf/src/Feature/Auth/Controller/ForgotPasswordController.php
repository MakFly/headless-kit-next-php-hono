<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller;

use App\Shared\Service\ApiResponseService;
use BetterAuth\Providers\PasswordResetProvider\PasswordResetProvider;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/password/forgot', name: 'api_v1_auth_password_forgot', methods: ['POST'])]
class ForgotPasswordController extends AbstractController
{
    public function __construct(
        private readonly PasswordResetProvider $passwordResetProvider,
        private readonly ApiResponseService $api,
        private readonly ?LoggerInterface $logger = null,
        #[Autowire(env: 'FRONTEND_URL')]
        private readonly string $frontendUrl = 'http://localhost:3000',
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];
            $email = $data['email'] ?? null;

            if (!$email) {
                return $this->api->error('VALIDATION_ERROR', 'auth.email_required', 400);
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->api->error('VALIDATION_ERROR', 'auth.invalid_email_format', 422);
            }

            $callbackUrl = rtrim($this->frontendUrl, '/') . '/reset-password';
            $this->passwordResetProvider->sendResetEmail($email, $callbackUrl);

            $this->logger?->info('Password reset requested', ['email' => $email]);

            // Always return success to prevent email enumeration
            return $this->api->success([
                'message' => 'If an account exists with this email, a password reset link has been sent.',
                'expiresIn' => 3600,
            ]);
        } catch (\Exception $e) {
            $this->logger?->error('Password reset request failed', [
                'email' => $data['email'] ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            // Don't expose internal errors for security
            return $this->api->success([
                'message' => 'If an account exists with this email, a password reset link has been sent.',
            ]);
        }
    }
}
