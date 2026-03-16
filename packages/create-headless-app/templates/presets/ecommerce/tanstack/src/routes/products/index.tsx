import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { StorefrontNavbar } from '@/components/storefront/storefront-navbar'
import { ProductGrid } from '@/components/storefront/product-grid'
import { CategoryFilter } from '@/components/storefront/category-filter'
import { getProductsByCategory, type Category } from '@/lib/data/products'

export const Route = createFileRoute('/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  const [category, setCategory] = useState<Category>('All')
  const filtered = getProductsByCategory(category)
  return (
    <div className="min-h-screen bg-background">
      <StorefrontNavbar />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <CategoryFilter selected={category} onChange={setCategory} />
        <div className="mt-6"><ProductGrid products={filtered} /></div>
      </main>
    </div>
  )
}
