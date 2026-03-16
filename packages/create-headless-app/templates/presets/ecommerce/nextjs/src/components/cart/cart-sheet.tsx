'use client';

import { ShoppingCartIcon, MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/data/products';
import Link from 'next/link';

export function CartSheet() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotal = useCartStore((s) => s.getTotal);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingCartIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground mt-1">Add some products to get started.</p>
        <Link
          href="/products"
          className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.product.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
          <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center text-2xl">
            {item.product.category === 'Electronics' ? '🔌' : item.product.category === 'Clothing' ? '👕' : item.product.category === 'Sports' ? '⚽' : '🏠'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">{item.product.name}</h4>
            <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input hover:bg-accent"
            >
              <MinusIcon className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input hover:bg-accent"
            >
              <PlusIcon className="h-3 w-3" />
            </button>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
            <button
              onClick={() => removeItem(item.product.id)}
              className="mt-1 text-xs text-destructive hover:underline inline-flex items-center gap-1"
            >
              <TrashIcon className="h-3 w-3" />
              Remove
            </button>
          </div>
        </div>
      ))}
      <div className="border-t border-border pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(getTotal())}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
