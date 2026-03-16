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

#[Route('/api/v1/admin/products', name: 'api_v1_admin_shop_products_create', methods: ['POST'])]
#[IsGranted('ROLE_CHECK_admin')]
class CreateProductController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ProductRepository $productRepository,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $name = $data['name'] ?? null;
        $slug = $data['slug'] ?? null;
        $price = $data['price'] ?? null;

        if (!$name || !$slug || $price === null) {
            return $this->api->error('VALIDATION_ERROR', 'shop.product_name_slug_price_required', 400);
        }

        $existing = $this->productRepository->findOneBy(['slug' => $slug]);
        if ($existing !== null) {
            return $this->api->error('CONFLICT', 'shop.product_slug_exists', 409);
        }

        $product = new Product();
        $product->setName($name);
        $product->setSlug($slug);
        $product->setPrice((int) $price);
        $product->setDescription($data['description'] ?? null);
        $product->setCompareAtPrice(isset($data['compareAtPrice']) ? (int) $data['compareAtPrice'] : null);
        $product->setSku($data['sku'] ?? null);
        $product->setStockQuantity((int) ($data['stockQuantity'] ?? 0));
        $product->setImageUrl($data['imageUrl'] ?? null);
        $product->setImages($data['images'] ?? []);
        $product->setStatus($data['status'] ?? 'draft');
        $product->setFeatured((bool) ($data['featured'] ?? false));

        if (!empty($data['categoryId'])) {
            $category = $this->em->getRepository(Category::class)->find($data['categoryId']);
            if ($category !== null) {
                $product->setCategory($category);
            }
        }

        $this->em->persist($product);
        $this->em->flush();

        return $this->api->success($product->toArray(), 201);
    }
}
