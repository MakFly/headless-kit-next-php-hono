import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LayoutDashboardIcon } from 'lucide-react'

export const Route = createFileRoute('/shop/admin/')({
  component: ShopAdminDashboard,
})

function ShopAdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Shop Admin</h2>
        <p className="text-muted-foreground">
          Manage your shop.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboardIcon className="size-5" />
            Admin Dashboard
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Admin dashboard will display revenue metrics, recent orders, low stock alerts, and pending reviews.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
