import { Suspense } from "react"
import { HeroBanner } from "@/components/shop/hero-banner"
import { CategoryCard } from "@/components/shop/category-card"
import { ProductGrid } from "@/components/shop/product-grid"
import { ProductFilters } from "@/components/shop/product-filters"
import { ProductPagination } from "@/components/shop/product-pagination"
import { NewsletterSection } from "@/components/shop/newsletter-section"
import { getProductsAction, getCategoriesAction } from "@/lib/actions/shop/products"
import type { ProductFilters as ProductFiltersType } from "@/types/shop"

const heroCategories = [
  { name: "Dresses", slug: "dresses", imageUrl: "https://picsum.photos/seed/dress-silk/600/800" },
  { name: "Shirts & Tops", slug: "shirts", imageUrl: "https://picsum.photos/seed/shirt-linen/600/800" },
  { name: "Skincare", slug: "skincare", imageUrl: "https://picsum.photos/seed/skincare-cream/600/800" },
  { name: "Fragrances", slug: "fragrances", imageUrl: "https://picsum.photos/seed/perfume-bottle/600/800" },
  { name: "Accessories", slug: "accessories", imageUrl: "https://picsum.photos/seed/accessories-gold/600/800" },
  { name: "Shoes", slug: "shoes", imageUrl: "https://picsum.photos/seed/shoes-minimal/600/800" },
]

type ShopPageProps = {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const hasFilters = Object.values(params).some(Boolean)

  const filters: ProductFiltersType = {
    category: params.category,
    search: params.search,
    sort: params.sort as ProductFiltersType["sort"],
    minPrice: params.min_price ? Number(params.min_price) : undefined,
    maxPrice: params.max_price ? Number(params.max_price) : undefined,
    page: params.page ? Number(params.page) : 1,
  }

  const [productsResponse, categories] = await Promise.all([
    getProductsAction(filters),
    getCategoriesAction(),
  ])

  return (
    <div>
      {/* Hero + Categories — only when browsing without filters */}
      {!hasFilters && (
        <>
          <HeroBanner
            title="The New Collection"
            subtitle="Spring / Summer 2026"
            ctaText="Shop Now"
            ctaHref="/shop?sort=newest"
            imageUrl="https://picsum.photos/seed/fashion-editorial/1920/1080"
          />

          {/* Category cards */}
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mb-10 text-center">
              <p className="mb-2 text-[11px] tracking-[0.35em] uppercase text-stone-400">
                Explore
              </p>
              <h2 className="font-serif text-3xl text-stone-900">
                Shop by Category
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {heroCategories.map((cat) => (
                <CategoryCard key={cat.slug} {...cat} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Products section */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8">
          <h2 className="font-serif text-2xl text-stone-900 sm:text-3xl">
            {hasFilters ? "Results" : "All Products"}
          </h2>
        </div>

        <div className="mb-8">
          <Suspense>
            <ProductFilters categories={categories} />
          </Suspense>
        </div>

        <ProductGrid products={productsResponse.data} />

        <div className="mt-10">
          <ProductPagination
            currentPage={productsResponse.pagination.page}
            totalPages={productsResponse.pagination.totalPages}
          />
        </div>
      </section>

      {/* Newsletter */}
      {!hasFilters && <NewsletterSection />}
    </div>
  )
}
