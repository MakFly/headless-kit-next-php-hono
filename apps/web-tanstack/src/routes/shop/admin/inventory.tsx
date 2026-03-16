import { createFileRoute } from '@tanstack/react-router'
import { AdminInventoryTable } from '@/components/shop/admin/inventory-table'

export const Route = createFileRoute('/shop/admin/inventory')({
  component: InventoryPage,
})

function InventoryPage() {
  return <AdminInventoryTable />
}
