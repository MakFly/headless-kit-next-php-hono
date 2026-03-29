<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller;

use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\AuthManager;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/register', name: 'api_v1_auth_register', methods: ['POST'])]
class RegisterController extends AbstractController
{
    public function __construct(
        private readonly AuthManager $authManager,
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
            $name = $data['name'] ?? null;

            if (!$email || !$password) {
                return $this->api->error('VALIDATION_ERROR', 'auth.email_password_required', 400);
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->api->error('VALIDATION_ERROR', 'auth.invalid_email_format', 422);
            }

            if (\strlen($password) < 8) {
                return $this->api->error('VALIDATION_ERROR', 'auth.password_too_short', 400);
            }

            $additionalData = $name !== null ? ['name' => $name] : [];

            $this->authManager->signUp($email, $password, $additionalData);

            $result = $this->authManager->signIn(
                $email,
                $password,
                $request->getClientIp() ?? '127.0.0.1',
                $request->headers->get('User-Agent') ?? 'Unknown'
            );

            $this->logger?->info('User registered', ['email' => $email]);

            return $this->api->success($result, 201);
        } catch (Exception $e) {
            $this->logger?->error('Registration failed', [
                'email' => $data['email'] ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            $statusCode = str_contains(strtolower($e->getMessage()), 'already exists') ? 409 : 400;
            $messageKey = $statusCode === 409 ? 'auth.email_already_registered' : 'auth.registration_failed';

            return $this->api->error('REGISTRATION_FAILED', $messageKey, $statusCode);
        }
    }
}
