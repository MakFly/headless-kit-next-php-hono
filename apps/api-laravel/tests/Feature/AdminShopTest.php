<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Shared\Models\Category;
use App\Shared\Models\Customer;
use App\Shared\Models\Order;
use App\Shared\Models\OrderItem;
use App\Shared\Models\Product;
use App\Shared\Models\Review;
use App\Shared\Models\Role;
use App\Shared\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminShopTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $regularUser;
    private Product $product;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin role
        $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin', 'description' => 'Administrator']);

        $this->admin = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('SecurePassword123!'),
        ]);
        $this->admin->assignRole('admin');

        $this->regularUser = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => bcrypt('SecurePassword123!'),
        ]);

        $this->category = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'sort_order' => 1,
        ]);

        $this->product = Product::create([
            'name' => 'Test Laptop',
            'slug' => 'test-laptop',
            'price' => 99900,
            'stock_quantity' => 10,
            'category_id' => $this->category->id,
            'status' => 'active',
        ]);
    }

    // =========================================================================
    // Access control
    // =========================================================================

    public function test_non_admin_cannot_access_admin_endpoints_returns_403(): void
    {
        $response = $this->actingAs($this->regularUser, 'betterauth')
            ->getJson('/api/v1/admin/products');

        $response->assertStatus(403);
    }

    // =========================================================================
    // Products CRUD
    // =========================================================================

    public function test_admin_can_list_products(): void
    {
        $response = $this->actingAs($this->admin, 'betterauth')
            ->getJson('/api/v1/admin/products');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'name', 'slug', 'price']]]);
    }

    public function test_admin_can_create_product(): void
    {
        $response = $this->actingAs($this->admin, 'betterauth')
            ->postJson('/api/v1/admin/products', [
                'name' => 'New Product',
                'slug' => 'new-product',
                'price' => 4999,
                'stock_quantity' => 20,
                'status' => 'active',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.slug', 'new-product');

        $this->assertDatabaseHas('products', ['slug' => 'new-product']);
    }

    public function test_admin_can_update_product(): void
    {
        $response = $this->actingAs($this->admin, 'betterauth')
            ->putJson("/api/v1/admin/products/{$this->product->id}", [
                'price' => 89900,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.price', 89900);

        $this->assertDatabaseHas('products', ['id' => $this->product->id, 'price' => 89900]);
    }

    public function test_admin_can_delete_product(): void
    {
        $response = $this->actingAs($this->admin, 'betterauth')
            ->deleteJson("/api/v1/admin/products/{$this->product->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('products', ['id' => $this->product->id]);
    }

    // =========================================================================
    // Orders
    // =========================================================================

    public function test_admin_can_list_all_orders(): void
    {
        // Create two orders from different users
        $user1 = User::create(['id' => (string) Str::uuid(), 'name' => 'U1', 'email' => 'u1@test.com', 'password' => bcrypt('pass')]);
        $user2 = User::create(['id' => (string) Str::uuid(), 'name' => 'U2', 'email' => 'u2@test.com', 'password' => bcrypt('pass')]);

        Order::create(['user_id' => $user1->id, 'status' => 'pending', 'total' => 9900, 'shipping_address' => ['street' => '1 rue test', 'city' => 'Paris', 'state' => 'IDF', 'zip' => '75001', 'country' => 'FR'], 'payment_status' => 'pending']);
        Order::create(['user_id' => $user2->id, 'status' => 'confirmed', 'total' => 4900, 'shipping_address' => ['street' => '2 rue test', 'city' => 'Lyon', 'state' => 'ARA', 'zip' => '69001', 'country' => 'FR'], 'payment_status' => 'paid']);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->getJson('/api/v1/admin/orders');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_admin_can_update_order_status(): void
    {
        $user = User::create(['id' => (string) Str::uuid(), 'name' => 'U', 'email' => 'u@test.com', 'password' => bcrypt('pass')]);
        $order = Order::create(['user_id' => $user->id, 'status' => 'pending', 'total' => 9900, 'shipping_address' => ['street' => '1 rue test', 'city' => 'Paris', 'state' => 'IDF', 'zip' => '75001', 'country' => 'FR'], 'payment_status' => 'pending']);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->patchJson("/api/v1/admin/orders/{$order->id}/status", [
                'status' => 'shipped',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'shipped']);
    }

    // =========================================================================
    // Dashboard
    // =========================================================================

    public function test_admin_dashboard_returns_aggregates(): void
    {
        $response = $this->actingAs($this->admin, 'betterauth')
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['monthlyRevenue', 'nbNewOrders', 'newCustomers', 'pendingOrders', 'pendingReviews'],
            ]);
    }

    // =========================================================================
    // Customers CRUD
    // =========================================================================

    public function test_admin_can_list_customers(): void
    {
        Customer::create(['first_name' => 'Test', 'last_name' => 'Customer', 'email' => 'test@example.com']);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->getJson('/api/v1/admin/customers');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'first_name', 'last_name', 'email']]]);
    }

    public function test_admin_can_create_customer(): void
    {
        $response = $this->actingAs($this->admin, 'betterauth')
            ->postJson('/api/v1/admin/customers', [
                'first_name' => 'Alice',
                'last_name' => 'Martin',
                'email' => 'alice.martin@example.com',
                'segment' => 'regular',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.email', 'alice.martin@example.com');
    }

    public function test_admin_can_update_customer(): void
    {
        $customer = Customer::create(['first_name' => 'Bob', 'last_name' => 'Test', 'email' => 'bob@example.com']);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->putJson("/api/v1/admin/customers/{$customer->id}", [
                'segment' => 'compulsive',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.segment', 'compulsive');
    }

    public function test_admin_can_delete_customer(): void
    {
        $customer = Customer::create(['first_name' => 'Bob', 'last_name' => 'Test', 'email' => 'bob@example.com']);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->deleteJson("/api/v1/admin/customers/{$customer->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }

    // =========================================================================
    // Reviews
    // =========================================================================

    public function test_admin_can_list_reviews_with_filters(): void
    {
        $customer = Customer::create(['first_name' => 'C', 'last_name' => 'T', 'email' => 'ct@example.com']);
        Review::create(['product_id' => $this->product->id, 'customer_id' => $customer->id, 'rating' => 5, 'status' => 'pending']);
        Review::create(['product_id' => $this->product->id, 'customer_id' => $customer->id, 'rating' => 3, 'status' => 'approved']);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->getJson('/api/v1/admin/reviews?status=pending');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('pending', $response->json('data.0.status'));
    }

    public function test_admin_can_bulk_approve_reviews(): void
    {
        $customer = Customer::create(['first_name' => 'C', 'last_name' => 'T', 'email' => 'ct2@example.com']);
        $r1 = Review::create(['product_id' => $this->product->id, 'customer_id' => $customer->id, 'rating' => 4, 'status' => 'pending']);
        $r2 = Review::create(['product_id' => $this->product->id, 'customer_id' => $customer->id, 'rating' => 5, 'status' => 'pending']);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->postJson('/api/v1/admin/reviews/bulk-approve', [
                'ids' => [$r1->id, $r2->id],
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.count', 2);

        $this->assertDatabaseHas('reviews', ['id' => $r1->id, 'status' => 'approved']);
        $this->assertDatabaseHas('reviews', ['id' => $r2->id, 'status' => 'approved']);
    }

    public function test_admin_can_bulk_reject_reviews(): void
    {
        $customer = Customer::create(['first_name' => 'C', 'last_name' => 'T', 'email' => 'ct3@example.com']);
        $r1 = Review::create(['product_id' => $this->product->id, 'customer_id' => $customer->id, 'rating' => 1, 'status' => 'pending']);
        $r2 = Review::create(['product_id' => $this->product->id, 'customer_id' => $customer->id, 'rating' => 2, 'status' => 'pending']);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->postJson('/api/v1/admin/reviews/bulk-reject', [
                'ids' => [$r1->id, $r2->id],
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.count', 2);

        $this->assertDatabaseHas('reviews', ['id' => $r1->id, 'status' => 'rejected']);
    }

    // =========================================================================
    // Inventory
    // =========================================================================

    public function test_admin_can_update_inventory(): void
    {
        $response = $this->actingAs($this->admin, 'betterauth')
            ->patchJson("/api/v1/admin/inventory/{$this->product->id}", [
                'stock_quantity' => 50,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.stockQuantity', 50);

        $this->assertDatabaseHas('products', ['id' => $this->product->id, 'stock_quantity' => 50]);
    }
}
