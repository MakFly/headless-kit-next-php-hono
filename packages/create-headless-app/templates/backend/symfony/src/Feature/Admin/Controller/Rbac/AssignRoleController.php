<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Rbac;

use App\Shared\Entity\Role;
use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/users/{id}/roles', name: 'api_v1_admin_user_roles_assign', methods: ['POST'])]
#[IsGranted('ROLE_CHECK_admin')]
class AssignRoleController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $id, Request $request): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);

        if ($user === null) {
            return $this->api->error('NOT_FOUND', 'admin.user_not_found', 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $roleSlug = $data['role'] ?? null;

        if (!$roleSlug) {
            return $this->api->error('VALIDATION_ERROR', 'admin.role_slug_required', 400);
        }

        $role = $this->em->getRepository(Role::class)->findOneBy(['slug' => $roleSlug]);

        if ($role === null) {
            return $this->api->error('NOT_FOUND', 'admin.role_not_found', 404);
        }

        if ($user->hasRole($roleSlug)) {
            return $this->api->error('CONFLICT', 'admin.user_already_has_role', 409);
        }

        $user->assignRole($role);
        $this->em->flush();

        return $this->api->success(
            $user->getUserRoles()->map(fn (Role $r) => $r->toArrayWithPermissions())->toArray()
        );
    }
}
