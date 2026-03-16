<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Rbac;

use App\Shared\Entity\Permission;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/permissions', name: 'api_v1_admin_permissions_list', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class ListPermissionsController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        $permissions = $this->em->getRepository(Permission::class)->findAll();

        $data = array_map(
            fn (Permission $p) => $p->toArray(),
            $permissions
        );

        return $this->api->success($data);
    }
}
