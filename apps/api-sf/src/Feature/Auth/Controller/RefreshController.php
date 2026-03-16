<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller;

use App\Feature\Auth\Service\RateLimiterService;
use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\AuthManager;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/refresh', name: 'api_v1_auth_refresh', methods: ['POST'])]
class RefreshController extends AbstractController
{
    public function __construct(
        private readonly AuthManager $authManager,
        private readonly RateLimiterService $rateLimiter,
        private readonly ApiResponseService $api,
        private readonly ?LoggerInterface $logger = null,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];
            $refreshToken = $data['refreshToken'] ?? $data['refresh_token'] ?? null;

            if (!$refreshToken) {
                return $this->api->error('VALIDATION_ERROR', 'auth.refresh_token_required', 400);
            }

            $limiterKey = sprintf(
                'refresh:%s:%s',
                $request->getClientIp() ?? 'unknown',
                substr(hash('sha256', (string) $refreshToken), 0, 16)
            );
            $rateLimitResponse = $this->rateLimiter->consume($request, 'refresh', $limiterKey, 30, 60);
            if ($rateLimitResponse instanceof JsonResponse) {
                return $rateLimitResponse;
            }

            $result = $this->authManager->refresh($refreshToken);

            return $this->api->success($result);
        } catch (\Exception $e) {
            $this->logger?->warning('Token refresh failed', ['error' => $e->getMessage()]);

            return $this->api->error('INVALID_REFRESH_TOKEN', 'auth.invalid_refresh_token', 401);
        }
    }
}
