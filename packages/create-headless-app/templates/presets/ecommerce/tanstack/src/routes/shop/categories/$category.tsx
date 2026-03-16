import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/shop/categories/$category')({
  component: CategoryPage,
})

function CategoryPage() {
  const { category } = Route.useParams()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight capitalize">
          {category}
        </h2>
        <p className="text-muted-foreground">
          Browse products in the {category} category.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {category}
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Category page will display filtered products for this category with sorting and pagination.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
