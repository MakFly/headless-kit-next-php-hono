import { Link } from '@tanstack/react-router'

type CategoryCardProps = {
  name: string
  slug: string
  imageUrl: string
}

export function CategoryCard({ name, slug, imageUrl }: CategoryCardProps) {
  return (
    <Link
      to={`/shop/categories/${slug}`}
      className="group relative block aspect-[3/4] overflow-hidden bg-stone-100"
    >
      <img
        src={imageUrl}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/15 transition-all duration-500 group-hover:bg-black/30" />
      <div className="absolute inset-0 flex items-end p-5 sm:p-6">
        <span className="text-[11px] tracking-[0.25em] uppercase text-white font-light">
          {name}
        </span>
      </div>
    </Link>
  )
}
