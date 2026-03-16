'use client';

import Link from 'next/link';
import { ShoppingCartIcon, UserIcon } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';

export function StorefrontNavbar() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold">
          {'{{PROJECT_NAME}}'}
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Products
          </Link>
          <Link href="/products?category=Electronics" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Electronics
          </Link>
          <Link href="/products?category=Clothing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Clothing
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent">
            <ShoppingCartIcon className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <Link href="/dashboard" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent">
              <UserIcon className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
