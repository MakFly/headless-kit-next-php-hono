<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Rbac;

use App\Shared\Entity\Role;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/roles', name: 'api_v1_admin_roles_list', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class ListRolesController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        $roles = $this->em->getRepository(Role::class)->findAll();

        $data = array_map(
            fn (Role $role) => $role->toArrayWithPermissions(),
            $roles
        );

        return $this->api->success($data);
    }
}
