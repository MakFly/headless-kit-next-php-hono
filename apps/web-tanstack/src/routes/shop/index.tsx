import { createFileRoute } from '@tanstack/react-router'
import { ProductGrid } from '@/components/shop/product-grid'
import { ProductFilters } from '@/components/shop/product-filters'

export const Route = createFileRoute('/shop/')({
  component: ShopIndexPage,
})

function ShopIndexPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Shop</h2>
        <p className="text-muted-foreground">
          Browse our product catalog.
        </p>
      </div>
      <ProductFilters />
      <ProductGrid />
    </div>
  )
}
