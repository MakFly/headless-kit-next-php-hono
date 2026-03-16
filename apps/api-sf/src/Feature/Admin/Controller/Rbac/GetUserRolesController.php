<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Rbac;

use App\Shared\Entity\Role;
use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/users/{id}/roles', name: 'api_v1_admin_user_roles_get', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class GetUserRolesController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $id): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);

        if ($user === null) {
            return $this->api->error('NOT_FOUND', 'admin.user_not_found', 404);
        }

        $roles = $user->getUserRoles()->map(
            fn (Role $role) => $role->toArrayWithPermissions()
        )->toArray();

        return $this->api->success($roles);
    }
}
