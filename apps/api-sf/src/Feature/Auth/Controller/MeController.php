<?php

declare(strict_types=1);

namespace App\Feature\Auth\Controller;

use App\Shared\Entity\Permission;
use App\Shared\Entity\Role;
use App\Shared\Entity\User as DoctrineUser;
use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\TokenManager;
use BetterAuth\Symfony\Controller\Trait\AuthResponseTrait;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/auth/me', name: 'api_v1_auth_me', methods: ['GET'])]
class MeController extends AbstractController
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

            $payload = $this->tokenManager->parse($token);
            if (!$payload) {
                return $this->api->error('UNAUTHORIZED', 'auth.invalid_token', 401);
            }

            $user = $this->tokenManager->getUserFromToken($token);
            if (!$user) {
                return $this->api->error('UNAUTHORIZED', 'auth.invalid_token', 401);
            }

            $response = ['user' => $this->formatUser($user)];

            // Enrich with RBAC data from the Doctrine entity
            $doctrineUser = $this->em->getRepository(DoctrineUser::class)->find($user->getId());
            if ($doctrineUser !== null) {
                $response['user']['roles'] = $doctrineUser->getUserRoles()->map(
                    fn (Role $role) => $role->toArray()
                )->toArray();

                $response['user']['permissions'] = array_map(
                    fn (Permission $p) => $p->toArray(),
                    $doctrineUser->getAllPermissions()
                );
            }

            $response['expiresAt'] = (new DateTimeImmutable('@'.$payload['exp']))->format(DateTimeInterface::ATOM);

            return $this->api->success($response);
        } catch (Exception $e) {
            return $this->api->error('UNAUTHORIZED', 'auth.invalid_token', 401);
        }
    }
}
