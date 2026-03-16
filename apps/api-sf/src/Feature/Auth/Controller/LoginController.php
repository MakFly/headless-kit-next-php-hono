<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller;

use App\Feature\Auth\Service\RateLimiterService;
use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\AuthManager;
use BetterAuth\Providers\TotpProvider\TotpProvider;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/login', name: 'api_v1_auth_login', methods: ['POST'])]
class LoginController extends AbstractController
{
    public function __construct(
        private readonly AuthManager $authManager,
        private readonly TotpProvider $totpProvider,
        private readonly RateLimiterService $rateLimiter,
        private readonly ApiResponseService $api,
        private readonly ?LoggerInterface $logger = null,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];

            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;

            if (!$email || !$password) {
                return $this->api->error('VALIDATION_ERROR', 'auth.email_password_required', 400);
            }

            $limiterKey = sprintf(
                'login:%s:%s',
                $request->getClientIp() ?? 'unknown',
                strtolower((string) $email)
            );
            $rateLimitResponse = $this->rateLimiter->consume($request, 'login', $limiterKey, 5, 900);
            if ($rateLimitResponse instanceof JsonResponse) {
                return $rateLimitResponse;
            }

            $result = $this->authManager->signIn(
                $email,
                $password,
                $request->getClientIp() ?? '127.0.0.1',
                $request->headers->get('User-Agent') ?? 'Unknown'
            );

            $userData = $result['user'];
            $userId = $userData['id'];

            if ($this->totpProvider->requires2fa($userId)) {
                return $this->api->success([
                    'requires2fa' => true,
                    'user' => $userData,
                ]);
            }

            $this->logger?->info('User logged in', ['email' => $email]);

            return $this->api->success($result);
        } catch (\Exception $e) {
            $this->logger?->warning('Login failed', [
                'email' => $data['email'] ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            return $this->api->error('INVALID_CREDENTIALS', 'auth.invalid_credentials', 401);
        }
    }
}
