<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Shared\Models\Category;
use App\Shared\Models\Product;
use Illuminate\Database\Seeder;

class ShopSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics', 'slug' => 'electronics', 'description' => 'Gadgets and electronic devices', 'sort_order' => 1],
            ['name' => 'Clothing', 'slug' => 'clothing', 'description' => 'Fashion and apparel', 'sort_order' => 2],
            ['name' => 'Books', 'slug' => 'books', 'description' => 'Books and literature', 'sort_order' => 3],
            ['name' => 'Home & Garden', 'slug' => 'home-garden', 'description' => 'Home decor and garden supplies', 'sort_order' => 4],
            ['name' => 'Sports', 'slug' => 'sports', 'description' => 'Sports equipment and accessories', 'sort_order' => 5],
            ['name' => 'Toys', 'slug' => 'toys', 'description' => 'Toys and games for all ages', 'sort_order' => 6],
            ['name' => 'Food & Beverages', 'slug' => 'food-beverages', 'description' => 'Gourmet food and drinks', 'sort_order' => 7],
            ['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Fashion accessories and jewelry', 'sort_order' => 8],
        ];

        $createdCategories = [];
        foreach ($categories as $cat) {
            $category = Category::create(array_merge($cat, [
                'image_url' => "https://picsum.photos/seed/{$cat['slug']}/400/400",
            ]));
            $createdCategories[$cat['slug']] = $category->id;
        }

        $products = [
            // Electronics (5 products)
            ['name' => 'Wireless Bluetooth Headphones', 'slug' => 'wireless-bluetooth-headphones', 'category' => 'electronics', 'price' => 7999, 'compare_at_price' => 9999, 'sku' => 'ELEC-001', 'stock' => 50, 'featured' => true, 'description' => 'Premium wireless headphones with noise cancellation and 30h battery life.'],
            ['name' => 'Smart Watch Pro', 'slug' => 'smart-watch-pro', 'category' => 'electronics', 'price' => 19999, 'compare_at_price' => 24999, 'sku' => 'ELEC-002', 'stock' => 30, 'featured' => true, 'description' => 'Advanced smartwatch with health monitoring, GPS, and 7-day battery.'],
            ['name' => 'Portable Bluetooth Speaker', 'slug' => 'portable-bluetooth-speaker', 'category' => 'electronics', 'price' => 4999, 'compare_at_price' => null, 'sku' => 'ELEC-003', 'stock' => 75, 'featured' => false, 'description' => 'Waterproof portable speaker with 360° sound and 12h playtime.'],
            ['name' => 'USB-C Laptop Charger 65W', 'slug' => 'usb-c-laptop-charger-65w', 'category' => 'electronics', 'price' => 2999, 'compare_at_price' => null, 'sku' => 'ELEC-004', 'stock' => 100, 'featured' => false, 'description' => 'Universal 65W USB-C charger compatible with most laptops and devices.'],
            ['name' => '4K Webcam HD', 'slug' => '4k-webcam-hd', 'category' => 'electronics', 'price' => 8999, 'compare_at_price' => 11999, 'sku' => 'ELEC-005', 'stock' => 40, 'featured' => false, 'description' => '4K ultra HD webcam with built-in microphone and auto-focus.'],

            // Clothing (4 products)
            ['name' => 'Classic White T-Shirt', 'slug' => 'classic-white-t-shirt', 'category' => 'clothing', 'price' => 1999, 'compare_at_price' => null, 'sku' => 'CLTH-001', 'stock' => 200, 'featured' => false, 'description' => '100% organic cotton t-shirt, available in multiple sizes.'],
            ['name' => 'Slim Fit Jeans', 'slug' => 'slim-fit-jeans', 'category' => 'clothing', 'price' => 5999, 'compare_at_price' => 7999, 'sku' => 'CLTH-002', 'stock' => 80, 'featured' => true, 'description' => 'Modern slim-fit jeans with stretch fabric for comfort.'],
            ['name' => 'Lightweight Running Jacket', 'slug' => 'lightweight-running-jacket', 'category' => 'clothing', 'price' => 8999, 'compare_at_price' => null, 'sku' => 'CLTH-003', 'stock' => 45, 'featured' => false, 'description' => 'Windproof and water-resistant running jacket with reflective details.'],
            ['name' => 'Merino Wool Sweater', 'slug' => 'merino-wool-sweater', 'category' => 'clothing', 'price' => 12999, 'compare_at_price' => 15999, 'sku' => 'CLTH-004', 'stock' => 35, 'featured' => false, 'description' => 'Soft merino wool sweater, perfect for cold weather.'],

            // Books (3 products)
            ['name' => 'Clean Code: A Handbook', 'slug' => 'clean-code-handbook', 'category' => 'books', 'price' => 3499, 'compare_at_price' => null, 'sku' => 'BOOK-001', 'stock' => 60, 'featured' => false, 'description' => 'Essential guide to writing clean, maintainable code by Robert C. Martin.'],
            ['name' => 'The Pragmatic Programmer', 'slug' => 'pragmatic-programmer', 'category' => 'books', 'price' => 3999, 'compare_at_price' => 4999, 'sku' => 'BOOK-002', 'stock' => 45, 'featured' => true, 'description' => 'From journeyman to master — a must-read for software developers.'],
            ['name' => 'Design Patterns: GoF', 'slug' => 'design-patterns-gof', 'category' => 'books', 'price' => 4499, 'compare_at_price' => null, 'sku' => 'BOOK-003', 'stock' => 30, 'featured' => false, 'description' => 'The classic Gang of Four book on software design patterns.'],

            // Home & Garden (4 products)
            ['name' => 'Bamboo Plant Stand', 'slug' => 'bamboo-plant-stand', 'category' => 'home-garden', 'price' => 3499, 'compare_at_price' => null, 'sku' => 'HOME-001', 'stock' => 55, 'featured' => false, 'description' => 'Eco-friendly bamboo plant stand, fits pots up to 12 inches.'],
            ['name' => 'Ceramic Coffee Mug Set', 'slug' => 'ceramic-coffee-mug-set', 'category' => 'home-garden', 'price' => 2999, 'compare_at_price' => 3999, 'sku' => 'HOME-002', 'stock' => 90, 'featured' => false, 'description' => 'Set of 4 handcrafted ceramic mugs, microwave and dishwasher safe.'],
            ['name' => 'LED Desk Lamp', 'slug' => 'led-desk-lamp', 'category' => 'home-garden', 'price' => 4999, 'compare_at_price' => null, 'sku' => 'HOME-003', 'stock' => 65, 'featured' => true, 'description' => 'Adjustable LED desk lamp with USB charging port and 5 brightness levels.'],
            ['name' => 'Herb Garden Starter Kit', 'slug' => 'herb-garden-starter-kit', 'category' => 'home-garden', 'price' => 2499, 'compare_at_price' => null, 'sku' => 'HOME-004', 'stock' => 40, 'featured' => false, 'description' => 'Complete kit to grow basil, mint, and parsley indoors.'],

            // Sports (3 products)
            ['name' => 'Yoga Mat Premium', 'slug' => 'yoga-mat-premium', 'category' => 'sports', 'price' => 5999, 'compare_at_price' => 7999, 'sku' => 'SPRT-001', 'stock' => 70, 'featured' => false, 'description' => 'Extra thick 6mm non-slip yoga mat with carrying strap.'],
            ['name' => 'Resistance Bands Set', 'slug' => 'resistance-bands-set', 'category' => 'sports', 'price' => 2499, 'compare_at_price' => null, 'sku' => 'SPRT-002', 'stock' => 120, 'featured' => false, 'description' => 'Set of 5 resistance bands for strength training, varying tensions.'],
            ['name' => 'Running Water Bottle', 'slug' => 'running-water-bottle', 'category' => 'sports', 'price' => 1999, 'compare_at_price' => null, 'sku' => 'SPRT-003', 'stock' => 150, 'featured' => false, 'description' => 'BPA-free 750ml insulated water bottle, keeps drinks cold for 24h.'],

            // Toys (3 products)
            ['name' => 'STEM Building Blocks Set', 'slug' => 'stem-building-blocks-set', 'category' => 'toys', 'price' => 3999, 'compare_at_price' => null, 'sku' => 'TOYS-001', 'stock' => 80, 'featured' => true, 'description' => '200-piece magnetic building blocks for ages 3+, STEM learning.'],
            ['name' => 'Remote Control Car', 'slug' => 'remote-control-car', 'category' => 'toys', 'price' => 4999, 'compare_at_price' => 5999, 'sku' => 'TOYS-002', 'stock' => 50, 'featured' => false, 'description' => 'High-speed RC car with 4WD, 30km/h max speed, 30min runtime.'],
            ['name' => 'Wooden Puzzle 500 Pieces', 'slug' => 'wooden-puzzle-500-pieces', 'category' => 'toys', 'price' => 2499, 'compare_at_price' => null, 'sku' => 'TOYS-003', 'stock' => 65, 'featured' => false, 'description' => 'Nature-themed wooden jigsaw puzzle, 500 pieces for ages 8+.'],

            // Food & Beverages (4 products)
            ['name' => 'Organic Green Tea Sampler', 'slug' => 'organic-green-tea-sampler', 'category' => 'food-beverages', 'price' => 2499, 'compare_at_price' => null, 'sku' => 'FOOD-001', 'stock' => 100, 'featured' => false, 'description' => 'Premium selection of 5 organic green teas from Japan and China.'],
            ['name' => 'Artisan Dark Chocolate Box', 'slug' => 'artisan-dark-chocolate-box', 'category' => 'food-beverages', 'price' => 3499, 'compare_at_price' => null, 'sku' => 'FOOD-002', 'stock' => 60, 'featured' => true, 'description' => 'Handcrafted assortment of 16 dark chocolate truffles, 70% cacao.'],
            ['name' => 'Cold Brew Coffee Kit', 'slug' => 'cold-brew-coffee-kit', 'category' => 'food-beverages', 'price' => 2999, 'compare_at_price' => 3999, 'sku' => 'FOOD-003', 'stock' => 45, 'featured' => false, 'description' => 'Everything you need to make smooth cold brew coffee at home.'],
            ['name' => 'Himalayan Pink Salt Grinder', 'slug' => 'himalayan-pink-salt-grinder', 'category' => 'food-beverages', 'price' => 1499, 'compare_at_price' => null, 'sku' => 'FOOD-004', 'stock' => 80, 'featured' => false, 'description' => 'Refillable salt grinder with 100% pure Himalayan pink salt.'],

            // Accessories (4 products)
            ['name' => 'Leather Wallet Slim', 'slug' => 'leather-wallet-slim', 'category' => 'accessories', 'price' => 3999, 'compare_at_price' => null, 'sku' => 'ACC-001', 'stock' => 90, 'featured' => false, 'description' => 'Genuine leather slim wallet with RFID blocking, 6 card slots.'],
            ['name' => 'Canvas Tote Bag', 'slug' => 'canvas-tote-bag', 'category' => 'accessories', 'price' => 1999, 'compare_at_price' => null, 'sku' => 'ACC-002', 'stock' => 150, 'featured' => false, 'description' => 'Durable canvas tote bag with inner pocket, reusable and washable.'],
            ['name' => 'Sunglasses Polarized', 'slug' => 'sunglasses-polarized', 'category' => 'accessories', 'price' => 6999, 'compare_at_price' => 8999, 'sku' => 'ACC-003', 'stock' => 55, 'featured' => true, 'description' => 'UV400 polarized sunglasses with lightweight titanium frame.'],
            ['name' => 'Knit Beanie Hat', 'slug' => 'knit-beanie-hat', 'category' => 'accessories', 'price' => 1499, 'compare_at_price' => null, 'sku' => 'ACC-004', 'stock' => 120, 'featured' => false, 'description' => 'Soft and warm knit beanie, available in 8 colors.'],
        ];

        foreach ($products as $prod) {
            Product::create([
                'name' => $prod['name'],
                'slug' => $prod['slug'],
                'description' => $prod['description'],
                'price' => $prod['price'],
                'compare_at_price' => $prod['compare_at_price'],
                'sku' => $prod['sku'],
                'stock_quantity' => $prod['stock'],
                'category_id' => $createdCategories[$prod['category']],
                'image_url' => "https://picsum.photos/seed/{$prod['slug']}/400/400",
                'images' => [
                    "https://picsum.photos/seed/{$prod['slug']}-1/800/800",
                    "https://picsum.photos/seed/{$prod['slug']}-2/800/800",
                ],
                'status' => 'active',
                'featured' => $prod['featured'],
            ]);
        }
    }
}
