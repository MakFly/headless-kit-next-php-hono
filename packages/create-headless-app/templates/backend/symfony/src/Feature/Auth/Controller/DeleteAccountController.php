<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller;

use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\TokenManager;
use BetterAuth\Symfony\Controller\Trait\AuthResponseTrait;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/me', name: 'api_v1_auth_delete_account', methods: ['DELETE'])]
class DeleteAccountController extends AbstractController
{
    use AuthResponseTrait;

    public function __construct(
        private readonly TokenManager $tokenManager,
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $token = $this->extractBearerToken($request);

            if (!$token) {
                return $this->api->error('UNAUTHORIZED', 'auth.no_token_provided', 401);
            }

            $user = $this->tokenManager->getUserFromToken($token);
            if (!$user) {
                return $this->api->error('UNAUTHORIZED', 'auth.invalid_token', 401);
            }

            // Revoke all tokens before deletion
            try {
                $this->tokenManager->signOut($token);
            } catch (\Exception) {
                // Proceed even if token revocation fails
            }

            // Load and delete the Doctrine entity (cascades to related data)
            $doctrineUser = $this->em->getRepository(User::class)->find($user->getId());
            if ($doctrineUser === null) {
                return $this->api->error('NOT_FOUND', 'auth.user_not_found', 404);
            }

            $this->em->remove($doctrineUser);
            $this->em->flush();

            return $this->api->success(['message' => 'Account deleted successfully']);
        } catch (\Exception $e) {
            return $this->api->error('INTERNAL_ERROR', 'auth.delete_failed', 500);
        }
    }
}
