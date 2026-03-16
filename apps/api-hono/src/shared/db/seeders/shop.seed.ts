/**
 * Shop seed script
 *
 * Creates categories and products for the shop
 */

import { db, schema } from '../index.ts';
import { eq } from 'drizzle-orm';

const categoriesData = [
  { name: 'Electronics', slug: 'electronics', description: 'Smartphones, laptops, and gadgets', sortOrder: 1 },
  { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel for all', sortOrder: 2 },
  { name: 'Books', slug: 'books', description: 'Fiction, non-fiction, and educational', sortOrder: 3 },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Furniture, decor, and outdoor', sortOrder: 4 },
  { name: 'Sports', slug: 'sports', description: 'Equipment and sportswear', sortOrder: 5 },
  { name: 'Toys', slug: 'toys', description: 'Games and toys for all ages', sortOrder: 6 },
  { name: 'Food & Beverages', slug: 'food-beverages', description: 'Gourmet food and drinks', sortOrder: 7 },
  { name: 'Accessories', slug: 'accessories', description: 'Watches, bags, and jewelry', sortOrder: 8 },
];

const productsData = [
  // Electronics (5)
  { name: 'Wireless Noise-Cancelling Headphones', slug: 'wireless-nc-headphones', description: 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.', price: 29999, compareAtPrice: 34999, sku: 'ELEC-001', stockQuantity: 150, categorySlug: 'electronics', featured: true },
  { name: 'Ultra-Slim Laptop 14"', slug: 'ultra-slim-laptop-14', description: 'Lightweight laptop with M3 chip, 16GB RAM, and stunning Retina display.', price: 129999, compareAtPrice: null, sku: 'ELEC-002', stockQuantity: 45, categorySlug: 'electronics', featured: true },
  { name: 'Smart Watch Series 5', slug: 'smart-watch-series-5', description: 'Health monitoring, GPS, and always-on display in a sleek design.', price: 39999, compareAtPrice: 44999, sku: 'ELEC-003', stockQuantity: 200, categorySlug: 'electronics', featured: false },
  { name: 'Portable Bluetooth Speaker', slug: 'portable-bluetooth-speaker', description: 'Waterproof speaker with 360-degree sound and 12-hour battery.', price: 7999, compareAtPrice: null, sku: 'ELEC-004', stockQuantity: 300, categorySlug: 'electronics', featured: false },
  { name: '4K Action Camera', slug: '4k-action-camera', description: 'Rugged action camera with 4K60fps, image stabilization, and waterproof housing.', price: 34999, compareAtPrice: 39999, sku: 'ELEC-005', stockQuantity: 80, categorySlug: 'electronics', featured: false },

  // Clothing (4)
  { name: 'Merino Wool Sweater', slug: 'merino-wool-sweater', description: 'Soft and warm merino wool crew-neck sweater, perfect for layering.', price: 8999, compareAtPrice: null, sku: 'CLTH-001', stockQuantity: 120, categorySlug: 'clothing', featured: false },
  { name: 'Slim Fit Chinos', slug: 'slim-fit-chinos', description: 'Comfortable stretch chinos with a modern slim fit, available in multiple colors.', price: 5999, compareAtPrice: 6999, sku: 'CLTH-002', stockQuantity: 200, categorySlug: 'clothing', featured: true },
  { name: 'Classic Denim Jacket', slug: 'classic-denim-jacket', description: 'Timeless denim jacket with a modern fit and premium wash.', price: 11999, compareAtPrice: null, sku: 'CLTH-003', stockQuantity: 75, categorySlug: 'clothing', featured: false },
  { name: 'Performance Running Tee', slug: 'performance-running-tee', description: 'Moisture-wicking tech fabric t-shirt designed for high-intensity workouts.', price: 3499, compareAtPrice: null, sku: 'CLTH-004', stockQuantity: 350, categorySlug: 'clothing', featured: false },

  // Books (4)
  { name: 'The Art of Clean Code', slug: 'art-of-clean-code', description: 'A practical guide to writing maintainable and elegant software.', price: 3499, compareAtPrice: null, sku: 'BOOK-001', stockQuantity: 500, categorySlug: 'books', featured: true },
  { name: 'Modern Web Architecture', slug: 'modern-web-architecture', description: 'Deep dive into microservices, serverless, and edge computing patterns.', price: 4499, compareAtPrice: 4999, sku: 'BOOK-002', stockQuantity: 300, categorySlug: 'books', featured: false },
  { name: 'Sci-Fi: The Last Signal', slug: 'sci-fi-the-last-signal', description: 'A gripping sci-fi novel about humanitys first contact with an alien civilization.', price: 1499, compareAtPrice: null, sku: 'BOOK-003', stockQuantity: 800, categorySlug: 'books', featured: false },
  { name: 'Cookbook: World Flavors', slug: 'cookbook-world-flavors', description: 'Over 200 recipes from 50 countries, beautifully photographed.', price: 2999, compareAtPrice: 3499, sku: 'BOOK-004', stockQuantity: 200, categorySlug: 'books', featured: false },

  // Home & Garden (4)
  { name: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair', description: 'Adjustable lumbar support, breathable mesh back, and 5-year warranty.', price: 49999, compareAtPrice: 59999, sku: 'HOME-001', stockQuantity: 60, categorySlug: 'home-garden', featured: true },
  { name: 'Indoor Herb Garden Kit', slug: 'indoor-herb-garden-kit', description: 'Self-watering planter with LED grow lights, includes 6 herb pods.', price: 6999, compareAtPrice: null, sku: 'HOME-002', stockQuantity: 150, categorySlug: 'home-garden', featured: false },
  { name: 'Minimalist Desk Lamp', slug: 'minimalist-desk-lamp', description: 'Touch-controlled LED lamp with adjustable brightness and color temperature.', price: 4999, compareAtPrice: null, sku: 'HOME-003', stockQuantity: 250, categorySlug: 'home-garden', featured: false },
  { name: 'Premium Bedding Set', slug: 'premium-bedding-set', description: '400-thread-count Egyptian cotton sheets, duvet cover, and pillowcases.', price: 15999, compareAtPrice: 19999, sku: 'HOME-004', stockQuantity: 100, categorySlug: 'home-garden', featured: false },

  // Sports (4)
  { name: 'Carbon Fiber Tennis Racket', slug: 'carbon-fiber-tennis-racket', description: 'Professional-grade racket with vibration dampening and spin-friendly string pattern.', price: 18999, compareAtPrice: null, sku: 'SPRT-001', stockQuantity: 40, categorySlug: 'sports', featured: false },
  { name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', description: 'Extra-thick non-slip mat with alignment guides and carrying strap.', price: 5999, compareAtPrice: 7999, sku: 'SPRT-002', stockQuantity: 300, categorySlug: 'sports', featured: true },
  { name: 'Adjustable Dumbbell Set', slug: 'adjustable-dumbbell-set', description: 'Quick-change weight system from 5 to 50 lbs per dumbbell.', price: 34999, compareAtPrice: null, sku: 'SPRT-003', stockQuantity: 50, categorySlug: 'sports', featured: false },
  { name: 'Trail Running Shoes', slug: 'trail-running-shoes', description: 'Waterproof trail shoes with aggressive grip and rock plate protection.', price: 14999, compareAtPrice: 16999, sku: 'SPRT-004', stockQuantity: 180, categorySlug: 'sports', featured: false },

  // Toys (3)
  { name: 'Building Blocks Mega Set', slug: 'building-blocks-mega-set', description: '1500-piece creative building set compatible with major brands.', price: 4999, compareAtPrice: 5999, sku: 'TOYS-001', stockQuantity: 200, categorySlug: 'toys', featured: false },
  { name: 'RC Racing Drone', slug: 'rc-racing-drone', description: 'FPV racing drone with HD camera, 3 speed modes, and 20-min flight time.', price: 12999, compareAtPrice: null, sku: 'TOYS-002', stockQuantity: 70, categorySlug: 'toys', featured: true },
  { name: 'Strategy Board Game Collection', slug: 'strategy-board-game-collection', description: '5 classic strategy games in a premium wooden box set.', price: 7999, compareAtPrice: null, sku: 'TOYS-003', stockQuantity: 150, categorySlug: 'toys', featured: false },

  // Food & Beverages (3)
  { name: 'Artisan Coffee Sampler', slug: 'artisan-coffee-sampler', description: '6 single-origin coffees from around the world, freshly roasted whole beans.', price: 3999, compareAtPrice: null, sku: 'FOOD-001', stockQuantity: 400, categorySlug: 'food-beverages', featured: false },
  { name: 'Premium Olive Oil Gift Set', slug: 'premium-olive-oil-gift-set', description: 'Extra virgin olive oils from Italy, Spain, and Greece in elegant bottles.', price: 5499, compareAtPrice: 6499, sku: 'FOOD-002', stockQuantity: 100, categorySlug: 'food-beverages', featured: false },
  { name: 'Organic Tea Collection', slug: 'organic-tea-collection', description: '12 varieties of organic loose-leaf tea in a bamboo chest.', price: 4499, compareAtPrice: null, sku: 'FOOD-003', stockQuantity: 250, categorySlug: 'food-beverages', featured: true },

  // Accessories (3)
  { name: 'Leather Messenger Bag', slug: 'leather-messenger-bag', description: 'Full-grain leather bag with padded laptop compartment and brass hardware.', price: 19999, compareAtPrice: 24999, sku: 'ACCS-001', stockQuantity: 60, categorySlug: 'accessories', featured: true },
  { name: 'Minimalist Watch', slug: 'minimalist-watch', description: 'Swiss movement, sapphire crystal, and Italian leather strap.', price: 24999, compareAtPrice: null, sku: 'ACCS-002', stockQuantity: 40, categorySlug: 'accessories', featured: false },
  { name: 'Sunglasses Polarized', slug: 'sunglasses-polarized', description: 'UV400 polarized lenses in a lightweight titanium frame.', price: 15999, compareAtPrice: 17999, sku: 'ACCS-003', stockQuantity: 180, categorySlug: 'accessories', featured: false },
];

export async function seedShop() {
  console.log('\nSeeding shop data...\n');

  // Create categories
  console.log('Creating categories...');
  const categoryMap = new Map<string, string>();

  for (const cat of categoriesData) {
    const existing = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, cat.slug),
    });

    if (existing) {
      categoryMap.set(cat.slug, existing.id);
      console.log(`  - Category exists: ${cat.name}`);
      continue;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(schema.categories).values({
      id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: `https://picsum.photos/seed/${cat.slug}/400/400`,
      sortOrder: cat.sortOrder,
      createdAt: now,
      updatedAt: now,
    });

    categoryMap.set(cat.slug, id);
    console.log(`  ✓ Created category: ${cat.name}`);
  }

  // Create products
  console.log('\nCreating products...');
  for (const prod of productsData) {
    const existing = await db.query.products.findFirst({
      where: eq(schema.products.slug, prod.slug),
    });

    if (existing) {
      console.log(`  - Product exists: ${prod.name}`);
      continue;
    }

    const categoryId = categoryMap.get(prod.categorySlug);
    const now = new Date().toISOString();

    await db.insert(schema.products).values({
      id: crypto.randomUUID(),
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice,
      sku: prod.sku,
      stockQuantity: prod.stockQuantity,
      categoryId: categoryId || null,
      imageUrl: `https://picsum.photos/seed/${prod.slug}/400/400`,
      images: [
        `https://picsum.photos/seed/${prod.slug}-1/400/400`,
        `https://picsum.photos/seed/${prod.slug}-2/400/400`,
        `https://picsum.photos/seed/${prod.slug}-3/400/400`,
      ],
      status: 'active',
      featured: prod.featured,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`  ✓ Created product: ${prod.name} ($${(prod.price / 100).toFixed(2)})`);
  }

  console.log('\n✅ Shop data seeded successfully!\n');
}

// Run standalone
if (import.meta.main) {
  seedShop().catch((error) => {
    console.error('❌ Shop seed failed:', error);
    process.exit(1);
  });
}
