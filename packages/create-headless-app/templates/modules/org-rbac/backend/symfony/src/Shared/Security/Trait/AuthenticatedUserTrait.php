<?php

declare(strict_types=1);

namespace App\Shared\Security\Trait;

use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\TokenManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Provides a reusable method for extracting and validating the authenticated user
 * from a Bearer token in controllers that inject TokenManager + EntityManager.
 *
 * Requires the consuming class to have:
 *   - $this->tokenManager: TokenManager
 *   - $this->em: EntityManagerInterface
 *   - $this->api: ApiResponseService
 */
trait AuthenticatedUserTrait
{
    private function getAuthenticatedUserOrFail(Request $request): User
    {
        $authHeader = $request->headers->get('Authorization', '');
        if (!str_starts_with((string) $authHeader, 'Bearer ')) {
            throw new AccessDeniedException('common.unauthorized');
        }

        $token = substr((string) $authHeader, 7);

        /** @var TokenManager $tokenManager */
        $tokenManager = $this->tokenManager;

        $baseUser = $tokenManager->getUserFromToken($token);
        if ($baseUser === null) {
            throw new AccessDeniedException('common.unauthorized');
        }

        /** @var EntityManagerInterface $em */
        $em = $this->em;

        $user = $em->getRepository(User::class)->find($baseUser->getId());
        if ($user === null) {
            throw new AccessDeniedException('common.unauthorized');
        }

        return $user;
    }
}
