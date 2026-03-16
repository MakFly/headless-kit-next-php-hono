import type { Product } from '@/types/shop'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: Product
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0

  return (
    <a href={`/shop/${product.slug}`} className="group">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-square bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="size-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {product.featured && (
            <Badge className="absolute left-2 top-2" variant="default">
              Featured
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="absolute right-2 top-2 bg-red-500 text-white">
              -{discountPercent}%
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-1 font-semibold">{product.name}</h3>
          {product.category && (
            <p className="text-xs text-muted-foreground">{product.category.name}</p>
          )}
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {product.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex items-center gap-2 p-4 pt-0">
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </CardFooter>
      </Card>
    </a>
  )
}
