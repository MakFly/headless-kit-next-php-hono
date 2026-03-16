'use client'
import { Link } from '@tanstack/react-router'
import { TrashIcon, PlusIcon, MinusIcon } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/data/products'

export function CartSheet() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const getTotal = useCartStore((s) => s.getTotal)

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link to="/products" className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const emoji = item.product.category === 'Electronics' ? '🔌' : item.product.category === 'Clothing' ? '👕' : item.product.category === 'Sports' ? '⚽' : '🏠'
        return (
          <div key={item.product.id} className="flex gap-4 rounded-lg border border-border p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted text-2xl">
              {emoji}
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium">{item.product.name}</h3>
                  {item.selectedVariants && Object.entries(item.selectedVariants).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </p>
                  )}
                </div>
                <button onClick={() => removeItem(item.product.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent text-destructive">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center rounded-md border border-input">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="h-8 w-8 inline-flex items-center justify-center hover:bg-accent">
                    <MinusIcon className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-8 w-8 inline-flex items-center justify-center hover:bg-accent">
                    <PlusIcon className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-sm font-bold">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            </div>
          </div>
        )
      })}
      <div className="border-t border-border pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(getTotal())}</span>
        </div>
        <Link to="/checkout" className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  )
}
