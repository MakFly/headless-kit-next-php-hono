<?php

declare(strict_types=1);

namespace App\Tests\Functional\Shop;

use App\Entity\Category;
use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class ProductTest extends WebTestCase
{
    private ?KernelBrowser $client = null;
    private ?EntityManagerInterface $em = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = static::createClient();
        $this->em = $this->client->getContainer()->get('doctrine')->getManager();
        $this->cleanDatabase();
        $this->seedTestData();
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
        $connection->executeStatement('DELETE FROM products');
        $connection->executeStatement('DELETE FROM categories');
    }

    private function seedTestData(): void
    {
        $electronics = new Category();
        $electronics->setName('Electronics');
        $electronics->setSlug('electronics');
        $electronics->setDescription('Electronic devices');
        $electronics->setSortOrder(1);
        $this->em->persist($electronics);

        $books = new Category();
        $books->setName('Books');
        $books->setSlug('books');
        $books->setDescription('All kinds of books');
        $books->setSortOrder(2);
        $this->em->persist($books);

        $p1 = new Product();
        $p1->setName('Wireless Headphones');
        $p1->setSlug('wireless-headphones');
        $p1->setDescription('Great headphones');
        $p1->setPrice(7999);
        $p1->setCompareAtPrice(9999);
        $p1->setSku('ELEC-001');
        $p1->setStockQuantity(50);
        $p1->setCategory($electronics);
        $p1->setFeatured(true);
        $p1->setImageUrl('https://picsum.photos/seed/headphones/400/400');
        $this->em->persist($p1);

        $p2 = new Product();
        $p2->setName('USB-C Hub');
        $p2->setSlug('usb-c-hub');
        $p2->setDescription('Multi-port hub');
        $p2->setPrice(4999);
        $p2->setSku('ELEC-002');
        $p2->setStockQuantity(100);
        $p2->setCategory($electronics);
        $p2->setFeatured(false);
        $this->em->persist($p2);

        $p3 = new Product();
        $p3->setName('Clean Code Book');
        $p3->setSlug('clean-code-book');
        $p3->setDescription('A programming book');
        $p3->setPrice(3299);
        $p3->setSku('BOOK-001');
        $p3->setStockQuantity(200);
        $p3->setCategory($books);
        $p3->setFeatured(false);
        $this->em->persist($p3);

        $draft = new Product();
        $draft->setName('Draft Product');
        $draft->setSlug('draft-product');
        $draft->setPrice(999);
        $draft->setStatus('draft');
        $draft->setStockQuantity(10);
        $this->em->persist($draft);

        $this->em->flush();
    }

    // ==================== LIST TESTS ====================

    public function testListProducts(): void
    {
        $this->client->request('GET', '/api/v1/products');

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());

        $envelope = json_decode($response->getContent(), true);
        $this->assertTrue($envelope['success']);
        $this->assertArrayHasKey('data', $envelope);
        $this->assertArrayHasKey('meta', $envelope);
        $this->assertCount(3, $envelope['data'], 'Should only return active products');
        $this->assertSame(3, $envelope['meta']['total']);
    }

    public function testListProductsExcludesDrafts(): void
    {
        $this->client->request('GET', '/api/v1/products');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $slugs = array_column($envelope['data'], 'slug');
        $this->assertNotContains('draft-product', $slugs);
    }

    public function testListProductsFilterByCategory(): void
    {
        $this->client->request('GET', '/api/v1/products?category=electronics');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertCount(2, $envelope['data']);
    }

    public function testListProductsFilterBySearch(): void
    {
        $this->client->request('GET', '/api/v1/products?search=Headphones');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertCount(1, $envelope['data']);
        $this->assertSame('wireless-headphones', $envelope['data'][0]['slug']);
    }

    public function testListProductsSortByPriceAsc(): void
    {
        $this->client->request('GET', '/api/v1/products?sort=price_asc');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $prices = array_column($envelope['data'], 'price');
        $sorted = $prices;
        sort($sorted);
        $this->assertSame($sorted, $prices);
    }

    public function testListProductsSortByPriceDesc(): void
    {
        $this->client->request('GET', '/api/v1/products?sort=price_desc');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $prices = array_column($envelope['data'], 'price');
        $sorted = $prices;
        rsort($sorted);
        $this->assertSame($sorted, $prices);
    }

    public function testListProductsFilterByMinPrice(): void
    {
        $this->client->request('GET', '/api/v1/products?min_price=5000');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        foreach ($envelope['data'] as $product) {
            $this->assertGreaterThanOrEqual(5000, $product['price']);
        }
    }

    public function testListProductsFilterByMaxPrice(): void
    {
        $this->client->request('GET', '/api/v1/products?max_price=4000');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        foreach ($envelope['data'] as $product) {
            $this->assertLessThanOrEqual(4000, $product['price']);
        }
    }

    public function testListProductsPagination(): void
    {
        $this->client->request('GET', '/api/v1/products?per_page=2&page=1');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertCount(2, $envelope['data']);
        $this->assertSame(1, $envelope['meta']['page']);
        $this->assertSame(2, $envelope['meta']['per_page']);
        $this->assertSame(3, $envelope['meta']['total']);
        $this->assertSame(2, $envelope['meta']['last_page']);
    }

    public function testListProductsPaginationPage2(): void
    {
        $this->client->request('GET', '/api/v1/products?per_page=2&page=2');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertCount(1, $envelope['data']);
        $this->assertSame(2, $envelope['meta']['page']);
    }

    // ==================== DETAIL TESTS ====================

    public function testProductDetail(): void
    {
        $this->client->request('GET', '/api/v1/products/wireless-headphones');

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());

        $envelope = json_decode($response->getContent(), true);
        $this->assertTrue($envelope['success']);
        $product = $envelope['data'];
        $this->assertSame('wireless-headphones', $product['slug']);
        $this->assertSame('Wireless Headphones', $product['name']);
        $this->assertSame(7999, $product['price']);
        $this->assertSame(9999, $product['compareAtPrice']);
        $this->assertArrayHasKey('category', $product);
        $this->assertSame('electronics', $product['category']['slug']);
    }

    public function testProductDetailNotFound(): void
    {
        $this->client->request('GET', '/api/v1/products/non-existent-product');

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testProductDetailIncludesCategory(): void
    {
        $this->client->request('GET', '/api/v1/products/clean-code-book');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $product = $envelope['data'];
        $this->assertNotNull($product['category']);
        $this->assertSame('books', $product['category']['slug']);
    }
}
