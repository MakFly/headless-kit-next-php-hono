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

#[Route('/api/v1/auth/me', name: 'api_v1_auth_update_profile', methods: ['PATCH'])]
class UpdateProfileController extends AbstractController
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

            $data = json_decode($request->getContent(), true) ?? [];

            $name = isset($data['name']) ? trim((string) $data['name']) : null;
            $email = isset($data['email']) ? trim((string) $data['email']) : null;

            // Validate: at least one field must be provided
            if ($name === null && $email === null) {
                return $this->api->error('VALIDATION_ERROR', 'auth.no_fields_provided', 422);
            }

            // Load the Doctrine entity
            $doctrineUser = $this->em->getRepository(User::class)->find($user->getId());
            if ($doctrineUser === null) {
                return $this->api->error('NOT_FOUND', 'auth.user_not_found', 404);
            }

            // Validate name
            if ($name !== null) {
                if (mb_strlen($name) < 2) {
                    return $this->api->error('VALIDATION_ERROR', 'auth.name_too_short', 422);
                }
                $doctrineUser->setUsername($name);
            }

            // Validate email
            if ($email !== null) {
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    return $this->api->error('VALIDATION_ERROR', 'auth.invalid_email_format', 422);
                }

                // Uniqueness check (excluding current user)
                $existingUser = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
                if ($existingUser !== null && $existingUser->getId() !== $doctrineUser->getId()) {
                    return $this->api->error('CONFLICT', 'auth.email_already_registered', 409);
                }

                $doctrineUser->setEmail($email);
            }

            $doctrineUser->setUpdatedAt(new \DateTimeImmutable());
            $this->em->flush();

            return $this->api->success([
                'user' => [
                    'id' => $doctrineUser->getId(),
                    'email' => $doctrineUser->getEmail(),
                    'name' => $doctrineUser->getUsername(),
                    'avatar' => $doctrineUser->getAvatar(),
                    'emailVerified' => $doctrineUser->isEmailVerified(),
                    'emailVerifiedAt' => $doctrineUser->getEmailVerifiedAt()?->format(\DateTimeInterface::ATOM),
                    'createdAt' => $doctrineUser->getCreatedAt()->format(\DateTimeInterface::ATOM),
                    'updatedAt' => $doctrineUser->getUpdatedAt()->format(\DateTimeInterface::ATOM),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->api->error('INTERNAL_ERROR', 'auth.update_failed', 500);
        }
    }
}
