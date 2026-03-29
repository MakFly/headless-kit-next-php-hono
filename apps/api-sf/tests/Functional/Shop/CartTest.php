<?php

declare(strict_types=1);

namespace App\Tests\Functional\Shop;

use App\Shared\Entity\Category;
use App\Shared\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class CartTest extends WebTestCase
{
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

        $product2 = new Product();
        $product2->setName('Test Keyboard');
        $product2->setSlug('test-keyboard');
        $product2->setPrice(12999);
        $product2->setStockQuantity(5);
        $product2->setCategory($category);
        $this->em->persist($product2);

        $draft = new Product();
        $draft->setName('Draft Product');
        $draft->setSlug('draft-product');
        $draft->setPrice(999);
        $draft->setStatus('draft');
        $draft->setStockQuantity(50);
        $this->em->persist($draft);

        $this->em->flush();

        $this->productId = $product->getId();
    }

    private function registerUsers(): void
    {
        // Register first user
        $this->client->request('POST', '/api/v1/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'cartuser@example.com',
            'password' => 'SecurePass123!',
            'name' => 'Cart User',
        ]));
        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->accessToken = $envelope['data']['access_token'] ?? '';

        // Register second user
        $this->client->request('POST', '/api/v1/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'otheruser@example.com',
            'password' => 'SecurePass123!',
            'name' => 'Other User',
        ]));
        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->otherAccessToken = $envelope['data']['access_token'] ?? '';
    }

    private function authHeaders(string $token = ''): array
    {
        return [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.($token ?: $this->accessToken),
        ];
    }

    // ==================== AUTH TESTS ====================

    public function testCartRequiresAuth(): void
    {
        $this->client->request('GET', '/api/v1/cart');

        $this->assertContains(
            $this->client->getResponse()->getStatusCode(),
            [Response::HTTP_UNAUTHORIZED, Response::HTTP_FORBIDDEN]
        );
    }

    // ==================== GET CART ====================

    public function testGetCartCreatesIfEmpty(): void
    {
        $this->client->request('GET', '/api/v1/cart', [], [], $this->authHeaders());

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());

        $envelope = json_decode($response->getContent(), true);
        $this->assertTrue($envelope['success']);
        $cart = $envelope['data'];
        $this->assertArrayHasKey('id', $cart);
        $this->assertArrayHasKey('items', $cart);
        $this->assertArrayHasKey('total', $cart);
        $this->assertCount(0, $cart['items']);
        $this->assertSame(0, $cart['total']);
    }

    // ==================== ADD ITEM ====================

    public function testAddItemToCart(): void
    {
        $this->client->request('POST', '/api/v1/cart/items', [], [], $this->authHeaders(), json_encode([
            'productId' => $this->productId,
            'quantity' => 2,
        ]));

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_CREATED, $response->getStatusCode());

        $envelope = json_decode($response->getContent(), true);
        $cart = $envelope['data'];
        $this->assertCount(1, $cart['items']);
        $this->assertSame(2, $cart['items'][0]['quantity']);
        $this->assertSame(4999 * 2, $cart['total']);
    }

    public function testAddItemRequiresProductId(): void
    {
        $this->client->request('POST', '/api/v1/cart/items', [], [], $this->authHeaders(), json_encode([
            'quantity' => 1,
        ]));

        $this->assertSame(Response::HTTP_BAD_REQUEST, $this->client->getResponse()->getStatusCode());
    }

    public function testAddItemInvalidProduct(): void
    {
        $this->client->request('POST', '/api/v1/cart/items', [], [], $this->authHeaders(), json_encode([
            'productId' => 'non-existent-id',
            'quantity' => 1,
        ]));

        $this->assertSame(Response::HTTP_NOT_FOUND, $this->client->getResponse()->getStatusCode());
    }

    public function testAddDraftProductFails(): void
    {
        $draft = $this->em->getRepository(Product::class)->findOneBy(['slug' => 'draft-product']);

        $this->client->request('POST', '/api/v1/cart/items', [], [], $this->authHeaders(), json_encode([
            'productId' => $draft->getId(),
            'quantity' => 1,
        ]));

        $this->assertSame(Response::HTTP_NOT_FOUND, $this->client->getResponse()->getStatusCode());
    }

    public function testAddItemIncrementsExisting(): void
    {
        // Add 2
        $this->client->request('POST', '/api/v1/cart/items', [], [], $this->authHeaders(), json_encode([
            'productId' => $this->productId,
            'quantity' => 2,
        ]));

        // Add 3 more
        $this->client->request('POST', '/api/v1/cart/items', [], [], $this->authHeaders(), json_encode([
            'productId' => $this->productId,
            'quantity' => 3,
        ]));

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $cart = $envelope['data'];
        $this->assertCount(1, $cart['items']);
        $this->assertSame(5, $cart['items'][0]['quantity']);
    }

    public function testAddItemInsufficientStock(): void
    {
        $this->client->request('POST', '/api/v1/cart/items', [], [], $this->authHeaders(), json_encode([
            'productId' => $this->productId,
            'quantity' => 999,
        ]));

        $this->assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $this->client->getResponse()->getStatusCode());
    }

    // ==================== UPDATE ITEM ====================

    public function testUpdateItemQuantity(): void
    {
        // Add item first
        $this->client->request('POST', '/api/v1/cart/items', [], [], $this->authHeaders(), json_encode([
            'productId' => $this->productId,
            'quantity' => 1,
        ]));
        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $itemId = $envelope['data']['items'][0]['id'];

        // Update quantity
        $this->client->request('PATCH', '/api/v1/cart/items/'.$itemId, [], [], $this->authHeaders(), json_encode([
            'quantity' => 5,
        ]));

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());

        $envelope = json_decode($response->getContent(), true);
        $cart = $envelope['data'];
        $this->assertSame(5, $cart['items'][0]['quantity']);
    }

    public function testUpdateItemNotFound(): void
    {
        $this->client->request('PATCH', '/api/v1/cart/items/non-existent', [], [], $this->authHeaders(), json_encode([
            'quantity' => 5,
        ]));

        $this->assertSame(Response::HTTP_NOT_FOUND, $this->client->getResponse()->getStatusCode());
    }

    // ==================== DELETE ITEM ====================

    public function testRemoveItem(): void
    {
        // Add item
        $this->client->request('POST', '/api/v1/cart/items', [], [], $this->authHeaders(), json_encode([
            'productId' => $this->productId,
            'quantity' => 1,
        ]));
        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $itemId = $envelope['data']['items'][0]['id'];

        // Remove
        $this->client->request('DELETE', '/api/v1/cart/items/'.$itemId, [], [], $this->authHeaders());

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());

        $envelope = json_decode($response->getContent(), true);
        $cart = $envelope['data'];
        $this->assertCount(0, $cart['items']);
        $this->assertSame(0, $cart['total']);
    }

    // ==================== ISOLATION ====================

    public function testOtherUserCannotSeeMyCart(): void
    {
        // User 1 adds item
        $this->client->request('POST', '/api/v1/cart/items', [], [], $this->authHeaders(), json_encode([
            'productId' => $this->productId,
            'quantity' => 1,
        ]));

        // User 2 gets their own cart
        $this->client->request('GET', '/api/v1/cart', [], [], $this->authHeaders($this->otherAccessToken));

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertCount(0, $envelope['data']['items'], 'Other user should have empty cart');
    }
}
