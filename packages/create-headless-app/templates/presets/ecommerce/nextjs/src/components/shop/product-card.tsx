import Link from "next/link"
import { Heart } from "lucide-react"
import type { Product } from "@/types/shop"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const price = (product.price / 100).toFixed(2)
  const comparePrice = product.compareAtPrice
    ? (product.compareAtPrice / 100).toFixed(2)
    : null
  const imageUrl =
    product.imageUrl || `https://picsum.photos/seed/${product.slug}/480/600`

  return (
    <div className="group relative">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="absolute left-3 top-3 bg-stone-900 px-2.5 py-1 text-[9px] tracking-[0.15em] uppercase text-white">
              Sale
            </span>
          )}
          {product.stockQuantity <= 0 && (
            <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[9px] tracking-[0.15em] uppercase text-stone-900">
              Sold Out
            </span>
          )}
        </div>
        <div className="mt-3 space-y-1">
          {product.category && (
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone-400">
              {product.category.name}
            </p>
          )}
          <h3 className="text-sm text-stone-900 transition-colors group-hover:text-stone-600">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${comparePrice ? "text-red-700" : "text-stone-900"}`}
            >
              ${price}
            </span>
            {comparePrice && (
              <span className="text-sm text-stone-400 line-through">
                ${comparePrice}
              </span>
            )}
          </div>
        </div>
      </Link>
      {/* Wishlist button — visual only */}
      <button
        type="button"
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-stone-600 opacity-0 backdrop-blur transition-all duration-300 hover:bg-white hover:text-stone-900 group-hover:opacity-100"
        aria-label="Add to wishlist"
      >
        <Heart className="h-4 w-4" />
      </button>
    </div>
  )
}
