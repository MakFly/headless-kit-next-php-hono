import { createFileRoute } from '@tanstack/react-router'
import { AdminCustomersTable } from '@/components/shop/admin/customers-table'

export const Route = createFileRoute('/shop/admin/customers')({
  component: CustomersPage,
})

function CustomersPage() {
  return <AdminCustomersTable />
}
