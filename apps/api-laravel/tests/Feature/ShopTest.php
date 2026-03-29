<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Shared\Models\Category;
use App\Shared\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShopTest extends TestCase
{
    use RefreshDatabase;

    private Category $electronics;

    private Category $clothing;

    protected function setUp(): void
    {
        parent::setUp();

        $this->electronics = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Electronic devices',
            'sort_order' => 1,
        ]);

        $this->clothing = Category::create([
            'name' => 'Clothing',
            'slug' => 'clothing',
            'description' => 'Fashion apparel',
            'sort_order' => 2,
        ]);

        Product::create([
            'name' => 'Laptop Pro',
            'slug' => 'laptop-pro',
            'description' => 'A powerful laptop',
            'price' => 150000,
            'stock_quantity' => 10,
            'category_id' => $this->electronics->id,
            'status' => 'active',
            'featured' => true,
        ]);

        Product::create([
            'name' => 'Wireless Mouse',
            'slug' => 'wireless-mouse',
            'description' => 'Ergonomic wireless mouse',
            'price' => 2999,
            'stock_quantity' => 50,
            'category_id' => $this->electronics->id,
            'status' => 'active',
            'featured' => false,
        ]);

        Product::create([
            'name' => 'Cotton T-Shirt',
            'slug' => 'cotton-t-shirt',
            'description' => 'Comfortable cotton shirt',
            'price' => 1999,
            'stock_quantity' => 100,
            'category_id' => $this->clothing->id,
            'status' => 'active',
            'featured' => false,
        ]);
    }

    public function test_get_products_returns_paginated_list(): void
    {
        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'price'],
                ],
                'pagination' => ['page', 'perPage', 'total', 'totalPages'],
            ]);

        $this->assertEquals(3, $response->json('pagination.total'));
    }

    public function test_get_products_filters_by_category_slug(): void
    {
        $response = $this->getJson('/api/v1/products?category=electronics');

        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('pagination.total'));

        foreach ($response->json('data') as $product) {
            $this->assertEquals($this->electronics->id, $product['category_id']);
        }
    }

    public function test_get_products_searches_by_name(): void
    {
        $response = $this->getJson('/api/v1/products?search=laptop');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('pagination.total'));
        $this->assertEquals('laptop-pro', $response->json('data.0.slug'));
    }

    public function test_get_products_sorted_by_price_asc(): void
    {
        $response = $this->getJson('/api/v1/products?sort=price_asc');

        $response->assertStatus(200);
        $prices = array_column($response->json('data'), 'price');
        $this->assertEquals([1999, 2999, 150000], $prices);
    }

    public function test_get_products_sorted_by_price_desc(): void
    {
        $response = $this->getJson('/api/v1/products?sort=price_desc');

        $response->assertStatus(200);
        $prices = array_column($response->json('data'), 'price');
        $this->assertEquals([150000, 2999, 1999], $prices);
    }

    public function test_get_products_filters_by_price_range(): void
    {
        $response = $this->getJson('/api/v1/products?min_price=1000&max_price=5000');

        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('pagination.total'));

        foreach ($response->json('data') as $product) {
            $this->assertGreaterThanOrEqual(1000, $product['price']);
            $this->assertLessThanOrEqual(5000, $product['price']);
        }
    }

    public function test_get_product_by_slug_returns_detail_with_category(): void
    {
        $response = $this->getJson('/api/v1/products/laptop-pro');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'slug', 'price', 'category'],
            ]);

        $this->assertEquals('laptop-pro', $response->json('data.slug'));
        $this->assertEquals('electronics', $response->json('data.category.slug'));
    }

    public function test_get_product_by_nonexistent_slug_returns_404(): void
    {
        $response = $this->getJson('/api/v1/products/nonexistent');

        $response->assertStatus(404);
    }

    public function test_get_categories_returns_list_with_product_count(): void
    {
        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'productCount'],
                ],
            ]);

        $data = $response->json('data');
        $electronicsData = collect($data)->firstWhere('slug', 'electronics');
        $this->assertEquals(2, $electronicsData['productCount']);

        $clothingData = collect($data)->firstWhere('slug', 'clothing');
        $this->assertEquals(1, $clothingData['productCount']);
    }

    public function test_get_category_by_slug_returns_category_with_products(): void
    {
        $response = $this->getJson('/api/v1/categories/electronics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'slug', 'products'],
            ]);

        $this->assertEquals('electronics', $response->json('data.slug'));
        $this->assertCount(2, $response->json('data.products'));
    }

    public function test_get_category_by_nonexistent_slug_returns_404(): void
    {
        $response = $this->getJson('/api/v1/categories/nonexistent');

        $response->assertStatus(404);
    }
}
