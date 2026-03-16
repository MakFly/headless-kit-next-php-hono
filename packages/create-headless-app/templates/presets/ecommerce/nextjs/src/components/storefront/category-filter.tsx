'use client';

import { categories, type Category } from '@/lib/data/products';

export function CategoryFilter({
  selected,
  onChange,
}: {
  selected: Category;
  onChange: (category: Category) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors ${
            selected === category
              ? 'bg-primary text-primary-foreground'
              : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
