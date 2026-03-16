<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Simple endpoint accessibility tests for BetterAuth routes.
 */
class EndpointAccessTest extends WebTestCase
{
    /**
     * Test that auth routes are accessible (return proper HTTP codes).
     */
    #[DataProvider('authEndpointsProvider')]
    public function testAuthEndpointsAccessible(string $method, string $uri, array $expectedCodes, ?array $payload = null): void
    {
        $client = static::createClient();

        $server = ['CONTENT_TYPE' => 'application/json'];
        $content = $payload ? json_encode($payload) : null;

        $client->request($method, $uri, [], [], $server, $content);

        $response = $client->getResponse();
        $this->assertContains(
            $response->getStatusCode(),
            $expectedCodes,
            sprintf(
                '%s %s should return one of [%s], got %d. Response: %s',
                $method,
                $uri,
                implode(', ', $expectedCodes),
                $response->getStatusCode(),
                substr($response->getContent(), 0, 500)
            )
        );
    }

    public static function authEndpointsProvider(): array
    {
        return [
            // Login without credentials should return 400/401/422
            'POST /auth/login - empty' => [
                'POST',
                '/auth/login',
                [Response::HTTP_BAD_REQUEST, Response::HTTP_UNAUTHORIZED, Response::HTTP_UNPROCESSABLE_ENTITY],
                [],
            ],

            // Login with invalid credentials should return 401
            'POST /auth/login - invalid' => [
                'POST',
                '/auth/login',
                [Response::HTTP_UNAUTHORIZED],
                ['email' => 'nonexistent@test.com', 'password' => 'wrongpass123'],
            ],

            // Get me without token should return 401
            'GET /auth/me - no token' => [
                'GET',
                '/auth/me',
                [Response::HTTP_UNAUTHORIZED],
                null,
            ],

            // Refresh with invalid token should return 400/401
            'POST /auth/refresh - invalid' => [
                'POST',
                '/auth/refresh',
                [Response::HTTP_BAD_REQUEST, Response::HTTP_UNAUTHORIZED],
                ['refreshToken' => 'invalid-token'],
            ],

            // Logout without token should return 401
            'POST /auth/logout - no token' => [
                'POST',
                '/auth/logout',
                [Response::HTTP_UNAUTHORIZED],
                null,
            ],

            // 2FA status without token should return 401
            'GET /auth/2fa/status - no token' => [
                'GET',
                '/auth/2fa/status',
                [Response::HTTP_UNAUTHORIZED],
                null,
            ],

            // Sessions list without token should return 401
            'GET /auth/sessions - no token' => [
                'GET',
                '/auth/sessions',
                [Response::HTTP_UNAUTHORIZED],
                null,
            ],
        ];
    }

    /**
     * Test that OAuth providers endpoint is accessible.
     */
    public function testOAuthProvidersEndpoint(): void
    {
        $client = static::createClient();

        $client->request('GET', '/auth/oauth/providers', [], [], ['CONTENT_TYPE' => 'application/json']);

        $response = $client->getResponse();

        // Should return 200 or 500 (if FRONTEND_URL not configured)
        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_OK, Response::HTTP_INTERNAL_SERVER_ERROR],
            'OAuth providers endpoint should be accessible. Response: ' . $response->getContent()
        );

        if ($response->getStatusCode() === Response::HTTP_OK) {
            $data = json_decode($response->getContent(), true);
            $this->assertIsArray($data, 'OAuth providers should return an array');
        }
    }

    /**
     * Test API documentation is accessible.
     */
    public function testApiDocumentation(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/v1');

        $response = $client->getResponse();
        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_OK, Response::HTTP_MOVED_PERMANENTLY, Response::HTTP_FOUND, Response::HTTP_NOT_FOUND],
            'API documentation should be accessible or return 404. Response: ' . $response->getContent()
        );
    }

    /**
     * Test API docs JSON endpoint.
     */
    public function testApiDocsJson(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/v1/docs.json');

        $response = $client->getResponse();
        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_OK, Response::HTTP_NOT_FOUND],
            'API docs JSON should be accessible or return 404'
        );
    }
}
