import { notFound } from "next/navigation"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Star, ArrowLeft } from "lucide-react"
import { getProductBySlugAction } from "@/lib/actions/shop/products"
import { ProductActions } from "@/components/shop/product-actions"

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params

  let product
  try {
    product = await getProductBySlugAction(slug)
  } catch {
    notFound()
  }

  const price = (product.price / 100).toFixed(2)
  const comparePrice = product.compareAtPrice
    ? (product.compareAtPrice / 100).toFixed(2)
    : null
  const mainImage =
    product.imageUrl || `https://picsum.photos/seed/${product.slug}/800/1000`
  const thumbnails =
    product.images?.length > 0
      ? product.images
      : [
          mainImage,
          `https://picsum.photos/seed/${product.slug}-2/800/1000`,
          `https://picsum.photos/seed/${product.slug}-3/800/1000`,
          `https://picsum.photos/seed/${product.slug}-4/800/1000`,
        ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Breadcrumb */}
      <Link
        href="/shop"
        className="mb-8 inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-stone-400 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-[4/5] overflow-hidden bg-stone-100">
            <img
              src={mainImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {thumbnails.slice(0, 4).map((img, i) => (
              <div
                key={i}
                className="aspect-square cursor-pointer overflow-hidden bg-stone-100"
              >
                <img
                  src={img}
                  alt=""
                  className="h-full w-full object-cover opacity-80 transition-opacity hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product info */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4">
            {product.category && (
              <Link
                href={`/shop/categories/${product.category.slug}`}
                className="text-[10px] tracking-[0.2em] uppercase text-stone-400 transition-colors hover:text-stone-900"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="font-serif text-3xl text-stone-900 sm:text-4xl">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3">
              <span
                className={`text-xl ${comparePrice ? "text-red-700" : "text-stone-900"}`}
              >
                ${price}
              </span>
              {comparePrice && (
                <span className="text-base text-stone-400 line-through">
                  ${comparePrice}
                </span>
              )}
            </div>
            {/* Mock reviews */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= 4
                        ? "fill-amber-400 text-amber-400"
                        : "fill-stone-200 text-stone-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-stone-400">4.0 (24 reviews)</span>
            </div>
          </div>

          <Separator className="my-6 bg-stone-200" />

          <ProductActions
            productId={product.id}
            inStock={product.stockQuantity > 0}
          />

          <Separator className="my-6 bg-stone-200" />

          {/* Details accordion */}
          <Accordion
            type="multiple"
            defaultValue={["description"]}
            className="w-full"
          >
            {product.description && (
              <AccordionItem value="description" className="border-stone-200">
                <AccordionTrigger className="py-4 text-[11px] tracking-[0.15em] uppercase text-stone-900 hover:no-underline">
                  Description
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-stone-600">
                  {product.description}
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="details" className="border-stone-200">
              <AccordionTrigger className="py-4 text-[11px] tracking-[0.15em] uppercase text-stone-900 hover:no-underline">
                Details &amp; Care
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-stone-600">
                <ul className="space-y-1.5">
                  {product.sku && <li>SKU: {product.sku}</li>}
                  <li>Imported</li>
                  <li>Machine wash cold, tumble dry low</li>
                  <li>Model is 5&apos;9&quot; wearing size S</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping" className="border-stone-200">
              <AccordionTrigger className="py-4 text-[11px] tracking-[0.15em] uppercase text-stone-900 hover:no-underline">
                Shipping &amp; Returns
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-stone-600">
                <p>Free standard shipping on orders over $100.</p>
                <p className="mt-1.5">
                  Free returns within 30 days of purchase.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
