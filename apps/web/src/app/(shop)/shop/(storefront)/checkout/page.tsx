'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/stores/cart-store';
import { createOrderAction } from '@/lib/actions/shop/orders';
import type { ShippingAddress } from '@/types/shop';
import { ArrowLeft, Lock, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, isLoading: cartLoading, fetchCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zip ||
      !address.country
    ) {
      setError('Please fill in all address fields');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const order = await createOrderAction(address);
      toast.success('Order placed successfully');
      router.push(`/shop/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  if (cartLoading && items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl text-stone-900">Checkout</h1>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <ShoppingBag className="mb-4 h-12 w-12 text-stone-300" />
        <h1 className="mb-2 font-serif text-2xl text-stone-900">
          Nothing to check out
        </h1>
        <p className="mb-6 text-sm text-stone-500">
          Add items to your bag first
        </p>
        <Button
          onClick={() => router.push('/shop')}
          className="h-11 rounded-none bg-stone-900 px-10 text-[11px] uppercase tracking-[0.15em] hover:bg-stone-800"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  const inputClasses =
    'rounded-none border-stone-300 text-sm placeholder:text-stone-400 focus-visible:ring-stone-400';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        href="/shop/cart"
        className="mb-8 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-stone-400 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to bag
      </Link>

      <h1 className="mb-10 font-serif text-3xl text-stone-900">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Shipping form */}
          <div className="space-y-8 lg:col-span-3">
            <div>
              <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-900">
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="street" className="text-xs text-stone-600">
                    Street Address
                  </Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={(e) => updateField('street', e.target.value)}
                    placeholder="123 Main Street"
                    required
                    className={inputClasses}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs text-stone-600">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="New York"
                      required
                      className={inputClasses}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-xs text-stone-600">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="NY"
                      required
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="zip" className="text-xs text-stone-600">
                      ZIP Code
                    </Label>
                    <Input
                      id="zip"
                      value={address.zip}
                      onChange={(e) => updateField('zip', e.target.value)}
                      placeholder="10001"
                      required
                      className={inputClasses}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="country"
                      className="text-xs text-stone-600"
                    >
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={address.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      placeholder="United States"
                      required
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-stone-50 p-6 lg:sticky lg:top-24">
              <h2 className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-900">
                Your Order
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt=""
                        className="h-16 w-12 bg-stone-100 object-cover"
                      />
                    ) : (
                      <div className="h-16 w-12 bg-stone-200" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-stone-900">
                        {item.product?.name ?? 'Product'}
                      </p>
                      <p className="text-xs text-stone-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm text-stone-900">
                      {item.product
                        ? formatPrice(item.product.price * item.quantity)
                        : '-'}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4 bg-stone-200" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="text-stone-900">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Shipping</span>
                  <span className="text-stone-900">Free</span>
                </div>
              </div>

              <Separator className="my-4 bg-stone-200" />

              <div className="mb-6 flex justify-between font-medium">
                <span className="text-stone-900">Total</span>
                <span className="text-stone-900">{formatPrice(total)}</span>
              </div>

              {error && (
                <p className="mb-4 text-xs text-red-600">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-none bg-stone-900 text-[11px] uppercase tracking-[0.15em] hover:bg-stone-800"
              >
                <Lock className="mr-2 h-3.5 w-3.5" />
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </Button>
              <p className="mt-3 text-center text-[10px] text-stone-400">
                Secure checkout. Your data is protected.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
