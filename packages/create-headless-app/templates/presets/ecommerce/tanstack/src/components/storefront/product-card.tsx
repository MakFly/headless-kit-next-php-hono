'use client'
import { Link } from '@tanstack/react-router'
import { StarIcon, ShoppingCartIcon } from 'lucide-react'
import type { Product } from '@/lib/data/products'
import { formatPrice } from '@/lib/data/products'
import { useCartStore } from '@/stores/cart-store'
import { toast } from 'sonner'

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const emoji = product.category === 'Electronics' ? '🔌' : product.category === 'Clothing' ? '👕' : product.category === 'Sports' ? '⚽' : '🏠'

  return (
    <div className="group rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg">
      <Link to="/products/$id" params={{ id: product.id }} className="block aspect-square bg-muted relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-4xl text-muted-foreground/30">{emoji}</div>
        {!product.inStock && <div className="absolute top-2 right-2 rounded-full bg-destructive px-2 py-1 text-xs text-white">Out of Stock</div>}
      </Link>
      <div className="p-4">
        <Link to="/products/$id" params={{ id: product.id }}>
          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="mt-2 flex items-center gap-1">
          <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
          <button
            onClick={() => { addItem(product); toast.success(`${product.name} added to cart`) }}
            disabled={!product.inStock}
            className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            <ShoppingCartIcon className="h-3 w-3" />Add
          </button>
        </div>
      </div>
    </div>
  )
}
