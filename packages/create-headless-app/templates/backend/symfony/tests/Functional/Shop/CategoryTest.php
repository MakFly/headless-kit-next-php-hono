<?php

declare(strict_types=1);

namespace App\Tests\Functional\Shop;

use App\Entity\Category;
use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class CategoryTest extends WebTestCase
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
        $electronics->setImageUrl('https://picsum.photos/seed/electronics/400/400');
        $this->em->persist($electronics);

        $books = new Category();
        $books->setName('Books');
        $books->setSlug('books');
        $books->setDescription('All kinds of books');
        $books->setSortOrder(2);
        $this->em->persist($books);

        $empty = new Category();
        $empty->setName('Empty Category');
        $empty->setSlug('empty-category');
        $empty->setSortOrder(3);
        $this->em->persist($empty);

        $p1 = new Product();
        $p1->setName('Headphones');
        $p1->setSlug('headphones');
        $p1->setPrice(7999);
        $p1->setStockQuantity(50);
        $p1->setCategory($electronics);
        $this->em->persist($p1);

        $p2 = new Product();
        $p2->setName('Keyboard');
        $p2->setSlug('keyboard');
        $p2->setPrice(12999);
        $p2->setStockQuantity(30);
        $p2->setCategory($electronics);
        $this->em->persist($p2);

        $p3 = new Product();
        $p3->setName('PHP Book');
        $p3->setSlug('php-book');
        $p3->setPrice(3299);
        $p3->setStockQuantity(100);
        $p3->setCategory($books);
        $this->em->persist($p3);

        // Draft product should not count
        $draft = new Product();
        $draft->setName('Draft Item');
        $draft->setSlug('draft-item');
        $draft->setPrice(999);
        $draft->setStatus('draft');
        $draft->setCategory($electronics);
        $draft->setStockQuantity(5);
        $this->em->persist($draft);

        $this->em->flush();
    }

    // ==================== LIST TESTS ====================

    public function testListCategories(): void
    {
        $this->client->request('GET', '/api/v1/categories');

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());

        $envelope = json_decode($response->getContent(), true);
        $this->assertTrue($envelope['success']);
        $this->assertCount(3, $envelope['data']);
    }

    public function testListCategoriesIncludesProductCount(): void
    {
        $this->client->request('GET', '/api/v1/categories');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $categories = $envelope['data'];

        $electronicsCategory = null;
        $emptyCategory = null;
        foreach ($categories as $cat) {
            if ($cat['slug'] === 'electronics') {
                $electronicsCategory = $cat;
            }
            if ($cat['slug'] === 'empty-category') {
                $emptyCategory = $cat;
            }
        }

        $this->assertNotNull($electronicsCategory);
        $this->assertSame(2, $electronicsCategory['productCount'], 'Should count only active products');
        $this->assertNotNull($emptyCategory);
        $this->assertSame(0, $emptyCategory['productCount']);
    }

    public function testListCategoriesOrderedBySortOrder(): void
    {
        $this->client->request('GET', '/api/v1/categories');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $sortOrders = array_column($envelope['data'], 'sortOrder');
        $sorted = $sortOrders;
        sort($sorted);
        $this->assertSame($sorted, $sortOrders);
    }

    // ==================== DETAIL TESTS ====================

    public function testCategoryDetail(): void
    {
        $this->client->request('GET', '/api/v1/categories/electronics');

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());

        $envelope = json_decode($response->getContent(), true);
        $this->assertTrue($envelope['success']);
        $category = $envelope['data'];
        $this->assertSame('electronics', $category['slug']);
        $this->assertSame('Electronics', $category['name']);
        $this->assertArrayHasKey('products', $category);
        $this->assertCount(2, $category['products'], 'Should only include active products');
    }

    public function testCategoryDetailNotFound(): void
    {
        $this->client->request('GET', '/api/v1/categories/non-existent');

        $response = $this->client->getResponse();
        $this->assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testCategoryDetailEmptyCategory(): void
    {
        $this->client->request('GET', '/api/v1/categories/empty-category');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $category = $envelope['data'];
        $this->assertSame('empty-category', $category['slug']);
        $this->assertArrayHasKey('products', $category);
        $this->assertCount(0, $category['products']);
    }

    public function testCategoryDetailIncludesImageUrl(): void
    {
        $this->client->request('GET', '/api/v1/categories/electronics');

        $envelope = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertNotNull($envelope['data']['imageUrl']);
    }
}
