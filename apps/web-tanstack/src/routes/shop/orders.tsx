import { createFileRoute } from '@tanstack/react-router'
import { ClipboardListIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/shop/orders')({
  component: OrdersPage,
})

function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Orders</h2>
        <p className="text-muted-foreground">
          View your order history.
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
            Orders page will display a list of past orders with status tracking and detail links.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
