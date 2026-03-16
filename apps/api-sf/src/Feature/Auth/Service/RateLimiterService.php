<?php

declare(strict_types=1);

namespace App\Feature\Auth\Service;

use App\Shared\Service\ApiResponseService;
use Psr\Cache\CacheItemPoolInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Provides rate-limiting functionality for auth endpoints.
 */
final class RateLimiterService
{
    public function __construct(
        private readonly CacheItemPoolInterface $cache,
        private readonly ApiResponseService $api,
    ) {
    }

    public function consume(
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

        $response = $this->api->error('TOO_MANY_REQUESTS', 'auth.too_many_attempts', 429);
        $response->headers->set('Retry-After', (string) $retryAfter);

        return $response;
    }
}
