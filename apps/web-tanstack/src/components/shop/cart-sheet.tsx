import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { ShoppingBag, X, Plus, Minus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'

type CartSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, total, itemCount, isLoading, fetchCart, updateItem, removeItem } = useCartStore()

  useEffect(() => {
    if (open) {
      fetchCart()
    }
  }, [open, fetchCart])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col rounded-none border-l border-stone-200 bg-white p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b border-stone-100 px-6 py-4">
          <SheetTitle className="font-serif text-base tracking-[0.15em] uppercase text-stone-900">
            Your Bag
            {itemCount > 0 && (
              <span className="ml-2 text-xs font-normal tracking-wide text-stone-500">
                ({itemCount})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Body */}
        {items.length === 0 && !isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12">
            <ShoppingBag className="h-12 w-12 text-stone-300" />
            <p className="text-sm tracking-wide text-stone-500">Your bag is empty</p>
            <Button
              variant="outline"
              className="rounded-none border-stone-900 text-xs tracking-[0.15em] uppercase hover:bg-stone-900 hover:text-white"
              onClick={() => onOpenChange(false)}
              asChild
            >
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading && items.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-xs tracking-wide text-stone-400">Loading...</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => {
                  const product = item.product
                  const price = product?.price ?? 0
                  const imageUrl = product?.imageUrl ?? null
                  const name = product?.name ?? 'Product'
                  const slug = product?.slug ?? ''

                  return (
                    <li key={item.id} className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="relative h-16 w-12 shrink-0 bg-stone-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-stone-100" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to="/shop/$slug"
                            params={{ slug }}
                            className="truncate text-xs tracking-wide text-stone-900 hover:underline"
                            onClick={() => onOpenChange(false)}
                          >
                            {name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="shrink-0 text-stone-400 hover:text-stone-700"
                            aria-label="Remove item"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Qty controls */}
                          <div className="flex items-center border border-stone-200">
                            <button
                              type="button"
                              className="flex h-6 w-6 items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-40"
                              onClick={() => updateItem(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isLoading}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex h-6 w-7 items-center justify-center text-xs text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="flex h-6 w-6 items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-40"
                              onClick={() => updateItem(item.id, item.quantity + 1)}
                              disabled={isLoading}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <p className="text-xs tracking-wide text-stone-900">
                            ${((price * item.quantity) / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="flex-col gap-0 border-t border-stone-100 px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs tracking-[0.15em] uppercase text-stone-500">Total</span>
              <span className="font-serif text-sm text-stone-900">
                ${(total / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full rounded-none border-stone-900 text-xs tracking-[0.15em] uppercase hover:bg-stone-50"
                asChild
                onClick={() => onOpenChange(false)}
              >
                <Link to="/shop/cart">View Full Bag</Link>
              </Button>
              <Button
                className="w-full rounded-none bg-stone-900 text-xs tracking-[0.15em] uppercase text-white hover:bg-stone-800"
                asChild
                onClick={() => onOpenChange(false)}
              >
                <Link to="/shop/checkout">Checkout</Link>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
