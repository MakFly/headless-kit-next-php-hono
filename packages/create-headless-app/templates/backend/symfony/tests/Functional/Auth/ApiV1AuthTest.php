<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;

/**
 * Functional tests for /api/v1/auth/* endpoints (custom controllers).
 */
class ApiV1AuthTest extends WebTestCase
{
    private const TEST_EMAIL = 'apiv1test@example.com';
    private const TEST_PASSWORD = 'SecurePassword123!';
    private const TEST_NAME = 'API V1 Test User';

    private ?KernelBrowser $client = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = static::createClient();
        $this->resetDatabase();
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->client = null;
    }

    private function resetDatabase(): void
    {
        $container = $this->client->getContainer();
        $em = $container->get('doctrine')->getManager();
        $cache = $container->get('cache.app');

        $connection = $em->getConnection();
        $connection->executeStatement('DELETE FROM refresh_tokens');
        $connection->executeStatement('DELETE FROM sessions');
        $connection->executeStatement('DELETE FROM users');
        $cache->clear();
    }

    private function registerUser(string $email = self::TEST_EMAIL): array
    {
        $this->client->request(
            'POST',
            '/api/v1/auth/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => self::TEST_PASSWORD,
                'name' => self::TEST_NAME,
            ])
        );

        $raw = json_decode($this->client->getResponse()->getContent(), true) ?? [];

        // Return the data payload (envelope format: {success, data, status, request_id})
        return $raw['data'] ?? $raw;
    }

    // ==================== REGISTER TESTS ====================

    public function testRegisterNewUser(): void
    {
        $this->client->request(
            'POST',
            '/api/v1/auth/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => self::TEST_EMAIL,
                'password' => self::TEST_PASSWORD,
                'name' => self::TEST_NAME,
            ])
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_CREATED, $response->getStatusCode(),
            'Registration should return 201 Created. Response: ' . $response->getContent());

        $envelope = json_decode($response->getContent(), true);
        $this->assertTrue($envelope['success']);
        $data = $envelope['data'];
        $this->assertArrayHasKey('user', $data);
        $this->assertArrayHasKey('access_token', $data);
        $this->assertArrayHasKey('refresh_token', $data);
    }

    public function testRegisterWithExistingEmail(): void
    {
        $this->registerUser();

        $this->client->request(
            'POST',
            '/api/v1/auth/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => self::TEST_EMAIL,
                'password' => self::TEST_PASSWORD,
                'name' => 'Another User',
            ])
        );

        $response = $this->client->getResponse();
        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_BAD_REQUEST, Response::HTTP_CONFLICT],
            'Duplicate registration should return 400 or 409. Response: ' . $response->getContent()
        );
    }

    public function testRegisterWithoutEmail(): void
    {
        $this->client->request(
            'POST',
            '/api/v1/auth/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'password' => self::TEST_PASSWORD,
                'name' => self::TEST_NAME,
            ])
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode(),
            'Registration without email should return 400. Response: ' . $response->getContent());
    }

    public function testRegisterWithInvalidEmail(): void
    {
        $this->client->request(
            'POST',
            '/api/v1/auth/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'invalid-email',
                'password' => self::TEST_PASSWORD,
                'name' => self::TEST_NAME,
            ])
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $response->getStatusCode(),
            'Registration with invalid email should return 422. Response: ' . $response->getContent());
    }

    // ==================== LOGIN TESTS ====================

    public function testLoginWithValidCredentials(): void
    {
        $this->registerUser();

        $this->client->request(
            'POST',
            '/api/v1/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => self::TEST_EMAIL,
                'password' => self::TEST_PASSWORD,
            ])
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode(),
            'Login should return 200 OK. Response: ' . $response->getContent());

        $envelope = json_decode($response->getContent(), true);
        $this->assertTrue($envelope['success']);
        $data = $envelope['data'];
        $this->assertArrayHasKey('access_token', $data);
        $this->assertArrayHasKey('refresh_token', $data);
        $this->assertArrayHasKey('user', $data);
    }

    public function testLoginWithInvalidPassword(): void
    {
        $this->registerUser();

        $this->client->request(
            'POST',
            '/api/v1/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => self::TEST_EMAIL,
                'password' => 'WrongPassword123!',
            ])
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode(),
            'Login with invalid password should return 401. Response: ' . $response->getContent());
    }

    public function testLoginWithoutCredentials(): void
    {
        $this->client->request(
            'POST',
            '/api/v1/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([])
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode(),
            'Login without credentials should return 400. Response: ' . $response->getContent());
    }

    // ==================== ME TESTS ====================

    public function testMeWithValidToken(): void
    {
        $registerData = $this->registerUser();
        $accessToken = $registerData['access_token'] ?? '';

        $this->client->request(
            'GET',
            '/api/v1/auth/me',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $accessToken,
            ]
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode(),
            'Get me should return 200 OK. Response: ' . $response->getContent());

        $envelope = json_decode($response->getContent(), true);
        $this->assertTrue($envelope['success']);
        $this->assertArrayHasKey('user', $envelope['data']);
    }

    public function testMeWithoutToken(): void
    {
        $this->client->request(
            'GET',
            '/api/v1/auth/me',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json']
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode(),
            'Get me without token should return 401.');
    }

    public function testMeWithInvalidToken(): void
    {
        $this->client->request(
            'GET',
            '/api/v1/auth/me',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer invalid-token',
            ]
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode(),
            'Get me with invalid token should return 401. Response: ' . $response->getContent());
    }

    // ==================== REFRESH TESTS ====================

    public function testRefreshWithValidToken(): void
    {
        $registerData = $this->registerUser();
        $refreshToken = $registerData['refresh_token'] ?? null;

        $this->assertNotNull($refreshToken, 'Refresh token should be returned on registration');

        $this->client->request(
            'POST',
            '/api/v1/auth/refresh',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['refreshToken' => $refreshToken])
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode(),
            'Refresh should return 200 OK. Response: ' . $response->getContent());

        $envelope = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('access_token', $envelope['data']);
    }

    public function testRefreshWithInvalidToken(): void
    {
        $this->client->request(
            'POST',
            '/api/v1/auth/refresh',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['refreshToken' => 'invalid-token'])
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode(),
            'Refresh with invalid token should return 401. Response: ' . $response->getContent());
    }

    public function testRefreshWithoutToken(): void
    {
        $this->client->request(
            'POST',
            '/api/v1/auth/refresh',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([])
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode(),
            'Refresh without token should return 400. Response: ' . $response->getContent());
    }

    // ==================== LOGOUT TESTS ====================

    public function testLogoutWithValidToken(): void
    {
        $registerData = $this->registerUser();
        $accessToken = $registerData['access_token'] ?? '';

        $this->client->request(
            'POST',
            '/api/v1/auth/logout',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $accessToken,
            ]
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode(),
            'Logout should return 200 OK. Response: ' . $response->getContent());
    }

    public function testLogoutWithoutToken(): void
    {
        $this->client->request(
            'POST',
            '/api/v1/auth/logout',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json']
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode(),
            'Logout without token should return 401.');
    }

    // ==================== REVOKE ALL TESTS ====================

    public function testRevokeAllWithValidToken(): void
    {
        $registerData = $this->registerUser();
        $accessToken = $registerData['access_token'] ?? '';

        $this->client->request(
            'POST',
            '/api/v1/auth/revoke-all',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $accessToken,
            ]
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode(),
            'Revoke all should return 200 OK. Response: ' . $response->getContent());
    }

    public function testRevokeAllWithoutToken(): void
    {
        $this->client->request(
            'POST',
            '/api/v1/auth/revoke-all',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json']
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode(),
            'Revoke all without token should return 401.');
    }
}
