import { createFileRoute } from '@tanstack/react-router'
import { PackageIcon } from 'lucide-react'

const mockOrders = [
  { id: 'ORD-001', customer: 'John Doe', email: 'john@example.com', total: 349.98, status: 'Delivered', date: '2026-03-14' },
  { id: 'ORD-002', customer: 'Jane Smith', email: 'jane@example.com', total: 129.99, status: 'Shipped', date: '2026-03-13' },
  { id: 'ORD-003', customer: 'Bob Wilson', email: 'bob@example.com', total: 84.98, status: 'Processing', date: '2026-03-12' },
  { id: 'ORD-004', customer: 'Alice Brown', email: 'alice@example.com', total: 449.99, status: 'Pending', date: '2026-03-11' },
  { id: 'ORD-005', customer: 'Charlie Davis', email: 'charlie@example.com', total: 199.98, status: 'Delivered', date: '2026-03-10' },
]

const statusColors: Record<string, string> = {
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Pending: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
}

export const Route = createFileRoute('/dashboard/orders')({
  component: AdminOrdersPage,
})

function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders.</p>
        </div>
      </div>
      <div className="rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium">{order.id}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium">{order.customer}</div>
                  <div className="text-xs text-muted-foreground">{order.email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{order.date}</td>
                <td className="px-4 py-3 text-sm font-medium">${order.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] ?? ''}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mockOrders.length === 0 && (
        <div className="py-12 text-center">
          <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No orders yet.</p>
        </div>
      )}
    </div>
  )
}
