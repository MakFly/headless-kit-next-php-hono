'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StorefrontNavbar } from '@/components/storefront/storefront-navbar';
import { getProduct, formatPrice } from '@/lib/data/products';
import { useCartStore } from '@/stores/cart-store';
import { StarIcon, ShoppingCartIcon, ArrowLeftIcon } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const product = getProduct(id);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontNavbar />
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link href="/products" className="mt-4 inline-flex items-center text-primary hover:underline">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StorefrontNavbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to products
        </Link>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-8xl">
            {product.category === 'Electronics' ? '🔌' : product.category === 'Clothing' ? '👕' : product.category === 'Sports' ? '⚽' : '🏠'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>
            <p className="mt-4 text-2xl font-bold">{formatPrice(product.price)}</p>
            <p className="mt-4 text-muted-foreground">{product.description}</p>

            {product.variants?.map((variant) => (
              <div key={variant.name} className="mt-4">
                <label className="text-sm font-medium">{variant.name}</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {variant.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: option }))}
                      className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-medium border transition-colors ${
                        selectedVariants[variant.name] === option
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input hover:bg-accent'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-md border border-input">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 inline-flex items-center justify-center hover:bg-accent">-</button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="h-10 w-10 inline-flex items-center justify-center hover:bg-accent">+</button>
              </div>
              <button
                onClick={() => {
                  addItem(product, quantity, selectedVariants);
                  toast.success(`${product.name} added to cart`);
                }}
                disabled={!product.inStock}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
