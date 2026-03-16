<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\Product;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/inventory/{productId}', name: 'api_v1_admin_shop_inventory_update', methods: ['PATCH'])]
#[IsGranted('ROLE_CHECK_admin')]
class UpdateInventoryController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request, string $productId): JsonResponse
    {
        $product = $this->em->getRepository(Product::class)->find($productId);
        if ($product === null) {
            return $this->api->error('NOT_FOUND', 'shop.product_not_found', 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (!isset($data['stockQuantity'])) {
            return $this->api->error('VALIDATION_ERROR', 'shop.inventory_stock_quantity_required', 400);
        }

        $product->setStockQuantity((int) $data['stockQuantity']);
        $this->em->flush();

        return $this->api->success([
            'id' => $product->getId(),
            'name' => $product->getName(),
            'stockQuantity' => $product->getStockQuantity(),
        ]);
    }
}
