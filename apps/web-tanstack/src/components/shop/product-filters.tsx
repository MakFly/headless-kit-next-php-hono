'use client'

import { SearchIcon, SlidersHorizontalIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function ProductFilters() {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-4 p-4">
        <div className="flex flex-1 items-center gap-2 rounded-md border px-3 py-2">
          <SearchIcon className="size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled
          />
        </div>
        <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
          <SlidersHorizontalIcon className="size-4" />
          <span>Filters (Coming Soon)</span>
        </div>
        <select
          className="rounded-md border bg-transparent px-3 py-2 text-sm text-muted-foreground"
          disabled
        >
          <option>Sort by: Newest</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Name: A-Z</option>
        </select>
      </CardContent>
    </Card>
  )
}
