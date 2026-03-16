import { createFileRoute } from '@tanstack/react-router'
import { ShoppingCartIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/shop/cart')({
  component: CartPage,
})

function CartPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cart</h2>
        <p className="text-muted-foreground">
          Your shopping cart.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="size-5" />
            Shopping Cart
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cart page will display items, quantities, subtotals, and a checkout button.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
