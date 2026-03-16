<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller;

use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\AuthManager;
use BetterAuth\Providers\TotpProvider\TotpProvider;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/login/2fa', name: 'api_v1_auth_login_2fa', methods: ['POST'])]
class Login2faController extends AbstractController
{
    public function __construct(
        private readonly AuthManager $authManager,
        private readonly TotpProvider $totpProvider,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true) ?? [];

            $email = $data['email'] ?? null;
            $password = $data['password'] ?? null;
            $code = $data['code'] ?? null;

            if (!$email || !$password || !$code) {
                return $this->api->error('VALIDATION_ERROR', 'auth.email_password_2fa_required', 400);
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

                return $this->api->error('INVALID_2FA', 'auth.invalid_2fa_code', 401);
            }

            return $this->api->success($result);
        } catch (\Exception $e) {
            return $this->api->error('INVALID_AUTH_FLOW', 'auth.invalid_auth_flow', 401);
        }
    }
}
