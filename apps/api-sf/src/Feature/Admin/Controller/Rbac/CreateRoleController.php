<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Rbac;

use App\Shared\Entity\Permission;
use App\Shared\Entity\Role;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/roles', name: 'api_v1_admin_roles_create', methods: ['POST'])]
#[IsGranted('ROLE_CHECK_admin')]
class CreateRoleController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $name = $data['name'] ?? null;
        $slug = $data['slug'] ?? null;
        $description = $data['description'] ?? null;

        if (!$name || !$slug) {
            return $this->api->error('VALIDATION_ERROR', 'admin.role_name_slug_required', 400);
        }

        $existing = $this->em->getRepository(Role::class)->findOneBy(['slug' => $slug]);
        if ($existing !== null) {
            return $this->api->error('CONFLICT', 'admin.role_slug_exists', 409);
        }

        $role = new Role();
        $role->setName($name);
        $role->setSlug($slug);
        $role->setDescription($description);

        $permissionSlugs = $data['permissions'] ?? [];
        if (\is_array($permissionSlugs) && \count($permissionSlugs) > 0) {
            $permRepo = $this->em->getRepository(Permission::class);
            foreach ($permissionSlugs as $permSlug) {
                $permission = $permRepo->findOneBy(['slug' => $permSlug]);
                if ($permission !== null) {
                    $role->addPermission($permission);
                }
            }
        }

        $this->em->persist($role);
        $this->em->flush();

        return $this->api->success($role->toArrayWithPermissions(), 201);
    }
}
