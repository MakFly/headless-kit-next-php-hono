import { createFileRoute } from '@tanstack/react-router'
import { products, formatPrice } from '@/lib/data/products'
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react'

export const Route = createFileRoute('/dashboard/products')({
  component: AdminProductsPage,
})

function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <PlusIcon className="h-4 w-4" />Add Product
        </button>
      </div>
      <div className="rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3 text-sm">{formatPrice(p.price)}</td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.inStock ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{p.inStock ? 'In Stock' : 'Out of Stock'}</span></td>
                <td className="px-4 py-3 text-right">
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"><PencilIcon className="h-4 w-4" /></button>
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent text-destructive"><TrashIcon className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
