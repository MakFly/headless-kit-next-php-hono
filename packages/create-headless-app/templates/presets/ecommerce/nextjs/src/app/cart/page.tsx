'use client';

import { StorefrontNavbar } from '@/components/storefront/storefront-navbar';
import { CartSheet } from '@/components/cart/cart-sheet';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <StorefrontNavbar />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <CartSheet />
      </main>
    </div>
  );
}
