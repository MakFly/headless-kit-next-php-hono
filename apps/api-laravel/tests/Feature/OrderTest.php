<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Shared\Models\Category;
use App\Shared\Models\Order;
use App\Shared\Models\Product;
use App\Shared\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $otherUser;

    private Product $product;

    private array $shippingAddress = [
        'street' => '123 Main St',
        'city' => 'Paris',
        'state' => 'Île-de-France',
        'zip' => '75001',
        'country' => 'France',
    ];

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Test User',
            'email' => 'user@example.com',
            'password' => bcrypt('SecurePassword123!'),
        ]);

        $this->otherUser = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Other User',
            'email' => 'other@example.com',
            'password' => bcrypt('SecurePassword123!'),
        ]);

        $category = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'sort_order' => 1,
        ]);

        $this->product = Product::create([
            'name' => 'Test Laptop',
            'slug' => 'test-laptop',
            'price' => 99900,
            'stock_quantity' => 10,
            'category_id' => $category->id,
            'status' => 'active',
        ]);
    }

    private function addProductToCart(User $user, int $quantity = 1): void
    {
        $this->actingAs($user, 'betterauth')->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => $quantity,
        ]);
    }

    public function test_create_order_with_empty_cart_returns_422(): void
    {
        $response = $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/orders', [
            'shipping_address' => $this->shippingAddress,
        ]);

        $response->assertStatus(422);
    }

    public function test_create_order_with_valid_cart_returns_201(): void
    {
        $this->addProductToCart($this->user, 2);

        $response = $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/orders', [
            'shipping_address' => $this->shippingAddress,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id', 'status', 'total', 'paymentStatus',
                    'shippingAddress', 'items', 'createdAt',
                ],
            ]);

        $this->assertEquals('pending', $response->json('data.status'));
        $this->assertEquals('pending', $response->json('data.paymentStatus'));
        $this->assertEquals(99900 * 2, $response->json('data.total'));
        $this->assertCount(1, $response->json('data.items'));
        $this->assertEquals('Test Laptop', $response->json('data.items.0.productName'));
    }

    public function test_create_order_decrements_stock(): void
    {
        $initialStock = $this->product->stock_quantity;
        $this->addProductToCart($this->user, 3);

        $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/orders', [
            'shipping_address' => $this->shippingAddress,
        ]);

        $this->product->refresh();
        $this->assertEquals($initialStock - 3, $this->product->stock_quantity);
    }

    public function test_create_order_empties_cart(): void
    {
        $this->addProductToCart($this->user, 1);

        $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/orders', [
            'shipping_address' => $this->shippingAddress,
        ]);

        $cartResponse = $this->actingAs($this->user, 'betterauth')->getJson('/api/v1/cart');
        $this->assertEmpty($cartResponse->json('data.items'));
    }

    public function test_get_orders_returns_user_orders_only(): void
    {
        $this->addProductToCart($this->user, 1);
        $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/orders', [
            'shipping_address' => $this->shippingAddress,
        ]);

        $this->addProductToCart($this->otherUser, 1);
        $this->actingAs($this->otherUser, 'betterauth')->postJson('/api/v1/orders', [
            'shipping_address' => $this->shippingAddress,
        ]);

        $response = $this->actingAs($this->user, 'betterauth')->getJson('/api/v1/orders');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));

        foreach ($response->json('data') as $order) {
            $dbOrder = Order::find($order['id']);
            $this->assertEquals($this->user->id, $dbOrder->user_id);
        }
    }

    public function test_get_order_by_id_returns_200(): void
    {
        $this->addProductToCart($this->user, 1);
        $createResponse = $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/orders', [
            'shipping_address' => $this->shippingAddress,
        ]);

        $orderId = $createResponse->json('data.id');

        $response = $this->actingAs($this->user, 'betterauth')->getJson("/api/v1/orders/{$orderId}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['id', 'status', 'total', 'items'],
            ]);

        $this->assertEquals($orderId, $response->json('data.id'));
    }

    public function test_get_other_users_order_returns_403(): void
    {
        $this->addProductToCart($this->user, 1);
        $createResponse = $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/orders', [
            'shipping_address' => $this->shippingAddress,
        ]);

        $orderId = $createResponse->json('data.id');

        $response = $this->actingAs($this->otherUser, 'betterauth')->getJson("/api/v1/orders/{$orderId}");

        $response->assertStatus(403);
    }
}
