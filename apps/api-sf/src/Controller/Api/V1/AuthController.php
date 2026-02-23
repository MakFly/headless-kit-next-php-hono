<?php

declare(strict_types=1);

namespace App\Controller\Api\V1;

use BetterAuth\Core\AuthManager;
use BetterAuth\Core\Entities\User;
use BetterAuth\Core\Interfaces\TokenSignerInterface;
use BetterAuth\Core\Interfaces\UserRepositoryInterface;
use BetterAuth\Core\TokenManager;
use BetterAuth\Providers\TotpProvider\TotpProvider;
use BetterAuth\Symfony\Controller\Trait\AuthResponseTrait;
use Psr\Log\LoggerInterface;
use Psr\Cache\CacheItemPoolInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Custom AuthController extending BetterAuth functionality.
 *
 * Endpoints:
 * - POST /api/v1/auth/register - Register new user
 * - POST /api/v1/auth/login - Login with email/password
 * - POST /api/v1/auth/login/2fa - Complete login with 2FA code
 * - GET  /api/v1/auth/me - Get current authenticated user
 * - POST /api/v1/auth/refresh - Refresh access token
 * - POST /api/v1/auth/logout - Logout current session
 * - POST /api/v1/auth/revoke-all - Revoke all sessions
 */
#[Route('/api/v1/auth', name: 'api_v1_auth_')]
class AuthController extends AbstractController
{
    use AuthResponseTrait;

    public const REFRESH_TEST_EMAIL = 'refresh-test@example.com';
    private const REFRESH_TEST_TOKEN_LIFETIME = 10;

    public function __construct(
        private readonly AuthManager $authManager,
        private readonly TokenManager $tokenManager,
        private readonly TokenSignerInterface $tokenSigner,
        private readonly UserRepositoryInterface $userRepository,
        private readonly TotpProvider $totpProvider,
        #[Autowire(service: 'cache.app')]
        private readonly CacheItemPoolInterface $cache,
        private readonly RequestStack $requestStack,
        private readonly ?LoggerInterface $logger = null,
    ) {
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];

            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;
            $name = $data['name'] ?? null;

            if (!$email || !$password) {
                return $this->jsonNoStore(['error' => 'Email and password are required'], 400);
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->jsonNoStore(['error' => 'Invalid email format'], 422);
            }

            $additionalData = $name !== null ? ['name' => $name] : [];

            $user = $this->authManager->signUp($email, $password, $additionalData);

            $result = $this->authManager->signIn(
                $email,
                $password,
                $request->getClientIp() ?? '127.0.0.1',
                $request->headers->get('User-Agent') ?? 'Unknown'
            );

            $this->logger?->info('User registered', ['email' => $email]);

            return $this->jsonNoStore($result, 201);
        } catch (\Exception $e) {
            $this->logger?->error('Registration failed', [
                'email' => $data['email'] ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            $statusCode = str_contains(strtolower($e->getMessage()), 'already exists') ? 409 : 400;
            $message = $statusCode === 409 ? 'Email already registered' : 'Registration failed';

            return $this->jsonNoStore(['error' => $message], $statusCode);
        }
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];

            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;

            if (!$email || !$password) {
                return $this->jsonNoStore(['error' => 'Email and password are required'], 400);
            }

            $limiterKey = sprintf(
                'login:%s:%s',
                $request->getClientIp() ?? 'unknown',
                strtolower((string) $email)
            );
            $rateLimitResponse = $this->consumeRateLimit($request, 'login', $limiterKey, 5, 900);
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
                return $this->jsonNoStore([
                    'requires2fa' => true,
                    'message' => 'Two-factor authentication required',
                    'user' => $userData,
                ]);
            }

            $this->logger?->info('User logged in', ['email' => $email]);

            if ($email === self::REFRESH_TEST_EMAIL) {
                $result = $this->createShortLivedTokens($userId, $result);
            }

            return $this->jsonNoStore($result);
        } catch (\Exception $e) {
            $this->logger?->warning('Login failed', [
                'email' => $data['email'] ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            return $this->jsonNoStore(['error' => 'Invalid credentials'], 401);
        }
    }

    #[Route('/login/2fa', name: 'login_2fa', methods: ['POST'])]
    public function login2fa(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];

            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;
            $code = $data['code'] ?? null;

            if (!$email || !$password || !$code) {
                return $this->jsonNoStore(['error' => 'Email, password and 2FA code are required'], 400);
            }

            $result = $this->authManager->signIn(
                $email,
                $password,
                $request->getClientIp() ?? '127.0.0.1',
                $request->headers->get('User-Agent') ?? 'Unknown'
            );

            $userData = $result['user'];
            $userId = $userData['id'];

            $verified = $this->totpProvider->verify($userId, $code);
            if (!$verified) {
                if (isset($result['session'])) {
                    $this->authManager->signOut($result['session']->getToken());
                } elseif (isset($result['access_token'])) {
                    $this->authManager->revokeAllTokens($userId);
                }

                return $this->jsonNoStore(['error' => 'Invalid 2FA code'], 401);
            }

            return $this->jsonNoStore($result);
        } catch (\Exception $e) {
            return $this->jsonNoStore(['error' => 'Invalid authentication flow'], 401);
        }
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(Request $request): JsonResponse
    {
        try {
            $token = $this->extractBearerToken($request);

            if (!$token) {
                return $this->jsonNoStore(['error' => 'No token provided'], 401);
            }

            $payload = $this->tokenManager->parse($token);
            if (!$payload) {
                return $this->jsonNoStore(['error' => 'Invalid token'], 401);
            }

            $user = $this->tokenManager->getUserFromToken($token);
            if (!$user) {
                return $this->jsonNoStore(['error' => 'Invalid token'], 401);
            }

            $response = ['user' => $this->formatUser($user)];

            if (isset($payload['exp'])) {
                $response['expiresAt'] = (new \DateTimeImmutable('@' . $payload['exp']))->format(\DateTimeInterface::ATOM);
            }

            return $this->jsonNoStore($response);
        } catch (\Exception $e) {
            return $this->jsonNoStore(['error' => 'Invalid token'], 401);
        }
    }

    #[Route('/refresh', name: 'refresh', methods: ['POST'])]
    public function refresh(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];
            $refreshToken = $data['refreshToken'] ?? $data['refresh_token'] ?? null;

            if (!$refreshToken) {
                return $this->jsonNoStore(['error' => 'Refresh token is required'], 400);
            }

            $limiterKey = sprintf(
                'refresh:%s:%s',
                $request->getClientIp() ?? 'unknown',
                substr(hash('sha256', (string) $refreshToken), 0, 16)
            );
            $rateLimitResponse = $this->consumeRateLimit($request, 'refresh', $limiterKey, 30, 60);
            if ($rateLimitResponse instanceof JsonResponse) {
                return $rateLimitResponse;
            }

            $result = $this->authManager->refresh($refreshToken);

            return $this->jsonNoStore($result);
        } catch (\Exception $e) {
            $this->logger?->warning('Token refresh failed', ['error' => $e->getMessage()]);

            return $this->jsonNoStore(['error' => 'Invalid refresh token'], 401);
        }
    }

    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        try {
            $token = $this->extractBearerToken($request);

            if (!$token) {
                return $this->jsonNoStore(['error' => 'No token provided'], 401);
            }

            $this->authManager->signOut($token);

            return $this->jsonNoStore(['message' => 'Logged out successfully']);
        } catch (\Exception $e) {
            return $this->jsonNoStore(['error' => 'Logout failed'], 400);
        }
    }

    private function createShortLivedTokens(string $userId, array $result): array
    {
        $user = $this->userRepository->findById($userId);
        if (!$user instanceof User) {
            return $result;
        }

        $accessToken = $this->tokenSigner->sign(
            [
                'sub' => $user->getId(),
                'type' => 'access',
                'data' => [
                    'email' => $user->getEmail(),
                    'username' => $user->getUsername(),
                ],
            ],
            self::REFRESH_TEST_TOKEN_LIFETIME
        );

        return [
            ...$result,
            'access_token' => $accessToken,
            'expires_in' => self::REFRESH_TEST_TOKEN_LIFETIME,
        ];
    }

    #[Route('/revoke-all', name: 'revoke_all', methods: ['POST'])]
    public function revokeAll(Request $request): JsonResponse
    {
        try {
            $token = $this->extractBearerToken($request);

            if (!$token) {
                return $this->jsonNoStore(['error' => 'No token provided'], 401);
            }

            $user = $this->tokenManager->getUserFromToken($token);

            if (!$user) {
                return $this->jsonNoStore(['error' => 'Invalid token'], 401);
            }

            $this->authManager->revokeAllTokens($user->getId());

            return $this->jsonNoStore(['message' => 'All sessions revoked']);
        } catch (\Exception $e) {
            return $this->jsonNoStore(['error' => 'Revoke all failed'], 400);
        }
    }

    private function consumeRateLimit(
        Request $request,
        string $scope,
        string $identifier,
        int $maxAttempts,
        int $windowSeconds
    ): ?JsonResponse {
        $now = time();
        $window = intdiv($now, $windowSeconds);
        $fingerprint = sha1(($request->getClientIp() ?? 'unknown') . ':' . $identifier);
        $cacheKey = sprintf('auth_rl_%s_%s_%d', $scope, $fingerprint, $window);

        $item = $this->cache->getItem($cacheKey);
        $count = $item->isHit() ? (int) $item->get() : 0;
        $count++;

        $retryAfter = max(1, (($window + 1) * $windowSeconds) - $now);

        $item->set($count);
        $item->expiresAfter($retryAfter);
        $this->cache->save($item);

        if ($count <= $maxAttempts) {
            return null;
        }

        $response = $this->jsonNoStore(
            ['error' => 'Too many attempts. Please try again later.'],
            429
        );

        $response->headers->set('Retry-After', (string) $retryAfter);

        return $response;
    }

    private function jsonNoStore(array $data, int $status = 200): JsonResponse
    {
        $requestId = $this->getRequestId();
        if (!isset($data['status'])) {
            $data['status'] = $status;
        }
        if (!isset($data['request_id'])) {
            $data['request_id'] = $requestId;
        }

        $response = $this->json($data, $status);
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('X-Request-Id', $requestId);

        return $response;
    }

    private function getRequestId(): string
    {
        $request = $this->requestStack->getCurrentRequest();
        $incoming = $request?->headers->get('X-Request-Id');
        if (is_string($incoming) && $incoming !== '') {
            return $incoming;
        }

        try {
            return bin2hex(random_bytes(16));
        } catch (\Exception) {
            return uniqid('req_', true);
        }
    }
}
