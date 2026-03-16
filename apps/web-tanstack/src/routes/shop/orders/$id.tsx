import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/shop/orders/$id')({
  component: OrderDetailPage,
})

function OrderDetailPage() {
  const { id } = Route.useParams()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Order #{id}</h2>
        <p className="text-muted-foreground">
          Order details and tracking.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Order #{id}
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Order detail page will show items, shipping info, payment status, and tracking updates.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
