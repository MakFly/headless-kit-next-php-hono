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

#[Route('/api/v1/admin/users/{id}/roles/{roleSlug}', name: 'api_v1_admin_user_roles_remove', methods: ['DELETE'])]
#[IsGranted('ROLE_CHECK_admin')]
class RemoveRoleController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $id, string $roleSlug): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);

        if ($user === null) {
            return $this->api->error('NOT_FOUND', 'admin.user_not_found', 404);
        }

        if (!$user->hasRole($roleSlug)) {
            return $this->api->error('NOT_FOUND', 'admin.user_does_not_have_role', 404);
        }

        $role = $this->em->getRepository(Role::class)->findOneBy(['slug' => $roleSlug]);

        if ($role === null) {
            return $this->api->error('NOT_FOUND', 'admin.role_not_found', 404);
        }

        $user->removeRole($role);
        $this->em->flush();

        return $this->api->success(
            $user->getUserRoles()->map(fn (Role $r) => $r->toArrayWithPermissions())->toArray()
        );
    }
}
