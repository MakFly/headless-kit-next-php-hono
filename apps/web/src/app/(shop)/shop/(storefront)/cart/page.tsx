'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/stores/cart-store';
import { Minus, Plus, X, ShoppingBag, ArrowLeft, Truck } from 'lucide-react';

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const FREE_SHIPPING_THRESHOLD = 10000; // $100

export default function CartPage() {
  const router = useRouter();
  const { items, total, isLoading, error, fetchCart, updateItem, removeItem } =
    useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const shippingProgress = Math.min(
    100,
    (total / FREE_SHIPPING_THRESHOLD) * 100,
  );
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - total;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h1 className="mb-2 font-serif text-3xl text-stone-900">Shopping Bag</h1>
      <p className="mb-8 text-xs text-stone-400">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </p>

      {isLoading && items.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-sm text-stone-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4 rounded-none"
            onClick={fetchCart}
          >
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <ShoppingBag className="mb-4 h-12 w-12 text-stone-300" />
          <h2 className="mb-2 font-serif text-2xl text-stone-900">
            Your bag is empty
          </h2>
          <p className="mb-6 text-sm text-stone-500">
            Discover our curated collection
          </p>
          <Button
            onClick={() => router.push('/shop')}
            className="h-11 rounded-none bg-stone-900 px-10 text-[11px] uppercase tracking-[0.15em] hover:bg-stone-800"
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2">
            {/* Free shipping progress */}
            {total < FREE_SHIPPING_THRESHOLD && (
              <div className="mb-6 bg-stone-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-stone-500" />
                  <p className="text-xs text-stone-600">
                    Add {formatPrice(amountToFreeShipping)} more for free
                    shipping
                  </p>
                </div>
                <div className="h-1 w-full overflow-hidden bg-stone-200">
                  <div
                    className="h-full bg-stone-900 transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="divide-y divide-stone-200">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-6">
                  {item.product?.imageUrl ? (
                    <Link
                      href={`/shop/${item.product?.slug ?? ''}`}
                      className="shrink-0"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product?.name ?? 'Product'}
                        className="h-28 w-20 bg-stone-100 object-cover"
                      />
                    </Link>
                  ) : (
                    <div className="h-28 w-20 shrink-0 bg-stone-100" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="text-sm text-stone-900">
                          {item.product?.name ?? 'Product'}
                        </h3>
                        <p className="mt-0.5 text-xs text-stone-400">
                          {item.product
                            ? formatPrice(item.product.price)
                            : '-'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={isLoading}
                        className="text-stone-400 transition-colors hover:text-stone-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-stone-300">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-50"
                          disabled={isLoading || item.quantity <= 1}
                          onClick={() =>
                            updateItem(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-50"
                          disabled={isLoading}
                          onClick={() =>
                            updateItem(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-stone-900">
                        {item.product
                          ? formatPrice(item.product.price * item.quantity)
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-stone-500 transition-colors hover:text-stone-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-stone-50 p-6">
              <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-900">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">
                    Subtotal (
                    {items.reduce((sum, i) => sum + i.quantity, 0)} items)
                  </span>
                  <span className="text-stone-900">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Shipping</span>
                  <span className="text-stone-900">
                    {total >= FREE_SHIPPING_THRESHOLD
                      ? 'Free'
                      : 'Calculated at checkout'}
                  </span>
                </div>
              </div>

              <Separator className="my-4 bg-stone-200" />

              {/* Promo code */}
              <div className="mb-4 flex gap-2">
                <Input
                  placeholder="Promo code"
                  className="flex-1 rounded-none border-stone-300 bg-white text-xs placeholder:text-stone-400 focus-visible:ring-stone-400"
                />
                <Button
                  variant="outline"
                  className="rounded-none border-stone-300 px-4 text-[11px] uppercase tracking-wider"
                >
                  Apply
                </Button>
              </div>

              <div className="mb-6 flex justify-between text-sm font-medium">
                <span className="text-stone-900">Total</span>
                <span className="text-stone-900">{formatPrice(total)}</span>
              </div>

              <Button
                className="h-11 w-full rounded-none bg-stone-900 text-[11px] uppercase tracking-[0.15em] hover:bg-stone-800"
                onClick={() => router.push('/shop/checkout')}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
