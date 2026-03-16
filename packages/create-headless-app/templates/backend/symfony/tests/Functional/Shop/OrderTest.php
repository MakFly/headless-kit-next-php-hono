<?php

declare(strict_types=1);

namespace App\Tests\Functional\Shop;

use App\Entity\Category;
use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class OrderTest extends WebTestCase
{
    private const SHIPPING_ADDRESS = [
        'street' => '123 Main St',
        'city' => 'Springfield',
        'state' => 'IL',
        'zip' => '62701',
        'country' => 'US',
    ];

    private ?KernelBrowser $client = null;
    private ?EntityManagerInterface $em = null;
    private string $accessToken = '';
    private string $otherAccessToken = '';
    private string $productId = '';

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = static::createClient();
        $this->em = $this->client->getContainer()->get('doctrine')->getManager();
        $this->cleanDatabase();
        $this->seedProducts();
        $this->registerUsers();
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->client = null;
        $this->em = null;
    }

    private function cleanDatabase(): void
    {
        $connection = $this->em->getConnection();
        $connection->executeStatement('DELETE FROM order_items');
        $connection->executeStatement('DELETE FROM orders');
        $connection->executeStatement('DELETE FROM cart_items');
        $connection->executeStatement('DELETE FROM carts');
        $connection->executeStatement('DELETE FROM products');
        $connection->executeStatement('DELETE FROM categories');
        $connection->executeStatement('DELETE FROM refresh_tokens');
        $connection->executeStatement('DELETE FROM sessions');
        $connection->executeStatement('DELETE FROM users');
        $this->client->getContainer()->get('cache.app')->clear();
    }

    private function seedProducts(): void
    {
        $category = new Category();
        $category->setName('Electronics');
        $category->setSlug('electronics');
        $category->setSortOrder(1);
        $this->em->persist($category);

        $product = new Product();
        $product->setName('Test Headphones');
        $product->setSlug('test-headphones');
        $product->setPrice(4999);
        $product->setStockQuantity(10);
        $product->setCategory($category);
        $this->em->persist($product);

        $this->em->flush();

        $this->productId = $product->getId();
    }

    private function registerUsers(): void
    {
        $this->client->request('POST', '/api/v1/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'orderuser@example.com',
            'password' => 'SecurePass123!',
            'name' => 'Order User',
        ]));
        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->accessToken = $envelope['data']['access_token'] ?? '';

        $this->client->request('POST', '/api/v1/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'otherorderuser@example.com',
            'password' => 'SecurePass123!',
            'name' => 'Other Order User',
        ]));
        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->otherAccessToken = $envelope['data']['access_token'] ?? '';
    }

    private function authHeaders(string $token = ''): array
    {
        return [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . ($token ?: $this->accessToken),
        ];
    }

    private function addItemToCart(): void
    {
        $this->client->request('POST', '/api/v1/cart/items', [], [], $this->authHeaders(), json_encode([
            'productId' => $this->productId,
            'quantity' => 2,
        ]));
    }

    // ==================== AUTH TESTS ====================

    public function testOrdersRequireAuth(): void
    {
        $this->client->request('GET', '/api/v1/orders');

        $this->assertContains(
            $this->client->getResponse()->getStatusCode(),
            [Response::HTTP_UNAUTHORIZED, Response::HTTP_FORBIDDEN]
        );
    }

    // ==================== CREATE ORDER ====================

    public function testCreateOrderFromCart(): void
    {
        $this->addItemToCart();

        $this->client->request('POST', '/api/v1/orders', [], [], $this->authHeaders(), json_encode([
            'shippingAddress' => self::SHIPPING_ADDRESS,
        ]));

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_CREATED, $response->getStatusCode());

        $envelope = json_decode($response->getContent(), true);
        $this->assertTrue($envelope['success']);
        $order = $envelope['data'];
        $this->assertArrayHasKey('id', $order);
        $this->assertSame('confirmed', $order['status']);
        $this->assertSame('pending', $order['paymentStatus']);
        $this->assertSame(4999 * 2, $order['total']);
        $this->assertCount(1, $order['items']);
        $this->assertSame('Test Headphones', $order['items'][0]['productName']);
        $this->assertSame(4999, $order['items'][0]['productPrice']);
        $this->assertSame(2, $order['items'][0]['quantity']);
        $this->assertSame(4999 * 2, $order['items'][0]['subtotal']);
    }

    public function testCreateOrderEmptyCart(): void
    {
        $this->client->request('POST', '/api/v1/orders', [], [], $this->authHeaders(), json_encode([
            'shippingAddress' => self::SHIPPING_ADDRESS,
        ]));

        $this->assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $this->client->getResponse()->getStatusCode());
    }

    public function testCreateOrderRequiresShippingAddress(): void
    {
        $this->addItemToCart();

        $this->client->request('POST', '/api/v1/orders', [], [], $this->authHeaders(), json_encode([]));

        $this->assertSame(Response::HTTP_BAD_REQUEST, $this->client->getResponse()->getStatusCode());
    }

    public function testCreateOrderDecrementsStock(): void
    {
        $this->addItemToCart();

        $this->client->request('POST', '/api/v1/orders', [], [], $this->authHeaders(), json_encode([
            'shippingAddress' => self::SHIPPING_ADDRESS,
        ]));

        $this->assertSame(Response::HTTP_CREATED, $this->client->getResponse()->getStatusCode());

        // Verify stock decremented
        $this->em->clear();
        $product = $this->em->getRepository(Product::class)->find($this->productId);
        $this->assertSame(8, $product->getStockQuantity(), 'Stock should be decremented by 2');
    }

    public function testCreateOrderClearsCart(): void
    {
        $this->addItemToCart();

        $this->client->request('POST', '/api/v1/orders', [], [], $this->authHeaders(), json_encode([
            'shippingAddress' => self::SHIPPING_ADDRESS,
        ]));

        // Cart should be empty now
        $this->client->request('GET', '/api/v1/cart', [], [], $this->authHeaders());
        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertCount(0, $envelope['data']['items']);
    }

    // ==================== LIST ORDERS ====================

    public function testListOrders(): void
    {
        $this->addItemToCart();
        $this->client->request('POST', '/api/v1/orders', [], [], $this->authHeaders(), json_encode([
            'shippingAddress' => self::SHIPPING_ADDRESS,
        ]));

        $this->client->request('GET', '/api/v1/orders', [], [], $this->authHeaders());

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());

        $envelope = json_decode($response->getContent(), true);
        $orders = $envelope['data'];
        $this->assertCount(1, $orders);
        $this->assertSame('confirmed', $orders[0]['status']);
    }

    public function testListOrdersEmpty(): void
    {
        $this->client->request('GET', '/api/v1/orders', [], [], $this->authHeaders());

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertCount(0, $envelope['data']);
    }

    // ==================== ORDER DETAIL ====================

    public function testOrderDetail(): void
    {
        $this->addItemToCart();
        $this->client->request('POST', '/api/v1/orders', [], [], $this->authHeaders(), json_encode([
            'shippingAddress' => self::SHIPPING_ADDRESS,
        ]));
        $createEnvelope = json_decode($this->client->getResponse()->getContent(), true);
        $order = $createEnvelope['data'];

        $this->client->request('GET', '/api/v1/orders/' . $order['id'], [], [], $this->authHeaders());

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());

        $envelope = json_decode($response->getContent(), true);
        $fetchedOrder = $envelope['data'];
        $this->assertSame($order['id'], $fetchedOrder['id']);
        $this->assertArrayHasKey('items', $fetchedOrder);
        $this->assertArrayHasKey('shippingAddress', $fetchedOrder);
    }

    public function testOrderDetailNotFound(): void
    {
        $this->client->request('GET', '/api/v1/orders/non-existent-id', [], [], $this->authHeaders());

        $this->assertSame(Response::HTTP_NOT_FOUND, $this->client->getResponse()->getStatusCode());
    }

    // ==================== ISOLATION ====================

    public function testOtherUserCannotSeeMyOrders(): void
    {
        $this->addItemToCart();
        $this->client->request('POST', '/api/v1/orders', [], [], $this->authHeaders(), json_encode([
            'shippingAddress' => self::SHIPPING_ADDRESS,
        ]));
        $createEnvelope = json_decode($this->client->getResponse()->getContent(), true);
        $order = $createEnvelope['data'];

        // Other user tries to access
        $this->client->request('GET', '/api/v1/orders/' . $order['id'], [], [], $this->authHeaders($this->otherAccessToken));

        $this->assertSame(Response::HTTP_NOT_FOUND, $this->client->getResponse()->getStatusCode());
    }

    public function testOtherUserListShowsOnlyTheirOrders(): void
    {
        $this->addItemToCart();
        $this->client->request('POST', '/api/v1/orders', [], [], $this->authHeaders(), json_encode([
            'shippingAddress' => self::SHIPPING_ADDRESS,
        ]));

        // Other user's list should be empty
        $this->client->request('GET', '/api/v1/orders', [], [], $this->authHeaders($this->otherAccessToken));

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertCount(0, $envelope['data']);
    }
}
