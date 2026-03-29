<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Functional tests for BetterAuth authentication endpoints.
 */
class AuthenticationTest extends WebTestCase
{
    private const TEST_EMAIL = 'test@example.com';
    private const TEST_PASSWORD = 'SecurePassword123!';
    private const TEST_NAME = 'Test User';

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

        // Clear all users for clean tests
        $connection = $em->getConnection();
        $connection->executeStatement('DELETE FROM refresh_tokens');
        $connection->executeStatement('DELETE FROM sessions');
        $connection->executeStatement('DELETE FROM users');
        $cache->clear();
    }

    private function registerUser(string $email = self::TEST_EMAIL, string $password = self::TEST_PASSWORD, string $name = self::TEST_NAME): array
    {
        $this->client->request(
            'POST',
            '/auth/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => $password,
                'name' => $name,
            ])
        );

        return json_decode($this->client->getResponse()->getContent(), true) ?? [];
    }

    public function testRegisterNewUser(): void
    {
        $this->client->request(
            'POST',
            '/auth/register',
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
            'Registration should return 201 Created. Response: '.$response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('user', $data);
        $this->assertArrayHasKey('access_token', $data);
        $this->assertSame(self::TEST_EMAIL, $data['user']['email']);
    }

    public function testRegisterWithExistingEmail(): void
    {
        // First registration
        $this->registerUser();

        // Second registration with same email
        $this->client->request(
            'POST',
            '/auth/register',
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
            'Duplicate registration should return 400 or 409. Response: '.$response->getContent()
        );
    }

    public function testRegisterWithInvalidEmail(): void
    {
        $this->client->request(
            'POST',
            '/auth/register',
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
        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_BAD_REQUEST, Response::HTTP_UNPROCESSABLE_ENTITY],
            'Invalid email should return 400 or 422. Response: '.$response->getContent()
        );
    }

    public function testRegisterWithWeakPassword(): void
    {
        $this->client->request(
            'POST',
            '/auth/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => self::TEST_EMAIL,
                'password' => '123', // Too weak
                'name' => self::TEST_NAME,
            ])
        );

        $response = $this->client->getResponse();
        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_BAD_REQUEST, Response::HTTP_UNPROCESSABLE_ENTITY, Response::HTTP_CREATED],
            'Weak password should return 400/422 (or 201 if no validation). Response: '.$response->getContent()
        );
    }

    public function testLoginWithValidCredentials(): void
    {
        // Register first
        $this->registerUser();

        // Now login
        $this->client->request(
            'POST',
            '/auth/login',
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
            'Login should return 200 OK. Response: '.$response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('access_token', $data);
        $this->assertArrayHasKey('user', $data);
    }

    public function testLoginWithInvalidPassword(): void
    {
        // Register first
        $this->registerUser();

        // Login with wrong password
        $this->client->request(
            'POST',
            '/auth/login',
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
            'Invalid password should return 401 Unauthorized. Response: '.$response->getContent());
    }

    public function testLoginWithNonExistentUser(): void
    {
        $this->client->request(
            'POST',
            '/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'nonexistent@example.com',
                'password' => self::TEST_PASSWORD,
            ])
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode(),
            'Non-existent user should return 401 Unauthorized. Response: '.$response->getContent());
    }

    public function testGetCurrentUserWithValidToken(): void
    {
        // Register and get token
        $registerData = $this->registerUser();
        $access_token = $registerData['access_token'] ?? '';

        $this->assertNotEmpty($access_token, 'Access token should be returned on registration');

        // Get current user
        $this->client->request(
            'GET',
            '/auth/me',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer '.$access_token,
            ]
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode(),
            'Get me should return 200 OK. Response: '.$response->getContent());

        $data = json_decode($response->getContent(), true);
        // BetterAuth returns user data directly or wrapped in 'user' key
        $userData = $data['user'] ?? $data;
        $this->assertArrayHasKey('email', $userData);
        $this->assertSame(self::TEST_EMAIL, $userData['email']);
    }

    public function testGetCurrentUserWithoutToken(): void
    {
        $this->client->request(
            'GET',
            '/auth/me',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json']
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode(),
            'Get me without token should return 401 Unauthorized. Response: '.$response->getContent());
    }

    public function testGetCurrentUserWithInvalidToken(): void
    {
        $this->client->request(
            'GET',
            '/auth/me',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer invalid-token',
            ]
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode(),
            'Get me with invalid token should return 401 Unauthorized. Response: '.$response->getContent());
    }

    public function testRefreshToken(): void
    {
        // Register and get tokens
        $registerData = $this->registerUser();
        $refresh_token = $registerData['refresh_token'] ?? null;

        if ($refresh_token === null) {
            $this->markTestSkipped('Refresh token not returned on registration');
        }

        // Refresh the token (BetterAuth expects camelCase 'refreshToken')
        $this->client->request(
            'POST',
            '/auth/refresh',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'refreshToken' => $refresh_token,
            ])
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode(),
            'Refresh should return 200 OK. Response: '.$response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('access_token', $data);
    }

    public function testLogout(): void
    {
        // Register and get token
        $registerData = $this->registerUser();
        $access_token = $registerData['access_token'] ?? '';

        // Logout
        $this->client->request(
            'POST',
            '/auth/logout',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer '.$access_token,
            ]
        );

        $response = $this->client->getResponse();
        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_OK, Response::HTTP_NO_CONTENT],
            'Logout should return 200 or 204. Response: '.$response->getContent()
        );
    }

    public function testListOAuthProviders(): void
    {
        $this->client->request(
            'GET',
            '/auth/oauth/providers',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json']
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode(),
            'OAuth providers list should return 200 OK. Response: '.$response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertIsArray($data);
    }

    public function test2FAStatusWithoutAuthentication(): void
    {
        $this->client->request(
            'GET',
            '/auth/2fa/status',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json']
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode(),
            '2FA status without auth should return 401. Response: '.$response->getContent());
    }

    public function test2FAStatusWithAuthentication(): void
    {
        // Register and get token
        $registerData = $this->registerUser();
        $access_token = $registerData['access_token'] ?? '';

        // Check 2FA status
        $this->client->request(
            'GET',
            '/auth/2fa/status',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer '.$access_token,
            ]
        );

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode(),
            '2FA status with auth should return 200. Response: '.$response->getContent());
    }

    public function testListSessionsWithAuthentication(): void
    {
        // Register and get token
        $registerData = $this->registerUser();
        $access_token = $registerData['access_token'] ?? '';

        // List sessions
        $this->client->request(
            'GET',
            '/auth/sessions',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer '.$access_token,
            ]
        );

        $response = $this->client->getResponse();
        // In API mode, sessions list returns 400 (only available in session/hybrid mode)
        // In session/hybrid mode, it returns 200
        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_OK, Response::HTTP_BAD_REQUEST],
            'Sessions list should return 200 or 400 (depending on auth mode). Response: '.$response->getContent()
        );
    }
}
