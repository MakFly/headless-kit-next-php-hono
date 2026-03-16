import { PackageIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ProductGrid() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <PackageIcon className="mb-4 size-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Product Catalog</h3>
        <Badge variant="secondary" className="mt-2">
          Coming Soon
        </Badge>
        <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
          The product grid will display a responsive grid of product cards with lazy loading and pagination.
          Connect a backend API to see products here.
        </p>
      </CardContent>
    </Card>
  )
}
