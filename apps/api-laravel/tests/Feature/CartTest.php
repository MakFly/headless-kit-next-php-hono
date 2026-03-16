<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Shared\Models\Category;
use App\Shared\Models\Product;
use App\Shared\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private Product $product;

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

    public function test_get_cart_without_auth_returns_401(): void
    {
        $response = $this->getJson('/api/v1/cart');

        $response->assertStatus(401);
    }

    public function test_get_cart_with_auth_creates_empty_cart(): void
    {
        $response = $this->actingAs($this->user, 'betterauth')->getJson('/api/v1/cart');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['id', 'items', 'total'],
            ]);

        $this->assertEmpty($response->json('data.items'));
        $this->assertEquals(0, $response->json('data.total'));
    }

    public function test_add_item_to_cart_returns_201(): void
    {
        $response = $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'items', 'total'],
            ]);

        $this->assertCount(1, $response->json('data.items'));
        $this->assertEquals(2, $response->json('data.items.0.quantity'));
        $this->assertEquals(99900 * 2, $response->json('data.total'));
    }

    public function test_add_item_with_invalid_product_returns_404(): void
    {
        $response = $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/cart/items', [
            'product_id' => '00000000-0000-0000-0000-000000000000',
            'quantity' => 1,
        ]);

        $response->assertStatus(404);
    }

    public function test_add_item_with_quantity_exceeding_stock_returns_422(): void
    {
        $response = $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 999,
        ]);

        $response->assertStatus(422);
    }

    public function test_adding_same_product_increments_quantity(): void
    {
        $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 3,
        ]);

        $response->assertStatus(201);
        $this->assertCount(1, $response->json('data.items'));
        $this->assertEquals(5, $response->json('data.items.0.quantity'));
    }

    public function test_update_cart_item_quantity(): void
    {
        $addResponse = $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $itemId = $addResponse->json('data.items.0.id');

        $response = $this->actingAs($this->user, 'betterauth')->patchJson("/api/v1/cart/items/{$itemId}", [
            'quantity' => 5,
        ]);

        $response->assertStatus(200);
        $this->assertEquals(5, $response->json('data.items.0.quantity'));
    }

    public function test_remove_cart_item(): void
    {
        $addResponse = $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        $itemId = $addResponse->json('data.items.0.id');

        $response = $this->actingAs($this->user, 'betterauth')->deleteJson("/api/v1/cart/items/{$itemId}");

        $response->assertStatus(200);
        $this->assertEmpty($response->json('data.items'));
    }

    public function test_cannot_modify_other_users_cart_item_returns_403(): void
    {
        $addResponse = $this->actingAs($this->user, 'betterauth')->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        $itemId = $addResponse->json('data.items.0.id');

        $response = $this->actingAs($this->otherUser, 'betterauth')->deleteJson("/api/v1/cart/items/{$itemId}");

        $response->assertStatus(403);
    }
}
