import { createFileRoute } from '@tanstack/react-router'
import { ClipboardListIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/shop/admin/orders')({
  component: AdminOrdersPage,
})

function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manage Orders</h2>
        <p className="text-muted-foreground">
          View and manage all customer orders.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardListIcon className="size-5" />
            Orders
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Order management page will include status updates, filtering, and fulfillment workflows.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
