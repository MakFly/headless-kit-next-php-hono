'use client';

import { StorefrontNavbar } from '@/components/storefront/storefront-navbar';
import { ProductGrid } from '@/components/storefront/product-grid';
import { products } from '@/lib/data/products';

export default function HomePage() {
  const featured = products.filter((p) => p.inStock).slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <StorefrontNavbar />
      <main>
        <section className="py-16 px-6">
          <div className="mx-auto max-w-7xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome to {'{{PROJECT_NAME}}'}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover our curated collection of premium products.
            </p>
          </div>
        </section>
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
            <ProductGrid products={featured} />
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>{'{{PROJECT_NAME}}'} — Built with Headless Kit</p>
      </footer>
    </div>
  );
}
