<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\Product;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/products/{id}', name: 'api_v1_admin_shop_products_delete', methods: ['DELETE'])]
#[IsGranted('ROLE_CHECK_admin')]
class DeleteProductController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $id): JsonResponse
    {
        $product = $this->em->getRepository(Product::class)->find($id);
        if ($product === null) {
            return $this->api->error('NOT_FOUND', 'shop.product_not_found', 404);
        }

        $this->em->remove($product);
        $this->em->flush();

        return $this->api->success(['message' => 'shop.product_deleted']);
    }
}
