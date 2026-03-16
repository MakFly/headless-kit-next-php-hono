<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Category;
use App\Entity\Product;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;

class ShopFixtures extends Fixture implements FixtureGroupInterface
{
    public static function getGroups(): array
    {
        return ['shop'];
    }

    public function load(ObjectManager $manager): void
    {
        $categories = $this->createCategories($manager);
        $this->createProducts($manager, $categories);
        $manager->flush();
    }

    /**
     * @return array<string, Category>
     */
    private function createCategories(ObjectManager $manager): array
    {
        $categoriesData = [
            ['name' => 'Electronics', 'slug' => 'electronics', 'description' => 'Smartphones, laptops, gadgets and more', 'sortOrder' => 1],
            ['name' => 'Clothing', 'slug' => 'clothing', 'description' => 'Fashion and apparel for all seasons', 'sortOrder' => 2],
            ['name' => 'Books', 'slug' => 'books', 'description' => 'Bestsellers, classics and new releases', 'sortOrder' => 3],
            ['name' => 'Home & Garden', 'slug' => 'home-garden', 'description' => 'Furniture, decor and garden essentials', 'sortOrder' => 4],
            ['name' => 'Sports', 'slug' => 'sports', 'description' => 'Equipment and gear for every sport', 'sortOrder' => 5],
            ['name' => 'Toys', 'slug' => 'toys', 'description' => 'Fun and educational toys for all ages', 'sortOrder' => 6],
            ['name' => 'Food & Beverages', 'slug' => 'food-beverages', 'description' => 'Gourmet food, snacks and drinks', 'sortOrder' => 7],
            ['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Watches, bags, jewelry and more', 'sortOrder' => 8],
        ];

        $categories = [];
        foreach ($categoriesData as $data) {
            $category = new Category();
            $category->setName($data['name']);
            $category->setSlug($data['slug']);
            $category->setDescription($data['description']);
            $category->setSortOrder($data['sortOrder']);
            $category->setImageUrl('https://picsum.photos/seed/' . $data['slug'] . '/400/400');
            $manager->persist($category);
            $categories[$data['slug']] = $category;
        }

        return $categories;
    }

    /**
     * @param array<string, Category> $categories
     */
    private function createProducts(ObjectManager $manager, array $categories): void
    {
        $productsData = [
            // Electronics (5)
            ['name' => 'Wireless Bluetooth Headphones', 'slug' => 'wireless-bluetooth-headphones', 'description' => 'Premium noise-cancelling wireless headphones with 30-hour battery life.', 'price' => 7999, 'compareAtPrice' => 9999, 'sku' => 'ELEC-001', 'stock' => 150, 'category' => 'electronics', 'featured' => true],
            ['name' => 'USB-C Charging Hub', 'slug' => 'usb-c-charging-hub', 'description' => '7-in-1 USB-C hub with HDMI, USB 3.0 and SD card reader.', 'price' => 4999, 'sku' => 'ELEC-002', 'stock' => 200, 'category' => 'electronics', 'featured' => false],
            ['name' => 'Smart Watch Pro', 'slug' => 'smart-watch-pro', 'description' => 'Fitness tracking smartwatch with heart rate monitor and GPS.', 'price' => 19999, 'compareAtPrice' => 24999, 'sku' => 'ELEC-003', 'stock' => 75, 'category' => 'electronics', 'featured' => true],
            ['name' => 'Portable Power Bank 20000mAh', 'slug' => 'portable-power-bank', 'description' => 'Fast-charging portable battery with dual USB ports.', 'price' => 3499, 'sku' => 'ELEC-004', 'stock' => 300, 'category' => 'electronics', 'featured' => false],
            ['name' => 'Mechanical Keyboard RGB', 'slug' => 'mechanical-keyboard-rgb', 'description' => 'Full-size mechanical keyboard with Cherry MX switches and RGB backlighting.', 'price' => 12999, 'sku' => 'ELEC-005', 'stock' => 100, 'category' => 'electronics', 'featured' => false],

            // Clothing (4)
            ['name' => 'Classic Cotton T-Shirt', 'slug' => 'classic-cotton-tshirt', 'description' => 'Soft 100% organic cotton t-shirt available in multiple colors.', 'price' => 2499, 'sku' => 'CLTH-001', 'stock' => 500, 'category' => 'clothing', 'featured' => false],
            ['name' => 'Denim Slim Fit Jeans', 'slug' => 'denim-slim-fit-jeans', 'description' => 'Stretch denim jeans with a modern slim fit.', 'price' => 5999, 'compareAtPrice' => 7999, 'sku' => 'CLTH-002', 'stock' => 200, 'category' => 'clothing', 'featured' => true],
            ['name' => 'Winter Puffer Jacket', 'slug' => 'winter-puffer-jacket', 'description' => 'Warm insulated puffer jacket with water-resistant shell.', 'price' => 8999, 'sku' => 'CLTH-003', 'stock' => 80, 'category' => 'clothing', 'featured' => false],
            ['name' => 'Running Sneakers Ultralight', 'slug' => 'running-sneakers-ultralight', 'description' => 'Lightweight running shoes with responsive cushioning.', 'price' => 11999, 'compareAtPrice' => 14999, 'sku' => 'CLTH-004', 'stock' => 120, 'category' => 'clothing', 'featured' => true],

            // Books (4)
            ['name' => 'The Art of Clean Code', 'slug' => 'art-of-clean-code', 'description' => 'A practical guide to writing maintainable and elegant software.', 'price' => 3299, 'sku' => 'BOOK-001', 'stock' => 400, 'category' => 'books', 'featured' => true],
            ['name' => 'Modern PHP Development', 'slug' => 'modern-php-development', 'description' => 'Master PHP 8.x features, frameworks and best practices.', 'price' => 4499, 'sku' => 'BOOK-002', 'stock' => 250, 'category' => 'books', 'featured' => false],
            ['name' => 'TypeScript in Depth', 'slug' => 'typescript-in-depth', 'description' => 'Advanced TypeScript patterns for large-scale applications.', 'price' => 3999, 'sku' => 'BOOK-003', 'stock' => 300, 'category' => 'books', 'featured' => false],
            ['name' => 'System Design Interview Guide', 'slug' => 'system-design-interview', 'description' => 'Comprehensive guide to acing system design interviews.', 'price' => 4999, 'compareAtPrice' => 5999, 'sku' => 'BOOK-004', 'stock' => 180, 'category' => 'books', 'featured' => true],

            // Home & Garden (4)
            ['name' => 'Ergonomic Office Chair', 'slug' => 'ergonomic-office-chair', 'description' => 'Adjustable mesh office chair with lumbar support and headrest.', 'price' => 29999, 'compareAtPrice' => 39999, 'sku' => 'HOME-001', 'stock' => 30, 'category' => 'home-garden', 'featured' => true],
            ['name' => 'LED Desk Lamp', 'slug' => 'led-desk-lamp', 'description' => 'Dimmable LED lamp with wireless charging base.', 'price' => 4999, 'sku' => 'HOME-002', 'stock' => 150, 'category' => 'home-garden', 'featured' => false],
            ['name' => 'Indoor Plant Pot Set', 'slug' => 'indoor-plant-pot-set', 'description' => 'Set of 3 minimalist ceramic pots with drainage holes.', 'price' => 3499, 'sku' => 'HOME-003', 'stock' => 200, 'category' => 'home-garden', 'featured' => false],
            ['name' => 'Stainless Steel Cookware Set', 'slug' => 'stainless-steel-cookware', 'description' => '10-piece professional cookware set with copper core.', 'price' => 19999, 'sku' => 'HOME-004', 'stock' => 50, 'category' => 'home-garden', 'featured' => false],

            // Sports (4)
            ['name' => 'Yoga Mat Premium', 'slug' => 'yoga-mat-premium', 'description' => 'Extra thick non-slip yoga mat with carrying strap.', 'price' => 3999, 'sku' => 'SPRT-001', 'stock' => 300, 'category' => 'sports', 'featured' => false],
            ['name' => 'Adjustable Dumbbell Set', 'slug' => 'adjustable-dumbbell-set', 'description' => 'Space-saving adjustable dumbbells from 5 to 52.5 lbs.', 'price' => 34999, 'compareAtPrice' => 44999, 'sku' => 'SPRT-002', 'stock' => 25, 'category' => 'sports', 'featured' => true],
            ['name' => 'Carbon Fiber Tennis Racket', 'slug' => 'carbon-fiber-tennis-racket', 'description' => 'Professional-grade carbon fiber racket with vibration dampening.', 'price' => 15999, 'sku' => 'SPRT-003', 'stock' => 60, 'category' => 'sports', 'featured' => false],
            ['name' => 'Insulated Water Bottle 1L', 'slug' => 'insulated-water-bottle', 'description' => 'Double-wall vacuum insulated bottle keeps drinks cold 24h.', 'price' => 2999, 'sku' => 'SPRT-004', 'stock' => 500, 'category' => 'sports', 'featured' => false],

            // Toys (3)
            ['name' => 'Building Blocks Creative Set', 'slug' => 'building-blocks-creative', 'description' => '500-piece creative building set compatible with major brands.', 'price' => 4999, 'sku' => 'TOYS-001', 'stock' => 150, 'category' => 'toys', 'featured' => true],
            ['name' => 'Remote Control Drone', 'slug' => 'remote-control-drone', 'description' => 'Beginner-friendly drone with HD camera and auto-hover.', 'price' => 8999, 'compareAtPrice' => 11999, 'sku' => 'TOYS-002', 'stock' => 40, 'category' => 'toys', 'featured' => false],
            ['name' => 'Board Game Strategy Collection', 'slug' => 'board-game-strategy', 'description' => 'Collection of 3 award-winning strategy board games.', 'price' => 5999, 'sku' => 'TOYS-003', 'stock' => 100, 'category' => 'toys', 'featured' => false],

            // Food & Beverages (3)
            ['name' => 'Artisan Coffee Bean Selection', 'slug' => 'artisan-coffee-beans', 'description' => 'Premium single-origin coffee beans from 3 regions, 750g total.', 'price' => 3499, 'sku' => 'FOOD-001', 'stock' => 200, 'category' => 'food-beverages', 'featured' => false],
            ['name' => 'Organic Green Tea Collection', 'slug' => 'organic-green-tea', 'description' => 'Curated selection of 6 organic Japanese green teas.', 'price' => 2999, 'sku' => 'FOOD-002', 'stock' => 250, 'category' => 'food-beverages', 'featured' => false],
            ['name' => 'Dark Chocolate Tasting Box', 'slug' => 'dark-chocolate-tasting', 'description' => 'Assortment of 12 single-origin dark chocolates from around the world.', 'price' => 4499, 'compareAtPrice' => 5499, 'sku' => 'FOOD-003', 'stock' => 100, 'category' => 'food-beverages', 'featured' => true],

            // Accessories (3)
            ['name' => 'Leather Laptop Sleeve', 'slug' => 'leather-laptop-sleeve', 'description' => 'Genuine leather sleeve fits 13-15 inch laptops.', 'price' => 5999, 'sku' => 'ACCS-001', 'stock' => 180, 'category' => 'accessories', 'featured' => false],
            ['name' => 'Minimalist Watch Silver', 'slug' => 'minimalist-watch-silver', 'description' => 'Elegant silver watch with Japanese quartz movement.', 'price' => 14999, 'compareAtPrice' => 19999, 'sku' => 'ACCS-002', 'stock' => 50, 'category' => 'accessories', 'featured' => true],
            ['name' => 'Canvas Backpack Travel', 'slug' => 'canvas-backpack-travel', 'description' => 'Durable canvas backpack with laptop compartment and USB port.', 'price' => 6999, 'sku' => 'ACCS-003', 'stock' => 120, 'category' => 'accessories', 'featured' => false],
        ];

        foreach ($productsData as $data) {
            $product = new Product();
            $product->setName($data['name']);
            $product->setSlug($data['slug']);
            $product->setDescription($data['description']);
            $product->setPrice($data['price']);
            if (isset($data['compareAtPrice'])) {
                $product->setCompareAtPrice($data['compareAtPrice']);
            }
            $product->setSku($data['sku']);
            $product->setStockQuantity($data['stock']);
            $product->setCategory($categories[$data['category']]);
            $product->setFeatured($data['featured']);
            $product->setImageUrl('https://picsum.photos/seed/' . $data['slug'] . '/400/400');
            $product->setImages([
                'https://picsum.photos/seed/' . $data['slug'] . '-1/800/800',
                'https://picsum.photos/seed/' . $data['slug'] . '-2/800/800',
                'https://picsum.photos/seed/' . $data['slug'] . '-3/800/800',
            ]);
            $manager->persist($product);
        }
    }
}
