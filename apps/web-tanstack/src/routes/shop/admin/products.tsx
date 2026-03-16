import { createFileRoute } from '@tanstack/react-router'
import { PackageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/shop/admin/products')({
  component: AdminProductsPage,
})

function AdminProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manage Products</h2>
        <p className="text-muted-foreground">
          Create, edit, and manage your product catalog.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageIcon className="size-5" />
            Products
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Product management page will include CRUD operations, bulk actions, and inventory tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
