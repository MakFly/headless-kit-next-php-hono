<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller;

use BetterAuth\Providers\PasswordResetProvider\PasswordResetProvider;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/password/verify-token', name: 'api_v1_auth_password_verify_token', methods: ['POST'])]
class VerifyResetTokenController extends AbstractController
{
    public function __construct(
        private readonly PasswordResetProvider $passwordResetProvider,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];
            $token = $data['token'] ?? null;

            if (!$token) {
                return $this->json(['error' => 'Token is required'], 400);
            }

            $result = $this->passwordResetProvider->verifyResetToken($token);

            if (!$result['valid']) {
                return $this->json([
                    'valid' => false,
                    'error' => 'Invalid or expired token',
                ], 400);
            }

            return $this->json([
                'valid' => true,
                'email' => $result['email'] ?? null,
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'valid' => false,
                'error' => 'Invalid or expired token',
            ], 400);
        }
    }
}
