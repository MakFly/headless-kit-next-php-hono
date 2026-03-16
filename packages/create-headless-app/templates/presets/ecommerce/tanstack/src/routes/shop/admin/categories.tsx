import { createFileRoute } from '@tanstack/react-router'
import { AdminCategoriesTable } from '@/components/shop/admin/categories-table'

export const Route = createFileRoute('/shop/admin/categories')({
  component: CategoriesPage,
})

function CategoriesPage() {
  return <AdminCategoriesTable />
}
