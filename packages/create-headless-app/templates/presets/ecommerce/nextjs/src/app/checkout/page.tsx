'use client';

import { useState } from 'react';
import { StorefrontNavbar } from '@/components/storefront/storefront-navbar';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/data/products';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    clearCart();
    toast.success('Order placed successfully!');
    router.push('/');
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <StorefrontNavbar />
        <main className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Add some products before checking out.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StorefrontNavbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid gap-8 md:grid-cols-5">
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-6">
            <div className="rounded-lg border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <input required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <input required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <input required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <input required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <input required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">ZIP Code</label>
                  <input required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Place Order — ${formatPrice(getTotal())}`}
            </button>
          </form>
          <div className="md:col-span-2">
            <div className="rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-border pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
