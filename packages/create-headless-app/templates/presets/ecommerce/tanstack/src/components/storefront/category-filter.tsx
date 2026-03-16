'use client'
import { categories, type Category } from '@/lib/data/products'

export function CategoryFilter({ selected, onChange }: { selected: Category; onChange: (c: Category) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button key={cat} onClick={() => onChange(cat)}
          className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors ${selected === cat ? 'bg-primary text-primary-foreground' : 'border border-input bg-background hover:bg-accent'}`}>
          {cat}
        </button>
      ))}
    </div>
  )
}
