<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Feature\Shop\Repository\ProductRepository;
use App\Shared\Entity\Category;
use App\Shared\Entity\Product;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/products/{id}', name: 'api_v1_admin_shop_products_update', methods: ['PUT'])]
#[IsGranted('ROLE_CHECK_admin')]
class UpdateProductController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ProductRepository $productRepository,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $product = $this->em->getRepository(Product::class)->find($id);
        if ($product === null) {
            return $this->api->error('NOT_FOUND', 'shop.product_not_found', 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (isset($data['name'])) {
            $product->setName($data['name']);
        }
        if (isset($data['slug'])) {
            $existing = $this->productRepository->findOneBy(['slug' => $data['slug']]);
            if ($existing !== null && $existing->getId() !== $id) {
                return $this->api->error('CONFLICT', 'shop.product_slug_in_use', 409);
            }
            $product->setSlug($data['slug']);
        }
        if (isset($data['description'])) {
            $product->setDescription($data['description']);
        }
        if (isset($data['price'])) {
            $product->setPrice((int) $data['price']);
        }
        if (array_key_exists('compareAtPrice', $data)) {
            $product->setCompareAtPrice($data['compareAtPrice'] !== null ? (int) $data['compareAtPrice'] : null);
        }
        if (isset($data['sku'])) {
            $product->setSku($data['sku']);
        }
        if (isset($data['stockQuantity'])) {
            $product->setStockQuantity((int) $data['stockQuantity']);
        }
        if (isset($data['imageUrl'])) {
            $product->setImageUrl($data['imageUrl']);
        }
        if (isset($data['images'])) {
            $product->setImages($data['images']);
        }
        if (isset($data['status'])) {
            $product->setStatus($data['status']);
        }
        if (isset($data['featured'])) {
            $product->setFeatured((bool) $data['featured']);
        }
        if (array_key_exists('categoryId', $data)) {
            if ($data['categoryId'] === null) {
                $product->setCategory(null);
            } else {
                $category = $this->em->getRepository(Category::class)->find($data['categoryId']);
                if ($category !== null) {
                    $product->setCategory($category);
                }
            }
        }

        $this->em->flush();

        return $this->api->success($product->toArray());
    }
}
