/**
 * Admin seed script
 *
 * Creates segments, customers, and reviews
 */

import { db, schema } from '../index.ts';
import { eq } from 'drizzle-orm';

const segmentsData = [
  { name: 'Compulsive', slug: 'compulsive' },
  { name: 'Regular', slug: 'regular' },
  { name: 'Ordered Once', slug: 'ordered-once' },
  { name: 'Collectors', slug: 'collectors' },
];

const customersData = [
  { firstName: 'Alice', lastName: 'Martin', email: 'alice.martin@example.com', phone: '+1-555-0101', segment: 'compulsive', totalSpent: 125000, nbOrders: 12 },
  { firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com', phone: '+1-555-0102', segment: 'regular', totalSpent: 45000, nbOrders: 5 },
  { firstName: 'Clara', lastName: 'Williams', email: 'clara.williams@example.com', phone: '+1-555-0103', segment: 'ordered-once', totalSpent: 8999, nbOrders: 1 },
  { firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com', phone: '+1-555-0104', segment: 'collectors', totalSpent: 350000, nbOrders: 25 },
  { firstName: 'Emma', lastName: 'Davis', email: 'emma.davis@example.com', phone: '+1-555-0105', segment: 'compulsive', totalSpent: 89000, nbOrders: 8 },
  { firstName: 'Frank', lastName: 'Miller', email: 'frank.miller@example.com', phone: '+1-555-0106', segment: 'regular', totalSpent: 32000, nbOrders: 4 },
  { firstName: 'Grace', lastName: 'Wilson', email: 'grace.wilson@example.com', phone: '+1-555-0107', segment: 'ordered-once', totalSpent: 12999, nbOrders: 1 },
  { firstName: 'Henry', lastName: 'Moore', email: 'henry.moore@example.com', phone: '+1-555-0108', segment: 'collectors', totalSpent: 275000, nbOrders: 18 },
  { firstName: 'Iris', lastName: 'Taylor', email: 'iris.taylor@example.com', phone: '+1-555-0109', segment: 'regular', totalSpent: 56000, nbOrders: 6 },
  { firstName: 'Jack', lastName: 'Anderson', email: 'jack.anderson@example.com', phone: '+1-555-0110', segment: 'compulsive', totalSpent: 142000, nbOrders: 15 },
  { firstName: 'Karen', lastName: 'Thomas', email: 'karen.thomas@example.com', phone: '+1-555-0111', segment: 'ordered-once', totalSpent: 5999, nbOrders: 1 },
  { firstName: 'Leo', lastName: 'Jackson', email: 'leo.jackson@example.com', phone: '+1-555-0112', segment: 'regular', totalSpent: 28000, nbOrders: 3 },
  { firstName: 'Mia', lastName: 'White', email: 'mia.white@example.com', phone: '+1-555-0113', segment: 'collectors', totalSpent: 198000, nbOrders: 14 },
  { firstName: 'Noah', lastName: 'Harris', email: 'noah.harris@example.com', phone: '+1-555-0114', segment: 'compulsive', totalSpent: 95000, nbOrders: 10 },
  { firstName: 'Olivia', lastName: 'Clark', email: 'olivia.clark@example.com', phone: '+1-555-0115', segment: 'regular', totalSpent: 41000, nbOrders: 5 },
];

const reviewComments = [
  'Excellent product, exceeded my expectations!',
  'Good quality for the price.',
  'Average. Does the job but nothing special.',
  'Not what I expected, quite disappointed.',
  'Amazing! Will definitely buy again.',
  'Fast shipping and great packaging.',
  'Could be better, but acceptable.',
  'Perfect gift for my friend, they loved it.',
  'The product broke after a week of use.',
  'Outstanding quality, highly recommend.',
  'Decent product, fair price.',
  'Love the design, very stylish.',
  'Not worth the money in my opinion.',
  'Great customer service when I had an issue.',
  'Exactly as described, very satisfied.',
  'A bit overpriced for what you get.',
  'Best purchase I made this year!',
  'Okay product, nothing to write home about.',
  'The color was different from the picture.',
  'Superb craftsmanship, top notch quality.',
];

export async function seedAdmin() {
  console.log('\nSeeding admin data...\n');

  // Create segments
  console.log('Creating segments...');
  for (const seg of segmentsData) {
    const existing = await db.query.segments.findFirst({
      where: eq(schema.segments.slug, seg.slug),
    });

    if (existing) {
      console.log(`  - Segment exists: ${seg.name}`);
      continue;
    }

    await db.insert(schema.segments).values({
      id: crypto.randomUUID(),
      name: seg.name,
      slug: seg.slug,
    });
    console.log(`  ✓ Created segment: ${seg.name}`);
  }

  // Create customers
  console.log('\nCreating customers...');
  const customerIds: string[] = [];

  for (const cust of customersData) {
    const existing = await db.query.customers.findFirst({
      where: eq(schema.customers.email, cust.email),
    });

    if (existing) {
      customerIds.push(existing.id);
      console.log(`  - Customer exists: ${cust.firstName} ${cust.lastName}`);
      continue;
    }

    const id = crypto.randomUUID();
    customerIds.push(id);

    await db.insert(schema.customers).values({
      id,
      firstName: cust.firstName,
      lastName: cust.lastName,
      email: cust.email,
      phone: cust.phone,
      address: {
        street: `${Math.floor(Math.random() * 999) + 1} Oak Street`,
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        country: 'US',
      },
      segment: cust.segment,
      totalSpent: cust.totalSpent,
      nbOrders: cust.nbOrders,
      lastOrderAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log(`  ✓ Created customer: ${cust.firstName} ${cust.lastName} (${cust.segment})`);
  }

  // Create reviews
  console.log('\nCreating reviews...');
  const products = await db.select().from(schema.products);

  if (products.length === 0 || customerIds.length === 0) {
    console.log('  - No products or customers found, skipping reviews');
  } else {
    // Check if reviews already exist
    const existingReviews = await db.select({ id: schema.reviews.id }).from(schema.reviews);
    if (existingReviews.length > 0) {
      console.log(`  - ${existingReviews.length} reviews already exist, skipping`);
    } else {
      const statuses = ['pending', 'approved', 'approved', 'approved', 'rejected'];

      for (let i = 0; i < 20; i++) {
        const product = products[i % products.length];
        const customerId = customerIds[i % customerIds.length];
        const rating = Math.floor(Math.random() * 5) + 1;
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        await db.insert(schema.reviews).values({
          id: crypto.randomUUID(),
          productId: product.id,
          customerId,
          rating,
          comment: reviewComments[i],
          status,
          createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      console.log(`  ✓ Created 20 reviews`);
    }
  }

  console.log('\n✅ Admin data seeded successfully!\n');
}

// Run standalone
if (import.meta.main) {
  seedAdmin().catch((error) => {
    console.error('❌ Admin seed failed:', error);
    process.exit(1);
  });
}
