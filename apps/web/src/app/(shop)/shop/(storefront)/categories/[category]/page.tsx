import { notFound } from "next/navigation"
import Link from "next/link"
import { ProductGrid } from "@/components/shop/product-grid"
import { ArrowLeft } from "lucide-react"
import { getCategoryBySlugAction } from "@/lib/actions/shop/products"

type CategoryPageProps = {
  params: Promise<{ category: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params

  let categoryData
  try {
    categoryData = await getCategoryBySlugAction(slug)
  } catch {
    notFound()
  }

  const bannerImage = `https://picsum.photos/seed/cat-${slug}/1920/600`

  return (
    <div>
      {/* Category hero */}
      <section className="relative h-64 w-full overflow-hidden bg-stone-100 sm:h-80">
        <img
          src={bannerImage}
          alt={categoryData.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <p className="mb-2 text-[10px] tracking-[0.35em] uppercase text-white/70">
            Collection
          </p>
          <h1 className="font-serif text-4xl text-white sm:text-5xl">
            {categoryData.name}
          </h1>
          {categoryData.description && (
            <p className="mt-3 max-w-md text-sm text-white/80">
              {categoryData.description}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href="/shop"
          className="mb-8 inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-stone-400 transition-colors hover:text-stone-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Products
        </Link>

        <ProductGrid products={categoryData.products} />
      </div>
    </div>
  )
}
