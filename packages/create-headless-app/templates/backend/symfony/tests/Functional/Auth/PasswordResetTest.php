<?php

declare(strict_types=1);

namespace App\Tests\Functional\Auth;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;

/**
 * Functional tests for password reset endpoints.
 */
class PasswordResetTest extends WebTestCase
{
    private const TEST_EMAIL = 'passwordtest@example.com';
    private const TEST_PASSWORD = 'SecurePassword123!';

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

        // Clear password reset tokens if table exists
        try {
            $connection->executeStatement('DELETE FROM password_reset_tokens');
        } catch (\Exception $e) {
            // Table may not exist
        }

        $connection->executeStatement('DELETE FROM refresh_tokens');
        $connection->executeStatement('DELETE FROM sessions');
        $connection->executeStatement('DELETE FROM users');
        $cache->clear();
    }

    private function registerUser(string $email = self::TEST_EMAIL): void
    {
        $this->client->request(
            'POST',
            '/auth/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => self::TEST_PASSWORD,
                'name' => 'Test User',
            ])
        );
    }

    public function testForgotPasswordWithValidEmail(): void
    {
        // Register a user first
        $this->registerUser();

        // Request password reset
        $this->client->request(
            'POST',
            '/auth/password/forgot',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => self::TEST_EMAIL])
        );

        $response = $this->client->getResponse();

        // Should always return 200 to prevent email enumeration
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode(),
            'Password forgot should return 200. Response: ' . $response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('message', $data);
    }

    public function testForgotPasswordWithNonExistentEmail(): void
    {
        // Request password reset for non-existent email
        $this->client->request(
            'POST',
            '/auth/password/forgot',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'nonexistent@example.com'])
        );

        $response = $this->client->getResponse();

        // Should still return 200 to prevent email enumeration
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode(),
            'Password forgot should return 200 even for non-existent email. Response: ' . $response->getContent());
    }

    public function testForgotPasswordWithoutEmail(): void
    {
        $this->client->request(
            'POST',
            '/auth/password/forgot',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([])
        );

        $response = $this->client->getResponse();

        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_BAD_REQUEST, Response::HTTP_UNPROCESSABLE_ENTITY],
            'Password forgot without email should return 400/422. Response: ' . $response->getContent()
        );
    }

    public function testForgotPasswordWithInvalidEmail(): void
    {
        $this->client->request(
            'POST',
            '/auth/password/forgot',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'invalid-email'])
        );

        $response = $this->client->getResponse();

        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_BAD_REQUEST, Response::HTTP_UNPROCESSABLE_ENTITY, Response::HTTP_OK],
            'Password forgot with invalid email should return 400/422 or 200. Response: ' . $response->getContent()
        );
    }

    public function testResetPasswordWithInvalidToken(): void
    {
        $this->client->request(
            'POST',
            '/auth/password/reset',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'token' => 'invalid-token',
                'password' => 'NewSecurePassword123!',
            ])
        );

        $response = $this->client->getResponse();

        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_BAD_REQUEST, Response::HTTP_UNAUTHORIZED],
            'Password reset with invalid token should return 400/401. Response: ' . $response->getContent()
        );
    }

    public function testResetPasswordWithoutToken(): void
    {
        $this->client->request(
            'POST',
            '/auth/password/reset',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['password' => 'NewSecurePassword123!'])
        );

        $response = $this->client->getResponse();

        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_BAD_REQUEST, Response::HTTP_UNPROCESSABLE_ENTITY],
            'Password reset without token should return 400/422. Response: ' . $response->getContent()
        );
    }

    public function testResetPasswordWithoutPassword(): void
    {
        $this->client->request(
            'POST',
            '/auth/password/reset',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['token' => 'some-token'])
        );

        $response = $this->client->getResponse();

        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_BAD_REQUEST, Response::HTTP_UNPROCESSABLE_ENTITY],
            'Password reset without password should return 400/422. Response: ' . $response->getContent()
        );
    }

    public function testVerifyTokenWithInvalidToken(): void
    {
        $this->client->request(
            'POST',
            '/auth/password/verify-token',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['token' => 'invalid-token'])
        );

        $response = $this->client->getResponse();

        // Bundle returns 400 for invalid tokens
        $this->assertSame(Response::HTTP_BAD_REQUEST, $response->getStatusCode(),
            'Verify token with invalid token should return 400. Response: ' . $response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('valid', $data);
        $this->assertFalse($data['valid']);
    }

    public function testVerifyTokenWithoutToken(): void
    {
        $this->client->request(
            'POST',
            '/auth/password/verify-token',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([])
        );

        $response = $this->client->getResponse();

        $this->assertContains(
            $response->getStatusCode(),
            [Response::HTTP_BAD_REQUEST, Response::HTTP_OK],
            'Verify token without token should return 400 or 200 with valid=false. Response: ' . $response->getContent()
        );
    }
}
