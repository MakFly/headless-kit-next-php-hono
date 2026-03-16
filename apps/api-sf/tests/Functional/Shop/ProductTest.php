<?php

declare(strict_types=1);

namespace App\Tests\Functional\Shop;

use App\Shared\Entity\Category;
use App\Shared\Entity\Product;
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

    private function getProductIdBySlug(string $slug): string
    {
        $product = $this->em->getRepository(Product::class)->findOneBy(['slug' => $slug]);
        $this->assertNotNull($product, sprintf('Product with slug "%s" not found', $slug));

        return $product->getId();
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
        // API Platform returns ALL products (including drafts) — no custom status filter
        $this->assertCount(4, $envelope['data'], 'API Platform returns all products including drafts');
        $this->assertSame(4, $envelope['meta']['total']);
    }

    public function testListProductsPagination(): void
    {
        // API Platform uses ?page=N&itemsPerPage=N (not per_page)
        $this->client->request('GET', '/api/v1/products?page=1&itemsPerPage=2');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertCount(2, $envelope['data']);
        $this->assertSame(1, $envelope['meta']['page']);
        $this->assertSame(2, $envelope['meta']['per_page']);
        $this->assertSame(4, $envelope['meta']['total']);
        $this->assertSame(2, $envelope['meta']['last_page']);
    }

    public function testListProductsPaginationPage2(): void
    {
        // API Platform uses ?page=N&itemsPerPage=N (not per_page)
        $this->client->request('GET', '/api/v1/products?page=2&itemsPerPage=2');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertCount(2, $envelope['data']);
        $this->assertSame(2, $envelope['meta']['page']);
    }

    // ==================== DETAIL TESTS ====================

    public function testProductDetail(): void
    {
        $id = $this->getProductIdBySlug('wireless-headphones');
        $this->client->request('GET', '/api/v1/products/' . $id);

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
        $this->client->request('GET', '/api/v1/products/00000000-0000-0000-0000-000000000000');

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testProductDetailIncludesCategory(): void
    {
        $id = $this->getProductIdBySlug('clean-code-book');
        $this->client->request('GET', '/api/v1/products/' . $id);

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $product = $envelope['data'];
        $this->assertNotNull($product['category']);
        $this->assertSame('books', $product['category']['slug']);
    }
}
