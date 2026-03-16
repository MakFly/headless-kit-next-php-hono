<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/customers/{id}', name: 'api_v1_admin_shop_customers_delete', methods: ['DELETE'])]
#[IsGranted('ROLE_CHECK_admin')]
class DeleteCustomerController extends AbstractController
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
            return $this->api->error('NOT_FOUND', 'admin.customer_not_found', 404);
        }

        $this->em->remove($user);
        $this->em->flush();

        return $this->api->success(['message' => 'admin.customer_deleted']);
    }
}
