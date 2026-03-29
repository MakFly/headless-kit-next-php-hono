import { useCallback, useEffect, useState } from 'react'
import { Box, Eye, Package, Plus, Search, Trash2 } from 'lucide-react'
import type { Category, PaginatedResponse, Product } from '@/types/shop'
import {
  deleteProductFn,
  getAdminCategoriesFn,
  getAdminProductsFn,
} from '@/lib/services/admin-service'
import { formatPrice } from '@/components/shop/admin/format'
import { StatusBadge } from '@/components/shop/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
type StatusFilter = 'all' | 'active' | 'draft' | 'archived'

function getStockStatus(qty: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (qty <= 0) return 'out_of_stock'
  if (qty < 10) return 'low_stock'
  return 'in_stock'
}

function getStockLabel(qty: number): string {
  if (qty <= 0) return 'Out of stock'
  if (qty < 10) return `Low stock (${qty})`
  return `In stock (${qty})`
}

export function AdminProductsTable() {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null)
  const [categories, setCategories] = useState<Array<Category>>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')

  useEffect(() => {
    getAdminCategoriesFn().then(setCategories).catch(() => {})
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getAdminProductsFn({
        data: {
          filters: {
            search: search || undefined,
            page,
            perPage: 24,
          },
        },
      })
      setData(result)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProductFn({ data: { id: deleteTarget.id } })
      setDeleteTarget(null)
      fetchProducts()
    } catch {
      // silent
    } finally {
      setDeleting(false)
    }
  }

  const filteredProducts = data?.data.filter((p) => {
    if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (stockFilter !== 'all' && getStockStatus(p.stockQuantity) !== stockFilter) return false
    return true
  })

  return (
    <div className="flex gap-6">
      {/* Sidebar filters */}
      <div className="hidden min-w-48 shrink-0 space-y-6 md:block">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2"><Package className="h-4 w-4" />Category</h3>
          <div className="flex flex-wrap gap-1.5 ml-3">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2"><Eye className="h-4 w-4" />Status</h3>
          <div className="space-y-1.5 ml-3">
            {([
              ['all', 'All'],
              ['active', 'Active'],
              ['draft', 'Draft'],
              ['archived', 'Archived'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
              >
                <div
                  className={`h-4 w-4 rounded-full border-2 transition-colors ${
                    statusFilter === value
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/40'
                  }`}
                >
                  {statusFilter === value && (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </div>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2"><Box className="h-4 w-4" />Stock</h3>
          <div className="space-y-1.5 ml-3">
            {([
              ['all', 'All'],
              ['in_stock', 'In Stock'],
              ['low_stock', 'Low Stock (< 10)'],
              ['out_of_stock', 'Out of Stock'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setStockFilter(value)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
              >
                <div
                  className={`h-4 w-4 rounded-full border-2 transition-colors ${
                    stockFilter === value
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/40'
                  }`}
                >
                  {stockFilter === value && (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </div>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-4">
        {/* Search + Add */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-125"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <StatusBadge status={product.status} />
                  </div>
                </div>
                <div className="space-y-2 p-3">
                  <div>
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={getStockStatus(product.stockQuantity)} className="text-[10px]" />
                    <span className="text-xs text-muted-foreground">
                      {getStockLabel(product.stockQuantity)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-xs text-muted-foreground">
                      {product.category?.name ?? 'Uncategorized'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteTarget(product)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <Package className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No products found.</p>
          </div>
        )}

        {/* Pagination */}
        {data && (data.pagination?.last_page ?? 0) > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {data.pagination?.page ?? 1} of {data.pagination?.last_page ?? 1} ({data.pagination?.total ?? 0} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (data.pagination?.last_page ?? 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
